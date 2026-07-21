'use server';

import { requireAuthSession } from '@/lib/auth-guards';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { format } from 'date-fns';
import {
  buildSlotLockId, isSlotLockExpired, hasSlotConflict, parseLocalDate, getFreeSlotsForDay,
} from '@/lib/booking-utils';
import { getAvailableSlots, getDefaultBranchId } from '@/actions/booking.actions';
import type {
  UserPreferences,
  ProfileData, HistorialEntry, HistorialGroup,
  HairProfile, SerializedPreferences, FavoriteSalonData,
  AppointmentStatus, Staff,
} from '@/lib/schema';

export type { ProfileData, HistorialEntry, HistorialGroup, HairProfile, SerializedPreferences, FavoriteSalonData };

const PHONE_RE = /^\+?[\d\s\-().]{6,20}$/;

function normalizeArgPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('54')) return '+' + digits
  if (digits.startsWith('0'))  return '+54' + digits.slice(1)
  return '+54' + digits
}

export async function getMyProfile(): Promise<ProfileData | null> {
  let auth: Awaited<ReturnType<typeof requireAuthSession>>;
  try { auth = await requireAuthSession(); } catch { return null; }

  const { uid, name: sessionName, email: sessionEmail, image: sessionPhoto } = auth;

  const profileRef = adminDb.collection('users').doc(uid);
  const snap = await profileRef.get();

  if (!snap.exists) {
    await profileRef.set({
      id: uid,
      displayName: sessionName ?? '',
      email: sessionEmail ?? '',
      photoURL: sessionPhoto ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
    return {
      displayName: sessionName ?? '',
      email: sessionEmail ?? '',
      phone: '',
      photoURL: sessionPhoto ?? null,
      createdAt: null,
    };
  }

  const data = snap.data()!;
  return {
    displayName: data.displayName ?? sessionName ?? '',
    email: data.email ?? sessionEmail ?? '',
    phone: data.phone ?? '',
    photoURL: data.photoURL ?? sessionPhoto ?? null,
    createdAt: (data.createdAt as Timestamp | undefined)?.toDate?.()?.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    }) ?? null,
  };
}

