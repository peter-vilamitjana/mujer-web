'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncAppointmentToCalendar, cancelCalendarEvent } from './calendar.actions';
import type { Appointment, PaymentSplit, Staff } from '@/lib/schema';

type ActionResult = { success: true; id?: string } | { success: false; error: string };

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  const uid = (session.user as { uid?: string }).uid;
  if (!uid) throw new Error('Sesión inválida.');
  return { session, uid };
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getAppointmentsForDay(
  tenantId: string,
  branchId: string | null,
  date: Date,
): Promise<Appointment[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const base = adminDb.collection('tenants').doc(tenantId).collection('appointments');
  const q = (branchId ? base.where('branchId', '==', branchId) : base)
    .where('date', '>=', Timestamp.fromDate(start))
    .where('date', '<=', Timestamp.fromDate(end))
    .orderBy('date', 'asc');

  try {
    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Appointment);
  } catch (err) {
    console.warn('[getAppointmentsForDay] Firestore read failed (returning []):', (err as Error)?.message);
    return [];
  }
}

// ─── Client-facing reads (Firestore REST — no Firebase Auth required) ─────────

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mujer-app';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function parseFirestoreValue(value: any): any {
  if (!value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue, 10);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return new Date(value.timestampValue);
  if ('mapValue' in value) {
    const fields = value.mapValue?.fields || {};
    return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, parseFirestoreValue(v)]));
  }
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(parseFirestoreValue);
  return null;
}

function parseFirestoreDoc(doc: any): Record<string, any> {
  const fields = doc.fields || {};
  const parsed: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) parsed[key] = parseFirestoreValue(value);
  const nameParts = (doc.name || '').split('/');
  parsed._id = nameParts[nameParts.length - 1];
  parsed._tenantId = nameParts[nameParts.indexOf('tenants') + 1] ?? null;
  return parsed;
}

export interface ClientAppointment {
  id: string;
  tenantId: string;
  serviceNames: string;
  staffName: string;
  date: string;
  status: string;
  priceEstimated: number;
  durationMinutes: number;
}

export async function getMyAppointments(clientId: string): Promise<ClientAppointment[]> {
  const url = `${FIRESTORE_BASE}:runQuery`;
  const structuredQuery = {
    from: [{ collectionId: 'appointments', allDescendants: true }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'clientId' },
        op: 'EQUAL',
        value: { stringValue: clientId },
      },
    },
    orderBy: [{ field: { fieldPath: 'date' }, direction: 'DESCENDING' }],
    limit: 100,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('[getMyAppointments] Firestore REST error:', await res.text());
      return [];
    }

    const results = await res.json();
    return results
      .filter((r: any) => r.document)
      .map((r: any) => {
        const d = parseFirestoreDoc(r.document);
        const dateRaw = d.date instanceof Date ? d.date : new Date(d.date ?? 0);
        return {
          id: d._id as string,
          tenantId: d._tenantId as string,
          serviceNames: (d.serviceNames as string) || '',
          staffName: (d.staffName as string) || '',
          date: dateRaw.toISOString(),
          status: (d.status as string) || 'pending',
          priceEstimated: (d.priceEstimated as number) || 0,
          durationMinutes: (d.durationMinutes as number) || 0,
        } satisfies ClientAppointment;
      });
  } catch (err) {
    console.warn('[getMyAppointments] error:', (err as Error).message);
    return [];
  }
}

export async function getAppointmentsToday(
  tenantId: string,
  branchId: string | null = null,
): Promise<Appointment[]> {
  return getAppointmentsForDay(tenantId, branchId, new Date());
}

export async function getNextAppointment(
  tenantId: string,
  branchId: string | null = null,
): Promise<Appointment | null> {
  const base = adminDb.collection('tenants').doc(tenantId).collection('appointments');
  const q = (branchId ? base.where('branchId', '==', branchId) : base)
    .where('status', 'in', ['confirmed', 'pending'])
    .where('date', '>=', Timestamp.fromDate(new Date()))
    .orderBy('date', 'asc')
    .limit(1);

  const snap = await q.get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Appointment;
}

export interface PendingApptRow {
  id: string;
  clientName: string;
  timeStr: string;
  priceEstimated: number;
}

export interface CobradoApptRow {
  id: string;
  clientName: string;
  serviceNames: string;
  paymentMethod: string;
  amountPaid: number;
  timeStr: string;
}

