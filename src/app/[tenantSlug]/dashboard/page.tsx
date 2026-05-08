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
  const [servicesPeriod, setServicesPeriod] = React.useState<'semana' | 'mes'>('semana');

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
            <div className="relative isolate rounded-[1.5rem] border border-white/10 p-6 overflow-hidden hover:border-violet-400/20 transition-all duration-300 cursor-default flex flex-col justify-between group">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label mt-1.5">INGRESOS TOTALES</span>
                
                {/* Time Filter Pills */}
                <div className="flex items-center bg-[#0d0d0d]/60 rounded-[8px] p-[3px] border border-white/[0.04] backdrop-blur-md">
                  <button className="px-2.5 py-1 text-[10px] font-semibold text-[#f5f0e8] bg-white/[0.08] rounded-[5px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all">Hoy</button>
                  <button className="px-2.5 py-1 text-[10px] font-medium text-[#7a766e] hover:text-[#f5f0e8] transition-all">Sem</button>
                  <button className="px-2.5 py-1 text-[10px] font-medium text-[#7a766e] hover:text-[#f5f0e8] transition-all">Mes</button>
                </div>
              </div>
              
              <div className="flex flex-col mb-4">
                <span className="font-playfair text-4xl text-[#f5f0e8] font-bold italic leading-none">$128,450.00</span>
                <div className="flex items-center gap-1.5 mt-3 mb-4">
                  <span className="material-symbols-outlined text-emerald-400 text-[15px]">trending_up</span>
                  <span className="text-xs font-medium text-emerald-400">+12.5% vs ayer</span>
                </div>
                
                {/* Visual Trend Line */}
                <div className="h-10 w-full relative opacity-90 -mb-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 30 L0 25 L15 22 L30 26 L45 15 L60 18 L75 8 L85 11 L100 2 L100 30 Z"
                      fill="url(#trendGradient)"
                    />
                    <path
                      d="M0 25 L15 22 L30 26 L45 15 L60 18 L75 8 L85 11 L100 2"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    />
                  </svg>
                </div>
              </div>

              {/* Payment Breakdown Legend */}
              <div className="grid grid-cols-1 gap-2.5 pt-4 border-t border-white/[0.06] mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_5px_rgba(56,189,248,0.5)]" style={{ backgroundColor: '#38bdf8' }}></span>
                    <span className="text-[11px] text-[#7a766e] font-medium tracking-wide">Mercado Pago</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#f5f0e8] font-mono">$65,200.00</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_5px_rgba(167,139,250,0.5)]" style={{ backgroundColor: '#a78bfa' }}></span>
                    <span className="text-[11px] text-[#7a766e] font-medium tracking-wide">Tarjeta</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#f5f0e8] font-mono">$40,150.00</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_5px_rgba(251,191,36,0.5)]" style={{ backgroundColor: '#fbbf24' }}></span>
                    <span className="text-[11px] text-[#7a766e] font-medium tracking-wide">Efectivo</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#f5f0e8] font-mono">$23,100.00</span>
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
                {/* Delta badge — more prominent */}
                <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                  <span className="material-symbols-outlined text-emerald-400 text-[13px]" style={{ fontSize: '13px' }}>trending_up</span>
                  <span className="text-[11px] text-emerald-400 font-bold">+14.2%</span>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-28 mt-2">
                {[
                  { pct: 42, day: 'L',  amount: '$14.400', today: false, best: false },
                  { pct: 58, day: 'M',  amount: '$19.900', today: false, best: false },
                  { pct: 31, day: 'X',  amount: '$10.600', today: false, best: false },
                  { pct: 100, day: 'J', amount: '$34.200', today: true,  best: true  },
                  { pct: 52, day: 'V',  amount: '$17.800', today: false, best: false },
                  { pct: 78, day: 'S',  amount: '$26.700', today: false, best: false },
                  { pct: 47, day: 'D',  amount: '$16.100', today: false, best: false },
                ].map(({ pct, day, amount, today, best }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar relative">
                    {/* Hover tooltip */}
                    <div className="absolute bottom-[calc(100%-2rem)] left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none z-10 mb-1">
                      <div className="bg-[#1a1525] border border-violet-500/30 rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                        <span className="text-[10px] font-bold text-[#f5f0e8] font-mono">{amount}</span>
                      </div>
                      <div className="w-2 h-2 bg-[#1a1525] border-b border-r border-violet-500/30 rotate-45 mx-auto -mt-1" />
                    </div>
                    {/* Best day crown */}
                    {best && (
                      <span className="material-symbols-outlined text-amber-400 absolute" style={{ fontSize: '12px', bottom: 'calc(100% - 1.5rem)', left: '50%', transform: 'translateX(-50%) translateY(-100%)' }}>
                        star
                      </span>
                    )}
                    <div
                      className={`w-full rounded-md transition-all duration-300 group-hover/bar:brightness-125 ${
                        today
                          ? 'shadow-[0_0_14px_rgba(167,139,250,0.55)]'
                          : best
                          ? 'shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                          : ''
                      }`}
                      style={{
                        height: `${pct}%`,
                        background: today
                          ? 'linear-gradient(to top, #7c3aed, #a78bfa)'
                          : best
                          ? 'linear-gradient(to top, #92400e, #fbbf24)'
                          : 'rgba(167,139,250,0.20)',
                      }}
                    />
                    <span className={`text-[9px] font-bold font-label ${today ? 'text-violet-400' : best ? 'text-amber-400' : 'text-[#7a766e]'}`}>
                      {day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                <span className="text-[10px] text-[#7a766e]">vs semana anterior</span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400/80 inline-block" />
                  <span className="text-[10px] text-[#7a766e]">mejor día</span>
                  <span className="w-2 h-2 rounded-full bg-violet-400 inline-block ml-2" />
                  <span className="text-[10px] text-[#7a766e]">hoy</span>
                </div>
              </div>
            </div>

            {/* Upcoming Collections */}
            <div className="relative isolate rounded-[1.5rem] border border-white/10 p-5 overflow-hidden transition-all duration-300 flex flex-col">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">COBROS PENDIENTES</span>
                  <p className="font-playfair text-3xl text-[#f5f0e8] font-bold italic leading-none mt-1">3</p>
                </div>
                <span className="material-symbols-outlined text-amber-400 text-[18px]">payments</span>
              </div>

              {/* Mini list */}
              <ul className="flex flex-col gap-2 flex-1">
                {[
                  { initials: 'SM', name: 'Sofía M.',   time: '13:00', amount: '$2.500' },
                  { initials: 'CT', name: 'Camila T.',  time: '14:30', amount: '$1.800' },
                  { initials: 'DL', name: 'Daniela L.', time: '16:00', amount: '$2.500' },
                ].map((row) => (
                  <li key={row.time} className="flex items-center gap-2.5 py-2 border-b border-white/[0.05] last:border-0">
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0">
                      {row.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#f5f0e8] leading-none truncate">{row.name}</p>
                      <p className="text-[10px] text-[#7a766e] mt-0.5 font-mono">{row.time}</p>
                    </div>
                    <span className="text-[12px] font-bold text-amber-400 font-mono shrink-0">{row.amount}</span>
                  </li>
                ))}
              </ul>

              {/* Total */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] text-[#7a766e] uppercase tracking-wider font-label">Total estimado</span>
                <span className="text-[13px] font-bold text-amber-400 font-mono">$6.800</span>
              </div>
            </div>
          </div>

          {/* ── Distribution & Appointment Metrics ── */}
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-5">
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
              
              <div className="w-full mt-auto space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.6)]" style={{ backgroundColor: '#a78bfa' }}></span>
                    <span className="text-[13px] text-[#f5f0e8] font-medium">Tarjeta</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#f5f0e8] font-mono">65%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(232,121,249,0.6)]" style={{ backgroundColor: '#e879f9' }}></span>
                    <span className="text-[13px] text-[#f5f0e8] font-medium">Efectivo</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#f5f0e8] font-mono">20%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(216,180,254,0.6)]" style={{ backgroundColor: '#d8b4fe' }}></span>
                    <span className="text-[13px] text-[#f5f0e8] font-medium">Transfer.</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#f5f0e8] font-mono">15%</span>
                </div>
              </div>
            </div>

            {/* Top Services Card */}
            <div className="lg:col-span-3 relative isolate rounded-[1.5rem] border border-white/[0.06] p-6 md:p-7 overflow-hidden flex flex-col bg-[#0d0d0d]/40">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block">SERVICIOS DESTACADOS</span>
                  <p className="font-playfair text-lg text-[#f5f0e8] font-bold italic leading-tight mt-1">Más solicitados</p>
                </div>
                {/* Semana / Mes toggle */}
                <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.06] rounded-full p-0.5">
                  {(['semana', 'mes'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setServicesPeriod(p)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold font-label uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                        servicesPeriod === p
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/25'
                          : 'text-[#7a766e] hover:text-[#f5f0e8]'
                      }`}
                    >
                      {p === 'semana' ? 'Semana' : 'Mes'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service list */}
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
                  const rankColors: Record<number, { dot: string; glow: string; bar: string }> = {
                    1: { dot: '#fbbf24', glow: 'rgba(251,191,36,0.5)', bar: 'linear-gradient(to right, #92400e, #fbbf24)' },
                    2: { dot: '#a78bfa', glow: 'rgba(167,139,250,0.5)', bar: 'linear-gradient(to right, #4c1d95, #a78bfa)' },
                    3: { dot: '#e879f9', glow: 'rgba(232,121,249,0.4)', bar: 'linear-gradient(to right, #701a75, #e879f9)' },
                    4: { dot: '#7a766e', glow: 'transparent',           bar: 'rgba(167,139,250,0.15)' },
                  };
                  const rc = rankColors[rank];
                  return (
                    <li key={name} className="group/svc">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                            style={{ background: `${rc.dot}18`, color: rc.dot, boxShadow: `0 0 6px ${rc.glow}` }}
                          >
                            {rank}
                          </span>
                          <span className="text-[13px] text-[#f5f0e8] font-medium truncate">{name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-[11px] text-[#7a766e]">{count} turnos</span>
                          <span className="text-[12px] font-bold text-[#f5f0e8] font-mono w-20 text-right">{revenue}</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: rc.bar }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
                <span className="text-[10px] text-[#7a766e]">
                  {servicesPeriod === 'semana' ? 'Esta semana · Jue 1 – Jue 7 May' : 'Este mes · Mayo 2026'}
                </span>
                <button className="text-[11px] text-violet-400 hover:text-violet-300 font-medium transition-colors cursor-pointer">Ver todos →</button>
              </div>
            </div>

            {/* Appointment Metrics */}
            <div className="lg:col-span-3 relative isolate rounded-[1.5rem] border border-white/[0.06] p-6 overflow-hidden flex flex-col bg-[#0d0d0d]/40">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

              <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label block mb-5">MÉTRICAS DE CITAS</span>

              {/* 2×2 stat tiles */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: 'event_available', label: 'Turnos hoy',         value: '18 / 22', sub: '82% ocupación'  },
                  { icon: 'timer',           label: 'Duración promedio',  value: '48 min',  sub: 'por servicio'   },
                  { icon: 'check_circle',    label: 'Confirmados',        value: '87%',     sub: 'tasa confirmac.' },
                  { icon: 'cancel',          label: 'Cancelaciones',      value: '2',       sub: 'hoy'            },
                ].map(({ icon, label, value, sub }) => (
                  <div
                    key={label}
                    className="p-3.5 bg-white/[0.02] rounded-2xl border border-white/[0.04] hover:border-violet-400/20 transition-colors flex flex-col gap-2"
                  >
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

              {/* Staff performance */}
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-[#7a766e] tracking-[0.15em] font-label">Top Estilistas</span>
                  <button className="text-[11px] text-violet-400 hover:text-violet-300 font-medium transition-colors cursor-pointer">Ver reporte →</button>
                </div>
                <ul className="flex flex-col gap-2">
                  {[
                    { initials: 'LM', name: 'Luciana M.',   turnos: 8, color: '#a78bfa' },
                    { initials: 'SR', name: 'Sofía R.',      turnos: 6, color: '#e879f9' },
                    { initials: 'CA', name: 'Camila A.',     turnos: 4, color: '#d8b4fe' },
                  ].map(({ initials, name, turnos, color }) => (
                    <li key={initials} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
                      >
                        {initials}
                      </div>
                      <span className="text-[13px] text-[#f5f0e8] flex-1 truncate">{name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-16 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(turnos / 8) * 100}%`, background: color }}
                          />
                        </div>
                        <span className="text-[11px] text-[#7a766e] font-mono w-8 text-right">{turnos}t</span>
                      </div>
                    </li>
                  ))}
                </ul>
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
