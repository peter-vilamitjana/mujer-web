'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useStaff } from '@/hooks/useStaff';
import { updateStaffCommissions } from '@/actions/staff.actions';
import { getServices } from '@/actions/services.actions';
import { getAppointmentsForPeriod } from '@/actions/appointments.actions';
import type { Staff, Appointment, Service, StaffCommissions } from '@/lib/schema';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';

// ── Constants ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const staffColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const COMPLETED_STATUSES: Appointment['status'][] = ['completed', 'cobrado', 'pending_payment'];

const PERIOD_LABELS = { dia: 'Hoy', semana: 'Esta semana', mes: 'Este mes' } as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPeriodStart(period: 'dia' | 'semana' | 'mes'): Date {
  const now = new Date();
  if (period === 'dia')    return startOfDay(now);
  if (period === 'semana') return startOfWeek(now, { weekStartsOn: 1 });
  return startOfMonth(now);
}

function getPeriodLabel(period: 'dia' | 'semana' | 'mes'): string {
  const now = new Date();
  if (period === 'dia')    return format(now, "d 'de' MMMM", { locale: es });
  if (period === 'semana') {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    return `${format(start, 'd MMM', { locale: es })} – ${format(now, 'd MMM yyyy', { locale: es })}`;
  }
  return format(now, 'MMMM yyyy', { locale: es });
}

const toDate = (val: any): Date =>
  val?.toDate?.() ? val.toDate() :
  (val?._seconds ? new Date(val._seconds * 1000) : new Date(val));

const fmtDate = (val: unknown) => format(toDate(val), "d MMM", { locale: es });

const fmtARS = (n: number) =>
  '$' + Math.round(n).toLocaleString('es-AR');

function calcEarned(appt: Appointment, member: Staff): number {
  if (appt.commissionCalculated !== undefined) return appt.commissionCalculated;
  const price = appt.priceFinal ?? appt.amountPaid ?? appt.priceEstimated ?? 0;
  const defaultComm = member.commissions?.default ?? 40;
  const serviceComm = appt.serviceIds?.length
    ? (member.commissions?.byService?.[appt.serviceIds[0]] ?? defaultComm)
    : defaultComm;
  return price * serviceComm / 100;
}

