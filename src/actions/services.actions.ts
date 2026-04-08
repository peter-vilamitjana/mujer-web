'use server';

import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Service } from '@/lib/schema';

type ActionResult = { success: true; id?: string } | { success: false; error: string };

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  return session;
}

export async function createService(
  tenantId: string,
  data: Omit<Service, 'id'>
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const ref = await addDoc(collection(db, 'tenants', tenantId, 'services'), {
      ...data,
      createdAt: serverTimestamp(),
    });
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
    await updateDoc(doc(db, 'tenants', tenantId, 'services', serviceId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
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
    await updateDoc(doc(db, 'tenants', tenantId, 'services', serviceId), {
      active,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[toggleServiceActive]', err);
    return { success: false, error: 'No se pudo cambiar el estado del servicio.' };
  }
}
