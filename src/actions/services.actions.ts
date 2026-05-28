'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Service } from '@/lib/schema';

type ActionResult = { success: true; id?: string } | { success: false; error: string };

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  return session;
}

export async function getServices(
  tenantId: string,
  onlyActive = true,
): Promise<Service[]> {
  let ref = adminDb.collection('tenants').doc(tenantId).collection('services').orderBy('name', 'asc');
  if (onlyActive) ref = ref.where('active', '==', true) as typeof ref;
  const snap = await ref.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Service);
}

export async function createService(
  tenantId: string,
  data: Omit<Service, 'id'>
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const ref = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('services')
      .add({ ...data, createdAt: FieldValue.serverTimestamp() });
    return { success: true, id: ref.id };
  } catch (err) {
    console.error('[createService]', err);
    return { success: false, error: 'No se pudo crear el servicio.' };
  }
}

export async function updateService(
  tenantId: string,
  serviceId: string,
  data: Partial<Omit<Service, 'id'>>
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('services').doc(serviceId)
      .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    return { success: true };
  } catch (err) {
    console.error('[updateService]', err);
    return { success: false, error: 'No se pudo actualizar el servicio.' };
  }
}

export async function toggleServiceActive(
  tenantId: string,
  serviceId: string,
  active: boolean
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('services').doc(serviceId)
      .update({ active, updatedAt: FieldValue.serverTimestamp() });
    return { success: true };
  } catch (err) {
    console.error('[toggleServiceActive]', err);
    return { success: false, error: 'No se pudo cambiar el estado del servicio.' };
  }
}
