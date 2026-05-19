'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import {
  collection, query, where, orderBy, getDocs, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTenant } from '@/contexts/TenantContext';
import { useStaff } from '@/hooks/useStaff';
import { useCatalog } from '@/hooks/useCatalog';
import { searchCustomers, createCustomer } from '@/actions/customer.actions';
import { createAppointment } from '@/actions/appointments.actions';
import { closeAppointment } from '@/actions/checkout.actions';
import type { Appointment, AppointmentStatus, Service } from '@/lib/schema';
import type { CreateEventBody } from '@/app/api/google/event/route';

// ── Constants ─────────────────────────────────────────────────────────────────

const SLOT_H = 68;
const SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30',
];
const AVATAR_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const staffColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const STATUS_CFG = {
  confirmado:       { bg: 'rgba(139,92,246,0.12)',  lbar: '#a78bfa', text: '#c4b5fd', icon: 'check_circle',  label: 'Confirmado' },
  pendiente:        { bg: 'rgba(251,191,36,0.11)',  lbar: '#fbbf24', text: '#fcd34d', icon: 'pending',       label: 'Pendiente'  },
  'pago-pendiente': { bg: 'rgba(244,63,94,0.11)',   lbar: '#fb7185', text: '#fda4af', icon: 'error_outline', label: 'Sin cobrar' },
  completado:       { bg: 'rgba(52,211,153,0.11)',  lbar: '#34d399', text: '#6ee7b7', icon: 'task_alt',      label: 'Completado' },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type ApptStatus = keyof typeof STATUS_CFG;
type Pro = { id: string; name: string; initials: string; color: string; avatar?: string };
type Appt = {
  id: string; pro: number; slot: number; dur: number;
  client: string; service: string; status: ApptStatus;
  amount: number; allergy?: string; notes?: string;
  firestoreStatus?: AppointmentStatus;
};
type ServiceLine = { serviceIdx: number };
type NewApptForm = {
  slot: number; pro: number;
  clientMode: 'search' | 'new';
  clientSearch: string; clientId: string | null;
  client: string; phone: string;
  services: ServiceLine[];
  notes: string; status: ApptStatus;
};
type SearchResult = { id: string; name: string; phone?: string; visits?: number };

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapFirestoreStatus(s: AppointmentStatus): ApptStatus {
  switch (s) {
    case 'confirmed':       return 'confirmado';
    case 'pending':         return 'pendiente';
    case 'pending_payment': return 'pago-pendiente';
    case 'cobrado':
    case 'completed':       return 'completado';
    default:                return 'pendiente';
  }
}

function dateToSlot(date: Date): number {
  return Math.round((date.getHours() * 60 + date.getMinutes() - 9 * 60) / 30);
}

function slotToDate(slotIdx: number, dateOffset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + dateOffset);
  const [h, m] = SLOTS[slotIdx].split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

function getServicePrice(svc: Service): number {
  if (typeof svc.price === 'number') return svc.price;
  if (svc.price && typeof svc.price === 'object') {
    if ('corto' in svc.price) return (svc.price as { corto: number }).corto;
    if ('from' in svc.price) return (svc.price as { from: number }).from;
  }
  return 0;
}

function getServiceDurSlots(svc: Service): number {
  return Math.max(1, Math.round(svc.durationMinutes / 30));
}

function mapToAppt(a: Appointment, pros: Pro[]): Appt | null {
  const date = (a.date as Timestamp).toDate();
  const slot = dateToSlot(date);
  if (slot < 0 || slot >= SLOTS.length) return null;
  const proIdx = pros.findIndex(p => p.id === a.staffId);
  if (proIdx === -1) return null;
  return {
    id: a.id,
    pro: proIdx,
    slot,
    dur: Math.max(1, Math.round((a.durationMinutes ?? 30) / 30)),
    client: a.clientName,
    service: a.serviceNames,
    status: mapFirestoreStatus(a.status),
    amount: a.priceFinal ?? a.priceEstimated ?? 0,
    notes: a.notes,
    firestoreStatus: a.status,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AgendaTabView() {
  const { tenantId, branchId } = useTenant();
  const { staff, loading: staffLoading } = useStaff();
  const { services: catalogServices } = useCatalog();

  // Derived pros array from real staff
  const pros = useMemo<Pro[]>(() =>
    staff.map(s => ({
      id:       s.id,
      name:     s.name.split(' ')[0], // first name only for column headers
      initials: initials(s.name),
      color:    staffColor(s.name),
      avatar:   s.avatarUrl,
    })),
    [staff],
  );

  // Services available in new-appt form
  const SERVICES = useMemo(() =>
    catalogServices.map(s => ({
      id:    s.id,
      name:  s.name,
      dur:   getServiceDurSlots(s),
      price: getServicePrice(s),
    })),
    [catalogServices],
  );

  // ── Appointment state ────────────────────────────────────────────────────────
  const [appts, setAppts]         = useState<Appt[]>([]);
  const [apptLoading, setApptLoading] = useState(false);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [checkoutId, setCheckoutId]   = useState<string | null>(null);
  const [dateOffset, setDateOffset]   = useState(0);
  const [payMethod,  setPayMethod]    = useState(0);
  const [calendarView, setCalendarView] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [weekPro, setWeekPro]           = useState<number | 'all'>('all');
  const [newAppt, setNewAppt]           = useState<NewApptForm | null>(null);
  const [draggedId, setDraggedId]       = useState<string | null>(null);
  const [dropTarget, setDropTarget]     = useState<{ slot: number; pro: number } | null>(null);

  // ── Google Calendar integration ──────────────────────────────────────────────
  const [gcalConnected, setGcalConnected] = useState<boolean | null>(null); // null = loading
  const [gcalSyncing,   setGcalSyncing]   = useState(false);
  const [gcalError,     setGcalError]     = useState<string | null>(null);

  // Check connection on mount + handle ?gcal= query param
  useEffect(() => {
    fetch('/api/google/status')
      .then(r => r.json())
      .then(d => setGcalConnected(!!d.connected))
      .catch(() => setGcalConnected(false));

    const params = new URLSearchParams(window.location.search);
    if (params.get('gcal') === 'connected') setGcalConnected(true);
    if (params.get('gcal') === 'error') setGcalError('No se pudo conectar con Google Calendar.');
    // Clean query param without history push
    if (params.has('gcal')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('gcal');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleGcalConnect = () => {
    const slug = window.location.pathname.split('/')[1];
    window.location.href = `/api/google/connect?slug=${slug}`;
  };

  const handleGcalDisconnect = async () => {
    setGcalSyncing(true);
    try {
      await fetch('/api/google/disconnect', { method: 'POST' });
      setGcalConnected(false);
    } catch {
      setGcalError('Error al desconectar.');
    } finally {
      setGcalSyncing(false);
    }
  };

  const syncApptToGcal = useCallback(async (
    clientName: string,
    serviceName: string,
    startDate: Date,
    durationMinutes: number,
    notes?: string,
  ) => {
    if (!gcalConnected) return;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);
    const body: CreateEventBody = {
      summary:     `${clientName} — ${serviceName}`,
      description: notes ? `Notas: ${notes}` : undefined,
      startIso:    startDate.toISOString(),
      endIso:      endDate.toISOString(),
      colorId:     '3',
    };
    await fetch('/api/google/event', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }).catch(err => console.error('[syncApptToGcal]', err));
  }, [gcalConnected]);

  // ── New appointment form: client search ─────────────────────────────────────
  const [clientResults, setClientResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!newAppt || newAppt.clientMode !== 'search') {
      setClientResults([]);
      return;
    }
    const q = newAppt.clientSearch.trim();
    if (q.length < 2) { setClientResults([]); return; }
    const timer = setTimeout(async () => {
      if (!tenantId) return;
      const results = await searchCustomers(tenantId, q);
      setClientResults(results.slice(0, 6).map(c => ({
        id:     c.id,
        name:   c.fullName,
        phone:  c.phone,
        visits: c.metrics?.totalVisits,
      })));
    }, 300);
    return () => clearTimeout(timer);
  }, [newAppt?.clientSearch, newAppt?.clientMode, tenantId]);

  // ── Load appointments for selected date ─────────────────────────────────────
  const loadAppts = useCallback(async () => {
    if (!tenantId || pros.length === 0) return;
    setApptLoading(true);
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dateOffset);
      const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
      const end   = new Date(targetDate); end.setHours(23, 59, 59, 999);

      const constraints = [
        where('status', 'not-in', ['cancelled', 'no_show']),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end)),
        orderBy('date', 'asc'),
      ];
      if (branchId) constraints.unshift(where('branchId', '==', branchId) as any);

      const snap = await getDocs(
        query(collection(db, 'tenants', tenantId, 'appointments'), ...constraints),
      );
      const loaded = snap.docs
        .map(d => mapToAppt({ id: d.id, ...d.data() } as Appointment, pros))
        .filter((a): a is Appt => a !== null);
      setAppts(loaded);
    } catch (err) {
      console.error('[AgendaTabView] loadAppts:', err);
    } finally {
      setApptLoading(false);
    }
  }, [tenantId, branchId, dateOffset, pros]);

  useEffect(() => {
    loadAppts();
  }, [loadAppts]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const selectedAppt = appts.find(a => a.id === selectedId) ?? null;
  const checkoutAppt = appts.find(a => a.id === checkoutId) ?? null;

  const displayDate = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + dateOffset);
    const day  = d.toLocaleDateString('es-AR', { weekday: 'short' });
    const date = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    return `${day.charAt(0).toUpperCase() + day.slice(1)}, ${date}`;
  }, [dateOffset]);

  const weekOffset = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + dateOffset);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return dateOffset - dow;
  }, [dateOffset]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + weekOffset + i);
      return { d, offset: weekOffset + i };
    }), [weekOffset]);

  const weekLabel = useMemo(() => {
    const s = weekDays[0].d, e = weekDays[6].d;
    const sm = s.toLocaleDateString('es-AR', { month: 'short' });
    const em = e.toLocaleDateString('es-AR', { month: 'short' });
    return sm === em
      ? `${s.getDate()} – ${e.getDate()} ${sm}`
      : `${s.getDate()} ${sm} – ${e.getDate()} ${em}`;
  }, [weekDays]);

  const monthLabel = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + dateOffset);
    const lbl = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return lbl.charAt(0).toUpperCase() + lbl.slice(1);
  }, [dateOffset]);

  const monthCells = useMemo(() => {
    const ref = new Date(); ref.setDate(ref.getDate() + dateOffset);
    const year = ref.getFullYear(), month = ref.getMonth();
    const first = new Date(year, month, 1);
    const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const cells: Array<{ day: number; offset: number; isToday: boolean } | null> = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const offset = Math.round((date.getTime() - today.getTime()) / 86400000);
      cells.push({ day, offset, isToday });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [dateOffset]);

  const occupiedCells = useMemo(() => {
    const s = new Set<string>();
    appts.forEach(a => {
      if (a.id === draggedId) return;
      for (let i = 0; i < a.dur; i++) s.add(`${a.slot + i}-${a.pro}`);
    });
    return s;
  }, [appts, draggedId]);

  const canDrop = (targetSlot: number, targetPro: number): boolean => {
    if (draggedId === null) return false;
    const dragged = appts.find(a => a.id === draggedId);
    if (!dragged) return false;
    for (let i = 0; i < dragged.dur; i++) {
      if (targetSlot + i >= SLOTS.length) return false;
      if (occupiedCells.has(`${targetSlot + i}-${targetPro}`)) return false;
    }
    return true;
  };

  const draggedDur = draggedId !== null ? (appts.find(a => a.id === draggedId)?.dur ?? 1) : 0;

  const nowPx = useMemo(() => {
    const n = new Date(); const nm = n.getHours() * 60 + n.getMinutes();
    const start = 9 * 60, end = 18 * 60 + 30;
    return ((nm - start) / (end - start)) * (SLOTS.length * SLOT_H);
  }, []);

  const totalH = SLOTS.length * SLOT_H;
  const todayColIdx = weekDays.findIndex(wd => wd.offset === 0);

  // ── Nav ───────────────────────────────────────────────────────────────────────
  const openNewAppt = (slot = 0, pro = 0) => {
    setNewAppt({ slot, pro, clientMode: 'search', clientSearch: '', clientId: null, client: '', phone: '', services: [{ serviceIdx: 0 }], notes: '', status: 'confirmado' });
    setApptError(null);
    setSelectedId(null);
    setCheckoutId(null);
  };

  const navPrev = () => {
    if (calendarView === 'mes') {
      const d = new Date(); d.setDate(d.getDate() + dateOffset);
      const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      setDateOffset(Math.round((prev.getTime() - new Date().getTime()) / 86400000));
    } else {
      setDateOffset(o => o - (calendarView === 'semana' ? 7 : 1));
    }
  };

  const navNext = () => {
    if (calendarView === 'mes') {
      const d = new Date(); d.setDate(d.getDate() + dateOffset);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      setDateOffset(Math.round((next.getTime() - new Date().getTime()) / 86400000));
    } else {
      setDateOffset(o => o + (calendarView === 'semana' ? 7 : 1));
    }
  };

  // ── New appointment submit ────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [apptError, setApptError] = useState<string | null>(null);

  const handleSubmitNewAppt = async () => {
    if (!newAppt || !tenantId) return;
    const clientName = newAppt.clientMode === 'search'
      ? (clientResults.find(c => c.id === newAppt.clientId)?.name ?? newAppt.clientSearch.trim())
      : newAppt.client.trim();
    if (!clientName) return;

    const selectedSvcs = newAppt.services.map(sl => SERVICES[sl.serviceIdx]).filter(Boolean);
    const svcIds   = newAppt.services.map(sl => catalogServices[sl.serviceIdx]?.id ?? '').filter(Boolean);
    const svcNames = selectedSvcs.map(s => s.name).join(' + ');
    const totalDur = selectedSvcs.reduce((s, sv) => s + sv.dur, 0);
    const totalAmt = selectedSvcs.reduce((s, sv) => s + sv.price, 0);

    const selectedStaff = staff[newAppt.pro];
    if (!selectedStaff) return;

    setApptError(null);
    setSubmitting(true);
    try {
      // Persist new client to Firestore if created inline
      let resolvedClientId = newAppt.clientId;
      if (newAppt.clientMode === 'new' && !resolvedClientId) {
        const newClientResult = await createCustomer(tenantId, {
          fullName: clientName,
          ...(newAppt.phone ? { phone: newAppt.phone } : {}),
          metrics: { totalVisits: 0, totalSpent: 0 },
        });
        if (newClientResult.success && newClientResult.id) {
          resolvedClientId = newClientResult.id;
        }
      }

      const result = await createAppointment(tenantId, {
        branchId:        branchId ?? '',
        clientId:        resolvedClientId ?? `guest-${Date.now()}`,
        clientName,
        staffId:         selectedStaff.id,
        staffName:       selectedStaff.name,
        serviceIds:      svcIds,
        serviceNames:    svcNames,
        date:            slotToDate(newAppt.slot, dateOffset),
        durationMinutes: Math.max(totalDur, 1) * 30,
        priceEstimated:  totalAmt,
        notes:           newAppt.notes || undefined,
        status:          newAppt.status === 'confirmado' ? 'confirmed' : 'pending',
      });

      if (result.success) {
        const newId = result.id ?? `local-${Date.now()}`;
        setAppts(prev => [...prev, {
          id:      newId,
          pro:     newAppt.pro,
          slot:    newAppt.slot,
          dur:     Math.max(totalDur, 1),
          client:  clientName,
          service: svcNames,
          status:  newAppt.status,
          amount:  totalAmt,
          ...(newAppt.notes ? { notes: newAppt.notes } : {}),
        }]);
        setSelectedId(newId);
        setNewAppt(null);

        // Best-effort Google Calendar sync
        syncApptToGcal(
          clientName,
          svcNames,
          slotToDate(newAppt.slot, dateOffset),
          Math.max(totalDur, 1) * 30,
          newAppt.notes || undefined,
        );
      } else {
        setApptError(result.error ?? 'No se pudo crear el turno.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Checkout submit ───────────────────────────────────────────────────────────
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const PAY_METHODS = ['tarjeta', 'efectivo', 'transferencia'] as const;

  const handleConfirmCheckout = async () => {
    if (!checkoutAppt || !tenantId) return;
    const method = PAY_METHODS[payMethod] ?? 'efectivo';
    const commissionRate = staff[checkoutAppt.pro]?.commissions?.default ?? 30;

    setCheckoutSubmitting(true);
    setCheckoutError(null);
    try {
      const result = await closeAppointment(tenantId, checkoutAppt.id, {
        amountPaid: checkoutAppt.amount,
        paymentMethod: method,
        paymentMethods: { [method]: checkoutAppt.amount } as any,
        commissionCalculated: commissionRate,
      });
      if (result.success) {
        setAppts(prev => prev.map(a =>
          a.id === checkoutAppt.id ? { ...a, status: 'completado' as const, firestoreStatus: 'cobrado' } : a,
        ));
        setCheckoutId(null);
        setSelectedId(checkoutAppt.id);
      } else {
        setCheckoutError(result.error ?? 'Error al cobrar.');
      }
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (staffLoading && pros.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '28px' }}>progress_activity</span>
          <p className="text-[#7a766e] text-sm">Cargando agenda…</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold italic text-[#f5f0e8] leading-tight">Agenda</h1>
          <p className="text-[#7a766e] text-sm mt-1 flex items-center gap-1.5">
            <Sparkles size={13} className="text-violet-400" />
            {apptLoading ? 'Cargando…' : `${appts.length} turnos agendados`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date nav pill */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
            <button onClick={navPrev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-[#7a766e] hover:text-[#f5f0e8] transition-colors cursor-pointer" aria-label="Anterior">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>
            <button onClick={() => setDateOffset(0)} className="px-3 h-8 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-white/[0.04] group min-w-[80px]" aria-label="Ir a hoy">
              {calendarView === 'dia' && (<>
                <span className="text-[11px] font-bold text-[#f5f0e8] leading-none tabular-nums">
                  {(() => { const d = new Date(); d.setDate(d.getDate() + dateOffset); return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }); })()}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wide leading-none mt-0.5 transition-colors ${dateOffset === 0 ? 'text-violet-400' : 'text-[#7a766e] group-hover:text-[#f5f0e8]'}`}>
                  {dateOffset === 0 ? 'hoy' : (() => { const d = new Date(); d.setDate(d.getDate() + dateOffset); return d.toLocaleDateString('es-AR', { weekday: 'short' }); })()}
                </span>
              </>)}
              {calendarView === 'semana' && (
                <span className="text-[11px] font-bold text-[#f5f0e8] leading-none">{weekLabel}</span>
              )}
              {calendarView === 'mes' && (
                <span className="text-[11px] font-bold text-[#f5f0e8] leading-none capitalize">{monthLabel}</span>
              )}
            </button>
            <button onClick={navNext} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-[#7a766e] hover:text-[#f5f0e8] transition-colors cursor-pointer" aria-label="Siguiente">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
            {(['dia', 'semana', 'mes'] as const).map(v => (
              <button key={v} onClick={() => setCalendarView(v)} className={`px-3 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${calendarView === v ? 'bg-violet-500/20 text-violet-300' : 'text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.04]'}`}>
                {v === 'dia' ? 'Día' : v === 'semana' ? 'Sem' : 'Mes'}
              </button>
            ))}
          </div>
          <button onClick={() => openNewAppt()} className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]">
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">Nuevo turno</span>
          </button>
        </div>
      </div>

      {/* Layout: calendar + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* CALENDAR */}
        <div className="lg:col-span-8 xl:col-span-9 relative isolate rounded-[1.5rem] border border-white/[0.08] overflow-hidden flex flex-col bg-[#0d0d0d]/40 shadow-[0_20px_60px_rgba(0,0,0,0.4)]" style={{ minHeight: 400 }}>
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

          {/* ── DAY VIEW ── */}
          {calendarView === 'dia' && (<>
            {/* Prominent date bar */}
            {(() => {
              const d = new Date(); d.setDate(d.getDate() + dateOffset);
              const isToday = dateOffset === 0;
              const dayNum  = d.getDate();
              const weekday = d.toLocaleDateString('es-AR', { weekday: 'long' });
              const month   = d.toLocaleDateString('es-AR', { month: 'long' });
              const year    = d.getFullYear();
              return (
                <div className={`flex items-center gap-5 px-5 py-4 border-b shrink-0 transition-colors ${isToday ? 'border-violet-500/15 bg-violet-500/[0.04]' : 'border-white/[0.06]'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-violet-500 shadow-[0_0_28px_rgba(139,92,246,0.45)]' : 'bg-white/[0.05] border border-white/[0.08]'}`}>
                      <span className={`font-playfair font-bold leading-none ${isToday ? 'text-white text-4xl' : 'text-[#f5f0e8] text-3xl'}`}>{dayNum}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5 ${isToday ? 'text-white/70' : 'text-[#7a766e]'}`}>
                        {d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-playfair text-2xl font-bold italic text-[#f5f0e8] leading-tight capitalize">{weekday}</span>
                      <span className="text-sm text-[#7a766e] capitalize">{month} {year}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2 shrink-0">
                    {isToday && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/15 border border-violet-500/25 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest">En vivo</span>
                      </div>
                    )}
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[10px] text-[#7a766e] uppercase tracking-widest">{appts.length} turnos</span>
                      <span className="text-[11px] font-bold font-mono text-[#f5f0e8]">
                        ${appts.reduce((s, a) => s + a.amount, 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#0d0d0d]/70 backdrop-blur-xl shrink-0" style={{ display: 'grid', gridTemplateColumns: `56px repeat(${pros.length || 1}, 1fr)` }}>
              <div className="p-3 flex items-center justify-center border-r border-white/[0.05]">
                <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '17px' }}>schedule</span>
              </div>
              {pros.length === 0 ? (
                <div className="px-3 py-2.5 flex items-center justify-center text-[#7a766e] text-xs">Sin profesionales</div>
              ) : pros.map((pro, i) => (
                <div key={pro.id} className="px-3 py-2.5 flex items-center gap-2.5 border-r border-white/[0.05] last:border-r-0">
                  {pro.avatar ? (
                    <img src={pro.avatar} alt={pro.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0" style={{ background: `${pro.color}1a`, color: pro.color, border: `1px solid ${pro.color}33` }}>
                      {pro.initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-playfair font-bold italic text-[#f5f0e8] text-sm leading-none truncate">{pro.name}</p>
                    <p className="text-[10px] text-[#7a766e] mt-0.5">{appts.filter(a => a.pro === i).length} turnos</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
              <div className="relative" style={{ display: 'grid', gridTemplateColumns: `56px repeat(${pros.length || 1}, 1fr)`, gridTemplateRows: `repeat(${SLOTS.length}, ${SLOT_H}px)`, height: totalH }}>
                {SLOTS.map((_, i) => (
                  <div key={`rl-${i}`} className="pointer-events-none border-b border-white/[0.035]" style={{ gridColumn: '1 / -1', gridRow: i + 1 }} />
                ))}
                {SLOTS.map((time, i) => (
                  <div key={`t-${i}`} className="flex items-start justify-center pt-2 border-r border-white/[0.05]" style={{ gridColumn: 1, gridRow: i + 1 }}>
                    <span className="text-[10px] font-mono font-bold text-[#7a766e] tabular-nums">{time}</span>
                  </div>
                ))}
                {SLOTS.flatMap((_, slot) =>
                  pros.map((_, pro) => {
                    if (occupiedCells.has(`${slot}-${pro}`)) return null;
                    const isDragging = draggedId !== null;
                    const validTarget = isDragging && canDrop(slot, pro);
                    return (
                      <div
                        key={`e-${slot}-${pro}`}
                        className={`p-1 group/add ${isDragging ? 'cursor-copy' : ''}`}
                        style={{ gridColumn: pro + 2, gridRow: slot + 1 }}
                        onDragOver={e => { e.preventDefault(); if (validTarget) setDropTarget({ slot, pro }); }}
                        onDrop={e => {
                          e.preventDefault();
                          if (draggedId !== null && validTarget) {
                            setAppts(prev => prev.map(a => a.id === draggedId ? { ...a, slot, pro } : a));
                            setSelectedId(draggedId);
                          }
                          setDraggedId(null); setDropTarget(null);
                        }}
                      >
                        {!isDragging && (
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label="Agregar turno"
                            onClick={() => openNewAppt(slot, pro)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNewAppt(slot, pro); } }}
                            className="w-full h-full rounded-lg border border-dashed border-transparent group-hover/add:border-violet-500/25 group-hover/add:bg-violet-500/[0.04] transition-all duration-200 flex items-center justify-center cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-violet-400/0 group-hover/add:text-violet-400/50 transition-all" style={{ fontSize: '13px' }}>add</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Drop preview */}
                {draggedId !== null && dropTarget !== null && canDrop(dropTarget.slot, dropTarget.pro) && (() => {
                  const dragged = appts.find(a => a.id === draggedId);
                  const cfg = dragged ? STATUS_CFG[dragged.status] : null;
                  return cfg ? (
                    <div className="pointer-events-none rounded-md z-10 transition-all" style={{ gridColumn: dropTarget.pro + 2, gridRow: `${dropTarget.slot + 1} / span ${draggedDur}`, background: `${cfg.lbar}18`, border: `2px dashed ${cfg.lbar}70` }} />
                  ) : null;
                })()}

                {appts.map(appt => {
                  const cfg = STATUS_CFG[appt.status];
                  const isSel = selectedId === appt.id;
                  const isDragged = draggedId === appt.id;
                  return (
                    <div
                      key={appt.id}
                      draggable
                      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDraggedId(appt.id); setDropTarget(null); }}
                      onDragEnd={() => { setDraggedId(null); setDropTarget(null); }}
                      className="p-[3px] transition-opacity duration-150"
                      style={{ gridColumn: appt.pro + 2, gridRow: `${appt.slot + 1} / span ${appt.dur}`, opacity: isDragged ? 0.35 : 1 }}
                    >
                      <div
                        onClick={() => { if (!isDragged) { setSelectedId(appt.id); setCheckoutId(null); } }}
                        className={`h-full rounded-md overflow-hidden flex flex-col transition-all duration-200 ${isDragged ? 'cursor-grabbing' : 'cursor-grab'} ${isSel && !isDragged ? 'shadow-[0_0_18px_rgba(139,92,246,0.18)]' : 'hover:brightness-110'}`}
                        style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.lbar}`, outline: isSel && !isDragged ? `1px solid ${cfg.lbar}55` : 'none' }}
                      >
                        <div className="p-2 flex flex-col gap-0.5 h-full min-h-0">
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[11px] font-bold leading-tight truncate" style={{ color: cfg.text }}>{appt.client}</span>
                            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '11px', color: cfg.text, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                          </div>
                          <p className="text-[9px] uppercase tracking-wider text-[#7a766e] truncate leading-tight">{appt.service}</p>
                          {appt.dur >= 2 && (
                            <p className="text-[10px] font-bold font-mono" style={{ color: cfg.text }}>${appt.amount.toLocaleString('es-AR')}</p>
                          )}
                          {appt.allergy && appt.dur >= 3 && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-rose-400" style={{ fontSize: '9px' }}>warning</span>
                              <span className="text-[8px] text-rose-400">Alergia</span>
                            </div>
                          )}
                          {appt.dur >= 2 && appt.status !== 'completado' && (
                            <div className="flex gap-1 mt-auto pt-1">
                              <button
                                onClick={e => { e.stopPropagation(); setCheckoutId(appt.id); setSelectedId(appt.id); }}
                                className="flex-1 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide cursor-pointer transition-all min-h-[28px]"
                                style={{ background: `${cfg.lbar}22`, color: cfg.text }}
                              >
                                Cobrar
                              </button>
                              <button onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] cursor-pointer transition-colors">
                                <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '12px' }}>chat</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {dateOffset === 0 && nowPx > 0 && nowPx < totalH && (
                  <div className="pointer-events-none absolute left-0 right-0 z-30 flex items-center" style={{ top: nowPx }}>
                    <div className="w-2 h-2 rounded-full bg-rose-400 ml-[48px] shrink-0 shadow-[0_0_6px_rgba(251,113,133,0.9)]" />
                    <div className="flex-1 h-px bg-rose-400/50" />
                  </div>
                )}
              </div>
            </div>
          </>)}

          {/* ── WEEK VIEW ── */}
          {calendarView === 'semana' && (<>
            {/* Pro filter */}
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.06] bg-[#0d0d0d]/60 backdrop-blur-xl shrink-0 overflow-x-auto">
              <button
                onClick={() => setWeekPro('all')}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${weekPro === 'all' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/25' : 'text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.05] border border-transparent'}`}
              >Todos</button>
              {pros.map((pro, i) => (
                <button
                  key={pro.id}
                  onClick={() => setWeekPro(i)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer border ${weekPro === i ? 'border-current' : 'border-transparent text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.05]'}`}
                  style={weekPro === i ? { background: `${pro.color}15`, color: pro.color, borderColor: `${pro.color}40` } : {}}
                >
                  {pro.avatar ? (
                    <img src={pro.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pro.color }} />
                  )}
                  {pro.name}
                </button>
              ))}
            </div>

            {/* Day header */}
            <div className="sticky top-0 z-20 grid border-b border-white/[0.07] bg-[#0d0d0d]/70 backdrop-blur-xl shrink-0" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
              <div className="p-3 flex items-center justify-center border-r border-white/[0.05]">
                <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '17px' }}>schedule</span>
              </div>
              {weekDays.map(({ d, offset: ofs }) => {
                const isToday = ofs === 0;
                return (
                  <button key={ofs} onClick={() => { setDateOffset(ofs); setCalendarView('dia'); }}
                    className={`px-1 py-2 flex flex-col items-center gap-0.5 border-r border-white/[0.05] last:border-r-0 cursor-pointer hover:bg-white/[0.03] transition-colors ${isToday ? 'bg-violet-500/[0.06]' : ''}`}>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${isToday ? 'text-violet-400' : 'text-[#7a766e]'}`}>
                      {d.toLocaleDateString('es-AR', { weekday: 'short' })}
                    </span>
                    <span className={`text-base font-bold leading-none ${isToday ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>{d.getDate()}</span>
                    {isToday && <div className="w-1 h-1 rounded-full bg-violet-400 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
              <div className="relative" style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', gridTemplateRows: `repeat(${SLOTS.length}, ${SLOT_H}px)`, height: totalH }}>
                {SLOTS.map((_, i) => (
                  <div key={`rl-${i}`} className="pointer-events-none border-b border-white/[0.035]" style={{ gridColumn: '1 / -1', gridRow: i + 1 }} />
                ))}
                {SLOTS.map((time, i) => (
                  <div key={`t-${i}`} className="flex items-start justify-center pt-2 border-r border-white/[0.05]" style={{ gridColumn: 1, gridRow: i + 1 }}>
                    <span className="text-[10px] font-mono font-bold text-[#7a766e] tabular-nums">{time}</span>
                  </div>
                ))}
                {todayColIdx >= 0 && (
                  <div className="pointer-events-none bg-violet-500/[0.03]" style={{ gridColumn: todayColIdx + 2, gridRow: `1 / ${SLOTS.length + 1}` }} />
                )}
                {weekPro !== 'all' ? (
                  todayColIdx >= 0 && appts.filter(a => a.pro === weekPro).map(appt => {
                    const cfg = STATUS_CFG[appt.status];
                    const isSel = selectedId === appt.id;
                    return (
                      <div key={appt.id} className="p-[3px]" style={{ gridColumn: todayColIdx + 2, gridRow: `${appt.slot + 1} / span ${appt.dur}` }}>
                        <div
                          onClick={() => { setSelectedId(appt.id); setCheckoutId(null); setCalendarView('dia'); setDateOffset(0); }}
                          className={`h-full rounded-md overflow-hidden flex flex-col cursor-pointer transition-all duration-200 ${isSel ? 'shadow-[0_0_18px_rgba(139,92,246,0.18)]' : 'hover:brightness-110'}`}
                          style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.lbar}`, outline: isSel ? `1px solid ${cfg.lbar}55` : 'none' }}
                        >
                          <div className="p-2 flex flex-col gap-0.5 h-full min-h-0">
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[11px] font-bold leading-tight truncate" style={{ color: cfg.text }}>{appt.client}</span>
                              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '11px', color: cfg.text, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                            </div>
                            <p className="text-[9px] uppercase tracking-wider text-[#7a766e] truncate leading-tight">{appt.service}</p>
                            {appt.dur >= 2 && (
                              <p className="text-[10px] font-bold font-mono" style={{ color: cfg.text }}>${appt.amount.toLocaleString('es-AR')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  weekDays.flatMap(({ offset: ofs }, colIdx) => {
                    const dayAppts = ofs === 0 ? appts : [];
                    const occ = new Array(SLOTS.length).fill(0);
                    dayAppts.forEach(a => {
                      for (let i = a.slot; i < Math.min(a.slot + a.dur, SLOTS.length); i++) occ[i]++;
                    });
                    const blocks: { start: number; span: number; count: number }[] = [];
                    let s = -1, mx = 0;
                    for (let i = 0; i <= SLOTS.length; i++) {
                      const c = i < SLOTS.length ? occ[i] : 0;
                      if (c > 0 && s === -1) { s = i; mx = c; }
                      else if (c > 0) { mx = Math.max(mx, c); }
                      else if (s !== -1) { blocks.push({ start: s, span: i - s, count: mx }); s = -1; mx = 0; }
                    }
                    return [
                      <div
                        key={`zone-${colIdx}`}
                        className="cursor-pointer hover:bg-white/[0.015] transition-colors"
                        style={{ gridColumn: colIdx + 2, gridRow: `1 / ${SLOTS.length + 1}` }}
                        onClick={() => { setDateOffset(ofs); setCalendarView('dia'); }}
                      />,
                      ...blocks.map((b, bi) => {
                        const ratio = b.count / Math.max(pros.length, 1);
                        const bg     = ratio >= 1 ? 'rgba(139,92,246,0.11)' : `rgba(255,255,255,${(0.04 + ratio * 0.06).toFixed(2)})`;
                        const border = ratio >= 1 ? '1px solid rgba(139,92,246,0.24)' : `1px solid rgba(255,255,255,${(0.05 + ratio * 0.07).toFixed(2)})`;
                        return (
                          <div
                            key={`macro-${colIdx}-${bi}`}
                            className="m-[3px] rounded-md cursor-pointer hover:brightness-125 transition-all flex flex-col items-center justify-center gap-1"
                            style={{ gridColumn: colIdx + 2, gridRow: `${b.start + 1} / span ${b.span}`, background: bg, border }}
                            onClick={() => { setDateOffset(ofs); setCalendarView('dia'); }}
                          >
                            {b.span >= 2 && (<>
                              <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>group</span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] text-center leading-tight font-label">
                                {b.count} {b.count === 1 ? 'ocupada' : 'ocupadas'}
                              </span>
                            </>)}
                          </div>
                        );
                      }),
                    ];
                  })
                )}
                {todayColIdx >= 0 && nowPx > 0 && nowPx < totalH && (
                  <div className="pointer-events-none absolute left-0 right-0 z-30 flex items-center" style={{ top: nowPx }}>
                    <div className="w-2 h-2 rounded-full bg-rose-400 ml-[48px] shrink-0 shadow-[0_0_6px_rgba(251,113,133,0.9)]" />
                    <div className="flex-1 h-px bg-rose-400/50" />
                  </div>
                )}
              </div>
            </div>
          </>)}

          {/* ── MONTH VIEW ── */}
          {calendarView === 'mes' && (
            <div className="flex flex-col flex-1 p-5 min-h-0 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
              <div className="grid grid-cols-7 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                  <div key={day} className="text-center text-[9px] font-bold uppercase tracking-widest text-[#7a766e] py-2 font-label">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5 flex-1">
                {monthCells.map((cell, i) => (
                  cell === null ? <div key={`e-${i}`} /> : (
                    <button
                      key={`${cell.day}-${i}`}
                      onClick={() => { setDateOffset(cell.offset); setCalendarView('dia'); }}
                      className={`flex flex-col items-center py-2.5 rounded-xl border transition-all cursor-pointer group ${
                        cell.isToday
                          ? 'bg-violet-500/15 border-violet-500/25'
                          : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className={`text-[13px] font-bold leading-none ${cell.isToday ? 'text-violet-300' : 'text-[#f5f0e8] group-hover:text-violet-300 transition-colors'}`}>{cell.day}</span>
                      {cell.isToday && (
                        <div className="flex gap-0.5 mt-1.5">
                          {pros.slice(0, 3).map(p => (
                            <div key={p.id} className="w-1 h-1 rounded-full" style={{ background: p.color }} />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">

          {newAppt ? (() => {
            const _svcs = newAppt.services.map(sl => SERVICES[sl.serviceIdx]).filter(Boolean);
            const _totalDur = _svcs.reduce((s, sv) => s + sv.dur, 0);
            const _totalAmt = _svcs.reduce((s, sv) => s + sv.price, 0);
            const _sena = Math.round(_totalAmt * 0.15);
            const _clientOk = newAppt.clientMode === 'search'
              ? (!!newAppt.clientId || newAppt.clientSearch.trim().length > 0)
              : newAppt.client.trim().length > 0;
            return (
              /* ── NUEVO TURNO FORM ── */
              <div className="relative isolate rounded-[1.5rem] border border-violet-500/20 flex flex-col bg-[#0d0d0d]/40 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 h-full">
                <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '17px', fontVariationSettings: "'FILL' 1" }}>calendar_add_on</span>
                    </div>
                    <div>
                      <h2 className="font-playfair text-[17px] font-bold italic text-[#f5f0e8] leading-tight">Nuevo turno</h2>
                      <p className="text-[9px] text-[#7a766e] font-label uppercase tracking-widest mt-0.5">{displayDate}</p>
                    </div>
                  </div>
                  <button onClick={() => setNewAppt(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/[0.06] text-[#7a766e] hover:text-[#f5f0e8] transition-colors cursor-pointer">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5" style={{ overscrollBehavior: 'contain' }}>

                  {/* ── 1. Cliente ── */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-violet-500/15 text-violet-400 flex items-center justify-center text-[11px] font-bold border border-violet-500/20">1</div>
                        <h3 className="text-[13px] font-bold text-[#f5f0e8]">Cliente</h3>
                      </div>
                      <div className="flex gap-0.5 p-0.5 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                        {(['search', 'new'] as const).map(mode => (
                          <button key={mode}
                            onClick={() => setNewAppt(p => p && ({ ...p, clientMode: mode, clientSearch: '', clientId: null }))}
                            className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer"
                            style={newAppt.clientMode === mode
                              ? { background: 'rgba(139,92,246,0.22)', color: '#c4b5fd' }
                              : { color: '#7a766e' }}>
                            {mode === 'search' ? 'Buscar' : 'Nuevo'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {newAppt.clientMode === 'search' ? (
                      <div className="flex flex-col gap-2">
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7a766e] group-focus-within:text-violet-400 transition-colors pointer-events-none" style={{ fontSize: '16px' }}>search</span>
                          <input type="text" placeholder="Buscar por nombre..." value={newAppt.clientSearch}
                            onChange={e => setNewAppt(p => p && ({ ...p, clientSearch: e.target.value, clientId: null }))}
                            className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-xl pl-10 pr-3.5 py-2.5 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] transition-all" />
                        </div>
                        {newAppt.clientSearch.trim().length > 0 && (
                          <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto rounded-xl" style={{ overscrollBehavior: 'contain' }}>
                            {clientResults.length > 0 ? clientResults.map(c => (
                              <button key={c.id}
                                onClick={() => setNewAppt(p => p && ({ ...p, clientId: c.id, clientSearch: c.name }))}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left w-full border"
                                style={newAppt.clientId === c.id
                                  ? { background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.30)' }
                                  : { background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.03)' }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                                  {initials(c.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-semibold text-[#f5f0e8] truncate">{c.name}</p>
                                  <p className="text-[10px] text-[#7a766e]">
                                    {c.visits !== undefined ? `${c.visits} visitas` : 'Cliente'}
                                    {c.phone ? ` · ${c.phone}` : ''}
                                  </p>
                                </div>
                                {newAppt.clientId === c.id && (
                                  <span className="material-symbols-outlined text-violet-400 shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                )}
                              </button>
                            )) : (
                              <div className="flex flex-col items-center gap-2 py-4 border border-dashed border-white/[0.08] rounded-xl bg-white/[0.01]">
                                <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '20px' }}>person_search</span>
                                <p className="text-[11px] text-[#7a766e] text-center">Sin resultados ·{' '}
                                  <span className="text-violet-400 cursor-pointer font-semibold hover:text-violet-300 transition-colors"
                                    onClick={() => setNewAppt(p => p && ({ ...p, clientMode: 'new', client: newAppt.clientSearch }))}>
                                    Crear nuevo
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7a766e] group-focus-within:text-violet-400 transition-colors pointer-events-none" style={{ fontSize: '16px' }}>person</span>
                          <input type="text" placeholder="Nombre completo *" value={newAppt.client}
                            onChange={e => setNewAppt(p => p && ({ ...p, client: e.target.value }))}
                            autoFocus
                            className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-xl pl-10 pr-3.5 py-2.5 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] transition-all" />
                        </div>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7a766e] group-focus-within:text-violet-400 transition-colors pointer-events-none" style={{ fontSize: '16px' }}>smartphone</span>
                          <input type="tel" placeholder="WhatsApp / Teléfono" value={newAppt.phone}
                            onChange={e => setNewAppt(p => p && ({ ...p, phone: e.target.value }))}
                            className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-xl pl-10 pr-3.5 py-2.5 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] transition-all" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── 2. Servicios ── */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-violet-500/15 text-violet-400 flex items-center justify-center text-[11px] font-bold border border-violet-500/20">2</div>
                        <h3 className="text-[13px] font-bold text-[#f5f0e8]">Servicios</h3>
                      </div>
                      <span className="text-[10px] font-bold text-[#7a766e] bg-white/[0.04] px-2 py-0.5 rounded-md">{newAppt.services.length} sel.</span>
                    </div>

                    <div className="relative group mt-1 mb-1">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a766e] pointer-events-none" style={{ fontSize: '18px' }}>search</span>
                      <input type="text" placeholder="Buscar por nombre de servicio..."
                        className="w-full bg-transparent border border-white/[0.08] hover:border-white/[0.12] rounded-xl pl-10 pr-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.02] transition-all" />
                    </div>

                    <div className="flex items-center gap-2 mt-1 mb-1">
                      <h4 className="text-[14px] font-bold text-[#f5f0e8]">Todos los servicios</h4>
                      <span className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] font-bold text-[#7a766e]">{SERVICES.length}</span>
                    </div>

                    <div className="flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar">
                      {SERVICES.map((svc, idx) => {
                        const isSelected = newAppt.services.some(s => s.serviceIdx === idx);
                        return (
                          <div
                            key={svc.id}
                            onClick={() => {
                              if (isSelected) setNewAppt(p => p && ({ ...p, services: p.services.filter(s => s.serviceIdx !== idx) }));
                              else setNewAppt(p => p && ({ ...p, services: [...p.services, { serviceIdx: idx }] }));
                            }}
                            className="relative flex items-center justify-between py-3.5 pl-4 pr-1 cursor-pointer transition-all border-b border-white/[0.04] hover:bg-white/[0.02] last:border-0"
                          >
                            <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-md transition-colors ${isSelected ? 'bg-violet-400' : 'bg-cyan-500/30'}`} />
                            <div className="flex flex-col gap-0.5 flex-1">
                              <p className={`text-[14px] font-bold ${isSelected ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>{svc.name}</p>
                              <p className="text-[12px] text-[#7a766e]">{svc.dur * 30}min</p>
                            </div>
                            <div className="flex flex-col items-end shrink-0 pl-3">
                              <p className={`text-[14px] font-mono font-bold ${isSelected ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>
                                ${svc.price.toLocaleString('es-AR')}
                              </p>
                              {isSelected && (
                                <span className="material-symbols-outlined text-violet-400 mt-1 animate-in zoom-in duration-200" style={{ fontSize: '18px' }}>check_circle</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {SERVICES.length === 0 && (
                        <p className="text-center text-[#7a766e] text-xs py-4">Sin servicios activos</p>
                      )}
                    </div>
                  </div>

                  {/* ── 3. Agendamiento ── */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-violet-500/15 text-violet-400 flex items-center justify-center text-[11px] font-bold border border-violet-500/20">3</div>
                      <h3 className="text-[13px] font-bold text-[#f5f0e8]">Agendamiento</h3>
                    </div>
                    <div className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex flex-col gap-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-[#7a766e] font-bold mb-3 ml-1">Profesional</p>
                        <div className="grid grid-cols-3 gap-2">
                          {pros.map((pro, i) => (
                            <button key={pro.id} onClick={() => setNewAppt(p => p && ({ ...p, pro: i }))}
                              className="relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden group"
                              style={newAppt.pro === i
                                ? { background: `${pro.color}10`, borderColor: `${pro.color}30` }
                                : { background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.04)' }}>
                              {newAppt.pro === i && (
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${pro.color} 0%, transparent 70%)` }} />
                              )}
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 transition-all z-10"
                                style={newAppt.pro === i
                                  ? { background: pro.color, color: '#fff', boxShadow: `0 0 15px ${pro.color}40` }
                                  : { background: 'rgba(255,255,255,0.05)', color: '#7a766e' }}>
                                {pro.initials}
                              </div>
                              <span className="text-[11px] font-bold tracking-wide z-10 transition-colors"
                                style={newAppt.pro === i ? { color: pro.color } : { color: '#7a766e' }}>
                                {pro.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="w-full h-px bg-white/[0.04] my-2" />

                      <div>
                        <div className="flex items-center justify-between mb-2 px-1">
                          <p className="text-[9px] uppercase tracking-widest text-[#7a766e] font-bold">Horario</p>
                        </div>
                        <div className="flex items-center p-1 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-sm">
                          <div className="flex-1 relative group/select">
                            <div className="w-full py-2.5 px-3 bg-[#0d0d0d] shadow-sm rounded-xl flex items-center justify-center gap-1.5 transition-all border border-white/[0.04]">
                              <span className="text-[14px] font-bold text-[#f5f0e8] tracking-wider">{SLOTS[newAppt.slot]}</span>
                              <span className="material-symbols-outlined text-[#7a766e] group-hover/select:text-violet-400 transition-colors" style={{ fontSize: '18px' }}>expand_more</span>
                            </div>
                            <select value={newAppt.slot} onChange={e => setNewAppt(p => p && ({ ...p, slot: Number(e.target.value) }))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none">
                              {SLOTS.map((t, i) => <option key={i} value={i} className="bg-[#0d0d0d]">{t}</option>)}
                            </select>
                          </div>
                          <div className="px-2 flex flex-col items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#7a766e]/40" style={{ fontSize: '18px' }}>arrow_right_alt</span>
                          </div>
                          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3">
                            <span className="text-[14px] font-medium text-[#7a766e] tracking-wider">{SLOTS[Math.min(newAppt.slot + _totalDur, SLOTS.length - 1)]}</span>
                            <div className="px-1.5 py-0.5 bg-white/[0.03] border border-white/[0.05] rounded-md shrink-0">
                              <span className="text-[9px] font-bold text-[#7a766e] uppercase tracking-widest">
                                {_totalDur >= 2 ? `${Math.floor(_totalDur / 2)}h${_totalDur % 2 ? ' 30m' : ''}` : '30m'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── 4. Opcionales ── */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-md bg-white/[0.05] text-[#7a766e] flex items-center justify-center text-[11px] font-bold border border-white/[0.08]">4</div>
                      <h3 className="text-[13px] font-bold text-[#f5f0e8]">Opcionales</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['confirmado', 'pendiente'] as ApptStatus[]).map(s => {
                        const cfg = STATUS_CFG[s];
                        return (
                          <button key={s} onClick={() => setNewAppt(p => p && ({ ...p, status: s }))}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer"
                            style={newAppt.status === s
                              ? { background: `${cfg.lbar}18`, borderColor: `${cfg.lbar}40`, color: cfg.text }
                              : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', color: '#7a766e' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wide">{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <textarea placeholder="Fórmula, sensibilidades, preferencias..." value={newAppt.notes}
                      onChange={e => setNewAppt(p => p && ({ ...p, notes: e.target.value }))}
                      rows={2} className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 text-[12px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] transition-all resize-none leading-relaxed min-h-[60px]" />
                  </div>

                  {/* ── Resumen financiero ── */}
                  <div className="mt-2 rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent">
                    <div className="px-4 py-3.5 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-[#7a766e] font-bold uppercase tracking-wide">Subtotal servicios</span>
                        <span className="text-[14px] font-bold text-[#f5f0e8] font-mono">${_totalAmt.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>lock</span>
                          <span className="text-[11px] text-violet-400 font-bold uppercase tracking-wide">Seña requerida (15%)</span>
                        </div>
                        <span className="text-[14px] font-bold text-violet-300 font-mono">${_sena.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06] flex flex-col gap-2 shrink-0">
                  {apptError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <span className="material-symbols-outlined text-rose-400 shrink-0" style={{ fontSize: '15px' }}>error</span>
                      <p className="text-[11px] text-rose-300 leading-tight">{apptError}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => { setNewAppt(null); setApptError(null); }}
                      className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.05] transition-all cursor-pointer border border-white/[0.06]">
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitNewAppt}
                      disabled={!_clientOk || submitting}
                      className="flex-1 py-3 bg-violet-500 hover:bg-violet-400 disabled:opacity-35 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold rounded-xl text-[13px] transition-all shadow-[0_0_24px_rgba(139,92,246,0.40)] cursor-pointer flex items-center justify-center gap-2 min-h-[44px]">
                      {submitting ? (
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                      {_totalAmt > 0 ? `Agendar — $${_sena.toLocaleString('es-AR')} seña` : 'Agendar turno'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })() : (<>
            {checkoutAppt ? (
            <div className="relative isolate rounded-[1.5rem] border border-white/[0.08] p-5 flex flex-col bg-[#0d0d0d]/40 overflow-hidden">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '20px' }}>point_of_sale</span>
                  <h2 className="font-playfair text-xl font-bold italic text-[#f5f0e8]">Cobrar</h2>
                </div>
                <button onClick={() => setCheckoutId(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/[0.06] text-[#7a766e] hover:text-[#f5f0e8] transition-colors cursor-pointer" aria-label="Cerrar">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>
              <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.05] mb-4">
                <p className="text-[10px] uppercase tracking-wider text-[#7a766e] mb-1">Cliente · Servicio</p>
                <p className="font-bold text-[#f5f0e8] leading-tight">{checkoutAppt.client}</p>
                <p className="text-[12px] text-[#7a766e]">{checkoutAppt.service}</p>
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a766e]">{checkoutAppt.service}</span>
                  <span className="font-bold text-[#f5f0e8] font-mono">${checkoutAppt.amount.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between border-t border-white/[0.06] pt-2">
                  <span className="text-[13px] font-bold text-[#f5f0e8] uppercase tracking-wide">Total</span>
                  <span className="text-xl font-bold text-violet-300 font-mono">${checkoutAppt.amount.toLocaleString('es-AR')}</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-[#7a766e] mb-2">Método de pago</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[{ icon: 'credit_card', label: 'Tarjeta' }, { icon: 'payments', label: 'Efectivo' }, { icon: 'account_balance', label: 'Transfer.' }].map((m, i) => (
                  <button key={m.label} onClick={() => setPayMethod(i)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer min-h-[44px] ${payMethod === i ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'bg-white/[0.03] border-white/[0.06] text-[#7a766e] hover:bg-white/[0.06] hover:text-[#f5f0e8]'}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{m.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide">{m.label}</span>
                  </button>
                ))}
              </div>
              {checkoutError && (
                <p className="text-rose-400 text-[11px] text-center mb-2">{checkoutError}</p>
              )}
              <button
                onClick={handleConfirmCheckout}
                disabled={checkoutSubmitting}
                className="w-full py-3.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer min-h-[44px] flex items-center justify-center gap-2">
                {checkoutSubmitting
                  ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                  : null}
                Confirmar · ${checkoutAppt.amount.toLocaleString('es-AR')}
              </button>
              <p className="text-[10px] text-center text-[#7a766e] mt-2.5">
                Comisión {pros[checkoutAppt.pro]?.name ?? '—'}:{' '}
                {(() => {
                  const rate = staff[checkoutAppt.pro]?.commissions?.default ?? 30;
                  return <span className="text-violet-400 font-bold">${Math.round(checkoutAppt.amount * rate / 100).toLocaleString('es-AR')}</span>;
                })()}
                {' '}({staff[checkoutAppt.pro]?.commissions?.default ?? 30}%)
              </p>
            </div>

          ) : selectedAppt ? (
            <div className="relative isolate rounded-[1.5rem] border border-white/[0.08] p-5 flex flex-col bg-[#0d0d0d]/40 overflow-hidden">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <div className="flex items-center gap-2.5 mb-4">
                <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '19px' }}>folder_shared</span>
                <h2 className="font-playfair text-xl font-bold italic text-[#f5f0e8]">Expediente</h2>
              </div>
              <div className="flex flex-col items-center justify-center text-center mt-2 mb-6">
                <div className="relative mb-3 group">
                  <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-[18px] font-black tracking-tighter shadow-lg"
                       style={{ background: `${STATUS_CFG[selectedAppt.status].lbar}1a`, color: STATUS_CFG[selectedAppt.status].lbar, border: `2px solid ${STATUS_CFG[selectedAppt.status].lbar}40` }}>
                    {initials(selectedAppt.client)}
                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-[2px] border-[#0d0d0d] flex items-center justify-center shadow-sm"
                         style={{ background: STATUS_CFG[selectedAppt.status].lbar }}>
                      <span className="material-symbols-outlined text-[13px] text-[#0a0a0a]" style={{ fontVariationSettings: "'FILL' 1" }}>{STATUS_CFG[selectedAppt.status].icon}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-[18px] font-bold text-[#f5f0e8] mb-1.5 tracking-tight">{selectedAppt.client}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.05] text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
                    {STATUS_CFG[selectedAppt.status].label}
                  </span>
                </div>
              </div>

              <div className="relative p-4 bg-[#121212]/80 backdrop-blur-md rounded-2xl border border-white/[0.06] shadow-sm mb-4 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
                <h4 className="text-[9px] uppercase tracking-widest text-[#7a766e] font-bold mb-3 flex items-center gap-1.5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"></span>
                  Turno Actual
                </h4>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-bold text-[#f5f0e8] leading-snug">{selectedAppt.service}</p>
                      {pros[selectedAppt.pro] && (
                        <div className="text-[11px] text-[#a1a1aa] mt-1 flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: pros[selectedAppt.pro].color }}>
                            {pros[selectedAppt.pro].initials}
                          </div>
                          con <span className="font-medium text-[#f5f0e8]">{pros[selectedAppt.pro].name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[14px] font-mono font-bold text-violet-400 shrink-0">${selectedAppt.amount.toLocaleString('es-AR')}</p>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-white/[0.08] via-white/[0.02] to-transparent"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] text-[#f5f0e8] font-medium">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-[#7a766e] text-[14px]">schedule</span>
                      </div>
                      {SLOTS[selectedAppt.slot]} <span className="text-[#7a766e] font-normal mx-0.5">a</span> {SLOTS[Math.min(selectedAppt.slot + selectedAppt.dur, SLOTS.length - 1)]}
                    </div>
                    <span className="text-[9px] font-bold uppercase text-[#a1a1aa] bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 rounded-md shadow-sm">
                      {selectedAppt.dur >= 2 ? `${Math.floor(selectedAppt.dur / 2)}h${selectedAppt.dur % 2 ? ' 30m' : ''}` : '30m'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAppt.allergy && (
                <div className="flex items-start gap-3 p-3.5 bg-rose-500/[0.08] backdrop-blur-md border border-rose-500/20 rounded-2xl mb-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50"></div>
                  <span className="material-symbols-outlined text-rose-400 shrink-0 mt-0.5" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold leading-none mb-1">Alerta Médica</p>
                    <p className="text-[12px] text-[#f5f0e8] font-medium leading-snug">{selectedAppt.allergy}</p>
                  </div>
                </div>
              )}

              {selectedAppt.notes && (
                <div className="mb-5 relative">
                  <span className="text-[9px] uppercase tracking-widest text-violet-400 font-bold block mb-2 font-label">Notas Técnicas</span>
                  <div className="relative p-3.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.05] text-[12px] leading-relaxed text-[#c9c3b8] italic">
                    <span className="absolute top-2 left-2 text-[#7a766e]/20 text-4xl leading-none font-serif">"</span>
                    <span className="relative z-10 pl-4 block">{selectedAppt.notes}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-auto">
                <button onClick={() => setCheckoutId(selectedAppt.id)} className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98] text-white font-bold rounded-2xl text-[13px] transition-all shadow-[0_4px_20px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.35)] cursor-pointer flex items-center justify-center gap-2 border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 blur-md opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="material-symbols-outlined relative z-10" style={{ fontSize: '18px' }}>point_of_sale</span>
                  <span className="relative z-10">Procesar Cobro</span>
                </button>
                <button className="w-14 h-auto rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center hover:bg-[#25D366]/20 transition-all cursor-pointer shadow-[0_4px_15px_rgba(37,211,102,0.1)] hover:shadow-[0_4px_20px_rgba(37,211,102,0.15)]" aria-label="WhatsApp">
                  <span className="material-symbols-outlined text-[#25D366]" style={{ fontSize: '20px' }}>chat</span>
                </button>
              </div>
            </div>

          ) : (
            <div className="relative isolate rounded-[1.5rem] border border-white/[0.08] p-6 flex flex-col items-center justify-center bg-[#0d0d0d]/40 overflow-hidden min-h-[180px]">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <span className="material-symbols-outlined text-[#7a766e]/50 mb-3" style={{ fontSize: '36px' }}>touch_app</span>
              <p className="text-[#7a766e] text-sm text-center leading-snug">Seleccioná un turno para ver el expediente del cliente</p>
            </div>
          )}

          {/* GOOGLE CALENDAR PANEL */}
          <div className={`relative isolate rounded-[1.5rem] border p-4 bg-[#0d0d0d]/40 overflow-hidden transition-colors ${gcalConnected ? 'border-emerald-500/20' : 'border-white/[0.08]'}`}>
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Google Calendar G logo */}
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 11.2V13h4.24c-.184.98-.76 1.808-1.608 2.36L16 17c1.656-1.528 2.616-3.784 2.616-6.44 0-.472-.04-.928-.112-1.36H12v2z" fill="#4285F4"/>
                    <path d="M5.616 14.28A7.064 7.064 0 0 1 5 12c0-.8.144-1.568.4-2.28L3.76 8.36A11.488 11.488 0 0 0 2.8 12c0 1.312.224 2.576.632 3.752L5.616 14.28z" fill="#FBBC05"/>
                    <path d="M12 19.2c2.176 0 4-.72 5.336-1.944l-2.048-1.6C14.56 16.24 13.368 16.6 12 16.6c-2.44 0-4.512-1.648-5.248-3.864L4.768 14.12C5.968 17.208 8.728 19.2 12 19.2z" fill="#34A853"/>
                    <path d="M6.752 12.736C6.576 12.184 6.48 11.6 6.48 11c0-.6.096-1.184.272-1.736L5.016 7.92A9.272 9.272 0 0 0 4.72 11c0 1.128.2 2.208.56 3.216L6.752 12.736z" fill="#EA4335" opacity=".3"/>
                    <path d="M12 4.8c1.36 0 2.576.528 3.488 1.384l2.064-2.064A7.12 7.12 0 0 0 12 1.8C8.728 1.8 5.968 3.792 4.768 6.88l2.184 1.696C7.688 6.448 9.656 4.8 12 4.8z" fill="#EA4335"/>
                  </svg>
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#7a766e] font-label">Google Calendar</span>
              </div>
              {gcalConnected === true && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Conectado</span>
                </div>
              )}
            </div>

            {gcalError && (
              <p className="text-[11px] text-rose-400 mb-2 px-1">{gcalError}</p>
            )}

            {gcalConnected === null && (
              <div className="flex items-center justify-center py-3">
                <span className="material-symbols-outlined text-[#7a766e] animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
              </div>
            )}

            {gcalConnected === false && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] text-[#7a766e] leading-relaxed px-0.5">
                  Sincronizá tus turnos con Google Calendar. Cada turno nuevo aparece automáticamente en tu agenda de Google.
                </p>
                <button
                  onClick={handleGcalConnect}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] hover:border-white/[0.18] rounded-xl text-[12px] font-bold text-[#f5f0e8] transition-all cursor-pointer active:scale-95"
                >
                  <div className="w-5 h-5 rounded bg-white flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" width="13" height="13">
                      <path d="M12 11.2V13h4.24c-.184.98-.76 1.808-1.608 2.36L16 17c1.656-1.528 2.616-3.784 2.616-6.44 0-.472-.04-.928-.112-1.36H12v2z" fill="#4285F4"/>
                      <path d="M5.616 14.28A7.064 7.064 0 0 1 5 12c0-.8.144-1.568.4-2.28L3.76 8.36A11.488 11.488 0 0 0 2.8 12c0 1.312.224 2.576.632 3.752L5.616 14.28z" fill="#FBBC05"/>
                      <path d="M12 19.2c2.176 0 4-.72 5.336-1.944l-2.048-1.6C14.56 16.24 13.368 16.6 12 16.6c-2.44 0-4.512-1.648-5.248-3.864L4.768 14.12C5.968 17.208 8.728 19.2 12 19.2z" fill="#34A853"/>
                      <path d="M12 4.8c1.36 0 2.576.528 3.488 1.384l2.064-2.064A7.12 7.12 0 0 0 12 1.8C8.728 1.8 5.968 3.792 4.768 6.88l2.184 1.696C7.688 6.448 9.656 4.8 12 4.8z" fill="#EA4335"/>
                    </svg>
                  </div>
                  Conectar con Google
                </button>
              </div>
            )}

            {gcalConnected === true && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] text-[#7a766e] leading-relaxed px-0.5">
                  Los nuevos turnos se sincronizan automáticamente a tu Google Calendar con color violeta.
                </p>
                <button
                  onClick={handleGcalDisconnect}
                  disabled={gcalSyncing}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-2 bg-rose-500/[0.07] hover:bg-rose-500/[0.12] border border-rose-500/15 hover:border-rose-500/25 rounded-xl text-[11px] font-bold text-rose-400 transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  {gcalSyncing
                    ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>progress_activity</span>
                    : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>link_off</span>}
                  Desconectar
                </button>
              </div>
            )}
          </div>

          {/* RESUMEN DEL DÍA */}
          <div className="relative isolate rounded-[1.5rem] border border-white/[0.08] p-4 bg-[#0d0d0d]/40 overflow-hidden">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#7a766e] font-label block mb-3">Resumen del día</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Confirmados', value: appts.filter(a => a.status === 'confirmado').length,   color: '#a78bfa' },
                { label: 'Pendientes',  value: appts.filter(a => a.status === 'pendiente').length,    color: '#fbbf24' },
                { label: 'Sin cobrar',  value: appts.filter(a => a.status === 'pago-pendiente').length, color: '#fb7185' },
                { label: 'Completados', value: appts.filter(a => a.status === 'completado').length,   color: '#34d399' },
              ].map(s => (
                <div key={s.label} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <p className="text-lg font-bold font-mono leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-[#7a766e] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          </>)}

        </div>
      </div>
    </div>
  );
}