export interface DailyMetrics {
  totalRevenue: number;
  revenueByMethod: { efectivo: number; mercadopago: number; tarjeta: number; transferencia: number };
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  cobradoCount: number;
  totalAppts: number;
  occupancyRate: number;
  previousDayRevenue: number;
  revenueDeltaPct: number | null;
  staffCommissions: Array<{ staffId: string; staffName: string; amount: number }>;
  pendingAppts: PendingApptRow[];
  cobradoAppts: CobradoApptRow[];
}

export async function getDailyMetrics(
  tenantId: string,
  branchId: string,
  date: Date = new Date(),
): Promise<DailyMetrics> {
  const [todayAppts, yesterdayAppts] = await Promise.all([
    getAppointmentsForDay(tenantId, branchId, date),
    getAppointmentsForDay(tenantId, branchId, new Date(date.getTime() - 86_400_000)),
  ]);

  const cobrados = todayAppts.filter(a => a.status === 'cobrado' || a.status === 'completed');
  const totalRevenue = cobrados.reduce((sum, a) => sum + (a.amountPaid ?? a.priceFinal ?? 0), 0);

  const revenueByMethod = { efectivo: 0, mercadopago: 0, tarjeta: 0, transferencia: 0 };
  for (const a of cobrados) {
    const split = a.paymentMethods as PaymentSplit | undefined;
    if (split) {
      revenueByMethod.efectivo      += split.efectivo      ?? 0;
      revenueByMethod.mercadopago   += split.mercadopago   ?? 0;
      revenueByMethod.tarjeta       += split.tarjeta       ?? 0;
      revenueByMethod.transferencia += split.transferencia ?? 0;
    } else if (a.paymentMethod) {
      revenueByMethod[a.paymentMethod] += a.amountPaid ?? 0;
    }
  }

  const prevCobrados = yesterdayAppts.filter(a => a.status === 'cobrado' || a.status === 'completed');
  const previousDayRevenue = prevCobrados.reduce((sum, a) => sum + (a.amountPaid ?? a.priceFinal ?? 0), 0);
  const revenueDeltaPct = previousDayRevenue > 0
    ? Math.round(((totalRevenue - previousDayRevenue) / previousDayRevenue) * 100)
    : null;

  const activeAppts = todayAppts.filter(a => a.status !== 'cancelled');
  const occupancyRate = activeAppts.length > 0
    ? Math.round((cobrados.length / activeAppts.length) * 100)
    : 0;

  const commMap = new Map<string, { staffName: string; amount: number }>();
  for (const a of cobrados) {
    if (!a.staffId || !a.staffCommissionAmount) continue;
    const existing = commMap.get(a.staffId);
    if (existing) {
      existing.amount += a.staffCommissionAmount;
    } else {
      commMap.set(a.staffId, { staffName: a.staffName, amount: a.staffCommissionAmount });
    }
  }
  const staffCommissions = Array.from(commMap.entries()).map(([staffId, v]) => ({ staffId, ...v }));

  const toTimeStr = (a: Appointment) => {
    try { return (a.date as Timestamp).toDate().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }
    catch { return '—'; }
  };

  const pendingAppts: PendingApptRow[] = todayAppts
    .filter(a => a.status === 'pending' || a.status === 'pending_payment')
    .slice(0, 5)
    .map(a => ({ id: a.id, clientName: a.clientName ?? '', timeStr: toTimeStr(a), priceEstimated: a.priceEstimated ?? 0 }));

  const cobradoAppts: CobradoApptRow[] = cobrados
    .slice(0, 20)
    .map(a => ({
      id: a.id,
      clientName: a.clientName ?? '',
      serviceNames: a.serviceNames ?? '',
      paymentMethod: a.paymentMethod ?? 'efectivo',
      amountPaid: a.amountPaid ?? a.priceFinal ?? a.priceEstimated ?? 0,
      timeStr: toTimeStr(a),
    }));

  return {
    totalRevenue,
    revenueByMethod,
    confirmedCount:  todayAppts.filter(a => a.status === 'confirmed').length,
    pendingCount:    todayAppts.filter(a => a.status === 'pending').length,
    cancelledCount:  todayAppts.filter(a => a.status === 'cancelled').length,
    cobradoCount:    cobrados.length,
    totalAppts:      todayAppts.length,
    occupancyRate,
    previousDayRevenue,
    revenueDeltaPct,
    staffCommissions,
    pendingAppts,
    cobradoAppts,
  };
}

// ─── Weekly revenue ───────────────────────────────────────────────────────────

export interface DayRevenue {
  label: string;
  revenue: number;
  cobradoCount: number;
  isToday: boolean;
}

