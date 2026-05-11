'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { getCustomers, searchCustomers, getCustomerAppointments } from '@/actions/customer.actions';
import type { Customer, Appointment } from '@/lib/schema';

type ClientStatus = 'vip' | 'frecuente' | 'regular' | 'nuevo' | 'inactivo';

interface ClientRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  lastVisit: string;
  totalSpent: number;
  status: ClientStatus;
  avatar: string;
  color: string;
  notes?: string;
}

const AVATAR_COLORS = [
  '#a78bfa', '#fbbf24', '#34d399', '#f472b6',
  '#38bdf8', '#fb7185', '#a3e635', '#e879f9',
];

const STATUS_CFG: Record<ClientStatus, { bg: string; text: string; label: string; icon: string }> = {
  vip:       { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', label: 'VIP',       icon: 'workspace_premium' },
  frecuente: { bg: 'rgba(167,139,250,0.12)', text: '#a78bfa', label: 'Frecuente', icon: 'favorite' },
  regular:   { bg: 'rgba(52,211,153,0.12)', text: '#34d399', label: 'Regular',   icon: 'check_circle' },
  nuevo:     { bg: 'rgba(244,114,182,0.12)', text: '#f472b6', label: 'Nuevo',     icon: 'new_releases' },
  inactivo:  { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', label: 'Inactivo',  icon: 'schedule' },
};

function deriveStatus(c: Customer): ClientStatus {
  const visits = c.metrics?.totalVisits ?? 0;
  const lastVisit = c.metrics?.lastVisit;
  if (lastVisit) {
    // After toSerializable, Timestamp fields are millisecond numbers
    const ms = typeof (lastVisit as any).toMillis === 'function'
      ? (lastVisit as any).toMillis()
      : Number(lastVisit);
    const days = (Date.now() - ms) / 86_400_000;
    if (days > 180) return 'inactivo';
  } else if (visits === 0) {
    return 'nuevo';
  }
  if (visits >= 20) return 'vip';
  if (visits >= 10) return 'frecuente';
  if (visits >= 5) return 'regular';
  return 'nuevo';
}

function formatLastVisit(c: Customer): string {
  const lv = c.metrics?.lastVisit;
  if (!lv) return 'Sin visitas';
  const ms = typeof (lv as any).toMillis === 'function' ? (lv as any).toMillis() : Number(lv);
  const date = new Date(ms);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function avatarColor(name: string): string {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function mapCustomer(c: Customer): ClientRow {
  return {
    id: c.id,
    name: c.fullName,
    phone: c.phone ?? '—',
    email: c.email ?? '—',
    visits: c.metrics?.totalVisits ?? 0,
    lastVisit: formatLastVisit(c),
    totalSpent: c.metrics?.totalSpent ?? 0,
    status: deriveStatus(c),
    avatar: initials(c.fullName),
    color: avatarColor(c.fullName),
    notes: c.notes,
  };
}

interface HistoryRow {
  date: string;
  service: string;
  pro: string;
  amount: number;
  status: string;
}

function mapAppointment(a: Appointment): HistoryRow {
  const ms = a.date
    ? (typeof (a.date as any).toMillis === 'function' ? (a.date as any).toMillis() : Number(a.date))
    : null;
  const date = ms ? new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  return {
    date,
    service: a.serviceNames ?? '—',
    pro: a.staffName ?? '—',
    amount: a.amountPaid ?? a.priceFinal ?? a.priceEstimated ?? 0,
    status: a.status === 'cobrado' || a.status === 'completed' ? 'completado' : a.status === 'confirmed' ? 'confirmado' : 'pendiente',
  };
}

export default function ClientesTabView() {
  const { tenantId } = useTenant();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all');
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load
  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    getCustomers(tenantId, { lim: 100 }).then(customers => {
      const rows = customers.map(mapCustomer);
      setClients(rows);
      setTotalCount(rows.length);
      if (rows.length > 0) setSelectedId(rows[0].id);
    }).finally(() => setLoading(false));
  }, [tenantId]);

  // Search debounce
  useEffect(() => {
    if (!tenantId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) {
      // Reload full list when search is cleared
      getCustomers(tenantId, { lim: 100 }).then(customers => {
        setClients(customers.map(mapCustomer));
      });
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchCustomers(tenantId, search.trim());
      setClients(results.map(mapCustomer));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, tenantId]);

  // Load history when client selected
  useEffect(() => {
    if (!tenantId || !selectedId) return;
    setHistoryLoading(true);
    setHistory([]);
    getCustomerAppointments(tenantId, selectedId, 10).then(appts => {
      setHistory(appts.map(mapAppointment));
    }).finally(() => setHistoryLoading(false));
  }, [tenantId, selectedId]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchesStatus;
    });
  }, [clients, filterStatus]);

  const selectedClient = filteredClients.find(c => c.id === selectedId) ?? clients.find(c => c.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold italic text-[#f5f0e8] leading-tight">Directorio de Clientes</h1>
          <p className="text-[#7a766e] text-sm mt-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '16px' }}>group</span>
            {loading ? 'Cargando…' : `${totalCount} clientes registrados`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] active:scale-95 text-[#f5f0e8] text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[600px]">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">

          {/* Filters and Search */}
          <div className="relative isolate rounded-[1.5rem] border border-white/[0.08] p-4 bg-[#0d0d0d]/40 overflow-hidden flex flex-col md:flex-row gap-3">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

            <div className="relative flex-1 group">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a766e] group-focus-within:text-violet-400 transition-colors pointer-events-none" style={{ fontSize: '18px' }}>search</span>
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-xl pl-10 pr-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border
                  ${filterStatus === 'all' ? 'bg-white/[0.08] border-white/[0.15] text-[#f5f0e8]' : 'bg-transparent border-white/[0.05] text-[#7a766e] hover:bg-white/[0.04] hover:text-[#f5f0e8]'}`}
              >
                Todos
              </button>
              {(Object.keys(STATUS_CFG) as ClientStatus[]).map(status => {
                const cfg = STATUS_CFG[status];
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border"
                    style={filterStatus === status
                      ? { background: cfg.bg, borderColor: `${cfg.text}40`, color: cfg.text }
                      : { background: 'transparent', borderColor: 'rgba(255,255,255,0.05)', color: '#7a766e' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="relative isolate rounded-[1.5rem] border border-white/[0.08] overflow-hidden flex flex-col flex-1 bg-[#0d0d0d]/40 min-h-[400px]">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-16">
                <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '32px' }}>progress_activity</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="px-5 py-4 text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06]">Cliente</th>
                      <th className="px-5 py-4 text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06]">Contacto</th>
                      <th className="px-5 py-4 text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06] text-center">Visitas</th>
                      <th className="px-5 py-4 text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06] text-center">Estado</th>
                      <th className="px-5 py-4 text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06] text-right">Valor LTV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredClients.map(client => {
                      const cfg = STATUS_CFG[client.status];
                      const isSel = selectedId === client.id;
                      return (
                        <tr
                          key={client.id}
                          onClick={() => setSelectedId(client.id)}
                          className={`transition-colors cursor-pointer group ${isSel ? 'bg-violet-500/[0.08]' : 'hover:bg-white/[0.03]'}`}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 border"
                                  style={{ background: `${client.color}15`, color: client.color, borderColor: `${client.color}30` }}>
                                  {client.avatar}
                                </div>
                                {isSel && (
                                  <div className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center border-2 border-[#0d0d0d]">
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>check</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className={`text-[13px] font-bold ${isSel ? 'text-violet-300' : 'text-[#f5f0e8]'} group-hover:text-violet-300 transition-colors`}>{client.name}</p>
                                <p className="text-[11px] text-[#7a766e] mt-0.5">Última: {client.lastVisit}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-[12px] text-[#f5f0e8]">{client.phone}</p>
                            <p className="text-[10px] text-[#7a766e] truncate max-w-[140px] mt-0.5">{client.email}</p>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-[14px] font-bold text-[#f5f0e8] font-mono">{client.visits}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
                              style={{ background: cfg.bg, color: cfg.text, borderColor: `${cfg.text}30` }}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-[13px] font-bold text-[#f5f0e8] font-mono">${client.totalSpent.toLocaleString('es-AR')}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredClients.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <span className="material-symbols-outlined text-[#7a766e]/50 mb-3" style={{ fontSize: '36px' }}>search_off</span>
                          <p className="text-[#7a766e] text-sm">No se encontraron clientes.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] text-center mt-auto">
              <span className="text-[11px] text-[#7a766e] font-medium tracking-wide">
                Mostrando {filteredClients.length} de {totalCount} clientes
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EXPEDIENTE */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">

          {selectedClient ? (
            <div className="relative isolate rounded-[1.5rem] border border-white/[0.08] flex flex-col bg-[#0d0d0d]/40 overflow-hidden h-full animate-in slide-in-from-right-8 duration-500">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-white/[0.06] flex flex-col items-center justify-center text-center group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] -mr-10 -mt-10 transition-opacity duration-700 opacity-30 group-hover:opacity-60"
                  style={{ background: selectedClient.color }} />

                <div className="relative mb-3 group/avatar cursor-pointer">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-20 transition-opacity duration-500 group-hover/avatar:opacity-50"
                    style={{ background: selectedClient.color }} />
                  <div className="relative w-[84px] h-[84px] rounded-full flex items-center justify-center text-[24px] font-black tracking-tighter shadow-lg border-2 transition-transform duration-300 group-hover/avatar:scale-105"
                    style={{ background: `${selectedClient.color}1a`, color: selectedClient.color, borderColor: `${selectedClient.color}40` }}>
                    {selectedClient.avatar}
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-[2px] border-[#0d0d0d] flex items-center justify-center shadow-sm"
                      style={{ background: STATUS_CFG[selectedClient.status].text }}>
                      <span className="material-symbols-outlined text-[#0a0a0a] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {STATUS_CFG[selectedClient.status].icon}
                      </span>
                    </div>
                  </div>
                </div>

                <h2 className="font-playfair text-[22px] font-bold text-[#f5f0e8] mb-1.5 tracking-tight leading-none">{selectedClient.name}</h2>
                <div className="flex items-center gap-2 mb-3 text-[12px] text-[#7a766e]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                    {selectedClient.phone}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 w-full">
                  <button className="flex-1 py-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] rounded-xl text-[11px] font-bold text-[#f5f0e8] transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    Editar
                  </button>
                  <button className="flex-1 py-2 bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 rounded-xl text-[11px] font-bold text-[#25D366] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_10px_rgba(37,211,102,0.1)]">
                    <span className="material-symbols-outlined text-[15px]">chat</span>
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6" style={{ overscrollBehavior: 'contain' }}>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.1em]">Total Gastado</span>
                    <span className="text-[16px] font-bold text-[#f5f0e8] font-mono">${selectedClient.totalSpent.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.1em]">Visitas Totales</span>
                    <span className="text-[16px] font-bold text-[#f5f0e8] font-mono">{selectedClient.visits}</span>
                  </div>
                  <div className="col-span-2 p-3 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.1em]">Email</span>
                    <span className="text-[13px] font-medium text-[#f5f0e8]">{selectedClient.email}</span>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="relative">
                    <span className="text-[9px] uppercase tracking-widest text-violet-400 font-bold block mb-2 font-label">Notas Técnicas & Preferencias</span>
                    <div className="relative p-3.5 bg-violet-500/5 backdrop-blur-md rounded-2xl border border-violet-500/20 text-[12px] leading-relaxed text-[#c9c3b8] italic">
                      <span className="absolute top-2 left-2 text-violet-400/20 text-4xl leading-none font-serif">"</span>
                      <span className="relative z-10 pl-4 block">{selectedClient.notes}</span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#7a766e] font-bold font-label">Historial de Turnos</span>
                    <button className="text-[10px] font-bold text-violet-400 hover:text-violet-300 cursor-pointer transition-colors flex items-center gap-0.5">
                      Ver todo <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </button>
                  </div>

                  {historyLoading ? (
                    <div className="py-6 flex justify-center">
                      <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
                    </div>
                  ) : history.length > 0 ? (
                    <div className="relative pl-2.5 ml-2 border-l border-white/[0.06] space-y-4">
                      {history.map((h, i) => (
                        <div key={i} className="relative group cursor-default">
                          <div className={`absolute -left-[14.5px] top-1.5 w-2 h-2 rounded-full border-[2px] border-[#0d0d0d] ${h.status === 'confirmado' ? 'bg-amber-400' : 'bg-emerald-400/80 group-hover:bg-emerald-400'} transition-all`} />
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-[#7a766e] tracking-wide">{h.date}</span>
                            <span className="text-[10px] uppercase font-bold text-[#7a766e]">{h.status}</span>
                          </div>
                          <div className="p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] rounded-xl transition-all">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[#f5f0e8] text-[12px] font-bold leading-tight pr-2">{h.service}</span>
                              <span className="text-[#a1a1aa] font-mono text-[11px] shrink-0">${h.amount.toLocaleString('es-AR')}</span>
                            </div>
                            <p className="text-[11px] text-[#7a766e] flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[12px]">content_cut</span>
                              con {h.pro}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 text-center bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl">
                      <p className="text-[11px] text-[#7a766e]">No hay turnos registrados para este cliente.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/[0.06] bg-black/20 shrink-0">
                <button className="w-full py-3 bg-violet-500 hover:bg-violet-400 active:scale-[0.98] text-white font-bold rounded-xl text-[13px] transition-all shadow-[0_0_24px_rgba(139,92,246,0.3)] cursor-pointer flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>calendar_add_on</span>
                  Agendar Nuevo Turno
                </button>
              </div>
            </div>
          ) : (
            <div className="relative isolate rounded-[1.5rem] border border-white/[0.08] p-6 flex flex-col items-center justify-center bg-[#0d0d0d]/40 overflow-hidden h-full min-h-[400px]">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <span className="material-symbols-outlined text-[#7a766e]/50 mb-4" style={{ fontSize: '48px' }}>recent_actors</span>
              <p className="text-[#f5f0e8] text-base font-medium mb-1">Ningún cliente seleccionado</p>
              <p className="text-[#7a766e] text-sm text-center max-w-[250px]">Seleccioná un cliente de la lista para ver su expediente, historial y notas técnicas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
