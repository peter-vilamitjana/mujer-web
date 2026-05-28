'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
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
    const ref = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('branches')
      .add({ ...data, createdAt: FieldValue.serverTimestamp() });
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
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('branches').doc(branchId)
      .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
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
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('branches').doc(branchId)
      .update({ active, updatedAt: FieldValue.serverTimestamp() });
    return { success: true };
  } catch (err) {
    console.error('[toggleBranchActive]', err);
    return { success: false, error: 'No se pudo cambiar el estado de la sucursal.' };
  }
}
