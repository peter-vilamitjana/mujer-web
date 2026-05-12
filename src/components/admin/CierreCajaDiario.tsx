'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { getCierreCaja } from '@/actions/caja.actions';
import type { CierreCajaData } from '@/actions/caja.actions';

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
  transferencia: 'Transfer.',
};

const AVATAR_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

export function CierreCajaDiario() {
  const { tenantId, branchId } = useTenant();
  const [data, setData]       = useState<CierreCajaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    getCierreCaja(tenantId, branchId ?? '')
      .then(setData)
      .catch(err => console.error('[CierreCajaDiario]', err))
      .finally(() => setLoading(false));
  }, [tenantId, branchId]);

  const methods = data
    ? (Object.entries(data.byMethod) as [string, number][]).filter(([, v]) => v > 0)
    : [];
  const maxMethod = Math.max(...methods.map(([, v]) => v), 1);

  return (
    <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden">
      <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block">
            CIERRE DE CAJA
          </span>
          <p className="font-playfair text-2xl text-[#f5f0e8] font-bold italic leading-none mt-1">
            {loading ? '…' : fmtARS(data?.totalRevenue ?? 0)}
          </p>
          <p className="text-[11px] text-[#7a766e] mt-1 capitalize">
            {loading ? '' : `${data?.dateLabel} · ${data?.cobradoCount ?? 0} turnos cobrados`}
          </p>
        </div>
        <span className="material-symbols-outlined text-violet-400 text-[22px]">point_of_sale</span>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
        </div>
      ) : !data || data.totalRevenue === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center gap-2 text-center">
          <span className="material-symbols-outlined text-[#7a766e]/30" style={{ fontSize: '32px' }}>point_of_sale</span>
          <p className="text-[11px] text-[#7a766e]">Sin cobros registrados hoy</p>
        </div>
      ) : (
        <>
          {/* Payment methods breakdown */}
          <div className="space-y-3 mb-6">
            {methods.map(([method, amount]) => {
              const color = METHOD_COLORS[method] ?? '#94a3b8';
              const pct = Math.round(amount / maxMethod * 100);
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[13px] text-[#f5f0e8] font-medium">{METHOD_LABELS[method] ?? method}</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#f5f0e8] font-mono">{fmtARS(amount)}</span>
                  </div>
                  <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Staff commissions */}
          {data.byStaff.length > 0 && (
            <>
              <div className="border-t border-white/[0.06] pt-4">
                <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block mb-3">
                  COMISIONES
                </span>
                <ul className="space-y-2">
                  {data.byStaff.map(s => {
                    const color = avatarColor(s.staffName);
                    return (
                      <li key={s.staffId} className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
                        >
                          {initials(s.staffName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-[#f5f0e8] truncate">{s.staffName}</p>
                          <p className="text-[10px] text-[#7a766e]">{s.ticketCount} turno{s.ticketCount !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-bold text-violet-300 font-mono">{fmtARS(s.commissionAmount)}</p>
                          <p className="text-[9px] text-[#7a766e] font-mono">{fmtARS(s.grossSales)} bruto</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
