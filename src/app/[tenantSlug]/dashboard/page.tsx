'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Bell, ChevronRight, Plus, TrendingUp, Clock,
  CheckCircle2, ArrowUpRight, Sparkles,
  Home, Calendar, Users, Scissors, Settings,
} from 'lucide-react';

// ─── Mock data (reemplazar con Server Actions cuando estén listos) ───────────

const UPCOMING = [
  { id: 1, initials: 'VG', name: 'Valentina García',  service: 'Corte + Brushing',       time: '10:00', duration: '60 min', status: 'confirmed' as const },
  { id: 2, initials: 'LR', name: 'Luciana Romero',    service: 'Coloración completa',     time: '11:30', duration: '120 min', status: 'confirmed' as const },
  { id: 3, initials: 'SM', name: 'Sofía Martínez',    service: 'Manicura gel',             time: '13:00', duration: '45 min', status: 'pending' as const },
  { id: 4, initials: 'CT', name: 'Camila Torres',     service: 'Depilación brasileña',     time: '14:30', duration: '30 min', status: 'confirmed' as const },
  { id: 5, initials: 'DL', name: 'Daniela López',     service: 'Tratamiento capilar',      time: '16:00', duration: '90 min', status: 'confirmed' as const },
];

const WEEK = [
  { day: 'LUN', amount: 18500 },
  { day: 'MAR', amount: 24200 },
  { day: 'MIÉ', amount: 15800 },
  { day: 'JUE', amount: 31400 },
  { day: 'VIE', amount: 28900 },
  { day: 'SÁB', amount: 42100 },
  { day: 'HOY', amount: 19200, isToday: true },
];

const ADMIN_NAV = [
  { icon: 'dashboard',    label: 'Dashboard',     tab: 'dashboard' as const },
  { icon: 'calendar_month', label: 'Agenda',      tab: 'agenda'    as const },
  { icon: 'people',       label: 'Clientes',      tab: 'clientes'  as const },
  { icon: 'content_cut',  label: 'Servicios',     tab: 'servicios' as const },
  { icon: 'settings',     label: 'Config.',       tab: 'config'    as const },
];