// ── Commission Rules Sheet ────────────────────────────────────────────────────
function CommissionSheet({
  open,
  onOpenChange,
  staff,
  tenantId,
  services,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  staff: Staff;
  tenantId: string;
  services: Service[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [defaultComm, setDefaultComm] = useState(staff.commissions?.default ?? 40);
  const [byService, setByService] = useState<{ [serviceId: string]: number }>(
    staff.commissions?.byService ?? {}
  );

  useEffect(() => {
    setDefaultComm(staff.commissions?.default ?? 40);
    setByService(staff.commissions?.byService ?? {});
  }, [staff]);

  const staffServices = services.filter(s => staff.services?.includes(s.id));

  const handleSave = () => {
    const commissions: StaffCommissions = {
      default: defaultComm,
      byService: Object.keys(byService).length > 0 ? byService : undefined,
    };
    startTransition(async () => {
      const result = await updateStaffCommissions(tenantId, staff.id, commissions);
      if (result.success) {
        toast({ title: 'Comisiones guardadas' });
        onSaved();
        onOpenChange(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  const inputCls = "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 transition-all";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto bg-[#0f0e0c] border-white/[0.08] p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0"
              style={{ background: `${staffColor(staff.name)}20`, color: staffColor(staff.name), border: `1.5px solid ${staffColor(staff.name)}35` }}
            >
              {staff.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
            </div>
            <div>
              <h2 className="font-playfair text-[20px] font-bold italic text-[#f5f0e8] leading-tight">{staff.name}</h2>
              <p className="text-[#7a766e] text-[11px]">{staff.role}</p>
            </div>
          </div>
          <p className="text-[#7a766e] text-[12px] mt-2">Configurá las comisiones por servicio</p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Default commission */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label mb-3">Comisión por defecto</p>
            <div className="relative isolate rounded-2xl border border-white/[0.07] p-4 overflow-hidden">
              <div className="absolute inset-0 bg-white/[0.02] -z-10" />
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>percent</span>
                <p className="text-[13px] text-[#f5f0e8] font-semibold">Porcentaje base</p>
                <span className="ml-auto text-[20px] font-black text-violet-400 font-mono">{defaultComm}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={defaultComm}
                onChange={e => setDefaultComm(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:cursor-pointer cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[#7a766e]">0%</span>
                <span className="text-[10px] text-[#7a766e]">100%</span>
              </div>
              <p className="text-[11px] text-[#7a766e] mt-2">Aplica a todos los servicios sin regla específica.</p>
            </div>
          </div>

          {/* Per-service overrides */}
          {staffServices.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label mb-3">Comisiones por servicio</p>
              <div className="space-y-2">
                {staffServices.map(svc => {
                  const override = byService[svc.id];
                  const hasOverride = override !== undefined;
                  return (
                    <div key={svc.id} className="relative isolate rounded-xl border border-white/[0.07] p-3.5 overflow-hidden">
                      <div className="absolute inset-0 bg-white/[0.01] -z-10" />
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[13px] text-[#f5f0e8] font-semibold flex-1 truncate">{svc.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (hasOverride) {
                              const next = { ...byService };
                              delete next[svc.id];
                              setByService(next);
                            } else {
                              setByService({ ...byService, [svc.id]: defaultComm });
                            }
                          }}
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border transition-all cursor-pointer
                            ${hasOverride
                              ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                              : 'bg-white/[0.03] border-white/[0.08] text-[#7a766e] hover:text-[#f5f0e8]'}`}
                        >
                          {hasOverride ? 'Personalizado' : '+ Personalizar'}
                        </button>
                      </div>
                      {hasOverride ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={override}
                            onChange={e => setByService({ ...byService, [svc.id]: Number(e.target.value) })}
                            className="flex-1 h-1.5 rounded-full appearance-none bg-white/[0.08] cursor-pointer accent-violet-500"
                          />
                          <span className="text-[14px] font-black text-violet-400 font-mono w-12 text-right">{override}%</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#7a766e]">Usando base: <span className="text-[#f5f0e8] font-semibold">{defaultComm}%</span></p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {staffServices.length === 0 && (
            <div className="relative isolate rounded-xl border border-white/[0.07] p-4 overflow-hidden text-center">
              <div className="absolute inset-0 bg-white/[0.01] -z-10" />
              <span className="material-symbols-outlined text-[#7a766e] mb-2 block" style={{ fontSize: '24px' }}>content_cut</span>
              <p className="text-[12px] text-[#7a766e]">No hay servicios asignados. Asigná servicios desde la sección Staff.</p>
            </div>
          )}

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 disabled:opacity-50 text-white text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.25)]"
          >
            {isPending
              ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span> Guardando…</>
              : <><span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>save</span> Guardar comisiones</>
            }
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PerformanceTabView() {
  const { tenantId } = useTenant();
  const { staff, loading: staffLoading, refetch: refetchStaff } = useStaff();
  const { toast } = useToast();

  const [period, setPeriod] = useState<'dia' | 'semana' | 'mes'>('mes');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [commSheetOpen, setCommSheetOpen] = useState(false);

  // Auto-select first active staff
  useEffect(() => {
    if (!selectedId && staff.length > 0) {
      const first = staff.find(s => s.active) ?? staff[0];
      setSelectedId(first.id);
    }
  }, [staff, selectedId]);

  // Load services for commission editor
  useEffect(() => {
    if (!tenantId) return;
    getServices(tenantId)
      .then(data => setServices(data))
      .catch(console.error);
  }, [tenantId]);

  // Load appointments by period (one-shot — analytics don't need real-time)
  useEffect(() => {
    if (!tenantId) return;
    setApptLoading(true);
    const periodStart = getPeriodStart(period);
    getAppointmentsForPeriod(tenantId, null, periodStart)
      .then(all => {
        setAppointments(all.filter(a => COMPLETED_STATUSES.includes(a.status)));
      })
      .catch(err => console.error('[PerformanceTabView] appointments query:', err))
      .finally(() => setApptLoading(false));
  }, [tenantId, period]);

  // Compute per-staff metrics
  const staffMetrics = useMemo(() => {
    return staff
      .filter(s => s.active)
      .map(member => {
        const memberAppts = appointments.filter(a => a.staffId === member.id);
        const totalSales  = memberAppts.reduce((s, a) => s + (a.priceFinal ?? a.amountPaid ?? a.priceEstimated ?? 0), 0);
        const totalEarned = memberAppts.reduce((s, a) => s + calcEarned(a, member), 0);
        return { ...member, totalSales, totalEarned, tickets: memberAppts.length, appts: memberAppts };
      })
      .sort((a, b) => b.totalEarned - a.totalEarned);
  }, [staff, appointments]);

  // Global KPIs
  const totalComissions = staffMetrics.reduce((s, m) => s + m.totalEarned, 0);
  const totalSales      = staffMetrics.reduce((s, m) => s + m.totalSales, 0);
  const topPerformer    = staffMetrics[0] ?? null;

  const selectedMetrics = staffMetrics.find(m => m.id === selectedId) ?? staffMetrics[0] ?? null;
  const selectedStaff   = staff.find(s => s.id === selectedId) ?? null;

  const loading = staffLoading || apptLoading;

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!tenantId) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-[#7a766e]">No hay salón activo.</p>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-[32px] font-bold italic text-[#f5f0e8] leading-tight">Rendimiento</h1>
          <p className="text-[#7a766e] text-[13px] mt-1">{getPeriodLabel(period)} · Comisiones y productividad del equipo</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-2">
          {(['dia', 'semana', 'mes'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-150 cursor-pointer border
                ${period === p
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                  : 'text-[#7a766e] hover:text-[#f5f0e8] bg-white/[0.02] border-white/[0.07]'}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: 'payments',       label: 'A liquidar',    value: loading ? '–' : fmtARS(totalComissions), color: '#a78bfa', sub: 'comisiones del período' },
          { icon: 'point_of_sale',  label: 'Ventas totales',value: loading ? '–' : fmtARS(totalSales),      color: '#34d399', sub: `${appointments.length} servicios` },
          { icon: 'group',          label: 'Staff activo',  value: loading ? '–' : String(staffMetrics.length), color: '#fbbf24', sub: 'profesionales en el período' },
          { icon: 'emoji_events',   label: 'Top performer', value: loading ? '–' : (topPerformer?.name.split(' ')[0] ?? '—'), color: '#f472b6', sub: topPerformer ? `${fmtARS(topPerformer.totalEarned)} ganado` : '—' },
        ].map(stat => (
          <div key={stat.label} className="relative isolate rounded-2xl border border-white/[0.07] p-4 overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02] -z-10" />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${stat.color}18` }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <p className="text-[22px] font-bold text-[#f5f0e8] leading-none font-mono truncate">{stat.value}</p>
            <p className="text-[9px] text-[#7a766e] font-label uppercase tracking-widest font-bold mt-1.5 leading-tight">{stat.label}</p>
            <p className="text-[10px] text-[#7a766e]/60 mt-0.5 truncate">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 h-96 rounded-2xl border border-white/[0.05] animate-pulse bg-white/[0.02]" />
          <div className="lg:col-span-8 h-96 rounded-2xl border border-white/[0.05] animate-pulse bg-white/[0.02]" />
        </div>
      )}

      {/* ── Main split ── */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT: Staff list */}
          <div className="lg:col-span-4">
            <div className="relative isolate rounded-2xl border border-white/[0.07] overflow-hidden">
              <div className="absolute inset-0 bg-white/[0.02] -z-10" />

              <div className="px-5 py-4 border-b border-white/[0.06]">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Equipo</p>
              </div>

              {staffMetrics.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center px-5">
                  <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '32px' }}>group</span>
                  <p className="text-[13px] text-[#7a766e]">No hay staff activo o no se registraron servicios en este período.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {staffMetrics.map(member => {
                    const isSel  = selectedId === member.id;
                    const color  = staffColor(member.name);
                    const initials = member.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedId(member.id)}
                        className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-all
                          ${isSel ? 'bg-violet-500/[0.08]' : 'hover:bg-white/[0.025]'}`}
                      >
                        {/* Selected indicator */}
                        {isSel && (
                          <div className="absolute left-0 top-auto w-[3px] h-10 bg-violet-500 rounded-r-full" />
                        )}
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 transition-transform duration-200 group-hover:scale-105"
                          style={{ background: `${color}20`, color, border: `1.5px solid ${color}35` }}
                        >
                          {initials}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-semibold truncate ${isSel ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>{member.name}</p>
                          <p className="text-[11px] text-[#7a766e] truncate">{member.role}</p>
                        </div>
                        {/* Stats */}
                        <div className="text-right shrink-0">
                          <p className={`text-[13px] font-bold font-mono ${isSel ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>{fmtARS(member.totalEarned)}</p>
                          <p className="text-[10px] text-[#7a766e]">{member.tickets} turnos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Commission quick view */}
              {staffMetrics.length > 0 && (
                <div className="px-5 py-4 border-t border-white/[0.06]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label mb-3">Tasas de comisión</p>
                  <div className="space-y-1.5">
                    {staffMetrics.slice(0, 4).map(m => {
                      const comm = m.commissions?.default ?? 40;
                      return (
                        <div key={m.id} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: staffColor(m.name) }} />
                          <p className="text-[11px] text-[#7a766e] flex-1 truncate">{m.name.split(' ')[0]}</p>
                          <p className="text-[11px] font-bold text-violet-300 font-mono">{comm}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Ledger */}
          <div className="lg:col-span-8">
            {selectedMetrics ? (
              <div className="relative isolate rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-white/[0.02] -z-10" />

                {/* Ledger header */}
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0"
                      style={{ background: `${staffColor(selectedMetrics.name)}20`, color: staffColor(selectedMetrics.name), border: `1.5px solid ${staffColor(selectedMetrics.name)}35` }}
                    >
                      {selectedMetrics.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-playfair text-[18px] font-bold italic text-[#f5f0e8] leading-tight">{selectedMetrics.name}</p>
                      <p className="text-[11px] text-[#7a766e]">{selectedMetrics.role} · {PERIOD_LABELS[period]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Edit commissions */}
                    <button
                      onClick={() => setCommSheetOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-violet-500/[0.10] hover:border-violet-500/30 text-[#7a766e] hover:text-violet-300 transition-all text-[11px] font-bold uppercase tracking-wide cursor-pointer"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>percent</span>
                      Comisiones
                    </button>
                    {/* Totals */}
                    <div className="text-right pl-3 border-l border-white/[0.07]">
                      <p className="text-[9px] font-bold text-[#7a766e] uppercase tracking-widest">A liquidar</p>
                      <p className="text-[22px] font-black text-violet-400 font-mono leading-none mt-0.5">{fmtARS(selectedMetrics.totalEarned)}</p>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
                  {[
                    { label: 'Turnos',      value: String(selectedMetrics.tickets),               icon: 'event_available' },
                    { label: 'Ventas',      value: fmtARS(selectedMetrics.totalSales),            icon: 'point_of_sale' },
                    { label: 'Comisión %',  value: `${selectedMetrics.commissions?.default ?? 40}%`, icon: 'percent' },
                  ].map(stat => (
                    <div key={stat.label} className="px-5 py-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-violet-400/60 hidden sm:block" style={{ fontSize: '14px' }}>{stat.icon}</span>
                      <div>
                        <p className="text-[9px] text-[#7a766e] font-label uppercase tracking-widest font-bold">{stat.label}</p>
                        <p className="text-[15px] font-bold text-[#f5f0e8] font-mono leading-tight mt-0.5">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ledger table */}
                <div className="overflow-x-auto">
                  {selectedMetrics.appts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center px-5">
                      <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '32px' }}>receipt_long</span>
                      <p className="text-[13px] text-[#7a766e]">Sin registros en este período.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left min-w-[560px]">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {['Fecha', 'Cliente', 'Servicio', 'Cobrado', 'Com%', 'Ganancia'].map((h, i) => (
                            <th key={h} className={`px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {selectedMetrics.appts.map((appt, i) => {
                          const price   = appt.priceFinal ?? appt.amountPaid ?? appt.priceEstimated ?? 0;
                          const earned  = calcEarned(appt, selectedMetrics);
                          const commPct = appt.commissionCalculated !== undefined
                            ? Math.round(appt.commissionCalculated / price * 100)
                            : (selectedMetrics.commissions?.byService?.[appt.serviceIds?.[0]] ?? selectedMetrics.commissions?.default ?? 40);
                          return (
                            <tr key={appt.id ?? i} className="hover:bg-white/[0.015] transition-colors group">
                              <td className="px-5 py-3.5 text-[12px] text-[#7a766e] shrink-0 whitespace-nowrap">
                                {fmtDate(appt.date)}
                              </td>
                              <td className="px-5 py-3.5 text-[12px] font-semibold text-[#f5f0e8] whitespace-nowrap">
                                {appt.clientName}
                              </td>
                              <td className="px-5 py-3.5 text-[12px] text-[#7a766e] group-hover:text-violet-300/80 transition-colors max-w-[160px] truncate">
                                {appt.serviceNames}
                              </td>
                              <td className="px-5 py-3.5 text-[12px] font-mono text-[#7a766e] whitespace-nowrap">
                                {fmtARS(price)}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-bold font-mono">
                                  {commPct}%
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-[13px] text-right font-black text-[#f5f0e8] font-mono whitespace-nowrap">
                                {fmtARS(earned)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex gap-5">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Subtotal ventas</p>
                      <p className="text-[16px] font-bold text-[#f5f0e8] font-mono mt-0.5">{fmtARS(selectedMetrics.totalSales)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">A liquidar</p>
                      <p className="text-[16px] font-bold text-violet-400 font-mono mt-0.5">{fmtARS(selectedMetrics.totalEarned)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toast({ title: 'Liquidación generada', description: `${selectedMetrics.name} — ${fmtARS(selectedMetrics.totalEarned)} · ${PERIOD_LABELS[period]}` });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>payments</span>
                    Generar liquidación
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative isolate rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col items-center justify-center py-20">
                <div className="absolute inset-0 bg-white/[0.02] -z-10" />
                <span className="material-symbols-outlined text-[#7a766e] mb-3" style={{ fontSize: '40px' }}>person_search</span>
                <p className="text-[14px] text-[#f5f0e8] font-semibold">Seleccioná una profesional</p>
                <p className="text-[12px] text-[#7a766e] mt-1">para ver su ledger de actividad</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commission sheet */}
      {selectedStaff && tenantId && (
        <CommissionSheet
          open={commSheetOpen}
          onOpenChange={setCommSheetOpen}
          staff={selectedStaff}
          tenantId={tenantId}
          services={services}
          onSaved={refetchStaff}
        />
      )}
    </div>
  );
}
