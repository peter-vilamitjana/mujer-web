'use server';

// TECH DEBT P1: Uses Firebase Client SDK instead of Firestore REST API.
// Works in development but may fail in production due to Firestore security rules.
// Fix: Migrate to REST API with service account token before production deploy.
// Tracked: https://github.com/[repo]/issues/[n]

import { doc, getDoc, updateDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';

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
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Tenant } from '@/lib/schema';

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  return session;
}

export async function updateTenantSettings(
  tenantId: string,
  data: Partial<Omit<Tenant, 'id' | 'createdAt'>>
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    await updateDoc(doc(db, 'tenants', tenantId), {
      ...data,
      updatedAt: serverTimestamp(),
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
    const q = query(collection(db, 'tenants'), where('slug', '==', slug));
    const snap = await getDocs(q);
    const available = snap.empty || snap.docs.every((d) => d.id === currentTenantId);
    return { available };
  } catch (err) {
    console.error('[checkSlugAvailability]', err);
    return { available: false };
  }
}

export async function getTenantSettings(tenantId: string): Promise<Tenant | null> {
  try {
    const snap = await getDoc(doc(db, 'tenants', tenantId));
    if (!snap.exists()) return null;
    return toSerializable({ id: snap.id, ...snap.data() }) as Tenant;
  } catch (err) {
    console.error('[getTenantSettings]', err);
    return null;
  }
}
