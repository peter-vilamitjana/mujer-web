'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireTenantAccess } from '@/lib/auth-guards';
import type { Staff, StaffCommissions } from '@/lib/schema';

type ActionResult = { success: true; id?: string } | { success: false; error: string };

export async function createStaffMember(
  tenantId: string,
  data: Omit<Staff, 'id'>
): Promise<ActionResult> {
  try {
    await requireTenantAccess(tenantId);
    const ref = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('staff')
      .add({ ...data, createdAt: FieldValue.serverTimestamp() });
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
    await requireTenantAccess(tenantId);
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('staff').doc(staffId)
      .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
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
    await requireTenantAccess(tenantId);
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('staff').doc(staffId)
      .update({ active, updatedAt: FieldValue.serverTimestamp() });
    return { success: true };
  } catch (err) {
    console.error('[toggleStaffActive]', err);
    return { success: false, error: 'No se pudo cambiar el estado del profesional.' };
  }
}

export async function updateStaffCommissions(
  tenantId: string,
  staffId: string,
  commissions: StaffCommissions
): Promise<ActionResult> {
  try {
    await requireTenantAccess(tenantId);
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('staff').doc(staffId)
      .update({ commissions, updatedAt: FieldValue.serverTimestamp() });
    return { success: true };
  } catch (err) {
    console.error('[updateStaffCommissions]', err);
    return { success: false, error: 'No se pudieron guardar las comisiones.' };
  }
}
