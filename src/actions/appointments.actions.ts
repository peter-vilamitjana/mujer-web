'use server';

import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, limit, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncAppointmentToCalendar, cancelCalendarEvent } from './calendar.actions';
import type { Appointment, PaymentSplit } from '@/lib/schema';

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

/**
 * Devuelve todos los turnos de un día específico para una sucursal.
 * Ordenados por fecha ascendente.
 */
export async function getAppointmentsForDay(
  tenantId: string,
  branchId: string | null,
  date: Date,
): Promise<Appointment[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const constraints = [
    where('date', '>=', Timestamp.fromDate(start)),
    where('date', '<=', Timestamp.fromDate(end)),
    orderBy('date', 'asc'),
  ];
  if (branchId) constraints.unshift(where('branchId', '==', branchId));

  try {
    const snap = await getDocs(query(collection(db, 'tenants', tenantId, 'appointments'), ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Appointment);
  } catch (err) {
    console.warn('[getAppointmentsForDay] Firestore read failed (returning []):', (err as Error)?.message);
    return [];
  }
}

/**
 * Devuelve los turnos de hoy para un tenant (opcionalmente filtrado por sucursal).
 */
export async function getAppointmentsToday(
  tenantId: string,
  branchId: string | null = null,
): Promise<Appointment[]> {
  return getAppointmentsForDay(tenantId, branchId, new Date());
}

/**
 * Devuelve el próximo turno confirmado a partir de ahora.
 */
export async function getNextAppointment(
  tenantId: string,
  branchId: string | null = null,
): Promise<Appointment | null> {
  const constraints = [
    where('status', 'in', ['confirmed', 'pending']),
    where('date', '>=', Timestamp.fromDate(new Date())),
    orderBy('date', 'asc'),
    limit(1),
  ];
  if (branchId) constraints.unshift(where('branchId', '==', branchId));

  const snap = await getDocs(
    query(collection(db, 'tenants', tenantId, 'appointments'), ...constraints),
  );
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Appointment;
}

// Plain-object snapshots safe to cross the Server Action serialization boundary
export interface PendingApptRow {
  id: string;
  clientName: string;
  timeStr: string;   // "HH:MM"
  priceEstimated: number;
}

export interface CobradoApptRow {
  id: string;
  clientName: string;
  serviceNames: string;
  paymentMethod: string;
  amountPaid: number;
  timeStr: string;   // "HH:MM"
}

export interface DailyMetrics {
  totalRevenue: number;
  revenueByMethod: { efectivo: number; mercadopago: number; tarjeta: number; transferencia: number };
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  cobradoCount: number;
  totalAppts: number;
  occupancyRate: number;    // 0-100
  previousDayRevenue: number;
  revenueDeltaPct: number | null;
  staffCommissions: Array<{ staffId: string; staffName: string; amount: number }>;
  pendingAppts: PendingApptRow[];
  cobradoAppts: CobradoApptRow[];
}

/**
 * Calcula métricas del día: ingresos, desglose por método, ocupación y comisiones.
 * Se calcula en el servidor — no usa Cloud Functions.
 */
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

  const prevCobrados  = yesterdayAppts.filter(a => a.status === 'cobrado' || a.status === 'completed');
  const previousDayRevenue = prevCobrados.reduce((sum, a) => sum + (a.amountPaid ?? a.priceFinal ?? 0), 0);
  const revenueDeltaPct = previousDayRevenue > 0
    ? Math.round(((totalRevenue - previousDayRevenue) / previousDayRevenue) * 100)
    : null;

  const activeAppts = todayAppts.filter(a => a.status !== 'cancelled');
  const occupancyRate = activeAppts.length > 0
    ? Math.round((cobrados.length / activeAppts.length) * 100)
    : 0;

  // Comisiones por staff
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
  label: string;     // 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D'
  revenue: number;
  cobradoCount: number;
  isToday: boolean;
}

/**
 * Ingresos por día de la semana actual (lunes → domingo).
 * Solo appointments con status cobrado/completed.
 */
export async function getWeeklyRevenue(
  tenantId: string,
  branchId: string,
): Promise<DayRevenue[]> {
  const today = new Date();
  const dow = today.getDay(); // 0=Dom
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const constraints = [
    where('date', '>=', Timestamp.fromDate(startOfWeek)),
    where('date', '<=', Timestamp.fromDate(endOfWeek)),
    orderBy('date', 'asc'),
  ];
  if (branchId) constraints.unshift(where('branchId', '==', branchId));

  let snap;
  try {
    snap = await getDocs(
      query(collection(db, 'tenants', tenantId, 'appointments'), ...constraints),
    );
  } catch (err) {
    console.warn('[getWeeklyRevenue] Firestore read failed (returning empty):', (err as Error)?.message);
    snap = { docs: [] };
  }

  const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const todayStr = today.toDateString();

  // initialize Mon–Sun slots
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
  points: number[];   // revenue per time bucket
  labels: string[];   // display label per bucket
  total: number;
  maxVal: number;     // >= 1, for safe normalization
}

