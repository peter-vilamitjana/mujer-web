/**
 * Bases de URL para las llamadas REST directas a Firestore/Identity Toolkit
 * (server-only). Redirige al emulador cuando FIRESTORE_EMULATOR_HOST /
 * FIREBASE_AUTH_EMULATOR_HOST están seteadas (e2e/CI vía `firebase
 * emulators:exec`) — evita que los tests toquen el proyecto de producción.
 */

export function firestoreRestBase(projectId: string): string {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  return host
    ? `http://${host}/v1/projects/${projectId}/databases/(default)/documents`
    : `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

export function identityToolkitRestBase(): string {
  const host = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  return host
    ? `http://${host}/identitytoolkit.googleapis.com/v1`
    : `https://identitytoolkit.googleapis.com/v1`;
}
