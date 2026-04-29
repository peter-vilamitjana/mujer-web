/**
 * Playwright global setup — crea usuarios de prueba en Firebase Auth si no existen,
 * semilla demo-salon en Firestore, y genera storageState para reutilizar en tests.
 */
import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@mujerapp.test';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'E2eTest2026!';
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL ?? 'e2e-clienta@mujerapp.test';
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD ?? 'E2eTest2026!';

/** Crea un usuario en Firebase Auth. Ignora EMAIL_EXISTS. */
async function firebaseSignUp(email: string, password: string): Promise<void> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
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
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
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

/** Escribe un documento en Firestore vía REST API. Ignora errores de permisos (reglas estrictas). */
async function firestoreSet(
  idToken: string,
  docPath: string,
  fields: Record<string, unknown>
): Promise<void> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${docPath}`;

  // Convertir valores JS a Firestore field values
  function toFirestoreValue(v: unknown): unknown {
    if (typeof v === 'string') return { stringValue: v };
    if (typeof v === 'number') return { integerValue: String(v) };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (v === null || v === undefined) return { nullValue: null };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
    if (typeof v === 'object') {
      const mapFields: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        mapFields[k] = toFirestoreValue(val);
      }
      return { mapValue: { fields: mapFields } };
    }
    return { nullValue: null };
  }

  const firestoreFields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    firestoreFields[k] = toFirestoreValue(v);
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: firestoreFields }),
  });
  if (!res.ok) {
    const err = await res.json();
    const code = err?.error?.code;
    // 403 = PERMISSION_DENIED (reglas estrictas) — no lanzar error, continuar
    if (code !== 403) {
      console.warn(`[e2e setup] Firestore PATCH ${docPath}: ${err?.error?.message ?? res.status}`);
    }
  }
}

/** Siembra demo-salon en Firestore y asigna rol admin al usuario. */
async function seedDemoSalon(idToken: string, adminUid: string): Promise<void> {
  const TENANT = 'demo-salon';

  // Tenant raíz
  await firestoreSet(idToken, `tenants/${TENANT}`, {
    id: TENANT,
    name: 'Ouleeh | Estilismo y Belleza',
    slug: TENANT,
    isActivePublicly: true,
  });

  // Servicios
  const services = [
    { id: 'corte-estilo', name: 'Corte & Estilo', price: 15999, durationMinutes: 60, active: true, requiresLengthSelection: false },
    { id: 'coloracion', name: 'Coloración Profesional', price: 24999, durationMinutes: 120, active: true, requiresLengthSelection: true },
    { id: 'keratina', name: 'Keratina Profesional', price: 39999, durationMinutes: 150, active: true, requiresLengthSelection: true },
  ];
  for (const s of services) {
    const { id, ...fields } = s;
    await firestoreSet(idToken, `tenants/${TENANT}/services/${id}`, fields);
  }

  // Staff
  const staff = [
    { id: 'staff-valeria', name: 'Valeria', role: 'Estilista Senior', active: true },
    { id: 'staff-lucia', name: 'Lucía', role: 'Colorista', active: true },
  ];
  for (const s of staff) {
    const { id, ...fields } = s;
    await firestoreSet(idToken, `tenants/${TENANT}/staff/${id}`, fields);
  }

  // Membership admin
  await firestoreSet(idToken, `users/${adminUid}/memberships/${TENANT}`, {
    role: 'admin',
    tenantId: TENANT,
    tenantName: 'Ouleeh | Estilismo y Belleza',
  });
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

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });

  await context.storageState({ path: storageStatePath });
  await browser.close();
}

export default async function globalSetup(config: FullConfig) {
  const stateDir = path.join(process.cwd(), 'e2e/.auth');
  if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

  const adminStatePath = path.join(stateDir, 'admin.json');
  const customerStatePath = path.join(stateDir, 'customer.json');

  console.log('[e2e setup] Creando usuarios de prueba en Firebase Auth...');
  await firebaseSignUp(ADMIN_EMAIL, ADMIN_PASSWORD);
  await firebaseSignUp(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);

  console.log('[e2e setup] Sembrando demo-salon en Firestore...');
  try {
    const { idToken, localId } = await firebaseSignIn(ADMIN_EMAIL, ADMIN_PASSWORD);
    await seedDemoSalon(idToken, localId);
    console.log('[e2e setup] Firestore seed completado (o ignorado por reglas)');
  } catch (err) {
    console.warn('[e2e setup] Firestore seed falló (se continúa):', (err as Error).message);
  }

  console.log('[e2e setup] Generando sessiones persistentes...');
  await loginAndSaveSession(ADMIN_EMAIL, ADMIN_PASSWORD, adminStatePath);
  await loginAndSaveSession(CUSTOMER_EMAIL, CUSTOMER_PASSWORD, customerStatePath);

  console.log('[e2e setup] Listo — storageState guardados en e2e/.auth/');
}
