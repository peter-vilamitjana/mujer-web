'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  doc, getDoc, setDoc, serverTimestamp,
  collection, query, where, orderBy, limit, getDocs,
} from 'firebase/firestore';
import type { AppointmentStatus } from '@/lib/schema';
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

// ── Historial cross-tenant ────────────────────────────────────────────────────

export interface HistorialEntry {
  id: string;
  salonName: string;
  salonSlug: string;
  service: string;
  staffName: string;
  dateMs: number;        // ms timestamp — serializable across RSC boundary
  status: AppointmentStatus;
  price: number;
}

export interface HistorialGroup {
  monthLabel: string;    // "JULIO 2026"
  entries: HistorialEntry[];
}

/**
 * Devuelve las citas pasadas del usuario autenticado agrupadas por mes.
 * Consulta los tenants donde el usuario tiene membresía (JWT.tenantIds).
 */
export async function getMyHistorial(): Promise<HistorialGroup[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return [];

  const tenantIds: string[] = (session.user as any).tenantIds ?? [];
  if (tenantIds.length === 0) return [];

  const entries: HistorialEntry[] = [];

  await Promise.all(
    tenantIds.map(async (tenantId) => {
      try {
        // Obtener nombre y slug del tenant
        const tenantSnap = await getDoc(doc(db, 'tenants', tenantId));
        if (!tenantSnap.exists()) return;
        const tenantData = tenantSnap.data();
        const salonName: string = tenantData.name ?? 'Salón';
        const salonSlug: string = tenantData.slug ?? tenantId;

        // Obtener appointments del usuario en este tenant
        const q = query(
          collection(db, 'tenants', tenantId, 'appointments'),
          where('clientId', '==', uid),
          orderBy('date', 'desc'),
          limit(100),
        );
        const snap = await getDocs(q);

        for (const d of snap.docs) {
          const data = d.data();
          const ts = data.date;
          const dateMs: number = ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : 0);
          if (!dateMs) continue;

          entries.push({
            id: d.id,
            salonName,
            salonSlug,
            service: data.serviceNames ?? '',
            staffName: data.staffName ?? '',
            dateMs,
            status: data.status ?? 'pending',
            price: data.priceEstimated ?? 0,
          });
        }
      } catch (err) {
        console.error(`[getMyHistorial] tenant ${tenantId}:`, err);
      }
    }),
  );

  // Ordenar por fecha descendente
  entries.sort((a, b) => b.dateMs - a.dateMs);

  // Agrupar por mes
  const groups = new Map<string, HistorialEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.dateMs);
    const label = d
      .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
      .toUpperCase();
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(entry);
  }

  return Array.from(groups.entries()).map(([monthLabel, es]) => ({ monthLabel, entries: es }));
}

/**
 * Devuelve los próximos turnos del usuario (fecha futura) ordenados ascendente.
 * Cross-tenant, igual que getMyHistorial.
 */
export async function getMyUpcomingAppointments(): Promise<HistorialEntry[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return [];

  const tenantIds: string[] = (session.user as any).tenantIds ?? [];
  if (tenantIds.length === 0) return [];

  const nowMs = Date.now();
  const entries: HistorialEntry[] = [];

  await Promise.all(
    tenantIds.map(async (tenantId) => {
      try {
        const tenantSnap = await getDoc(doc(db, 'tenants', tenantId));
        if (!tenantSnap.exists()) return;
        const tenantData = tenantSnap.data();
        const salonName: string = tenantData.name ?? 'Salón';
        const salonSlug: string = tenantData.slug ?? tenantId;

        const q = query(
          collection(db, 'tenants', tenantId, 'appointments'),
          where('clientId', '==', uid),
          orderBy('date', 'asc'),
          limit(20),
        );
        const snap = await getDocs(q);

        for (const d of snap.docs) {
          const data = d.data();
          const ts = data.date;
          const dateMs: number = ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : 0);
          if (!dateMs || dateMs < nowMs) continue;

          entries.push({
            id: d.id,
            salonName,
            salonSlug,
            service: data.serviceNames ?? '',
            staffName: data.staffName ?? '',
            dateMs,
            status: data.status ?? 'pending',
            price: data.priceEstimated ?? 0,
          });
        }
      } catch (err) {
        console.error(`[getMyUpcomingAppointments] tenant ${tenantId}:`, err);
      }
    }),
  );

  entries.sort((a, b) => a.dateMs - b.dateMs);
  return entries;
}
