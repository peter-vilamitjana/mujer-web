import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      '[firebase-admin] FIREBASE_SERVICE_ACCOUNT env var is not set. ' +
      'Download a service account key from Firebase Console → Project Settings → Service Accounts ' +
      'and paste the JSON as a single-line string in .env.local.'
    );
  }

  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}

export const adminDb = getFirestore(getAdminApp());