/**
 * Returns revenue bucketed by time for the INGRESOS TOTALES trend chart.
 * - dia:    hourly from 00:00 to current hour
 * - semana: daily Mon–Sun of current week
 * - mes:    daily for last 30 days
 */
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

  const constraints = [
    where('date', '>=', Timestamp.fromDate(start30)),
    where('date', '<=', Timestamp.fromDate(end30)),
    orderBy('date', 'asc'),
  ];
  if (branchId) constraints.unshift(where('branchId', '==', branchId));

  let snap;
  try {
    snap = await getDocs(
      query(collection(db, 'tenants', tenantId, 'appointments'), ...constraints),
    );
  } catch (err) {
    console.warn('[getRevenueTimeSeries] Firestore read failed (returning empty):', (err as Error)?.message);
    snap = { docs: [] };
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

/**
 * Crea un turno desde el panel admin.
 * Valida que el slot no esté ocupado por el mismo staff.
 * Sincroniza con Google Calendar (best-effort).
 */
export async function createAppointment(
  tenantId: string,
  payload: CreateAppointmentPayload,
): Promise<ActionResult> {
  try {
    const { uid } = await requireAdminSession();

    // Validar slot libre para ese staff
    const slotStart = Timestamp.fromDate(payload.date);
    const slotEnd   = Timestamp.fromDate(new Date(payload.date.getTime() + payload.durationMinutes * 60_000));

    const conflictSnap = await getDocs(
      query(
        collection(db, 'tenants', tenantId, 'appointments'),
        where('staffId', '==', payload.staffId),
        where('status', 'in', ['pending', 'confirmed']),
        where('date', '>=', slotStart),
        where('date', '<',  slotEnd),
        limit(1),
      ),
    );
    if (!conflictSnap.empty) {
      return { success: false, error: 'El profesional ya tiene un turno en ese horario.' };
    }

    const ref = await addDoc(collection(db, 'tenants', tenantId, 'appointments'), {
      tenantId,
      branchId:       payload.branchId,
      clientId:       payload.clientId,
      clientName:     payload.clientName,
      staffId:        payload.staffId,
      staffName:      payload.staffName,
      serviceIds:     payload.serviceIds,
      serviceNames:   payload.serviceNames,
      date:           slotStart,
      durationMinutes: payload.durationMinutes,
      status:         payload.status ?? 'confirmed',
      priceEstimated: payload.priceEstimated,
      depositAmount:  0,
      depositPaid:    false,
      notes:          payload.notes ?? null,
      source:         'admin',
      createdAt:      serverTimestamp(),
      createdBy:      uid,
    });

    // Google Calendar sync — best-effort, no bloquea la respuesta
    syncAppointmentToCalendar(tenantId, ref.id).catch(err =>
      console.error('[createAppointment] GCal sync failed:', err),
    );

    return { success: true, id: ref.id };
  } catch (err) {
    console.error('[createAppointment]', err);
    return { success: false, error: 'No se pudo crear el turno.' };
  }
}

/**
 * Cancela un turno desde el panel admin.
 * Elimina el evento de Google Calendar si existe.
 */
export async function cancelAppointmentAdmin(
  tenantId: string,
  appointmentId: string,
  reason?: string,
): Promise<ActionResult> {
  try {
    const { uid } = await requireAdminSession();

    const ref  = doc(db, 'tenants', tenantId, 'appointments', appointmentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Turno no encontrado.' };

    const data = snap.data() as Appointment;
    if (data.status === 'cobrado') {
      return { success: false, error: 'No se puede cancelar un turno ya cobrado.' };
    }

    await updateDoc(ref, {
      status:            'cancelled',
      cancellationReason: reason ?? '',
      cancelledAt:       serverTimestamp(),
      cancelledBy:       uid,
    });

    // GCal cleanup — best-effort
    cancelCalendarEvent(tenantId, appointmentId).catch(err =>
      console.error('[cancelAppointmentAdmin] GCal delete failed:', err),
    );

    return { success: true };
  } catch (err) {
    console.error('[cancelAppointmentAdmin]', err);
    return { success: false, error: 'No se pudo cancelar el turno.' };
  }
}
