/**
 * Playwright global setup — crea usuarios de prueba en el emulador de Firebase
 * Auth, siembra e2e-test-salon en el emulador de Firestore vía Admin SDK, y
 * genera storageState para reutilizar en tests.
 *
 * Corre siempre contra los emuladores (ver package.json: `firebase
 * emulators:exec` exporta FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST
 * antes de invocar Playwright), nunca contra el proyecto de Firebase real.
 *
 * El seed usa Admin SDK en vez de REST con idToken de usuario porque
 * firestore.rules bloquea toda escritura a memberships (`allow write: if
 * false`) y el doc raíz de tenants exige rol admin — que depende de esa
 * misma membership. Un usuario recién creado nunca puede sembrar sus propios
 * datos por REST; Admin SDK bypasa las reglas como lo hacen las Server
 * Actions de la app en producción.
 */
import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'mujer-app';
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'e2e-emulator-key';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

const AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const IDENTITY_TOOLKIT_BASE = AUTH_EMULATOR_HOST
  ? `http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1`
  : 'https://identitytoolkit.googleapis.com/v1';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@mujerapp.test';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'E2eTest2026!';
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL ?? 'e2e-clienta@mujerapp.test';
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD ?? 'E2eTest2026!';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({ projectId: FIREBASE_PROJECT_ID });
}

const adminDb = getFirestore(getAdminApp());

/** Crea un usuario en Firebase Auth. Ignora EMAIL_EXISTS. */
async function firebaseSignUp(email: string, password: string): Promise<void> {
  const res = await fetch(
    `${IDENTITY_TOOLKIT_BASE}/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    if (err?.error?.message !== 'EMAIL_EXISTS') {
      throw new Error(`Firebase signUp failed for ${email}: ${err?.error?.message}`);
    }
  }
}

/** Firma en Firebase Auth y devuelve { idToken, localId }. */
async function firebaseSignIn(email: string, password: string): Promise<{ idToken: string; localId: string }> {
  const res = await fetch(
    `${IDENTITY_TOOLKIT_BASE}/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Firebase signIn failed for ${email}: ${data?.error?.message}`);
  return { idToken: data.idToken, localId: data.localId };
}

/** Siembra e2e-test-salon en Firestore (Admin SDK) y asigna rol admin al usuario. */
async function seedDemoSalon(adminUid: string): Promise<void> {
  // Tenant dedicado exclusivamente a E2E — nunca debe coincidir con el ID de un
  // salón real (el .set() reemplaza el documento entero).
  const TENANT = process.env.E2E_TEST_SALON_SLUG ?? 'e2e-test-salon';

  // Tenant raíz
  await adminDb.doc(`tenants/${TENANT}`).set({
    id: TENANT,
    name: 'Ouleeh | Estilismo y Belleza',
    slug: TENANT,
    isActivePublicly: true,
  }, { merge: true });

  // Servicios
  const services = [
    { id: 'corte-estilo', name: 'Corte & Estilo', price: 15999, durationMinutes: 60, active: true, requiresLengthSelection: false },
    { id: 'coloracion', name: 'Coloración Profesional', price: 24999, durationMinutes: 120, active: true, requiresLengthSelection: true },
    { id: 'keratina', name: 'Keratina Profesional', price: 39999, durationMinutes: 150, active: true, requiresLengthSelection: true },
  ];
  for (const s of services) {
    const { id, ...fields } = s;
    await adminDb.doc(`tenants/${TENANT}/services/${id}`).set(fields, { merge: true });
  }

  // Staff
  const staff = [
    { id: 'staff-valeria', name: 'Valeria', role: 'Estilista Senior', active: true },
    { id: 'staff-lucia', name: 'Lucía', role: 'Colorista', active: true },
  ];
  for (const s of staff) {
    const { id, ...fields } = s;
    await adminDb.doc(`tenants/${TENANT}/staff/${id}`).set(fields, { merge: true });
  }

  // Membership admin
  await adminDb.doc(`users/${adminUid}/memberships/${TENANT}`).set({
    role: 'admin',
    tenantId: TENANT,
    tenantName: 'Ouleeh | Estilismo y Belleza',
  }, { merge: true });
}

async function loginAndSaveSession(
  email: string,
  password: string,
  storageStatePath: string
): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`);
  await page.locator('#l-email').fill(email);
  await page.locator('#l-pass').fill(password);
  await page.getByRole('button', { name: /entrar al atelier/i }).click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: process.env.CI ? 45_000 : 20_000,
  });

  await context.storageState({ path: storageStatePath });
  await browser.close();
}

export default async function globalSetup(config: FullConfig) {
  const stateDir = path.join(process.cwd(), 'e2e/.auth');
  if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

  const adminStatePath = path.join(stateDir, 'admin.json');
  const customerStatePath = path.join(stateDir, 'customer.json');

  // ── Firebase Auth: create test users ────────────────────────────────────────
  // Wrapped in try/catch so public tests (registro.spec.ts) still run even if
  // el emulador de Auth no está corriendo (p.ej. `playwright test` sin
  // `firebase emulators:exec`).
  let firebaseReady = false;
  try {
    console.log('[e2e setup] Creando usuarios de prueba en Firebase Auth...');
    await firebaseSignUp(ADMIN_EMAIL, ADMIN_PASSWORD);
    await firebaseSignUp(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
    firebaseReady = true;
  } catch (err) {
    console.warn('[e2e setup] Firebase Auth setup falló (tests autenticados serán skipped):', (err as Error).message);
  }

  // ── Firestore seed ───────────────────────────────────────────────────────────
  if (firebaseReady) {
    console.log('[e2e setup] Sembrando e2e-test-salon en Firestore (Admin SDK)...');
    try {
      const { localId } = await firebaseSignIn(ADMIN_EMAIL, ADMIN_PASSWORD);
      await seedDemoSalon(localId);
      console.log('[e2e setup] Firestore seed completado');
    } catch (err) {
      console.warn('[e2e setup] Firestore seed falló (se continúa):', (err as Error).message);
    }
  }

  // ── Browser login → storageState ────────────────────────────────────────────
  // If Firebase wasn't available, write empty auth files so projects that
  // depend on storageState don't crash at startup (tests self-skip via checks).
  console.log('[e2e setup] Generando sesiones persistentes...');
  if (firebaseReady) {
    try {
      await loginAndSaveSession(ADMIN_EMAIL, ADMIN_PASSWORD, adminStatePath);
      await loginAndSaveSession(CUSTOMER_EMAIL, CUSTOMER_PASSWORD, customerStatePath);
      console.log('[e2e setup] Listo — storageState guardados en e2e/.auth/');
    } catch (err) {
      console.warn('[e2e setup] Login falló — storageState vacío (tests autenticados serán skipped):', (err as Error).message);
      writeEmptyStorageState(adminStatePath);
      writeEmptyStorageState(customerStatePath);
    }
  } else {
    writeEmptyStorageState(adminStatePath);
    writeEmptyStorageState(customerStatePath);
  }
}

function writeEmptyStorageState(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ cookies: [], origins: [] }));
  }
}
