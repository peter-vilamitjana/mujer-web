'use client';

import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import AgendaTabView from './AgendaTabView';
import ClientesTabView from './ClientesTabView';
import ServiciosTabView from './ServiciosTabView';
import ConfigTabView from './ConfigTabView';
import PerformanceTabView from './PerformanceTabView';
import DashboardTabView from './DashboardTabView';
import CajaTabView from './CajaTabView';
import { QueryProvider } from '@/components/providers/QueryProvider';

const ADMIN_NAV = [
  { icon: 'dashboard',    label: 'Dashboard',     tab: 'dashboard' as const },
  { icon: 'calendar_month', label: 'Agenda',      tab: 'agenda'    as const },
  { icon: 'people',       label: 'Clientes',      tab: 'clientes'  as const },
  { icon: 'content_cut',  label: 'Servicios',     tab: 'servicios' as const },
  { icon: 'point_of_sale', label: 'Caja',         tab: 'caja'        as const },
  { icon: 'insights',     label: 'Rendimiento',   tab: 'performance' as const },
  { icon: 'settings',     label: 'Config.',       tab: 'config'    as const },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'agenda' | 'clientes' | 'servicios' | 'caja' | 'performance' | 'config'>('dashboard');

  return (
    <QueryProvider>
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
        .sidebar-liquid {
          --glass-reflex-light: 1;
          --glass-reflex-dark: 1;
        }
        .sidebar-liquid-lens {
          background-color: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(48px) saturate(200%);
          -webkit-backdrop-filter: blur(48px) saturate(200%);
          box-shadow: 
            inset 0 1px 1px color-mix(in srgb, white calc(var(--glass-reflex-light) * 15%), transparent),
            inset 0 0 0 1px color-mix(in srgb, white calc(var(--glass-reflex-light) * 8%), transparent),
            inset 0 -1px 1px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 30%), transparent),
            0 12px 32px rgba(0,0,0,0.25),
            0 24px 64px rgba(0,0,0,0.38);
        }
      `}</style>

      {/* Violet ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background: 'radial-gradient(circle at 15% 25%, rgba(139,92,246,0.07) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(109,40,217,0.04) 0%, transparent 40%)',
      }} />

      {/* ══ SIDEBAR ══ */}
      <aside className="hidden md:block fixed left-3 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 group sidebar-expand">
        <div className="sidebar-liquid relative rounded-[2rem] flex flex-col py-5 px-2 gap-1 w-full overflow-hidden isolate">
          {/* Isolated Lens */}
          <div className="sidebar-liquid-lens absolute inset-0 -z-10 rounded-[2rem] pointer-events-none" />

          <Link href="/" className="flex items-center mb-6 group/logo cursor-pointer overflow-hidden h-10 rounded-xl hover:bg-white/5 transition-all duration-200">
            <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-b from-white/[0.15] to-transparent p-[1px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/logo:shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover/logo:scale-105">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-violet-400/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                  <span className="font-playfair italic text-[#f5f0e8] text-[15px] tracking-widest relative z-10 transition-colors duration-500 group-hover/logo:text-violet-400">M</span>
                </div>
              </div>
            </div>
            <span className="text-[22px] font-playfair italic text-[#f5f0e8] group-hover/logo:text-violet-400 opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
              MujerApp
            </span>
          </Link>

          <nav className="flex flex-col gap-1 w-full">
            {ADMIN_NAV.map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 cursor-pointer overflow-hidden ${
                  activeTab === item.tab
                    ? 'text-violet-400 bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                    : 'text-[#7a766e] hover:text-violet-400 hover:bg-white/5'
                }`}
              >
                <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="w-[calc(100%-12px)] h-px bg-white/10 my-2 opacity-50 mx-auto" />

          <div className="flex flex-col gap-1 w-full">
            <button className="w-full h-10 rounded-xl flex items-center text-[#7a766e] hover:text-violet-400 hover:bg-white/5 transition-all duration-200 cursor-pointer overflow-hidden">
              <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">logout</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Salir
              </span>
            </button>
          </div>

        </div>
      </aside>

      {/* ══ MOBILE TOP HEADER ══ */}
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

      {/* ══ MAIN CONTENT ══ */}
      <main className="md:pl-[84px] pb-28 md:pb-10 overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-10">

          {activeTab === 'dashboard'    && <DashboardTabView />}
          {activeTab === 'agenda'       && <AgendaTabView />}
          {activeTab === 'clientes'     && <ClientesTabView />}
          {activeTab === 'servicios'    && <ServiciosTabView />}
          {activeTab === 'caja'         && <CajaTabView />}
          {activeTab === 'performance'  && <PerformanceTabView />}
          {activeTab === 'config'       && <ConfigTabView />}

        </div>
      </main>

      {/* ══ MOBILE BOTTOM NAV ══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 sidebar-liquid isolate">
        <div className="sidebar-liquid-lens absolute inset-0 -z-10 pointer-events-none rounded-t-3xl" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] relative z-10">
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
    </QueryProvider>
  );
}
