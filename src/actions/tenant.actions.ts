'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { requireRole } from '@/lib/auth-guards';
import type { Tenant } from '@/lib/schema';

function toSerializable<T>(val: T): T {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') {
    if (typeof (val as any).toMillis === 'function') return (val as any).toMillis() as unknown as T;
    if (Array.isArray(val)) return (val as any[]).map(toSerializable) as unknown as T;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as object)) out[k] = toSerializable(v);
    return out as T;
  }
  return val;
}

type ActionResult = { success: true } | { success: false; error: string };

export async function updateTenantSettings(
  tenantId: string,
  data: Partial<Omit<Tenant, 'id' | 'createdAt'>>
): Promise<ActionResult> {
  try {
    await requireRole(tenantId, ['admin']);
    await adminDb.collection('tenants').doc(tenantId).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[updateTenantSettings]', err);
    return { success: false, error: 'No se pudo guardar la configuración.' };
  }
}

export async function checkSlugAvailability(
  slug: string,
  currentTenantId: string
): Promise<{ available: boolean }> {
  try {
    if (!slug || slug.length < 3) return { available: false };
    const snap = await adminDb.collection('tenants').where('slug', '==', slug).get();
    const available = snap.empty || snap.docs.every((d) => d.id === currentTenantId);
    return { available };
  } catch (err) {
    console.error('[checkSlugAvailability]', err);
    return { available: false };
  }
}

export async function getTenantSettings(tenantId: string): Promise<Tenant | null> {
  try {
    const snap = await adminDb.collection('tenants').doc(tenantId).get();
    if (!snap.exists) return null;
    return toSerializable({ id: snap.id, ...snap.data() }) as Tenant;
  } catch (err) {
    console.error('[getTenantSettings]', err);
    return null;
  }
}

// Info pública mínima para el header de la vitrina — nombre/slug/logo son
// datos ya públicos en /salones/{slug}, no requiere sesión ni rol.
export async function getSalonHeaderInfo(
  slug: string
): Promise<{ name: string; slug: string; logoUrl?: string } | null> {
  try {
    const snap = await adminDb
      .collection('tenants')
      .where('slug', '==', slug)
      .where('isActivePublicly', '==', true)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0].data();
    return { name: data.name, slug: data.slug, logoUrl: data.logoUrl };
  } catch (err) {
    console.error('[getSalonHeaderInfo]', err);
    return null;
  }
}
