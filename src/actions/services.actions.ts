'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireRole } from '@/lib/auth-guards';
import type { Service } from '@/lib/schema';

type ActionResult = { success: true; id?: string } | { success: false; error: string };

export async function getServices(
  tenantId: string,
  onlyActive = true,
): Promise<Service[]> {
  let ref = adminDb.collection('tenants').doc(tenantId).collection('services').orderBy('name', 'asc');
  if (onlyActive) ref = ref.where('active', '==', true) as typeof ref;
  const snap = await ref.get();
  // Whitelist explícito de los campos de Service — esta action cruza la
  // frontera Server→Client (se llama desde un componente cliente), y un
  // spread de d.data() a ciegas deja pasar cualquier campo legacy que sea
  // una instancia de clase (ej. un Timestamp de una migración vieja),
  // que React no puede serializar y rompe el render entero.
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      durationMinutes: data.durationMinutes,
      price: data.price,
      priceHasta: data.priceHasta,
      requiresLengthSelection: data.requiresLengthSelection,
      variablePrice: data.variablePrice,
      active: data.active,
      image: data.image,
      badge: data.badge,
    } as Service;
  });
}

export async function createService(
  tenantId: string,
  data: Omit<Service, 'id'>
): Promise<ActionResult> {
  try {
    await requireRole(tenantId, ['admin']);
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
    await requireRole(tenantId, ['admin']);
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
    await requireRole(tenantId, ['admin']);
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

export async function getGlobalFeaturedServices(): Promise<Service[]> {
  try {
    const snap = await adminDb
      .collection('servicios')
      .where('destacado', '==', true)
      .limit(6)
      .get();
      
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.nombre || '',
        price: data.precio || 0,
        image: data.imagen || '',
        durationMinutes: data.duracion || 60,
        active: true,
      } as Service;
    });
  } catch (error) {
    console.error('Error fetching global featured services:', error);
    return [];
  }
}
