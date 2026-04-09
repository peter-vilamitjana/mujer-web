'use server';

interface RegisterCustomerInput {
  displayName: string;
  email: string;
  password: string;
}

export async function registerCustomer(input: RegisterCustomerInput): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) throw new Error('Firebase API key not configured');

    // Create user via Firebase Auth REST API
    const signUpRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          displayName: input.displayName,
          returnSecureToken: true,
        }),
      }
    );

    const signUpData = await signUpRes.json();
    if (!signUpRes.ok) {
      const msg = signUpData?.error?.message || 'Registration failed';
      if (msg === 'EMAIL_EXISTS') return { success: false, error: 'Este email ya está registrado.' };
      if (msg === 'WEAK_PASSWORD : Password should be at least 6 characters') {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
      }
      return { success: false, error: 'No se pudo crear la cuenta. Intentá de nuevo.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[registerCustomer]', err);
    return { success: false, error: 'Error inesperado. Intentá de nuevo.' };
  }
}
