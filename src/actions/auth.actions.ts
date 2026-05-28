'use server'

const FIREBASE_API_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// ─── Validators ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{6,20}$/;

function validateRegistration(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): string | null {
  const name = data.name?.trim() ?? '';
  if (!name || name.length < 2)  return 'El nombre debe tener al menos 2 caracteres.';
  if (name.length > 100)         return 'El nombre es demasiado largo.';

  const email = data.email?.trim() ?? '';
  if (!email)                    return 'El email es obligatorio.';
  if (!EMAIL_RE.test(email))     return 'El email no tiene un formato válido.';
  if (email.length > 254)        return 'El email es demasiado largo.';

  const password = data.password ?? '';
  if (!password || password.length < 6)  return 'La contraseña debe tener al menos 6 caracteres.';
  if (password.length > 128)             return 'La contraseña es demasiado larga.';

  const phone = data.phone?.trim() ?? '';
  if (!phone)                    return 'El teléfono es obligatorio.';
  if (!PHONE_RE.test(phone))     return 'El teléfono no tiene un formato válido.';

  return null; // sin errores
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function registerCustomer(data: {
  name: string
  email: string
  password: string
  phone: string
}): Promise<{ success: true; uid: string } | { success: false; error: string }> {
  // Validación server-side antes de cualquier llamada externa
  const validationError = validateRegistration(data);
  if (validationError) return { success: false, error: validationError };

  const name  = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const phone = data.phone.trim();

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
          email,
          password: data.password,
          displayName: name,
          returnSecureToken: true,
        }),
      }
    );

    const authData = await authRes.json();

    if (!authRes.ok) {
      const msg = authData.error?.message;
      if (msg === 'EMAIL_EXISTS')            return { success: false, error: 'ESTE EMAIL YA TIENE UNA CUENTA' };
      if (msg?.startsWith('WEAK_PASSWORD'))  return { success: false, error: 'CONTRASEÑA MUY DÉBIL (MÍNIMO 6 CARACTERES)' };
      return { success: false, error: 'ERROR AL CREAR LA CUENTA' };
    }

    const uid: string     = authData.localId;
    const idToken: string = authData.idToken;

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
            fullName:    { stringValue: name },
            email:       { stringValue: email },
            phone:       { stringValue: phone },
            role:        { stringValue: 'customer' },
            createdAt:   { timestampValue: new Date().toISOString() },
            memberships: { arrayValue: { values: [] } },
          },
        }),
      }
    );

    if (!firestoreRes.ok) {
      // El usuario se creó en Auth pero no en Firestore — no fallar, el login igual funciona
      console.error('[registerCustomer] Error creando doc Firestore:', await firestoreRes.text());
    }

    return { success: true, uid };
  } catch (error) {
    console.error('[registerCustomer] Error:', error);
    return { success: false, error: 'ERROR DE CONEXIÓN' };
  }
}