const ARS = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const maxAmount = Math.max(...WEEK.map(d => d.amount));
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
      className="min-h-screen text-[#f5f0e8] selection:bg-[#f1c97d] selection:text-[#050504] relative"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #1a160f 0%, #050504 50%), radial-gradient(circle at 100% 100%, #121212 0%, #050504 50%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        .sidebar-expand { width: 60px !important; }
        .sidebar-expand:hover { width: 220px !important; }
      `}</style>

      <div className="mesh-glow" />

      {/* ══════════════════════════════════════════════
          SIDEBAR — igual que /perfil
      ══════════════════════════════════════════════ */}
      <aside className="hidden md:block fixed left-3 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 group sidebar-expand">
        <div className="liquid-glass-floating rounded-[2rem] flex flex-col py-5 px-2 gap-1 w-full overflow-hidden">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 px-[5px] mb-6 group/logo cursor-pointer">
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-b from-white/[0.15] to-transparent p-[1px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/logo:shadow-[0_0_15px_rgba(241,201,125,0.15)] group-hover/logo:scale-105">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#f1c97d]/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                <span className="font-playfair italic text-[#f5f0e8] text-[15px] tracking-widest relative z-10 transition-colors duration-500 group-hover/logo:text-[#f1c97d]">M</span>
              </div>
            </div>
            <span className="text-xl font-playfair italic text-[#f5f0e8] group-hover/logo:text-[#f1c97d] opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
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
                    ? 'text-[#f1c97d] bg-white/[0.08]'
                    : 'text-[#7a766e] hover:text-[#f1c97d] hover:bg-white/5'
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
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#7a766e] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
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
        <span className="font-playfair text-lg font-bold text-[#f1c97d] italic">MujerApp</span>
        <div className="flex items-center gap-1.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/[0.05] transition-all cursor-pointer text-[#7a766e]">
            <Bell size={17} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#f1c97d]/15 border border-[#f1c97d]/25 flex items-center justify-center text-[#f1c97d] text-xs font-bold">
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
              <p className="text-zinc-500 text-sm">{today}</p>
              <h1 className="font-playfair text-3xl md:text-4xl font-bold mt-1 leading-tight italic">
                {greeting},{' '}
                <span className="text-violet-400">Valentina</span>
              </h1>
              <p className="text-zinc-500 text-sm mt-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-violet-400" />
                Tenés 7 turnos agendados para hoy
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)] shrink-0">
              <Plus size={15} strokeWidth={2.5} />
              Nuevo turno
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Turnos hoy',     value: '7',       sub: '2 pendientes', icon: 'calendar_month', gold: true  },
              { label: 'Ingresos del día', value: '$19.200', sub: '+8% vs ayer',  icon: 'trending_up',    green: true },
              { label: 'Próxima clienta', value: '10:00',   sub: 'Valentina G.', icon: 'schedule',       gold: false },
              { label: 'Completados',     value: '3',       sub: 'de 7 turnos',  icon: 'check_circle',   gold: false },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative isolate rounded-[1.5rem] border border-white/10 p-4 md:p-5 overflow-hidden hover:border-[#f1c97d]/20 transition-all duration-300 cursor-default"
              >
                <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${stat.gold ? 'bg-[#f1c97d]' : stat.green ? 'bg-emerald-400' : 'bg-white/20'}`} />
                <span className={`material-symbols-outlined text-[18px] mb-3 block ${stat.gold ? 'text-[#f1c97d]' : stat.green ? 'text-emerald-400' : 'text-[#7a766e]'}`}>
                  {stat.icon}
                </span>
                <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.15em] font-label">{stat.label}</p>
                <p className="font-playfair text-2xl md:text-3xl font-bold text-[#f5f0e8] mt-1 italic leading-none">
                  {stat.value}
                </p>
                <p className={`text-xs mt-1.5 font-medium ${stat.green ? 'text-emerald-400' : 'text-[#7a766e]'}`}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Appointments + Chart ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Upcoming appointments */}
            <div className="lg:col-span-3 relative isolate rounded-[1.5rem] border border-white/10 overflow-hidden">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#f5f0e8]">Próximos turnos</h2>
                <button className="text-[10px] text-[#f1c97d] hover:text-[#f5f0e8] transition-colors font-label uppercase tracking-widest flex items-center gap-1 cursor-pointer">
                  Ver agenda <ArrowUpRight size={11} />
                </button>
              </div>

              <ul className="divide-y divide-white/[0.04]">
                {UPCOMING.map((apt) => (
                  <li key={apt.id}>
                    <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer text-left group">
                      <div className="w-8 h-8 rounded-full bg-[#f1c97d]/10 border border-[#f1c97d]/20 flex items-center justify-center text-[#f1c97d] text-[11px] font-bold shrink-0">
                        {apt.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#f5f0e8] truncate leading-tight">{apt.name}</p>
                        <p className="text-xs text-[#7a766e] truncate mt-0.5">{apt.service} · {apt.duration}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-[#f5f0e8] font-mono leading-tight">{apt.time}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          apt.status === 'confirmed' ? 'text-emerald-400' : 'text-[#f1c97d]'
                        }`}>
                          {apt.status === 'confirmed' ? '● Confirmado' : '○ Pendiente'}
                        </span>
                      </div>
                      <ChevronRight size={13} className="text-[#7a766e]/40 group-hover:text-[#7a766e] transition-colors ml-1 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="px-5 py-3 border-t border-white/[0.04]">
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-[#7a766e] hover:text-[#f1c97d] hover:bg-[#f1c97d]/5 transition-all duration-200 cursor-pointer">
                  <Plus size={14} />
                  Agregar turno
                </button>
              </div>
            </div>

            {/* Week chart */}
            <div className="lg:col-span-2 relative isolate rounded-[1.5rem] border border-white/10 p-5 flex flex-col">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-[#f5f0e8]">Esta semana</h2>
                <p className="text-[11px] text-[#7a766e] mt-0.5">Ingresos diarios</p>
              </div>

              <div className="flex-1 flex items-end justify-between gap-1.5 min-h-[120px]">
                {WEEK.map((d) => {
                  const h = Math.round((d.amount / maxAmount) * 100);
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                      <div
                        className={`w-full rounded-lg transition-all duration-300 ${
                          d.isToday
                            ? 'shadow-[0_0_16px_rgba(241,201,125,0.35)]'
                            : 'bg-white/[0.07] group-hover:bg-[#f1c97d]/10'
                        }`}
                        style={{
                          height: `${h}%`,
                          background: d.isToday
                            ? 'linear-gradient(to top, rgba(241,201,125,0.8), rgba(241,201,125,1))'
                            : undefined,
                        }}
                      />
                      <span className={`text-[9px] uppercase tracking-wider font-bold font-label ${
                        d.isToday ? 'text-[#f1c97d]' : 'text-[#7a766e]'
                      }`}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1.5">
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-[#7a766e] font-label">Total semana</p>
                  <p className="text-sm font-bold text-[#f5f0e8] font-mono">$180.100</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-[#7a766e] font-label">vs semana anterior</p>
                  <p className="text-xs font-semibold text-emerald-400">↑ 14.2%</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div>
            <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.2em] font-label mb-3">
              Acciones rápidas
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Nuevo turno',    icon: 'add_circle',   primary: true  },
                { label: 'Ver agenda',     icon: 'calendar_month', primary: false },
                { label: 'Nueva clienta',  icon: 'person_add',   primary: false },
                { label: 'Mis servicios',  icon: 'content_cut',  primary: false },
              ].map((action) => (
                <button
                  key={action.label}
                  className={`relative isolate flex flex-col items-center justify-center gap-2.5 py-5 px-3 rounded-[1.5rem] text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer overflow-hidden ${
                    action.primary
                      ? 'border border-[#f1c97d]/30 text-[#050504]'
                      : 'border border-white/10 text-[#7a766e] hover:text-[#f1c97d] hover:border-[#f1c97d]/20'
                  }`}
                  style={action.primary ? {
                    background: 'linear-gradient(135deg, rgba(241,201,125,0.9), rgba(212,175,55,1))',
                    boxShadow: '0 0 24px rgba(241,201,125,0.2)',
                  } : undefined}
                >
                  {!action.primary && <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />}
                  <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                  <span className="text-[11px] leading-tight text-center font-label uppercase tracking-wide">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ══════════════════════════════════════════════
          MOBILE BOTTOM NAV
      ══════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 liquid-glass-floating border-t border-[#f1c97d]/10">
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {ADMIN_NAV.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[52px] ${
                activeTab === item.tab ? 'text-[#f1c97d]' : 'text-[#7a766e] hover:text-[#f5f0e8]'
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
