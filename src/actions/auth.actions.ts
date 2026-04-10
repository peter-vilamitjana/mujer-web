'use server'

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

export async function registerCustomer(data: {
  name: string
  email: string
  password: string
  phone: string
}): Promise<{ success: true; uid: string } | { success: false; error: string }> {
  try {
    const apiKey = FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    if (!apiKey) throw new Error('Firebase API key not configured');

    // 1. Crear usuario en Firebase Auth via REST API
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          displayName: data.name,
          returnSecureToken: true,
        }),
      }
    )

    const authData = await authRes.json()

    if (!authRes.ok) {
      const msg = authData.error?.message;
      if (msg === 'EMAIL_EXISTS') {
        return { success: false, error: 'ESTE EMAIL YA TIENE UNA CUENTA' }
      }
      if (msg?.startsWith('WEAK_PASSWORD')) {
        return { success: false, error: 'CONTRASEÑA MUY DÉBIL (MÍNIMO 6 CARACTERES)' }
      }
      return { success: false, error: 'ERROR AL CREAR LA CUENTA' }
    }

    const uid: string = authData.localId
    const idToken: string = authData.idToken

    // 2. Crear documento en Firestore users/{uid}
    const firestoreRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fields: {
            fullName: { stringValue: data.name },
            email: { stringValue: data.email },
            phone: { stringValue: data.phone },
            role: { stringValue: 'customer' },
            createdAt: { timestampValue: new Date().toISOString() },
            memberships: { arrayValue: { values: [] } },
          },
        }),
      }
    )

    if (!firestoreRes.ok) {
      // El usuario se creó en Auth pero no en Firestore — no fallar, el login igual funciona
      console.error('Error creando documento en Firestore:', await firestoreRes.text())
    }

    return { success: true, uid }
  } catch (error) {
    console.error('Error en registerCustomer:', error)
    return { success: false, error: 'ERROR DE CONEXIÓN' }
  }
}
