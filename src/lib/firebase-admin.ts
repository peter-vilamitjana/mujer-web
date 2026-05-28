import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.warn(
      '[firebase-admin] FIREBASE_SERVICE_ACCOUNT env var is not set. ' +
      'Initializing with a dummy project. Database calls will fail.'
    );
    return initializeApp({ projectId: 'dummy-project' });
  }

  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}

export const adminDb = getFirestore(getAdminApp());