export async function getWeeklyRevenue(
  tenantId: string,
  branchId: string,
): Promise<DayRevenue[]> {
  const today = new Date();
  const dow = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const base = adminDb.collection('tenants').doc(tenantId).collection('appointments');
  const q = (branchId ? base.where('branchId', '==', branchId) : base)
    .where('date', '>=', Timestamp.fromDate(startOfWeek))
    .where('date', '<=', Timestamp.fromDate(endOfWeek))
    .orderBy('date', 'asc');

  let snap;
  try {
    snap = await q.get();
  } catch (err) {
    console.warn('[getWeeklyRevenue] Firestore read failed (returning empty):', (err as Error)?.message);
    snap = { docs: [] as typeof snap extends { docs: infer D } ? D : never[] };
  }

  const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const todayStr = today.toDateString();

  const slots: { revenue: number; cobradoCount: number; date: Date }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return { revenue: 0, cobradoCount: 0, date: d };
  });

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as Appointment;
    if (data.status !== 'cobrado' && data.status !== 'completed') continue;
    const apptDate = (data.date as Timestamp).toDate();
    const slotIdx = Math.floor((apptDate.getTime() - startOfWeek.getTime()) / 86_400_000);
    if (slotIdx >= 0 && slotIdx < 7) {
      slots[slotIdx].revenue += data.amountPaid ?? data.priceFinal ?? 0;
      slots[slotIdx].cobradoCount++;
    }
  }

  return slots.map(({ revenue, cobradoCount, date }) => ({
    label: DAY_LABELS[date.getDay()],
    revenue,
    cobradoCount,
    isToday: date.toDateString() === todayStr,
  }));
}

// ─── Revenue time-series (trend chart) ────────────────────────────────────────

export interface RevenueSeries {
  points: number[];
  labels: string[];
  total: number;
  maxVal: number;
}

