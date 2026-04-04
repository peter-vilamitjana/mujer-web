import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Usuario } from '@/lib/types';

/**
 * Obtiene el perfil del usuario desde Firestore.
 * Si no existe en 'users', intenta migrar desde la colección legacy 'usuarios'.
 * Retorna null si no existe en ninguna colección.
 */
export async function getUserProfile(uid: string, email: string | null): Promise<Record<string, any> | null> {
  const newProfileRef = doc(db, 'users', uid);
  const userDoc = await getDoc(newProfileRef);

  if (userDoc.exists()) {
    return userDoc.data();
  }

  // Fallback: buscar en colección legacy
  console.warn('[LEGACY] Perfil no encontrado en users, buscando en usuarios...');
  try {
    const legacyRef = doc(db, 'usuarios', uid);
    const legacySnap = await getDoc(legacyRef);

    if (legacySnap.exists()) {
      console.log('[LEGACY] Migrando perfil a users...');
      const legacyData = legacySnap.data() as Usuario;
      const newProfileData = {
        id: uid,
        displayName: legacyData.nombre || 'Usuario',
        email: legacyData.email || email,
        photoURL: legacyData.photoURL || null,
        migratedAt: new Date(),
        source: 'legacy_migration',
      };
      await setDoc(newProfileRef, newProfileData);
      return newProfileData;
    }

  } catch (err) {
    console.error('[LEGACY] Error en migración:', err);
  }

  return null;
}
