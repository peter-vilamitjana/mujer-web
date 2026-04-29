'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ProfileData {
  displayName: string;
  email: string;
  phone: string;
  photoURL: string | null;
  createdAt: string | null;
}

export async function getMyProfile(): Promise<ProfileData | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return null;

  const profileRef = doc(db, 'users', uid);
  const snap = await getDoc(profileRef);

  const sessionName = session.user.name ?? '';
  const sessionEmail = session.user.email ?? '';
  const sessionPhoto = session.user.image ?? null;

  if (!snap.exists()) {
    await setDoc(profileRef, {
      id: uid,
      displayName: sessionName,
      email: sessionEmail,
      photoURL: sessionPhoto,
      createdAt: serverTimestamp(),
    });
    return {
      displayName: sessionName,
      email: sessionEmail,
      phone: '',
      photoURL: sessionPhoto,
      createdAt: null,
    };
  }

  const data = snap.data();
  return {
    displayName: data.displayName ?? sessionName,
    email: data.email ?? sessionEmail,
    phone: data.phone ?? '',
    photoURL: data.photoURL ?? sessionPhoto,
    createdAt: data.createdAt?.toDate?.()?.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    }) ?? null,
  };
}

export async function updateMyProfile(
  updates: { displayName?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'No autenticado.' };

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return { success: false, error: 'Sesión inválida.' };

  if (!updates.displayName?.trim() && !updates.phone?.trim()) {
    return { success: false, error: 'No hay cambios para guardar.' };
  }

  try {
    const profileRef = doc(db, 'users', uid);
    const payload: Record<string, any> = { updatedAt: serverTimestamp() };
    if (updates.displayName?.trim()) payload.displayName = updates.displayName.trim();
    if (updates.phone !== undefined) payload.phone = updates.phone.trim();

    await setDoc(profileRef, payload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[updateMyProfile] Error:', err);
    return { success: false, error: 'No se pudo guardar el perfil.' };
  }
}