export async function getRevenueTimeSeries(
  tenantId: string,
  branchId: string,
  period: 'dia' | 'semana' | 'mes',
): Promise<RevenueSeries> {
  const now = new Date();

  if (period === 'dia') {
    const appts = await getAppointmentsForDay(tenantId, branchId || null, now);
    const cobrados = appts.filter(a => a.status === 'cobrado' || a.status === 'completed');
    const curHour = now.getHours();
    const buckets = Array<number>(curHour + 1).fill(0);
    for (const a of cobrados) {
      try {
        const h = (a.date as Timestamp).toDate().getHours();
        if (h <= curHour) buckets[h] += a.amountPaid ?? a.priceFinal ?? 0;
      } catch { /* skip malformed date */ }
    }
    const total = buckets.reduce((s, v) => s + v, 0);
    return {
      points: buckets,
      labels: buckets.map((_, i) => `${String(i).padStart(2, '0')}hs`),
      total,
      maxVal: Math.max(...buckets, 1),
    };
  }

  if (period === 'semana') {
    const days = await getWeeklyRevenue(tenantId, branchId);
    const points = days.map(d => d.revenue);
    return {
      points,
      labels: days.map(d => d.label),
      total: points.reduce((s, v) => s + v, 0),
      maxVal: Math.max(...points, 1),
    };
  }

  // mes — last 30 days
  const start30 = new Date(now);
  start30.setDate(now.getDate() - 29);
  start30.setHours(0, 0, 0, 0);
  const end30 = new Date(now);
  end30.setHours(23, 59, 59, 999);

  const base = adminDb.collection('tenants').doc(tenantId).collection('appointments');
  const q = (branchId ? base.where('branchId', '==', branchId) : base)
    .where('date', '>=', Timestamp.fromDate(start30))
    .where('date', '<=', Timestamp.fromDate(end30))
    .orderBy('date', 'asc');

  let snap;
  try {
    snap = await q.get();
  } catch (err) {
    console.warn('[getRevenueTimeSeries] Firestore read failed (returning empty):', (err as Error)?.message);
    snap = { docs: [] as typeof snap extends { docs: infer D } ? D : never[] };
  }

  const buckets = Array<number>(30).fill(0);
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as Appointment;
    if (data.status !== 'cobrado' && data.status !== 'completed') continue;
    try {
      const apptDate = (data.date as Timestamp).toDate();
      const idx = Math.floor((apptDate.getTime() - start30.getTime()) / 86_400_000);
      if (idx >= 0 && idx < 30) buckets[idx] += data.amountPaid ?? data.priceFinal ?? 0;
    } catch { /* skip */ }
  }

  const total = buckets.reduce((s, v) => s + v, 0);
  return {
    points: buckets,
    labels: Array.from({ length: 30 }, (_, i) => {
      const d = new Date(start30);
      d.setDate(start30.getDate() + i);
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    }),
    total,
    maxVal: Math.max(...buckets, 1),
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface CreateAppointmentPayload {
  branchId: string;
  clientId: string;
  clientName: string;
  staffId: string;
  staffName: string;
  serviceIds: string[];
  serviceNames: string;
  date: Date;
  durationMinutes: number;
  priceEstimated: number;
  notes?: string;
  status?: 'confirmed' | 'pending';
}

export async function createAppointment(
  tenantId: string,
  payload: CreateAppointmentPayload,
): Promise<ActionResult> {
  try {
    const { uid } = await requireAdminSession();

    const staffSnap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('staff').doc(payload.staffId)
      .get();
    if (staffSnap.exists) {
      const staffData = staffSnap.data() as Staff;
      if (staffData.schedule) {
        const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = DAY_NAMES[payload.date.getDay()];
        const daySched = staffData.schedule[dayName];
        if (daySched) {
          if (!daySched.available) {
            return { success: false, error: `${staffData.name} no trabaja ese día.` };
          }
          const [sh, sm] = daySched.start.split(':').map(Number);
          const [eh, em] = daySched.end.split(':').map(Number);
          const schedStartMin = sh * 60 + sm;
          const schedEndMin   = eh * 60 + em;
          const apptStartMin  = payload.date.getHours() * 60 + payload.date.getMinutes();
          const apptEndMin    = apptStartMin + payload.durationMinutes;
          if (apptStartMin < schedStartMin || apptEndMin > schedEndMin) {
            return { success: false, error: `El turno está fuera del horario de ${staffData.name} (${daySched.start}–${daySched.end}).` };
          }
        }
      }
    }

    const slotStart  = Timestamp.fromDate(payload.date);
    const slotEnd    = Timestamp.fromDate(new Date(payload.date.getTime() + payload.durationMinutes * 60_000));
    const windowStart = new Date(payload.date.getTime() - 8 * 60 * 60_000);

    const potentialConflicts = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments')
      .where('staffId', '==', payload.staffId)
      .where('status', 'in', ['pending', 'confirmed'])
      .where('date', '>=', Timestamp.fromDate(windowStart))
      .where('date', '<', slotEnd)
      .limit(30)
      .get();

    const slotStartMs = slotStart.toMillis();
    const hasConflict = potentialConflicts.docs.some(d => {
      const data = d.data();
      const existingStartMs = (data.date as Timestamp).toMillis();
      const existingEndMs   = existingStartMs + (data.durationMinutes ?? 30) * 60_000;
      return existingEndMs > slotStartMs;
    });

    if (hasConflict) {
      return { success: false, error: 'El profesional ya tiene un turno en ese horario.' };
    }

    const ref = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments')
      .add({
        tenantId,
        branchId:        payload.branchId,
        clientId:        payload.clientId,
        clientName:      payload.clientName,
        staffId:         payload.staffId,
        staffName:       payload.staffName,
        serviceIds:      payload.serviceIds,
        serviceNames:    payload.serviceNames,
        date:            slotStart,
        durationMinutes: payload.durationMinutes,
        status:          payload.status ?? 'confirmed',
        priceEstimated:  payload.priceEstimated,
        depositAmount:   0,
        depositPaid:     false,
        notes:           payload.notes ?? null,
        source:          'admin',
        createdAt:       FieldValue.serverTimestamp(),
        createdBy:       uid,
      });

    syncAppointmentToCalendar(tenantId, ref.id).catch(err =>
      console.error('[createAppointment] GCal sync failed:', err),
    );

    return { success: true, id: ref.id };
  } catch (err) {
    console.error('[createAppointment]', err);
    return { success: false, error: 'No se pudo crear el turno.' };
  }
}

export async function cancelAppointmentAdmin(
  tenantId: string,
  appointmentId: string,
  reason?: string,
): Promise<ActionResult> {
  try {
    const { uid } = await requireAdminSession();

    const ref = adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments').doc(appointmentId);
    const snap = await ref.get();
    if (!snap.exists) return { success: false, error: 'Turno no encontrado.' };

    const data = snap.data() as Appointment;
    if (data.status === 'cobrado') {
      return { success: false, error: 'No se puede cancelar un turno ya cobrado.' };
    }

    await ref.update({
      status:             'cancelled',
      cancellationReason: reason ?? '',
      cancelledAt:        FieldValue.serverTimestamp(),
      cancelledBy:        uid,
    });

    cancelCalendarEvent(tenantId, appointmentId).catch(err =>
      console.error('[cancelAppointmentAdmin] GCal delete failed:', err),
    );

    return { success: true };
  } catch (err) {
    console.error('[cancelAppointmentAdmin]', err);
    return { success: false, error: 'No se pudo cancelar el turno.' };
  }
}
