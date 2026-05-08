'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Bell, Plus, Sparkles } from 'lucide-react';

const ADMIN_NAV = [
  { icon: 'dashboard',    label: 'Dashboard',     tab: 'dashboard' as const },
  { icon: 'calendar_month', label: 'Agenda',      tab: 'agenda'    as const },
  { icon: 'people',       label: 'Clientes',      tab: 'clientes'  as const },
  { icon: 'content_cut',  label: 'Servicios',     tab: 'servicios' as const },
  { icon: 'settings',     label: 'Config.',       tab: 'config'    as const },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'agenda' | 'clientes' | 'servicios' | 'config'>('dashboard');

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

  return (
    <div
      className="min-h-screen text-[#f5f0e8] selection:bg-violet-500/30 selection:text-[#f5f0e8] relative"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #1a0b2e 0%, #050504 50%), radial-gradient(circle at 100% 100%, #120a1f 0%, #050504 50%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        .sidebar-expand { width: 60px !important; }
        .sidebar-expand:hover { width: 220px !important; }
      `}</style>

      {/* Violet ambient glow — override del mesh-glow ámbar de globals */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background: 'radial-gradient(circle at 15% 25%, rgba(139,92,246,0.07) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(109,40,217,0.04) 0%, transparent 40%)',
      }} />

      {/* ══════════════════════════════════════════════
          SIDEBAR — igual que /perfil
      ══════════════════════════════════════════════ */}
      <aside className="hidden md:block fixed left-3 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 group sidebar-expand">
        <div className="liquid-glass-floating rounded-[2rem] flex flex-col py-5 px-2 gap-1 w-full overflow-hidden">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 px-[5px] mb-6 group/logo cursor-pointer">
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-b from-white/[0.15] to-transparent p-[1px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/logo:shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover/logo:scale-105">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-violet-400/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                <span className="font-playfair italic text-[#f5f0e8] text-[15px] tracking-widest relative z-10 transition-colors duration-500 group-hover/logo:text-violet-400">M</span>
              </div>
            </div>
            <span className="text-xl font-playfair italic text-[#f5f0e8] group-hover/logo:text-violet-400 opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
              MujerApp
            </span>
          </Link>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 w-full">
            {ADMIN_NAV.map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full h-10 rounded-xl flex items-center gap-4 px-2.5 transition-all duration-200 cursor-pointer ${
                  activeTab === item.tab
                    ? 'text-violet-400 bg-white/[0.08]'
                    : 'text-[#7a766e] hover:text-violet-400 hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[19px] flex-shrink-0">{item.icon}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Separator */}
          <div className="w-full h-px bg-white/10 my-2 opacity-50" />

          {/* Logout */}
          <div className="flex flex-col gap-1 w-full">
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#7a766e] hover:text-violet-400 hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">logout</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Salir
              </span>
            </button>
          </div>

        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MOBILE TOP HEADER
      ══════════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-[#050504]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <span className="font-playfair text-lg font-bold text-violet-400 italic">MujerApp</span>
        <div className="flex items-center gap-1.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/[0.05] transition-all cursor-pointer text-[#7a766e]">
            <Bell size={17} />
          </button>
          <div className="w-8 h-8 rounded-full bg-violet-400/15 border border-violet-400/25 flex items-center justify-center text-violet-400 text-xs font-bold">
            V
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════ */}
      <main className="md:pl-[84px] pb-28 md:pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-7">

          {/* ── Greeting ── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#7a766e] text-sm">{today}</p>
              <h1 className="font-playfair text-3xl md:text-4xl font-bold mt-1 leading-tight italic">
                {greeting},{' '}
                <span className="text-violet-400">Valentina</span>
              </h1>
              <p className="text-[#7a766e] text-sm mt-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-violet-400" />
                Tenés 7 turnos agendados para hoy
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
            <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden hover:border-violet-400/20 transition-all duration-300 cursor-default group">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">INGRESOS TOTALES</span>
                <span className="material-symbols-outlined text-violet-400 text-[18px]">account_balance_wallet</span>
              </div>
              <div className="flex flex-col mt-1">
                <span className="font-playfair text-4xl text-[#f5f0e8] font-bold italic leading-none">$128,450.00</span>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="material-symbols-outlined text-emerald-400 text-[15px]">trending_up</span>
                  <span className="text-xs font-medium text-emerald-400">+12.5% vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Temporal Comparison (Mini Chart Card) */}
            <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden transition-all duration-300 cursor-default">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">COMPARATIVA SEMANAL</span>
                  <p className="font-playfair text-2xl text-[#f5f0e8] font-bold italic leading-none mt-1">$34.200</p>
                </div>
                <span className="material-symbols-outlined text-violet-400 text-[18px]">bar_chart</span>
              </div>
              <div className="flex items-end gap-2 h-24 mt-2">
                {[
                  { pct: 42, day: 'L' },
                  { pct: 58, day: 'M' },
                  { pct: 31, day: 'X' },
                  { pct: 100, day: 'J', today: true },
                  { pct: 52, day: 'V' },
                  { pct: 78, day: 'S' },
                  { pct: 47, day: 'D' },
                ].map(({ pct, day, today }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar">
                    <div
                      className={`w-full rounded-md transition-all duration-300 ${
                        today
                          ? 'shadow-[0_0_12px_rgba(167,139,250,0.5)]'
                          : 'group-hover/bar:opacity-80'
                      }`}
                      style={{
                        height: `${pct}%`,
                        background: today
                          ? 'linear-gradient(to top, #7c3aed, #a78bfa)'
                          : 'rgba(167,139,250,0.18)',
                      }}
                    />
                    <span className={`text-[9px] font-bold font-label ${today ? 'text-violet-400' : 'text-[#7a766e]'}`}>
                      {day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.05]">
                <span className="material-symbols-outlined text-emerald-400 text-[13px]">trending_up</span>
                <span className="text-[11px] text-emerald-400 font-medium">+14.2% vs semana ant.</span>
              </div>
            </div>

            {/* Upcoming Collections */}
            <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden transition-all duration-300 cursor-default">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">COBROS PENDIENTES</span>
                <span className="material-symbols-outlined text-amber-400 text-[18px]">event_repeat</span>
              </div>
              <div className="flex flex-col mt-1">
                <span className="font-playfair text-4xl text-[#f5f0e8] font-bold italic leading-none">24</span>
                <span className="text-xs text-[#7a766e] mt-3 font-medium">Estimado: <span className="text-amber-400">$12,300.00</span></span>
              </div>
              <div className="mt-4 w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="w-[70%] h-full bg-amber-400"></div>
              </div>
            </div>
          </div>

          {/* ── Distribution & Appointment Metrics ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Payment Distribution */}
            <div className="lg:col-span-2 relative isolate rounded-[1.5rem] border border-white/[0.06] p-6 md:p-7 overflow-hidden flex flex-col items-center justify-between h-full bg-[#0d0d0d]/40">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label self-start block mb-8">MÉTODO DE PAGO</span>
              
              <div className="relative w-44 h-44 mb-8">
                {/* Geometric Pie Visualization */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(167,139,250,0.15)]" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="rgba(255,255,255,0.03)" strokeWidth="3"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#a78bfa" strokeDasharray="65 35" strokeDashoffset="0" strokeWidth="3"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#e879f9" strokeDasharray="20 80" strokeDashoffset="-65" strokeWidth="3"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#d8b4fe" strokeDasharray="15 85" strokeDashoffset="-85" strokeWidth="3"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#f5f0e8] font-inter tracking-tight leading-none drop-shadow-md">65%</span>
                  <span className="text-[10px] text-[#7a766e] uppercase tracking-[0.2em] font-label mt-1.5">Digital</span>
                </div>
              </div>
              
              <div className="w-full mt-auto space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)] shrink-0" />
                    <span className="text-[13px] text-[#f5f0e8] font-medium">Tarjeta</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#f5f0e8] font-mono">65%</span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.6)] shrink-0" />
                    <span className="text-[13px] text-[#f5f0e8] font-medium">Efectivo</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#f5f0e8] font-mono">20%</span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(216,180,254,0.6)] shrink-0" />
                    <span className="text-[13px] text-[#f5f0e8] font-medium">Transfer.</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#f5f0e8] font-mono">15%</span>
                </div>
              </div>
            </div>

            {/* Appointment Metrics */}
            <div className="lg:col-span-3 space-y-4">
              <div className="relative isolate rounded-[1.5rem] border border-white/[0.06] p-6 md:p-7 overflow-hidden h-full flex flex-col justify-between group bg-[#0d0d0d]/40">
                <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

                <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block mb-5">MÉTRICAS DE CITAS</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04] flex items-center gap-4 hover:border-violet-400/20 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-violet-400/10 flex items-center justify-center border border-violet-400/20 shrink-0">
                      <span className="material-symbols-outlined text-violet-400">confirmation_number</span>
                    </div>
                    <div>
                      <p className="text-[#f5f0e8] font-bold text-xl leading-none">142</p>
                      <p className="text-[#7a766e] text-[13px] font-medium mt-1.5">Tickets Emitidos Hoy</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04] flex items-center gap-4 hover:border-violet-400/20 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-violet-400/10 flex items-center justify-center border border-violet-400/20 shrink-0">
                      <span className="material-symbols-outlined text-violet-400">timer</span>
                    </div>
                    <div>
                      <p className="text-[#f5f0e8] font-bold text-xl leading-none">18 min</p>
                      <p className="text-[#7a766e] text-[13px] font-medium mt-1.5">Tiempo Promedio</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 md:p-6 bg-white/[0.02] rounded-2xl border border-white/[0.04] relative hover:border-violet-400/20 transition-colors mt-auto">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h4 className="text-[#f5f0e8] font-medium text-[15px]">Rendimiento de Operadores</h4>
                      <p className="text-[13px] text-[#7a766e] mt-1">Top desempeño semanal activo</p>
                    </div>
                    <button className="text-violet-400 text-[13px] font-medium hover:text-violet-300 hover:underline transition-colors">Ver reporte</button>
                  </div>
                  <div className="flex -space-x-2">
                    <img alt="Avatar" className="w-8 h-8 rounded-full border-[1.5px] border-[#0d0d0d] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDovTZHT4ugpJUm45dR5I3v8-G6owMNgxWh1ru6Ohdw75SQGbn7Lw2JQNemI0ySMhl07Xda2BhkkOXbH3Bz5yWsI37dXETYSR7Mlp5Ho2MS2RsrAfUAzdKNOLfqznd4C_BIK029xEYq0-Pdp1YL-panD3YVge1RGNur_UT2LAxV87RjZ-f9AXFnjN-t9dZuXDTw1D3eH-V1qbitnSuRVLI0MKiDOGx6MCPwhHmtx7TQGLX_hWVjOE6TaZFeN3GvGGJ3xU7o5jo7Lz8" />
                    <img alt="Avatar" className="w-8 h-8 rounded-full border-[1.5px] border-[#0d0d0d] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpXmezsUHIg22n8IZepkoHtKiCTgmu2Rh8Z9uA4MrtJjptfoz7hqCKeVh7n1dI--g8tLopbIMAM-D9J25kpM-iNtwUb8xTLz4e7zKuSRTGtbDUF6D5aNvQezWO_gJlpJA7OOH3qu-MMu3PO-JYiNspGJMzLBQfPIxE8R2V2Ah1UWFnL_zCW0W1c6W2WENzZHLLZCUKMVpoe3u5j4FlONFOXlcUgt-ImwvGVHn37a_MHtSlzavxufLfUmavt5icsi4YEKavWFJhcEQ" />
                    <img alt="Avatar" className="w-8 h-8 rounded-full border-[1.5px] border-[#0d0d0d] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbLOO3Y7_8FQ6gl3rSZtEUQu8UsDsnuuGMqcC2RKCv9SiG2_H6-qRoQYlcwAJ9NFsVplIy7KgzvKjSSmiVkrZbEmZ6S_2ySuvcQq4dHUCAVHb48wvkIjbEkG5k4pERMpdDi3Y30jtR7IWHZLt2ym01dPjkx9VpfEGp3cVmv_EE09fCCfx815VPLnkCZ9TBxPFCHxOQZrsGZUeXRm6h4ZbPpMw9nGEN7pFPtsT7-rOZ8GL7-tJDfseoYE5sL3fpm44e5U22Xnb-9fE" />
                    <div className="w-8 h-8 rounded-full border-[1.5px] border-[#0d0d0d] bg-white/[0.05] flex items-center justify-center text-[10px] text-[#f5f0e8] font-bold">+8</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Movimientos del Día Table ── */}
          <section className="relative isolate rounded-[1.5rem] border border-white/10 overflow-hidden">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xl font-bold text-[#f5f0e8] font-playfair italic">Movimientos del Día</h3>
                <p className="text-[#7a766e] text-[13px] mt-1">Listado detallado de transacciones recientes</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-white/[0.05] hover:bg-white/[0.1] px-4 py-2.5 rounded-xl text-xs font-medium text-[#f5f0e8] transition-all border border-white/[0.05]">Filtrar</button>
                <button className="bg-violet-500 hover:bg-violet-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">Exportar CSV</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-4 text-[9px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06]">HORA</th>
                    <th className="px-6 py-4 text-[9px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06]">CLIENTE</th>
                    <th className="px-6 py-4 text-[9px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06]">CONCEPTO</th>
                    <th className="px-6 py-4 text-[9px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06]">MÉTODO</th>
                    <th className="px-6 py-4 text-[9px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06] text-right">MONTO</th>
                    <th className="px-6 py-4 text-[9px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label border-b border-white/[0.06] text-center">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <tr className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-[#7a766e]">14:24</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-400/10 flex items-center justify-center text-[10px] font-bold text-violet-400 border border-violet-400/20 shrink-0">VG</div>
                        <span className="text-[13px] text-[#f5f0e8] font-medium">Valentina García</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#7a766e]">Coloración + Brushing</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-violet-400/10 text-violet-400 text-[9px] font-bold uppercase tracking-wider border border-violet-400/20">Tarjeta</span>
                    </td>
                    <td className="px-6 py-4 text-right text-[13px] text-[#f5f0e8] font-bold font-mono">$8.500</td>
                    <td className="px-6 py-4 text-center">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px] leading-none block">check_circle</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-[#7a766e]">13:00</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center text-[10px] font-bold text-amber-400 border border-amber-400/20 shrink-0">LR</div>
                        <span className="text-[13px] text-[#f5f0e8] font-medium">Luciana Romero</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#7a766e]">Manicura gel + Pedicura</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 text-[9px] font-bold uppercase tracking-wider border border-amber-400/20">Efectivo</span>
                    </td>
                    <td className="px-6 py-4 text-right text-[13px] text-[#f5f0e8] font-bold font-mono">$4.200</td>
                    <td className="px-6 py-4 text-center">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px] leading-none block">check_circle</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-[#7a766e]">11:30</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-[#f5f0e8] border border-white/20 shrink-0">SM</div>
                        <span className="text-[13px] text-[#f5f0e8] font-medium">Sofía Martínez</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#7a766e]">Tratamiento capilar</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-white/[0.05] text-[#7a766e] text-[9px] font-bold uppercase tracking-wider border border-white/10">Transfer</span>
                    </td>
                    <td className="px-6 py-4 text-right text-[13px] text-[#f5f0e8] font-bold font-mono">$6.800</td>
                    <td className="px-6 py-4 text-center">
                      <span className="material-symbols-outlined text-amber-400 text-[16px] leading-none block">schedule</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] text-center">
              <button className="text-[#7a766e] text-[11px] hover:text-violet-400 transition-colors font-medium tracking-wide uppercase">Cargar más transacciones</button>
            </div>
          </section>
        </div>
      </main>

      {/* ══════════════════════════════════════════════
          MOBILE BOTTOM NAV
      ══════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 liquid-glass-floating border-t border-violet-400/10">
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {ADMIN_NAV.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[52px] ${
                activeTab === item.tab ? 'text-violet-400' : 'text-[#7a766e] hover:text-[#f5f0e8]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-[10px] font-label uppercase tracking-wide leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
