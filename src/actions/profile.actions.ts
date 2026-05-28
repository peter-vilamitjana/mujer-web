'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type {
  UserPreferences,
  ProfileData, HistorialEntry, HistorialGroup,
  HairProfile, SerializedPreferences, FavoriteSalonData,
} from '@/lib/schema';

export type { ProfileData, HistorialEntry, HistorialGroup, HairProfile, SerializedPreferences, FavoriteSalonData };

export async function getMyProfile(): Promise<ProfileData | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return null;

  const profileRef = adminDb.collection('users').doc(uid);
  const snap = await profileRef.get();

  const sessionName = session.user.name ?? '';
  const sessionEmail = session.user.email ?? '';
  const sessionPhoto = session.user.image ?? null;

  if (!snap.exists) {
    await profileRef.set({
      id: uid,
      displayName: sessionName,
      email: sessionEmail,
      photoURL: sessionPhoto,
      createdAt: FieldValue.serverTimestamp(),
    });
    return {
      displayName: sessionName,
      email: sessionEmail,
      phone: '',
      photoURL: sessionPhoto,
      createdAt: null,
    };
  }

  const data = snap.data()!;
  return {
    displayName: data.displayName ?? sessionName,
    email: data.email ?? sessionEmail,
    phone: data.phone ?? '',
    photoURL: data.photoURL ?? sessionPhoto,
    createdAt: (data.createdAt as Timestamp | undefined)?.toDate?.()?.toLocaleDateString('es-AR', {
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
    const payload: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    if (updates.displayName?.trim()) payload.displayName = updates.displayName.trim();
    if (updates.phone !== undefined) payload.phone = updates.phone.trim();

    await adminDb.collection('users').doc(uid).set(payload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[updateMyProfile] Error:', err);
    return { success: false, error: 'No se pudo guardar el perfil.' };
  }
}

// ── Historial cross-tenant ────────────────────────────────────────────────────

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
        const tenantSnap = await adminDb.collection('tenants').doc(tenantId).get();
        if (!tenantSnap.exists) return;
        const tenantData = tenantSnap.data()!;
        const salonName: string = tenantData.name ?? 'Salón';
        const salonSlug: string = tenantData.slug ?? tenantId;

        const snap = await adminDb
          .collection('tenants').doc(tenantId)
          .collection('appointments')
          .where('clientId', '==', uid)
          .orderBy('date', 'desc')
          .limit(100)
          .get();

        for (const d of snap.docs) {
          const data = d.data();
          const ts = data.date as Timestamp | undefined;
          const dateMs: number = ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : 0);
          if (!dateMs) continue;

          entries.push({
            id: d.id,
            tenantId,
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

  entries.sort((a, b) => b.dateMs - a.dateMs);

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
        const tenantSnap = await adminDb.collection('tenants').doc(tenantId).get();
        if (!tenantSnap.exists) return;
        const tenantData = tenantSnap.data()!;
        const salonName: string = tenantData.name ?? 'Salón';
        const salonSlug: string = tenantData.slug ?? tenantId;

        const snap = await adminDb
          .collection('tenants').doc(tenantId)
          .collection('appointments')
          .where('clientId', '==', uid)
          .orderBy('date', 'asc')
          .limit(20)
          .get();

        for (const d of snap.docs) {
          const data = d.data();
          const ts = data.date as Timestamp | undefined;
          const dateMs: number = ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : 0);
          if (!dateMs || dateMs < nowMs) continue;

          entries.push({
            id: d.id,
            tenantId,
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

// ── Hair Profile ──────────────────────────────────────────────────────────────

/**
 * Reads the client's hairProfile from their customer record in the primary tenant.
 */
export async function getMyHairProfile(): Promise<HairProfile | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const uid = (session.user as any).uid as string | undefined;
  const tenantIds: string[] = (session.user as any).tenantIds ?? [];
  if (!uid || tenantIds.length === 0) return null;

  // Use the first (primary) tenant
  const customerSnap = await adminDb
    .collection('tenants').doc(tenantIds[0])
    .collection('customers').doc(uid)
    .get();

  if (!customerSnap.exists) return null;
  return (customerSnap.data()?.hairProfile as HairProfile) ?? null;
}

/**
 * Writes hairProfile fields to the client's customer record in the primary tenant.
 * Uses Admin SDK because Firestore rules only allow `create` (not `update`) by the client themselves.
 */
export async function updateMyHairProfile(
  updates: Partial<HairProfile>,
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'No autenticado.' };
  const uid = (session.user as any).uid as string | undefined;
  const tenantIds: string[] = (session.user as any).tenantIds ?? [];
  if (!uid) return { success: false, error: 'Sesión inválida.' };
  if (tenantIds.length === 0) return { success: false, error: 'No tenés un salón asociado.' };

  try {
    const payload: Record<string, any> = {};
    for (const [key, val] of Object.entries(updates)) {
      payload[`hairProfile.${key}`] = val;
    }

    await adminDb
      .collection('tenants').doc(tenantIds[0])
      .collection('customers').doc(uid)
      .set(payload, { merge: true });

    return { success: true };
  } catch (err) {
    console.error('[updateMyHairProfile] Error:', err);
    return { success: false, error: 'No se pudo guardar el perfil capilar.' };
  }
}

// ── Preferences ───────────────────────────────────────────────────────────────

/**
 * Reads the client's preferences from users/{uid}/preferences/default.
 */
export async function getMyPreferences(): Promise<SerializedPreferences | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return null;

  const snap = await adminDb
    .collection('users').doc(uid)
    .collection('preferences').doc('default')
    .get();

  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    preferredZone: data.preferredZone ?? undefined,
    preferredTimeSlot: data.preferredTimeSlot ?? undefined,
    notifications: data.notifications ?? { whatsappReminder: true, reminderHoursBefore: 24, favoriteSalonUpdates: true },
    updatedAtMs: data.updatedAt?.toMillis?.() ?? null,
  };
}

/**
 * Writes (merges) preferences to users/{uid}/preferences/default.
 */
export async function updateMyPreferences(
  updates: Partial<Omit<UserPreferences, 'updatedAt'>>,
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'No autenticado.' };
  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return { success: false, error: 'Sesión inválida.' };

  try {
    await adminDb
      .collection('users').doc(uid)
      .collection('preferences').doc('default')
      .set({ ...updates, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    return { success: true };
  } catch (err) {
    console.error('[updateMyPreferences] Error:', err);
    return { success: false, error: 'No se pudo guardar las preferencias.' };
  }
}

// ── Favorites ─────────────────────────────────────────────────────────────────

/**
 * Returns the list of favorite salons, enriched with basic tenant data (name, address).
 */
export async function getMyFavorites(): Promise<FavoriteSalonData[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];
  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return [];

  const favSnap = await adminDb
    .collection('users').doc(uid)
    .collection('favorites')
    .orderBy('savedAt', 'desc')
    .get();

  if (favSnap.empty) return [];

  const results = await Promise.all(
    favSnap.docs.map(async (favDoc) => {
      const tenantId = favDoc.id;
      const savedAtMs: number = favDoc.data().savedAt?.toMillis?.() ?? 0;

      try {
        const tenantSnap = await adminDb.collection('tenants').doc(tenantId).get();
        if (!tenantSnap.exists) return null;
        const t = tenantSnap.data()!;
        return {
          tenantId,
          slug: t.slug ?? tenantId,
          name: t.name ?? 'Salón',
          address: t.address ?? null,
          savedAtMs,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r): r is FavoriteSalonData => r !== null);
}

/**
 * Adds or removes a salon from the user's favorites.
 * Returns the new favorite state.
 */
export async function toggleFavorite(
  tenantId: string,
): Promise<{ isFavorite: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { isFavorite: false, error: 'No autenticado.' };
  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return { isFavorite: false, error: 'Sesión inválida.' };
  if (!tenantId) return { isFavorite: false, error: 'ID de salón requerido.' };

  const favRef = adminDb
    .collection('users').doc(uid)
    .collection('favorites').doc(tenantId);

  try {
    const existing = await favRef.get();
    if (existing.exists) {
      await favRef.delete();
      return { isFavorite: false };
    }

    const tenantSnap = await adminDb.collection('tenants').doc(tenantId).get();
    if (!tenantSnap.exists) return { isFavorite: false, error: 'Salón no encontrado.' };

    await favRef.set({
      slug: tenantSnap.data()!.slug ?? tenantId,
      savedAt: FieldValue.serverTimestamp(),
    });
    return { isFavorite: true };
  } catch (err) {
    console.error('[toggleFavorite] Error:', err);
    return { isFavorite: false, error: 'No se pudo actualizar favoritos.' };
  }
}

// ── Cancel Appointment ────────────────────────────────────────────────────────

/**
 * Cancels an appointment owned by the authenticated client.
 * Verifies ownership before writing to prevent horizontal privilege escalation.
 */
export async function cancelMyAppointment(
  appointmentId: string,
  tenantId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'No autenticado.' };
  const uid = (session.user as any).uid as string | undefined;
  if (!uid) return { success: false, error: 'Sesión inválida.' };

  const apptRef = adminDb
    .collection('tenants').doc(tenantId)
    .collection('appointments').doc(appointmentId);

  try {
    const snap = await apptRef.get();
    if (!snap.exists) return { success: false, error: 'Turno no encontrado.' };

    const data = snap.data()!;
    if (data.clientId !== uid) return { success: false, error: 'No tenés permiso para cancelar este turno.' };

    const terminalStatuses = ['cancelled', 'completed', 'cobrado', 'no_show'];
    if (terminalStatuses.includes(data.status)) {
      return { success: false, error: 'El turno ya está en un estado final y no puede cancelarse.' };
    }

    await apptRef.update({ status: 'cancelled' });
    return { success: true };
  } catch (err) {
    console.error('[cancelMyAppointment] Error:', err);
    return { success: false, error: 'No se pudo cancelar el turno.' };
  }
}
