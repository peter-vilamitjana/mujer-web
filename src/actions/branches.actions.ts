'use server';

// TECH DEBT P1: Uses Firebase Client SDK instead of Firestore REST API.
// Works in development but may fail in production due to Firestore security rules.
// Fix: Migrate to REST API with service account token before production deploy.
// Tracked: https://github.com/[repo]/issues/[n]

import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Branch } from '@/lib/schema';

type ActionResult = { success: true; id?: string } | { success: false; error: string };

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  return session;
}

export async function createBranch(
  tenantId: string,
  data: Omit<Branch, 'id'>
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const ref = await addDoc(collection(db, 'tenants', tenantId, 'branches'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (err) {
    console.error('[createBranch]', err);
    return { success: false, error: 'No se pudo crear la sucursal.' };
  }
}

export async function updateBranch(
  tenantId: string,
  branchId: string,
  data: Partial<Omit<Branch, 'id'>>
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    await updateDoc(doc(db, 'tenants', tenantId, 'branches', branchId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[updateBranch]', err);
    return { success: false, error: 'No se pudo actualizar la sucursal.' };
  }
}

export async function toggleBranchActive(
  tenantId: string,
  branchId: string,
  active: boolean
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    await updateDoc(doc(db, 'tenants', tenantId, 'branches', branchId), {
      active,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[toggleBranchActive]', err);
    return { success: false, error: 'No se pudo cambiar el estado de la sucursal.' };
  }
}