export async function updateMyProfile(
  updates: { displayName?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
  let uid: string;
  try { ({ uid } = await requireAuthSession()); } catch { return { success: false, error: 'No autenticado.' }; }

  const displayName = updates.displayName?.trim() ?? '';
  const phone       = updates.phone?.trim() ?? '';

  if (!displayName && !phone) return { success: false, error: 'No hay cambios para guardar.' };
  if (displayName && displayName.length < 2)  return { success: false, error: 'El nombre debe tener al menos 2 caracteres.' };
  if (displayName && displayName.length > 100) return { success: false, error: 'El nombre es demasiado largo.' };
  if (phone && !PHONE_RE.test(phone))          return { success: false, error: 'El teléfono no tiene un formato válido.' };

  try {
    const payload: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    if (displayName) payload.displayName = displayName;
    if (phone) payload.phone = normalizeArgPhone(phone);

    await adminDb.collection('users').doc(uid).set(payload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[updateMyProfile] Error:', err);
    return { success: false, error: 'No se pudo guardar el perfil.' };
  }
}

// ── Historial cross-tenant ────────────────────────────────────────────────────

export async function getMyHistorial(): Promise<HistorialGroup[]> {
  let uid: string; let tenantIds: string[];
  try { ({ uid, tenantIds } = await requireAuthSession()); } catch { return []; }
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
  let uid: string; let tenantIds: string[];
  try { ({ uid, tenantIds } = await requireAuthSession()); } catch { return []; }
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
          const status: AppointmentStatus = data.status ?? 'pending';
          if (status === 'cancelled' || status === 'no_show') continue;

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
            status,
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

export async function getMyHairProfile(): Promise<HairProfile | null> {
  let uid: string; let tenantIds: string[];
  try { ({ uid, tenantIds } = await requireAuthSession()); } catch { return null; }
  if (tenantIds.length === 0) return null;

  const customerSnap = await adminDb
    .collection('tenants').doc(tenantIds[0])
    .collection('customers').doc(uid)
    .get();

  if (!customerSnap.exists) return null;
  return (customerSnap.data()?.hairProfile as HairProfile) ?? null;
}

export async function updateMyHairProfile(
  updates: Partial<HairProfile>,
): Promise<{ success: boolean; error?: string }> {
  let uid: string; let tenantIds: string[];
  try { ({ uid, tenantIds } = await requireAuthSession()); } catch { return { success: false, error: 'No autenticado.' }; }
  if (!uid)                  return { success: false, error: 'Sesión inválida.' };
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

export async function getMyPreferences(): Promise<SerializedPreferences | null> {
  let uid: string;
  try { ({ uid } = await requireAuthSession()); } catch { return null; }

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

export async function updateMyPreferences(
  updates: Partial<Omit<UserPreferences, 'updatedAt'>>,
): Promise<{ success: boolean; error?: string }> {
  let uid: string;
  try { ({ uid } = await requireAuthSession()); } catch { return { success: false, error: 'No autenticado.' }; }

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

export async function getMyFavorites(): Promise<FavoriteSalonData[]> {
  let uid: string;
  try { ({ uid } = await requireAuthSession()); } catch { return []; }

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

export async function toggleFavorite(
  tenantId: string,
): Promise<{ isFavorite: boolean; error?: string }> {
  let uid: string;
  try { ({ uid } = await requireAuthSession()); } catch { return { isFavorite: false, error: 'No autenticado.' }; }
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

export async function cancelMyAppointment(
  appointmentId: string,
  tenantId: string,
): Promise<{ success: boolean; error?: string }> {
  let uid: string;
  try { ({ uid } = await requireAuthSession()); } catch { return { success: false, error: 'No autenticado.' }; }

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

    // Liberar el slotLock para que el horario vuelva a estar disponible.
    const slotStart = (data.date as Timestamp).toDate();
    const slotLockId = buildSlotLockId(data.staffId, slotStart);
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('slotLocks').doc(slotLockId)
      .delete()
      .catch(err => console.error('[cancelMyAppointment] slotLock cleanup failed:', err));

    return { success: true };
  } catch (err) {
    console.error('[cancelMyAppointment] Error:', err);
    return { success: false, error: 'No se pudo cancelar el turno.' };
  }
}

// ── Sugerencia "Para vos" (estilista habitual + próximo horario libre) ────────

const MIN_VISITS_FOR_PATTERN = 3;
const COMPLETED_STATUSES = ['completed', 'cobrado']; // dos valores distintos y reales, ver schema.ts

export interface SuggestedPattern {
  tenantId: string;
  tenantSlug: string;
  salonName: string;
  staffId: string;
  staffName: string;
  serviceIds: string[];
  serviceNames: string;
  priceEstimated: number;
  durationMinutes: number;
  visitCount: number;
}

interface PatternAccumulator {
  tenantId: string;
  staffId: string;
  staffName: string;
  salonName: string;
  salonSlug: string;
  count: number;
  lastServiceIds: string[];
  lastServiceNames: string;
  lastPrice: number;
  lastDuration: number;
}

/**
 * Detecta si la clienta tiene un patrón de visitas repetidas con la misma
 * estilista en el mismo salón (3+ turnos completados). Devuelve el patrón
 * más frecuente, o null si no hay ninguno. No depende de ningún campo
 * cargado a mano — se infiere del historial real.
 */
export async function detectFavoriteStylistPattern(): Promise<SuggestedPattern | null> {
  let uid: string; let tenantIds: string[];
  try { ({ uid, tenantIds } = await requireAuthSession()); } catch { return null; }
  if (tenantIds.length === 0) return null;

  const patternCounts = new Map<string, PatternAccumulator>();

  await Promise.all(
    tenantIds.map(async (tenantId) => {
      try {
        const tenantSnap = await adminDb.collection('tenants').doc(tenantId).get();
        if (!tenantSnap.exists) return;
        const tenantData = tenantSnap.data()!;

        const snap = await adminDb
          .collection('tenants').doc(tenantId)
          .collection('appointments')
          .where('clientId', '==', uid)
          .where('status', 'in', COMPLETED_STATUSES)
          .orderBy('date', 'desc')
          .limit(30)
          .get();

        for (const doc of snap.docs) {
          const d = doc.data();
          const key = `${tenantId}_${d.staffId}`;
          const existing = patternCounts.get(key);

          if (existing) {
            existing.count++;
          } else {
            patternCounts.set(key, {
              tenantId,
              staffId: d.staffId,
              staffName: d.staffName ?? 'tu profesional',
              salonName: tenantData.name ?? 'el salón',
              salonSlug: tenantData.slug ?? tenantId,
              count: 1,
              lastServiceIds: d.serviceIds ?? [],
              lastServiceNames: d.serviceNames ?? '',
              lastPrice: d.priceEstimated ?? 0,
              lastDuration: d.durationMinutes ?? 30,
            });
          }
        }
      } catch (err) {
        console.error(`[detectFavoriteStylistPattern] tenant ${tenantId}:`, err);
      }
    }),
  );

  let best: PatternAccumulator | null = null;
  for (const pattern of patternCounts.values()) {
    if (pattern.count >= MIN_VISITS_FOR_PATTERN && (!best || pattern.count > best.count)) {
      best = pattern;
    }
  }
  if (!best) return null;

  return {
    tenantId: best.tenantId,
    tenantSlug: best.salonSlug,
    salonName: best.salonName,
    staffId: best.staffId,
    staffName: best.staffName,
    serviceIds: best.lastServiceIds,
    serviceNames: best.lastServiceNames,
    priceEstimated: best.lastPrice,
    durationMinutes: best.lastDuration,
    visitCount: best.count,
  };
}

export interface SuggestedSlot {
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
}

const DAYS_TO_CHECK = 14;

/**
 * Busca el próximo horario libre de un staff, hasta 14 días adelante.
 * Reusa getAvailableSlots (booking.actions.ts) para los ocupados y
 * getFreeSlotsForDay (booking-utils.ts) para acotar por staff.schedule
 * cuando existe — no reimplementa ninguno de los dos cálculos.
 */
export async function findNextAvailableSlot(
  tenantId: string,
  staffId: string,
): Promise<SuggestedSlot | null> {
  try {
    const staffSnap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('staff').doc(staffId)
      .get();
    const schedule = staffSnap.exists ? (staffSnap.data() as Staff).schedule : undefined;

    for (let i = 1; i <= DAYS_TO_CHECK; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const { occupiedSlots, error } = await getAvailableSlots(tenantId, staffId, dateStr);
      if (error) continue;

      const freeSlots = getFreeSlotsForDay(schedule, date, occupiedSlots);
      if (freeSlots.length > 0) {
        return { date: dateStr, time: freeSlots[0] };
      }
    }

    return null; // sin disponibilidad en las próximas 2 semanas
  } catch (err) {
    console.error('[findNextAvailableSlot] Error:', err);
    return null;
  }
}

export interface MySuggestion {
  pattern: SuggestedPattern;
  slot: SuggestedSlot;
}

export async function getMySuggestion(): Promise<MySuggestion | null> {
  try {
    const pattern = await detectFavoriteStylistPattern();
    if (!pattern) return null;

    const slot = await findNextAvailableSlot(pattern.tenantId, pattern.staffId);
    if (!slot) return null;

    return { pattern, slot };
  } catch (err) {
    console.error('[getMySuggestion] Error:', err);
    return null;
  }
}

/**
 * Reserva en un tap. Re-valida el patrón server-side — el cliente no
 * manda tenantId/staffId/precio/servicio "a mano", solo confirma que
 * quiere ESE turno puntual. Reusa el mismo patrón transaccional
 * (slotLock + runTransaction) que createBooking en booking.actions.ts.
 */
export async function bookSuggestedAppointment(
  tenantId: string,
  staffId: string,
  date: string,
  time: string,
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  let uid: string; let userName: string | null | undefined;
  try {
    const auth = await requireAuthSession();
    uid = auth.uid;
    userName = auth.name;
  } catch {
    return { success: false, error: 'Iniciá sesión para reservar.' };
  }

  const pattern = await detectFavoriteStylistPattern();
  if (!pattern || pattern.tenantId !== tenantId || pattern.staffId !== staffId) {
    return { success: false, error: 'No se pudo confirmar la sugerencia. Reservá desde el buscador.' };
  }

  try {
    const tenantSnap = await adminDb.collection('tenants').doc(tenantId).get();
    if (!tenantSnap.exists || tenantSnap.data()!.isActivePublicly !== true) {
      return { success: false, error: 'Este salón no está disponible para reservas en este momento.' };
    }

    // Pre-check no atómico — mismo criterio que createBooking. La
    // transacción de abajo es la barrera definitiva contra doble booking.
    const conflict = await hasSlotConflict(tenantId, staffId, date, time, pattern.durationMinutes);
    if (conflict) {
      return { success: false, error: 'El horario ya no está disponible. Reservá desde el buscador.' };
    }

    const [hour, minute] = time.split(':').map(Number);
    const appointmentDateTime = parseLocalDate(date);
    appointmentDateTime.setHours(hour, minute, 0, 0);
    const slotStart = Timestamp.fromDate(appointmentDateTime);

    const appointmentRef = adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments').doc();

    const branchId = await getDefaultBranchId(tenantId);

    // Slot-lock: mismo patrón que los otros 3 flujos de reserva — la
    // fórmula de slotLockId debe ser idéntica o los locks no colisionan.
    const slotLockId = buildSlotLockId(staffId, appointmentDateTime);
    const slotLockRef = adminDb
      .collection('tenants').doc(tenantId)
      .collection('slotLocks').doc(slotLockId);

    try {
      await adminDb.runTransaction(async (txn) => {
        const lockSnap = await txn.get(slotLockRef);
        if (lockSnap.exists && !isSlotLockExpired(lockSnap.data() as { expiresAt?: Timestamp })) {
          throw Object.assign(new Error('SLOT_TAKEN'), { code: 'SLOT_TAKEN' });
        }

        const lockExpiry = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60_000));
        txn.set(slotLockRef, {
          staffId,
          date: slotStart,
          appointmentId: appointmentRef.id,
          expiresAt: lockExpiry,
        });

        txn.set(appointmentRef, {
          id: appointmentRef.id,
          tenantId,
          branchId,
          clientId: uid,
          clientName: (userName ?? 'Cliente').slice(0, 100),
          staffId,
          staffName: pattern.staffName.slice(0, 100),
          serviceIds: pattern.serviceIds,
          serviceNames: pattern.serviceNames.slice(0, 500),
          date: slotStart,
          durationMinutes: pattern.durationMinutes,
          status: 'pending_payment',
          priceEstimated: pattern.priceEstimated,
          depositAmount: 0,
          depositPaid: false,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: uid,
          source: 'suggested',
          notes: '',
        });
      });
    } catch (err: any) {
      if (err?.code === 'SLOT_TAKEN') {
        return { success: false, error: 'El horario ya no está disponible. Reservá desde el buscador.' };
      }
      throw err;
    }

    return { success: true, appointmentId: appointmentRef.id };
  } catch (err) {
    console.error('[bookSuggestedAppointment] Error:', err);
    return { success: false, error: 'No se pudo crear el turno. Intentá de nuevo.' };
  }
}
