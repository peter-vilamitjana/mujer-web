'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTenant } from '@/contexts/TenantContext';
import { getDailyMetrics, getWeeklyRevenue, getRevenueTimeSeries } from '@/actions/appointments.actions';
import type { DailyMetrics, DayRevenue, RevenueSeries } from '@/actions/appointments.actions';
import { getCierreCaja } from '@/actions/caja.actions';
import type { CierreCajaData } from '@/actions/caja.actions';

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
  const [metrics, setMetrics]       = useState<DailyMetrics | null>(null);
  const [caja, setCaja]             = useState<CierreCajaData | null>(null);
  const [weekly, setWeekly]         = useState<DayRevenue[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [series, setSeries]         = useState<RevenueSeries | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [loading, setLoading]       = useState(true);

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
    Promise.all([
      getDailyMetrics(tenantId, branchId ?? ''),
      getCierreCaja(tenantId, branchId ?? ''),
      getWeeklyRevenue(tenantId, branchId ?? ''),
      getRevenueTimeSeries(tenantId, branchId ?? '', 'dia'),
    ])
      .then(([m, c, w, s]) => { setMetrics(m); setCaja(c); setWeekly(w); setSeries(s); })
      .catch(err => console.error('[DashboardTabView]', err))
      .finally(() => setLoading(false));
  }, [tenantId, branchId]);

  useEffect(() => {
    if (!tenantId || loading) return;
    setSeriesLoading(true);
    getRevenueTimeSeries(tenantId, branchId ?? '', chartPeriod)
      .then(setSeries)
      .catch(err => console.error('[DashboardTabView] series', err))
      .finally(() => setSeriesLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartPeriod]);

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
        {/* Total Income Card — real trend chart */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden hover:border-violet-400/20 transition-all duration-300 cursor-default flex flex-col justify-between group">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label mt-1.5">INGRESOS TOTALES</span>
            <div className="flex items-center bg-[#0d0d0d]/60 rounded-[8px] p-[3px] border border-white/[0.04] backdrop-blur-md">
              {(['dia', 'semana', 'mes'] as const).map((p, i) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-[5px] transition-all cursor-pointer ${
                    chartPeriod === p
                      ? 'text-[#f5f0e8] bg-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                      : 'text-[#7a766e] hover:text-[#f5f0e8]'
                  }`}
                >
                  {['Hoy', 'Sem', 'Mes'][i]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col mb-4">
            <span className="font-playfair text-4xl text-[#f5f0e8] font-bold italic leading-none">
              {loading ? '…' : chartPeriod === 'dia' ? fmtARS(totalRevenue) : fmtARS(series?.total ?? 0)}
            </span>
            {chartPeriod === 'dia' && revenueDeltaPct !== null && revenueDeltaPct !== undefined && (
              <div className="flex items-center gap-1.5 mt-3">
                <span className={`material-symbols-outlined text-[15px] ${revenueDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {revenueDeltaPct >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                <span className={`text-xs font-medium ${revenueDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {revenueDeltaPct >= 0 ? '+' : ''}{revenueDeltaPct}% vs ayer
                </span>
              </div>
            )}
            {chartPeriod !== 'dia' && (
              <p className="text-[10px] text-[#7a766e] mt-2">
                {chartPeriod === 'semana' ? 'Semana actual' : 'Últimos 30 días'}
              </p>
            )}
            {/* Real trend line */}
            <div className="h-10 w-full relative opacity-90 mt-3 -mb-2">
              {(loading || seriesLoading) ? (
                <div className="h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-violet-400/40 animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                </div>
              ) : series && series.points.length >= 2 ? (() => {
                const pts = series.points;
                const mx  = series.maxVal;
                const W = 100, H = 28;
                const step = W / (pts.length - 1);
                const line = pts.map((v, i) =>
                  `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(H - (v / mx) * H).toFixed(1)}`
                ).join(' ');
                const fill = `${line} L${W},${H} L0,${H} Z`;
                const hasRevenue = pts.some(v => v > 0);
                const color = hasRevenue ? '#34d399' : '#a78bfa';
                return (
                  <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={fill} fill="url(#trendGrad)" />
                    <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      className={`drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]`} />
                  </svg>
                );
              })() : (
                <div className="h-full border-b border-white/[0.05]" />
              )}
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

        {/* Weekly Revenue — real data */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden transition-all duration-300 cursor-default">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">COMPARATIVA SEMANAL</span>
              <p className="font-playfair text-2xl text-[#f5f0e8] font-bold italic leading-none mt-1">
                {loading ? '…' : fmtARS(weekly.reduce((s, d) => s + d.revenue, 0))}
              </p>
            </div>
            <span className="text-[9px] font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2.5 py-1 rounded-full uppercase tracking-wide">
              Semana
            </span>
          </div>
          {loading ? (
            <div className="h-28 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
            </div>
          ) : (() => {
            const maxRev = Math.max(...weekly.map(d => d.revenue), 1);
            return (
              <>
                <div className="flex items-end gap-1.5 h-28 mt-2">
                  {weekly.map((day) => {
                    const heightPct = Math.max(Math.round(day.revenue / maxRev * 100), day.revenue > 0 ? 6 : 3);
                    return (
                      <div key={day.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar relative">
                        {day.cobradoCount > 0 && (
                          <span className="absolute bottom-full mb-1.5 text-[8px] font-mono text-[#7a766e] opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {fmtARS(day.revenue)}
                          </span>
                        )}
                        <div
                          className="w-full rounded-md transition-all duration-700"
                          style={{
                            height: `${heightPct}%`,
                            background: day.isToday
                              ? 'linear-gradient(to top, #7c3aed, #a78bfa)'
                              : day.revenue > 0
                                ? 'rgba(167,139,250,0.35)'
                                : 'rgba(255,255,255,0.04)',
                          }}
                        />
                        <span className={`text-[9px] font-bold font-label ${day.isToday ? 'text-violet-400' : 'text-[#7a766e]'}`}>
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[#7a766e]/60 mt-3 text-center">
                  {weekly.reduce((s, d) => s + d.cobradoCount, 0)} turnos cobrados esta semana
                </p>
              </>
            );
          })()}
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
          {(() => {
            // r=15.915 → circumference ≈ 100, so pct == strokeDasharray value directly
            const METHODS = [
              { key: 'tarjeta',       color: '#a78bfa', label: 'Tarjeta'      },
              { key: 'mercadopago',   color: '#e879f9', label: 'Mercado Pago' },
              { key: 'efectivo',      color: '#34d399', label: 'Efectivo'     },
              { key: 'transferencia', color: '#60a5fa', label: 'Transfer.'    },
            ] as const;

            const vals = METHODS.map(m => revenueByMethod?.[m.key] ?? 0);
            const sum  = vals.reduce((a, b) => a + b, 0);
            // Round pcts and fix the last one so they always sum to 100
            const pcts = vals.map((v, i, arr) => {
              if (sum === 0) return i === 0 ? 100 : 0;
              if (i < arr.length - 1) return Math.round((v / sum) * 100);
              return 100 - vals.slice(0, -1).reduce((a, w) => a + Math.round((w / sum) * 100), 0);
            });

            // Cumulative offset: each segment starts where the previous ended
            let offset = 0;
            const segments = METHODS.map((m, i) => {
              const pct = pcts[i];
              const seg = { ...m, pct, offset };
              offset += pct;
              return seg;
            }).filter(s => s.pct > 0);

            // Find the dominant method for the center label
            const topIdx  = pcts.indexOf(Math.max(...pcts));
            const topPct  = pcts[topIdx];
            const topColor = METHODS[topIdx].color;
            const topLabel = METHODS[topIdx].label;

            const digitalPct = totalRevenue > 0
              ? Math.round(((revenueByMethod?.tarjeta ?? 0) + (revenueByMethod?.mercadopago ?? 0)) / totalRevenue * 100)
              : 0;

            return (
              <>
                <div className="relative w-44 h-44 mb-8">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(167,139,250,0.15)]" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                    {loading ? (
                      <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="rgba(255,255,255,0.06)" strokeDasharray="100 0" strokeWidth="3" />
                    ) : sum === 0 ? (
                      <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="rgba(255,255,255,0.06)" strokeDasharray="100 0" strokeWidth="3" />
                    ) : segments.map(s => (
                      <circle
                        key={s.key}
                        cx="18" cy="18"
                        fill="transparent"
                        r="15.915"
                        stroke={s.color}
                        strokeWidth="3"
                        strokeDasharray={`${s.pct} ${100 - s.pct}`}
                        strokeDashoffset={-s.offset}
                        style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {loading || sum === 0 ? (
                      <span className="text-[#7a766e] text-sm">—</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold font-inter tracking-tight leading-none drop-shadow-md" style={{ color: topColor }}>
                          {topPct}%
                        </span>
                        <span className="text-[10px] text-[#7a766e] uppercase tracking-[0.2em] font-label mt-1.5 text-center leading-tight max-w-[60px] truncate">
                          {topLabel}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full mt-auto space-y-3">
                  {METHODS.map(({ key, color, label }, i) => {
                    const pct = pcts[i];
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[13px] text-[#f5f0e8] font-medium">{label}</span>
                        </div>
                        <span className="text-[13px] font-bold text-[#f5f0e8] font-mono">
                          {loading ? '…' : `${pct}%`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>

        {/* Top Services — real data from caja.topServices */}
        <div className="lg:col-span-3 relative isolate rounded-[1.5rem] border border-white/[0.06] p-6 md:p-7 overflow-hidden flex flex-col bg-[#0d0d0d]/40">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block">SERVICIOS DESTACADOS</span>
              <p className="font-playfair text-lg text-[#f5f0e8] font-bold italic leading-tight mt-1">Hoy</p>
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full uppercase tracking-wide">
              Live
            </span>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
            </div>
          ) : !caja?.topServices.length ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-2">
              <span className="material-symbols-outlined text-[#7a766e]/40" style={{ fontSize: '32px' }}>bar_chart_4_bars</span>
              <p className="text-[11px] text-[#7a766e]">Sin servicios cobrados hoy</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3 flex-1">
              {(() => {
                const DOT_COLORS = ['#fbbf24', '#a78bfa', '#e879f9', '#34d399', '#60a5fa'];
                const BAR_GRADIENTS = [
                  'linear-gradient(to right, #92400e, #fbbf24)',
                  'linear-gradient(to right, #4c1d95, #a78bfa)',
                  'linear-gradient(to right, #701a75, #e879f9)',
                  'linear-gradient(to right, #064e3b, #34d399)',
                  'linear-gradient(to right, #1e3a5f, #60a5fa)',
                ];
                const maxCount = Math.max(...(caja?.topServices ?? []).map(s => s.count), 1);
                return (caja?.topServices ?? []).map((svc, i) => (
                  <li key={svc.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                          style={{ background: `${DOT_COLORS[i]}18`, color: DOT_COLORS[i] }}>{i + 1}</span>
                        <span className="text-[13px] text-[#f5f0e8] font-medium truncate">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-[11px] text-[#7a766e]">{svc.count}×</span>
                        <span className="text-[12px] font-bold text-[#f5f0e8] font-mono w-20 text-right">{fmtARS(svc.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round(svc.count / maxCount * 100)}%`, background: BAR_GRADIENTS[i] }} />
                    </div>
                  </li>
                ));
              })()}
            </ul>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
            <span className="text-[10px] text-[#7a766e]">{caja?.dateLabel ?? 'Hoy'} · {caja?.cobradoCount ?? 0} turnos cobrados</span>
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
