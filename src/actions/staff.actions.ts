'use server';

// TECH DEBT P1: Uses Firebase Client SDK instead of Firestore REST API.
// Works in development but may fail in production due to Firestore security rules.
// Fix: Migrate to REST API with service account token before production deploy.
// Tracked: https://github.com/[repo]/issues/[n]

import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Staff } from '@/lib/schema';

type ActionResult = { success: true; id?: string } | { success: false; error: string };

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  return session;
}

export async function createStaffMember(
  tenantId: string,
  data: Omit<Staff, 'id'>
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const ref = await addDoc(collection(db, 'tenants', tenantId, 'staff'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (err) {
    console.error('[createStaffMember]', err);
    return { success: false, error: 'No se pudo crear el profesional.' };
  }
}

export async function updateStaffMember(
  tenantId: string,
  staffId: string,
  data: Partial<Omit<Staff, 'id'>>
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    await updateDoc(doc(db, 'tenants', tenantId, 'staff', staffId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[updateStaffMember]', err);
    return { success: false, error: 'No se pudo actualizar el profesional.' };
  }
}

export async function toggleStaffActive(
  tenantId: string,
  staffId: string,
  active: boolean
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    await updateDoc(doc(db, 'tenants', tenantId, 'staff', staffId), {
      active,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[toggleStaffActive]', err);
    return { success: false, error: 'No se pudo cambiar el estado del profesional.' };
  }
}
