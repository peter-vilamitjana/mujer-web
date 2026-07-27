import "@/lib/shim-storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, memoryLocalCache, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcU9HP6ELT0SKyhVXyxMPebE4c5KqTi7g",
  authDomain: "mujer-app.firebaseapp.com",
  projectId: "mujer-app",
  storageBucket: "mujer-app.firebasestorage.app",
  messagingSenderId: "731843251807",
  appId: "1:731843251807:web:244db05fd41c9fc55815ea",
  measurementId: "G-HZYB137Q23"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use memory-only cache: disables IndexedDB offline persistence so the SDK
// never retries stale onSnapshot subscriptions across page loads.
const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  ignoreUndefinedProperties: true,
});

// Emulador de Firestore — solo activo en e2e/CI (ver next.config.ts, que
// reenvía FIRESTORE_EMULATOR_HOST al cliente bajo este nombre). Sin esto el
// SDK del browser (hooks como useStaff/useBranches/useMetrics) seguiría
// leyendo el Firestore real en vez de los datos sembrados para el test.
const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
if (firestoreEmulatorHost) {
  const [host, port] = firestoreEmulatorHost.split(':');
  connectFirestoreEmulator(db, host, Number(port));
}

let storage: ReturnType<typeof getStorage>;
try {
  storage = getStorage(app);
} catch (e) {
  // Storage might fail on server-side or if config is missing bucket
  console.warn("Storage init warning:", e);
  storage = {} as any;
}

let auth: Auth;
try {
  if (typeof window !== "undefined") {
    auth = getAuth(app);
  } else {
    // Server-side
    const { initializeAuth, inMemoryPersistence } = require("firebase/auth");
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence
    });
  }
} catch (e) {
  // If initializeAuth fails, try getAuth
  try {
    auth = getAuth(app);
  } catch (e2) {
    auth = {} as any;
  }
}

// Emulador de Auth — misma lógica que Firestore arriba. auth.ts usa este
// `auth` server-side (signInWithEmailAndPassword) para el login por
// credenciales, así que también debe apuntar al emulador en e2e/CI.
const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
if (authEmulatorHost) {
  try {
    connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
  } catch {
    // Ya conectado (posible en HMR) — seguro ignorar.
  }
}

export { db, auth, storage };
