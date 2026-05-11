'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTenant } from '@/contexts/TenantContext';
import { getDailyMetrics } from '@/actions/appointments.actions';
import type { DailyMetrics } from '@/actions/appointments.actions';

const AVATAR_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials2 = (name = '') => {
  const p = name.trim().split(' ').filter(Boolean);
  if (!p.length) return '??';
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};
const fmtARS = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const methodLabel: Record<string, string> = {
  mercadopago: 'Mercado Pago', efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transfer.',
};

export default function DashboardTabView() {
  const { data: session } = useSession();
  const { tenantId, branchId } = useTenant();
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [servicesPeriod, setServicesPeriod] = useState<'semana' | 'mes'>('semana');

  const userName = (session?.user?.name ?? '').split(' ')[0] || 'Admin';

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    const day  = d.toLocaleDateString('es-AR', { weekday: 'long' });
    const date = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
    return `${day.charAt(0).toUpperCase() + day.slice(1)}, ${date}`;
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    getDailyMetrics(tenantId, branchId ?? '')
      .then(m => setMetrics(m))
      .catch(err => console.error('[DashboardTabView]', err))
      .finally(() => setLoading(false));
  }, [tenantId, branchId]);

  const pendingAppts = metrics?.pendingAppts ?? [];
  const cobradoAppts = metrics?.cobradoAppts ?? [];
  const totalAppts   = metrics?.totalAppts ?? 0;
  const totalRevenue = metrics?.totalRevenue ?? 0;
  const revenueDeltaPct = metrics?.revenueDeltaPct;
  const revenueByMethod = metrics?.revenueByMethod;

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#7a766e] text-sm">{today}</p>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold mt-1 leading-tight italic">
            {greeting},{' '}
            <span className="text-violet-400">{userName}</span>
          </h1>
          <p className="text-[#7a766e] text-sm mt-1.5 flex items-center gap-1.5">
            <Sparkles size={13} className="text-violet-400" />
            {loading ? 'Cargando…' : `Tenés ${totalAppts} turnos agendados para hoy`}
          </p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)] shrink-0">
          <Plus size={15} strokeWidth={2.5} />
          Nuevo turno
        </button>
      </div>

      {/* ── Metrics Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income Card */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden hover:border-violet-400/20 transition-all duration-300 cursor-default flex flex-col justify-between group">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label mt-1.5">INGRESOS TOTALES</span>
            <div className="flex items-center bg-[#0d0d0d]/60 rounded-[8px] p-[3px] border border-white/[0.04] backdrop-blur-md">
              <button className="px-2.5 py-1 text-[10px] font-semibold text-[#f5f0e8] bg-white/[0.08] rounded-[5px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all">Hoy</button>
              <button className="px-2.5 py-1 text-[10px] font-medium text-[#7a766e] hover:text-[#f5f0e8] transition-all">Sem</button>
              <button className="px-2.5 py-1 text-[10px] font-medium text-[#7a766e] hover:text-[#f5f0e8] transition-all">Mes</button>
            </div>
          </div>
          <div className="flex flex-col mb-4">
            <span className="font-playfair text-4xl text-[#f5f0e8] font-bold italic leading-none">
              {loading ? '…' : fmtARS(totalRevenue)}
            </span>
            {revenueDeltaPct !== null && revenueDeltaPct !== undefined && (
              <div className="flex items-center gap-1.5 mt-3 mb-4">
                <span className={`material-symbols-outlined text-[15px] ${revenueDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {revenueDeltaPct >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                <span className={`text-xs font-medium ${revenueDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {revenueDeltaPct >= 0 ? '+' : ''}{revenueDeltaPct}% vs ayer
                </span>
              </div>
            )}
            {/* Static trend line — Fase E will make this dynamic */}
            <div className="h-10 w-full relative opacity-90 -mb-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 30 L0 25 L15 22 L30 26 L45 15 L60 18 L75 8 L85 11 L100 2 L100 30 Z" fill="url(#trendGradient)" />
                <path d="M0 25 L15 22 L30 26 L45 15 L60 18 L75 8 L85 11 L100 2" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2.5 pt-4 border-t border-white/[0.06] mt-auto">
            {[
              { key: 'mercadopago', color: '#38bdf8', label: 'Mercado Pago' },
              { key: 'tarjeta',     color: '#a78bfa', label: 'Tarjeta' },
              { key: 'efectivo',    color: '#fbbf24', label: 'Efectivo' },
            ].map(({ key, color, label }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-[#7a766e] font-medium tracking-wide">{label}</span>
                </div>
                <span className="text-[12px] font-bold text-[#f5f0e8] font-mono">
                  {loading ? '…' : fmtARS(revenueByMethod?.[key as keyof typeof revenueByMethod] ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Temporal Comparison — static chart, Fase E */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden transition-all duration-300 cursor-default">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">COMPARATIVA SEMANAL</span>
              <p className="font-playfair text-2xl text-[#f5f0e8] font-bold italic leading-none mt-1">—</p>
            </div>
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
              <span className="text-[11px] text-[#7a766e] font-bold">Fase E</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-28 mt-2">
            {['L','M','X','J','V','S','D'].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full rounded-md" style={{ height: `${[42,58,31,100,52,78,47][i]}%`, background: i === 3 ? 'linear-gradient(to top, #7c3aed, #a78bfa)' : 'rgba(167,139,250,0.20)' }} />
                <span className={`text-[9px] font-bold font-label ${i === 3 ? 'text-violet-400' : 'text-[#7a766e]'}`}>{day}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#7a766e]/60 mt-3 text-center">Datos históricos disponibles en Fase E</p>
        </div>

        {/* Cobros pendientes — REAL DATA */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-5 overflow-hidden transition-all duration-300 flex flex-col">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">COBROS PENDIENTES</span>
              <p className="font-playfair text-3xl text-[#f5f0e8] font-bold italic leading-none mt-1">
                {loading ? '…' : pendingAppts.length}
              </p>
            </div>
            <span className="material-symbols-outlined text-amber-400 text-[18px]">payments</span>
          </div>
          <ul className="flex flex-col gap-2 flex-1">
            {pendingAppts.map(a => {
              const color = avatarColor(a.clientName);
              return (
                <li key={a.id} className="flex items-center gap-2.5 py-2 border-b border-white/[0.05] last:border-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                    {initials2(a.clientName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#f5f0e8] leading-none truncate">{a.clientName}</p>
                    <p className="text-[10px] text-[#7a766e] mt-0.5 font-mono">{a.timeStr}</p>
                  </div>
                  <span className="text-[12px] font-bold text-amber-400 font-mono shrink-0">
                    {fmtARS(a.priceEstimated)}
                  </span>
                </li>
              );
            })}
            {!loading && pendingAppts.length === 0 && (
              <li className="flex-1 flex items-center justify-center py-4">
                <p className="text-[11px] text-[#7a766e]">Sin cobros pendientes</p>
              </li>
            )}
          </ul>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
            <span className="text-[10px] text-[#7a766e] uppercase tracking-wider font-label">Total estimado</span>
            <span className="text-[13px] font-bold text-amber-400 font-mono">
              {fmtARS(pendingAppts.reduce((s, a) => s + a.priceEstimated, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* ── Distribution & Appointment Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-5">
        {/* Payment Distribution — real breakdown */}
        <div className="lg:col-span-2 relative isolate rounded-[1.5rem] border border-white/[0.06] p-6 md:p-7 overflow-hidden flex flex-col items-center justify-between h-full bg-[#0d0d0d]/40">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label self-start block mb-8">MÉTODO DE PAGO</span>
          <div className="relative w-44 h-44 mb-8">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(167,139,250,0.15)]" viewBox="0 0 36 36">
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#a78bfa" strokeDasharray="65 35" strokeDashoffset="0" strokeWidth="3" />
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#e879f9" strokeDasharray="20 80" strokeDashoffset="-65" strokeWidth="3" />
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#d8b4fe" strokeDasharray="15 85" strokeDashoffset="-85" strokeWidth="3" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {loading || !totalRevenue ? (
                <span className="text-[#7a766e] text-sm">—</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-[#f5f0e8] font-inter tracking-tight leading-none drop-shadow-md">
                    {Math.round(((revenueByMethod?.tarjeta ?? 0) + (revenueByMethod?.mercadopago ?? 0)) / totalRevenue * 100)}%
                  </span>
                  <span className="text-[10px] text-[#7a766e] uppercase tracking-[0.2em] font-label mt-1.5">Digital</span>
                </>
              )}
            </div>
          </div>
          <div className="w-full mt-auto space-y-3">
            {[
              { key: 'tarjeta',     color: '#a78bfa', label: 'Tarjeta' },
              { key: 'mercadopago', color: '#e879f9', label: 'Mercado Pago' },
              { key: 'efectivo',    color: '#d8b4fe', label: 'Efectivo' },
              { key: 'transferencia', color: '#94a3b8', label: 'Transfer.' },
            ].map(({ key, color, label }) => {
              const val = revenueByMethod?.[key as keyof typeof revenueByMethod] ?? 0;
              const pct = totalRevenue > 0 ? Math.round(val / totalRevenue * 100) : 0;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[13px] text-[#f5f0e8] font-medium">{label}</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#f5f0e8] font-mono">{loading ? '…' : `${pct}%`}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Services Card — static for now (Fase E) */}
        <div className="lg:col-span-3 relative isolate rounded-[1.5rem] border border-white/[0.06] p-6 md:p-7 overflow-hidden flex flex-col bg-[#0d0d0d]/40">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block">SERVICIOS DESTACADOS</span>
              <p className="font-playfair text-lg text-[#f5f0e8] font-bold italic leading-tight mt-1">Más solicitados</p>
            </div>
            <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.06] rounded-full p-0.5">
              {(['semana', 'mes'] as const).map((p) => (
                <button key={p} onClick={() => setServicesPeriod(p)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold font-label uppercase tracking-wide transition-all duration-200 cursor-pointer ${servicesPeriod === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/25' : 'text-[#7a766e] hover:text-[#f5f0e8]'}`}>
                  {p === 'semana' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex flex-col gap-3 flex-1">
            {(servicesPeriod === 'semana' ? [
              { rank: 1, name: 'Coloración / Tinte',  count: 24, revenue: '$48.000', pct: 100 },
              { rank: 2, name: 'Corte + Brushing',     count: 18, revenue: '$27.000', pct: 75  },
              { rank: 3, name: 'Balayage',             count: 11, revenue: '$77.000', pct: 46  },
              { rank: 4, name: 'Manicura',             count: 9,  revenue: '$13.500', pct: 38  },
            ] : [
              { rank: 1, name: 'Corte + Brushing',     count: 72, revenue: '$108.000', pct: 100 },
              { rank: 2, name: 'Coloración / Tinte',   count: 68, revenue: '$136.000', pct: 94  },
              { rank: 3, name: 'Manicura',             count: 45, revenue: '$67.500',  pct: 63  },
              { rank: 4, name: 'Balayage',             count: 38, revenue: '$266.000', pct: 53  },
            ]).map(({ rank, name, count, revenue, pct }) => {
              const rc = [
                { dot: '#fbbf24', bar: 'linear-gradient(to right, #92400e, #fbbf24)' },
                { dot: '#a78bfa', bar: 'linear-gradient(to right, #4c1d95, #a78bfa)' },
                { dot: '#e879f9', bar: 'linear-gradient(to right, #701a75, #e879f9)' },
                { dot: '#7a766e', bar: 'rgba(167,139,250,0.15)' },
              ][rank - 1];
              return (
                <li key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: `${rc.dot}18`, color: rc.dot }}>{rank}</span>
                      <span className="text-[13px] text-[#f5f0e8] font-medium truncate">{name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-[11px] text-[#7a766e]">{count} turnos</span>
                      <span className="text-[12px] font-bold text-[#f5f0e8] font-mono w-20 text-right">{revenue}</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: rc.bar }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
            <span className="text-[10px] text-[#7a766e]">{servicesPeriod === 'semana' ? 'Esta semana' : 'Este mes'} · Datos históricos (Fase E)</span>
          </div>
        </div>

        {/* Appointment Metrics — partial real data */}
        <div className="lg:col-span-3 relative isolate rounded-[1.5rem] border border-white/[0.06] p-6 overflow-hidden flex flex-col bg-[#0d0d0d]/40">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block mb-5">MÉTRICAS DE CITAS</span>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: 'event_available', label: 'Turnos hoy',   value: loading ? '…' : `${metrics?.cobradoCount ?? 0} / ${totalAppts}`, sub: metrics && totalAppts > 0 ? `${metrics.occupancyRate}% ocupación` : 'sin datos' },
              { icon: 'check_circle',    label: 'Confirmados',  value: loading ? '…' : String(metrics?.confirmedCount ?? 0), sub: 'para hoy' },
              { icon: 'timer',           label: 'Pendientes',   value: loading ? '…' : String(metrics?.pendingCount ?? 0), sub: 'sin confirmar' },
              { icon: 'cancel',          label: 'Cancelaciones', value: loading ? '…' : String(metrics?.cancelledCount ?? 0), sub: 'hoy' },
            ].map(({ icon, label, value, sub }) => (
              <div key={label} className="p-3.5 bg-white/[0.02] rounded-2xl border border-white/[0.04] hover:border-violet-400/20 transition-colors flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '16px' }}>{icon}</span>
                </div>
                <div>
                  <p className="text-[#f5f0e8] font-bold text-lg leading-none">{value}</p>
                  <p className="text-[#7a766e] text-[11px] mt-1 leading-tight">{label}</p>
                  <p className="text-[#7a766e]/60 text-[10px] leading-tight">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Staff commissions from real data */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">Top Estilistas hoy</span>
            </div>
            <ul className="flex flex-col gap-2">
              {(metrics?.staffCommissions ?? []).slice(0, 3).map(({ staffName, amount }) => {
                const color = avatarColor(staffName);
                return (
                  <li key={staffName} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                      {initials2(staffName)}
                    </div>
                    <span className="text-[13px] text-[#f5f0e8] flex-1 truncate">{staffName.split(' ')[0]}</span>
                    <span className="text-[11px] text-violet-300 font-mono shrink-0">{fmtARS(amount)}</span>
                  </li>
                );
              })}
              {!loading && (metrics?.staffCommissions ?? []).length === 0 && (
                <li><p className="text-[11px] text-[#7a766e]">Sin cobros aún</p></li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Movimientos del Día — real cobrado appointments ── */}
      <section className="relative isolate rounded-[1.5rem] border border-white/10 overflow-hidden">
        <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-xl font-bold text-[#f5f0e8] font-playfair italic">Movimientos del Día</h3>
            <p className="text-[#7a766e] text-[13px] mt-1">Turnos cobrados hoy</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-violet-500 hover:bg-violet-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">Exportar CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-white/[0.02]">
                {['HORA', 'CLIENTE', 'CONCEPTO', 'MÉTODO', 'MONTO', 'ESTADO'].map(h => (
                  <th key={h} className={`px-6 py-4 text-[9px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06] ${h === 'MONTO' ? 'text-right' : h === 'ESTADO' ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {cobradoAppts.map(a => {
                const color = avatarColor(a.clientName);
                return (
                  <tr key={a.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-[#7a766e]">{a.timeStr}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                          {initials2(a.clientName)}
                        </div>
                        <span className="text-[13px] text-[#f5f0e8] font-medium">{a.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#7a766e]">{a.serviceNames}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-violet-400/10 text-violet-400 text-[9px] font-bold uppercase tracking-wider border border-violet-400/20">
                        {methodLabel[a.paymentMethod] ?? a.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-[13px] text-[#f5f0e8] font-bold font-mono">{fmtARS(a.amountPaid)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px] leading-none block">check_circle</span>
                    </td>
                  </tr>
                );
              })}
              {!loading && cobradoAppts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#7a766e] text-sm">Sin movimientos cobrados hoy</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
