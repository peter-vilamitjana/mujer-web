import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project';
    // El Admin SDK detecta FIRESTORE_EMULATOR_HOST automáticamente y no
    // necesita credenciales reales contra el emulador — solo advertir si
    // realmente vamos a intentar hablar con Firestore de producción.
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      console.warn(
        '[firebase-admin] FIREBASE_SERVICE_ACCOUNT env var is not set. ' +
        'Initializing with a dummy project. Database calls will fail.'
      );
    }
    return initializeApp({ projectId });
  }

  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}

export const adminDb = getFirestore(getAdminApp());
