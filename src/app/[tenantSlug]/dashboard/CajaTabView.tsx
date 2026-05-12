'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { getCierreCaja } from '@/actions/caja.actions';
import type { CierreCajaData } from '@/actions/caja.actions';
import { getWeeklyRevenue } from '@/actions/appointments.actions';
import type { DayRevenue } from '@/actions/appointments.actions';

const fmtARS = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

const METHOD_COLORS: Record<string, string> = {
  efectivo:      '#fbbf24',
  mercadopago:   '#38bdf8',
  tarjeta:       '#a78bfa',
  transferencia: '#94a3b8',
};
const METHOD_LABELS: Record<string, string> = {
  efectivo:      'Efectivo',
  mercadopago:   'Mercado Pago',
  tarjeta:       'Tarjeta',
  transferencia: 'Transferencia',
};

const AVATAR_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (name = '') => {
  const p = name.trim().split(' ').filter(Boolean);
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

type DatePreset = 'today' | 'yesterday' | 'custom';

function dateFromPreset(preset: DatePreset, custom: string): Date {
  if (preset === 'yesterday') {
    const d = new Date(); d.setDate(d.getDate() - 1); return d;
  }
  if (preset === 'custom' && custom) return new Date(custom + 'T12:00:00');
  return new Date();
}

export default function CajaTabView() {
  const { tenantId, branchId } = useTenant();

  const [preset, setPreset]     = useState<DatePreset>('today');
  const [customDate, setCustomDate] = useState('');
  const [caja, setCaja]         = useState<CierreCajaData | null>(null);
  const [weekly, setWeekly]     = useState<DayRevenue[]>([]);
  const [loading, setLoading]   = useState(true);

  const selectedDate = dateFromPreset(preset, customDate);

  const load = useCallback(() => {
    if (!tenantId) return;
    setLoading(true);
    Promise.all([
      getCierreCaja(tenantId, branchId ?? '', selectedDate),
      getWeeklyRevenue(tenantId, branchId ?? ''),
    ])
      .then(([c, w]) => { setCaja(c); setWeekly(w); })
      .catch(err => console.error('[CajaTabView]', err))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, branchId, preset, customDate]);

  useEffect(() => { load(); }, [load]);

  const methods = caja
    ? (Object.entries(caja.byMethod) as [string, number][]).filter(([, v]) => v > 0)
    : [];
  const maxMethod = Math.max(...methods.map(([, v]) => v), 1);
  const maxWeekRev = Math.max(...weekly.map(d => d.revenue), 1);

  const isToday = preset === 'today';

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold italic text-[#f5f0e8]">
            Cierre de <span className="text-violet-400">Caja</span>
          </h1>
          <p className="text-[#7a766e] text-sm mt-1 capitalize">
            {loading ? 'Cargando…' : caja?.dateLabel ?? ''}
          </p>
        </div>

        {/* Date selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['today', 'yesterday'] as const).map(p => (
            <button
              key={p}
              onClick={() => { setPreset(p); setCustomDate(''); }}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                preset === p
                  ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                  : 'bg-white/[0.05] text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.08]'
              }`}
            >
              {p === 'today' ? 'Hoy' : 'Ayer'}
            </button>
          ))}
          <input
            type="date"
            value={customDate}
            onChange={e => { setCustomDate(e.target.value); setPreset('custom'); }}
            className="px-3 py-2 rounded-xl text-[11px] font-medium bg-white/[0.05] border border-white/[0.08] text-[#f5f0e8] cursor-pointer focus:outline-none focus:border-violet-400/40 transition-all [color-scheme:dark]"
          />
          <button
            onClick={load}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.06] hover:bg-violet-400/10 hover:border-violet-400/30 transition-all cursor-pointer text-[#7a766e] hover:text-violet-400"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      {/* ── Top metrics strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total del día', value: loading ? '…' : fmtARS(caja?.totalRevenue ?? 0), icon: 'point_of_sale', color: '#a78bfa' },
          { label: 'Turnos cobrados', value: loading ? '…' : String(caja?.cobradoCount ?? 0), icon: 'check_circle', color: '#34d399' },
          { label: 'Ticket promedio', value: loading || !caja?.cobradoCount ? '…' : fmtARS(Math.round((caja?.totalRevenue ?? 0) / (caja?.cobradoCount ?? 1))), icon: 'receipt_long', color: '#fbbf24' },
          { label: 'Semana actual', value: loading ? '…' : fmtARS(weekly.reduce((s, d) => s + d.revenue, 0)), icon: 'calendar_month', color: '#60a5fa' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="relative isolate rounded-[1.5rem] border border-white/10 p-5 overflow-hidden">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label leading-tight">{label}</span>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
                <span className="material-symbols-outlined text-[14px]" style={{ color }}>{icon}</span>
              </div>
            </div>
            <p className="font-playfair text-2xl font-bold italic text-[#f5f0e8] leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Payment methods breakdown */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block mb-5">
            DESGLOSE POR MÉTODO DE PAGO
          </span>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
            </div>
          ) : methods.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[#7a766e]/30" style={{ fontSize: '36px' }}>payments</span>
              <p className="text-[12px] text-[#7a766e]">Sin cobros en esta fecha</p>
            </div>
          ) : (
            <div className="space-y-5">
              {methods.sort(([, a], [, b]) => b - a).map(([method, amount]) => {
                const color = METHOD_COLORS[method] ?? '#94a3b8';
                const pct = Math.round(amount / maxMethod * 100);
                const share = caja!.totalRevenue > 0 ? Math.round(amount / caja!.totalRevenue * 100) : 0;
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[13px] text-[#f5f0e8] font-medium">{METHOD_LABELS[method] ?? method}</span>
                        <span className="text-[10px] text-[#7a766e] bg-white/[0.04] px-1.5 py-0.5 rounded-full">{share}%</span>
                      </div>
                      <span className="text-[14px] font-bold text-[#f5f0e8] font-mono">{fmtARS(amount)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}

              {/* Total row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <span className="text-[11px] uppercase font-bold text-[#7a766e] tracking-wider font-label">Total cobrado</span>
                <span className="text-[18px] font-bold text-violet-300 font-mono font-playfair italic">{fmtARS(caja?.totalRevenue ?? 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Staff commissions */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block mb-5">
            COMISIONES POR PROFESIONAL
          </span>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
            </div>
          ) : !caja?.byStaff.length ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[#7a766e]/30" style={{ fontSize: '36px' }}>person_off</span>
              <p className="text-[12px] text-[#7a766e]">Sin turnos cobrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {caja.byStaff.map(s => {
                const color = avatarColor(s.staffName);
                const commPct = s.grossSales > 0 ? Math.round(s.commissionAmount / s.grossSales * 100) : 0;
                return (
                  <div key={s.staffId} className="flex items-center gap-4 py-3 border-b border-white/[0.05] last:border-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
                    >
                      {initials(s.staffName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#f5f0e8] truncate">{s.staffName}</p>
                      <p className="text-[10px] text-[#7a766e]">{s.ticketCount} turno{s.ticketCount !== 1 ? 's' : ''} · {fmtARS(s.grossSales)} bruto</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-bold font-mono" style={{ color }}>{fmtARS(s.commissionAmount)}</p>
                      <p className="text-[10px] text-[#7a766e]">{commPct}% comisión</p>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] uppercase font-bold text-[#7a766e] tracking-wider font-label">Total comisiones</span>
                <span className="text-[15px] font-bold text-violet-300 font-mono">
                  {fmtARS(caja.byStaff.reduce((s, st) => s + st.commissionAmount, 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Top services + Weekly chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top services */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">SERVICIOS MÁS VENDIDOS</span>
            {isToday && (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full uppercase tracking-wide">Live</span>
            )}
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
            </div>
          ) : !caja?.topServices.length ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[#7a766e]/30" style={{ fontSize: '36px' }}>bar_chart_4_bars</span>
              <p className="text-[12px] text-[#7a766e]">Sin servicios cobrados</p>
            </div>
          ) : (() => {
            const DOT_COLORS  = ['#fbbf24', '#a78bfa', '#e879f9', '#34d399', '#60a5fa'];
            const BAR_GRADS   = [
              'linear-gradient(to right, #92400e, #fbbf24)',
              'linear-gradient(to right, #4c1d95, #a78bfa)',
              'linear-gradient(to right, #701a75, #e879f9)',
              'linear-gradient(to right, #064e3b, #34d399)',
              'linear-gradient(to right, #1e3a5f, #60a5fa)',
            ];
            const maxCount = Math.max(...caja.topServices.map(s => s.count), 1);
            return (
              <ul className="space-y-4">
                {caja.topServices.map((svc, i) => (
                  <li key={svc.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                          style={{ background: `${DOT_COLORS[i]}18`, color: DOT_COLORS[i] }}
                        >{i + 1}</span>
                        <span className="text-[13px] text-[#f5f0e8] font-medium truncate">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-[11px] text-[#7a766e]">{svc.count}×</span>
                        <span className="text-[12px] font-bold text-[#f5f0e8] font-mono w-20 text-right">{fmtARS(svc.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round(svc.count / maxCount * 100)}%`, background: BAR_GRADS[i] }} />
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>

        {/* Weekly revenue chart */}
        <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block">COMPARATIVA SEMANAL</span>
              <p className="font-playfair text-2xl text-[#f5f0e8] font-bold italic leading-none mt-1">
                {loading ? '…' : fmtARS(weekly.reduce((s, d) => s + d.revenue, 0))}
              </p>
            </div>
            <span className="text-[9px] font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2.5 py-1 rounded-full uppercase tracking-wide">Semana</span>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 h-36">
                {weekly.map(day => {
                  const heightPct = Math.max(Math.round(day.revenue / maxWeekRev * 100), day.revenue > 0 ? 6 : 3);
                  return (
                    <div key={day.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar relative">
                      {day.cobradoCount > 0 && (
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none bg-[#0d0d0d]/90 border border-white/10 rounded-lg px-2 py-1 text-center whitespace-nowrap z-10">
                          <p className="text-[9px] font-mono text-[#f5f0e8]">{fmtARS(day.revenue)}</p>
                          <p className="text-[8px] text-[#7a766e]">{day.cobradoCount} turno{day.cobradoCount !== 1 ? 's' : ''}</p>
                        </div>
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
                      <span className={`text-[10px] font-bold font-label ${day.isToday ? 'text-violet-400' : 'text-[#7a766e]'}`}>
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#7a766e]/60 mt-4 text-center">
                {weekly.reduce((s, d) => s + d.cobradoCount, 0)} turnos cobrados esta semana
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
