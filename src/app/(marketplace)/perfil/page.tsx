'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Heart,
  User,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  ArrowRight,
  ChevronRight,
  Scissors,
  Palette,
  Sparkles,
  Leaf,
} from 'lucide-react';

type Appointment = {
  id: string;
  day: string;
  month: string;
  salonName: string;
  service: string;
  professional: string;
  time: string;
  location: string;
  status: 'confirmado' | 'pendiente' | 'cancelado';
  qrPattern: boolean[]; // array de 36 booleans para el grid 6x6
};

const appointments: Appointment[] = [
  {
    id: '1',
    day: '21',
    month: 'AGOSTO',
    salonName: "L'Atelier de Beauté",
    service: 'Balayage & Brushing Premium',
    professional: 'Valentina Gómez',
    time: '15:30 HS',
    location: 'Recoleta, CABA',
    status: 'confirmado',
    qrPattern: [true,true,false,true,true,true, true,false,true,false,true,false,
                false,true,true,true,false,true, true,false,true,false,true,true,
                true,true,false,true,false,true, true,false,true,true,true,true]
  },
  {
    id: '2',
    day: '24',
    month: 'AGOSTO',
    salonName: 'Skin Medical Spa',
    service: 'Facial de Oxígeno Glow & Detox',
    professional: 'Dra. Elena Rossi',
    time: '11:00 HS',
    location: 'Palermo Soho',
    status: 'confirmado',
    qrPattern: [true,false,true,true,false,true, true,true,false,true,true,true,
                false,false,true,false,true,false, true,true,true,true,false,true,
                true,false,true,true,true,true, true,true,false,false,true,true]
  },
  {
    id: '3',
    day: '02',
    month: 'SEPTIEMBRE',
    salonName: 'Nail Boutique',
    service: 'Manicura Rusa & Nail Art',
    professional: 'Micaela Sanz',
    time: '17:00 HS',
    location: 'Jerónimo Salguero 2400, CABA',
    status: 'confirmado',
    qrPattern: [false,true,true,false,true,true, true,false,false,true,false,true,
                true,true,false,true,true,false, false,true,true,false,true,true,
                true,false,true,true,false,true, true,true,false,true,true,false]
  }
];

export default function MisTurnosPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Sofia R.';
  const confirmedCount = appointments.filter(a => a.status === 'confirmado').length;

  const [activeTab, setActiveTab] = React.useState<'panel' | 'turnos'>('panel');

  return (
    <div 
      className="min-h-screen text-[#e5e2e1] font-body selection:bg-[#f1c97d] selection:text-[#080808] relative"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #1a160f 0%, #080808 50%), radial-gradient(circle at 100% 100%, #121212 0%, #080808 50%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <style>{`
        .mesh-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          background: 
            radial-gradient(circle at 20% 30%, rgba(241, 201, 125, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(241, 201, 125, 0.03) 0%, transparent 40%);
        }
        .sidebar-expand {
          width: 60px !important;
        }
        .sidebar-expand:hover {
          width: 220px !important;
        }
      `}</style>
      <div className="mesh-glow"></div>

      {/* Sidebar — hover expansible */}
      <aside className="fixed left-3 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 group sidebar-expand">
        <div className="liquid-glass-floating rounded-[2rem] flex flex-col py-5 px-2 gap-1 w-full overflow-hidden">

          {/* Logo M */}
          <div className="flex items-center gap-4 px-[5px] mb-6">
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-[#f1c97d] to-amber-700 flex items-center justify-center">
              <span className="font-headline italic text-[#1a1008] text-sm font-semibold">M</span>
            </div>
            <span className="text-xl font-headline italic text-[#f1c97d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">MujerApp</span>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 w-full">
            <button onClick={() => setActiveTab('panel')} className={`w-full h-10 rounded-xl flex items-center gap-4 px-2.5 transition-all duration-200 cursor-pointer ${activeTab === 'panel' ? 'text-[#f1c97d] bg-white/[0.08]' : 'text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5'}`}>
              <LayoutDashboard size={19} className="flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Panel</span>
            </button>
            <button onClick={() => setActiveTab('turnos')} className={`w-full h-10 rounded-xl flex items-center gap-4 px-2.5 transition-all duration-200 cursor-pointer ${activeTab === 'turnos' ? 'text-[#f1c97d] bg-white/[0.08]' : 'text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5'}`}>
              <CalendarDays size={19} className="flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Turnos</span>
            </button>
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <Heart size={19} className="flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Favoritos</span>
            </button>
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <User size={19} className="flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Perfil</span>
            </button>
          </nav>

          {/* Separador */}
          <div className="w-full h-px bg-white/10 my-2 opacity-50" />

          {/* Footer íconos */}
          <div className="flex flex-col gap-1 w-full">
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <Settings size={19} className="flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Ajustes</span>
            </button>
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <LogOut size={19} className="flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Salir</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-40 px-12 py-6 flex justify-end items-center pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          <div className="flex items-center gap-6 liquid-glass-rich px-4 py-2 rounded-full">
            <button className="relative flex items-center">
              <Bell size={20} className="text-[#99907c] hover:text-[#f1c97d] transition-colors" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#f1c97d] rounded-full shadow-[0_0_8px_rgba(241,201,125,0.8)]"></span>
            </button>
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#e5e2e1]">{userName}</p>
                <p className="text-[8px] text-[#f1c97d] uppercase tracking-[0.15em]">Premium</p>
              </div>
              <img 
                src={session?.user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBHoq1ZEd8ECYymUh961ONjGj5-uoYjX-EsusAscLPzNTVIX3qpGotVv8E-oA-OBS0IuFV6oE3czpRiREq_xWMZyOj183drIeG2A35hWgTaf_AOCy7m4Fyl5vj134EOHDKKeZQpyHYqn3zntnyI3gdebSsjLUFkkvvb87bdZ9-_hziB5ZJ_iGLBgocDLFOGkO166KYHvqiYzUzS1WFIZuiMm92_9Wr8t7-meHoUb0-fR7EI23mcmlzrHpEgX2G9HUmBH0Qbt2MSPiA"} 
                alt={userName}
                className="w-9 h-9 rounded-full object-cover border border-white/20"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pl-[84px] pr-16 pt-32 pb-24 min-h-screen">
        <div className="max-w-6xl mx-auto w-full relative transform-gpu">
          
          {/* DASHBOARD PANEL */}
          {activeTab === 'panel' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 1. Encabezado de Bienvenida */}
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h1 className="text-7xl font-headline italic text-[#e5e2e1] mb-3">Mi Panel</h1>
                  <p className="text-[#99907c] text-sm tracking-wide">Tu espacio personal de estética y bienestar</p>
                </div>
                <div className="liquid-glass-rich px-6 py-2.5 rounded-full border border-[#f1c97d]/20">
                  <span className="text-[#f1c97d] text-[10px] font-bold uppercase tracking-[0.2em]">Premium Member</span>
                </div>
              </div>

              {/* SECCIÓN 1: Hero Próximo Turno */}
              <div className="w-full relative z-10 mb-12">
                <p className="text-[10px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-4 ml-6">Tu próximo turno</p>
                
                <div className="relative isolate overflow-hidden rounded-[2.5rem] p-8 md:p-0 flex flex-col md:flex-row w-full transition-all duration-700 hover:scale-[1.01] hover:bg-white/[0.02] border border-white/10 group">
                  <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10"></div>
                  
                  {/* FECHA y HORA */}
                  <div className="flex flex-col items-center justify-center md:w-[220px] shrink-0 border-b md:border-b-0 md:border-r border-dashed border-white/10 px-8 py-8 md:py-12 relative z-10">
                    <div className="absolute top-6 left-8 md:left-auto md:top-6">
                      <span className="text-[9px] font-label uppercase tracking-[0.3em] text-[#99907c]">Mañana</span>
                    </div>
                    <span className="text-7xl font-headline text-[#f1c97d] mt-4" style={{ textShadow: '0 0 40px rgba(241,201,125,0.3)' }}>15</span>
                    <span className="text-[10px] font-label uppercase tracking-[0.4em] text-[#99907c] mt-2">Abril</span>
                    <span className="text-base font-headline italic text-[#e5e2e1] mt-5">10:30am</span>
                  </div>

                  {/* INFO PRINCIPAL */}
                  <div className="flex-1 px-8 md:px-12 py-8 md:py-10 flex flex-col justify-center relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <p className="text-[11px] font-label uppercase tracking-[0.2em] text-[#f1c97d]">MAISON DE BEAUTÉ</p>
                      <span className="w-1 h-1 rounded-full bg-[#f1c97d]/30"></span>
                      <p className="text-[#99907c] text-[11px] uppercase tracking-widest font-label flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> Palermo Soho
                      </p>
                    </div>
                    
                    <h2 className="text-4xl lg:text-5xl font-headline italic text-[#e5e2e1] mb-2 leading-tight">Balayage con Valentina</h2>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-8">
                      <button className="h-10 px-6 rounded-full border border-white/10 hover:border-[#f1c97d]/30 hover:bg-[#f1c97d]/5 transition-all text-xs uppercase tracking-[0.1em] font-label text-[#99907c] hover:text-[#f1c97d] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">map</span> Ver en mapa
                      </button>
                      <button className="h-10 px-6 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-xs uppercase tracking-[0.1em] font-label text-[#99907c] hover:text-[#e5e2e1] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">edit_calendar</span> Reagendar
                      </button>
                      <button className="h-10 px-6 rounded-full border border-transparent hover:border-red-500/20 hover:bg-red-500/10 transition-all text-xs uppercase tracking-[0.1em] font-label text-[#99907c] hover:text-red-400 flex items-center gap-2 ml-auto">
                        <span className="material-symbols-outlined text-[16px]">close</span> Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: Tu estado capilar (Expediente) */}
              <div className="w-full relative z-10 mb-12">
                <p className="text-[10px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-4 ml-6">Tu expediente</p>
                
                <div className="relative isolate overflow-hidden rounded-[2.5rem] p-8 md:p-10 flex flex-col w-full transition-all duration-700 border border-white/10 group">
                  <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
                    <div>
                      <h3 className="text-3xl font-headline italic text-[#e5e2e1] mb-2 flex items-center gap-3">
                        Tu Cabello
                        <span className="inline-flex items-center justify-center p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      </h3>
                      <div className="flex flex-col gap-1 mt-4">
                        <p className="text-[#99907c] text-sm uppercase tracking-wider font-label flex items-center gap-2">
                          ÚLTIMO TRATAMIENTO: <span className="text-[#f1c97d]">Balayage</span> <span className="opacity-40">—</span> <span className="text-[#e5e2e1] lowercase italic tracking-normal font-headline text-lg ml-1">hace 6 semanas</span>
                        </p>
                        <p className="text-[#99907c] text-sm uppercase tracking-wider font-label flex items-center gap-2">
                          PRÓXIMA RECOMENDACIÓN: <span className="text-[#e5e2e1] lowercase italic tracking-normal font-headline text-lg ml-1">en 2 semanas</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR & STATUS */}
                  <div className="relative z-10 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-label uppercase tracking-[0.2em] text-[#f1c97d]">80% <span className="text-[#99907c] normal-case tracking-normal pl-2 border-l border-white/10 ml-2">Tu color está en buen estado</span></p>
                    </div>
                    
                    <div className="w-full h-2.5 bg-[#080808]/60 rounded-full overflow-hidden border border-white/5 shadow-inner backdrop-blur-md">
                      <div className="h-full rounded-full relative overflow-hidden" style={{ width: '80%', background: 'linear-gradient(90deg, rgba(241,201,125,0.4) 0%, rgba(241,201,125,1) 100%)' }}>
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-white/30"></div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[#99907c] text-[10px] uppercase font-label tracking-widest opacity-60">ID Clínico: #MC-0982-H</p>
                    <button className="text-xs uppercase tracking-widest text-[#f1c97d] hover:text-[#e5e2e1] transition-colors flex items-center gap-1 group/link font-label">
                      Ver historial técnico completo <span className="material-symbols-outlined text-[14px] ml-1 group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: Cuerpo 60/40 */}
              <div className="flex flex-col lg:flex-row gap-8 w-full relative z-10">
                {/* Columna Izquierda */}
                <div className="w-full lg:w-[60%] shrink-0">
                  <div className="relative isolate rounded-[2.5rem] overflow-hidden h-full min-h-[340px] flex flex-col justify-center group border border-white/10" style={{ boxShadow: '0 0 40px -10px rgba(255, 255, 255, 0.05)' }}>
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-20"></div>
                    <div className="absolute top-0 right-0 w-72 h-72 bg-[#f1c97d]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 -z-10"></div>
                    <div className="relative z-10 w-full max-w-[65%] pl-10 pr-4">
                      <div className="inline-flex px-4 py-1.5 bg-[#f1c97d]/10 border border-[#f1c97d]/25 rounded-full mb-6">
                        <span className="text-[9px] font-label uppercase tracking-[0.2em] text-[#f1c97d]">PARA VOS</span>
                      </div>
                      
                      <h2 className="text-4xl lg:text-[42px] font-headline italic text-[#e5e2e1] mb-2 leading-tight">
                        Valentina tiene disponibilidad el jueves
                      </h2>
                      
                      <p className="text-[#99907c] text-sm leading-relaxed mb-6 font-label tracking-wide uppercase">
                        <span className="text-[#f1c97d]/50">—</span> TU ESTILISTA HABITUAL EN MAISON
                      </p>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 bg-[#080808]/50 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
                          <span className="material-symbols-outlined text-[#f1c97d] text-[16px]">schedule</span>
                          <span className="text-xs text-[#e5e2e1] font-label tracking-wider">11:00 am</span>
                        </div>
                        <span className="text-white/20">•</span>
                        <span className="text-sm font-headline italic text-[#e5e2e1] tracking-wide">$4.500</span>
                      </div>
                      
                      <button className="liquid-glass-floating h-12 px-8 flex items-center gap-2 justify-center rounded-[1.5rem] text-sm font-medium hover:bg-white/10 transition-all duration-300 group/btn border border-white/10 w-fit cursor-pointer">
                        <span className="text-[#e5e2e1] whitespace-nowrap">Reservar en un tap</span>
                        <ArrowRight size={16} className="text-[#e5e2e1] group-hover/btn:translate-x-1 transition-transform shrink-0" />
                      </button>
                    </div>
                    
                    {/* Imagen Decorativa */}
                    <img 
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800" 
                      alt="Estilista" 
                      className="absolute right-0 top-0 h-full w-[45%] max-w-[300px] object-cover object-center translate-x-4 group-hover:translate-x-0 transition-transform duration-1000 opacity-50 mix-blend-luminosity -z-10"
                      style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)', maskImage: 'linear-gradient(to right, transparent, black 40%)' }}
                    />
                  </div>
                </div>

                {/* Columna Derecha: Buscador Contextual Pequeño */}
                <div className="w-full lg:w-[40%] flex flex-col justify-center">
                  <div className="relative isolate overflow-hidden rounded-[2.5rem] p-8 md:p-10 border border-white/10 h-full flex flex-col justify-center">
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10"></div>
                    
                    <div className="relative z-10 flex flex-col justify-center h-full">
                      <span className="text-[9px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-4">Descubrimiento</span>
                      <h3 className="text-3xl lg:text-4xl font-headline italic text-[#e5e2e1] mb-8">¿Qué necesitás hoy?</h3>
                      
                      <div className="flex flex-wrap gap-3">
                        {['Corte', 'Color', 'Tratamiento', 'Uñas', 'Maquillaje'].map((tag) => (
                          <button key={tag} className="px-5 py-3 rounded-full border border-white/10 bg-[#080808]/40 hover:border-[#f1c97d]/30 hover:bg-[#f1c97d]/5 transition-all text-xs uppercase font-label tracking-[0.1em] text-[#e5e2e1] hover:text-[#f1c97d] flex items-center justify-center cursor-pointer shadow-sm md:flex-grow text-center truncate">
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 5: Tu actividad (Stats simples) */}
              <div className="w-full relative z-10 mt-12 py-8 border-t border-white/5">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center">
                  <p className="text-[#99907c] text-xs md:text-sm uppercase font-label tracking-[0.15em]">Visitaste <span className="text-[#f1c97d] font-headline text-base md:text-lg italic normal-case px-1">2 salones</span></p>
                  <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10"></span>
                  <p className="text-[#99907c] text-xs md:text-sm uppercase font-label tracking-[0.15em]"><span className="text-[#f1c97d] font-headline text-base md:text-lg italic normal-case pr-1">5 turnos</span> completados</p>
                  <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10"></span>
                  <p className="text-[#99907c] text-xs md:text-sm uppercase font-label tracking-[0.15em]"><span className="text-[#f1c97d] font-headline text-base md:text-lg italic normal-case pr-1">$22.500</span> gastados este año</p>
                </div>
              </div>
            </div>
          )}

          {/* MIS TURNOS VIEW */}
          {activeTab === 'turnos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Page Title */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-6">
                  <h1 className="text-7xl font-headline italic text-[#e5e2e1]">Mis Turnos</h1>
              <div className="liquid-glass-rich px-5 py-2 rounded-full border-[#f1c97d]/20 mt-3">
                <span className="text-[#f1c97d] text-[10px] font-bold uppercase tracking-[0.2em]">
                  {confirmedCount} CONFIRMADOS
                </span>
              </div>
            </div>
            <p className="text-[#99907c] text-sm mt-4">Gestiona tus próximas citas de belleza.</p>
          </div>

          {/* Tickets */}
          <div className="space-y-6">
            {appointments.map((appt) => (
              <div key={appt.id} className="specular-highlight liquid-glass-rich ticket-mask rounded-[2rem] flex min-h-[140px] transition-all duration-700 hover:scale-[1.02] hover:bg-white/[0.05]">
                {/* FECHA col */}
                <div className="flex flex-col items-center justify-center min-w-[100px] px-6 py-4">
                  <span
                    className="text-5xl font-headline text-[#f1c97d]"
                    style={{ textShadow: '0 0 40px rgba(241,201,125,0.3)' }}
                  >{appt.day}</span>
                  <span className="text-[10px] font-label uppercase tracking-[0.3em] text-[#99907c] mt-1">{appt.month}</span>
                </div>

                {/* FIX 3 — separador gradiente dorado */}
                <div style={{
                  width: '1px',
                  alignSelf: 'stretch',
                  margin: '16px 0',
                  background: 'linear-gradient(to bottom, transparent, rgba(241,201,125,0.3), transparent)'
                }} />

                {/* INFO col */}
                <div className="flex-grow px-8 py-4 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-3xl font-headline tracking-wide">{appt.salonName}</h2>
                    {appt.status === 'confirmado' && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">
                        Confirmado
                      </span>
                    )}
                  </div>
                  <p className="text-[#99907c] text-lg font-headline italic mb-3">{appt.service}</p>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <User size={20} className="text-[#f1c97d]/60" />
                      <div>
                        <p className="text-[8px] text-[#99907c] uppercase tracking-widest">Profesional</p>
                        <p className="text-[11px] uppercase tracking-wider font-medium">{appt.professional}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-[#f1c97d]/60" />
                      <div>
                        <p className="text-[8px] text-[#99907c] uppercase tracking-widest">Horario</p>
                        <p className="text-[11px] uppercase tracking-wider font-medium">{appt.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Using map-pin equivalent or marker for location */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f1c97d]/60"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <div>
                        <p className="text-[8px] text-[#99907c] uppercase tracking-widest">Ubicación</p>
                        <p className="text-[11px] uppercase tracking-wider font-medium">{appt.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR col — FIX 4: compacto 80x80 -> 68x68 */}
                <div className="w-[140px] flex-shrink-0 flex flex-col items-center justify-center gap-2 border-l border-dashed border-white/15 px-4 py-4">
                  <div className="bg-white/95 p-2 rounded-xl shadow-2xl transition-transform duration-500 hover:rotate-3">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px', width: '68px', height: '68px', opacity: 0.9 }}>
                      {appt.qrPattern.map((isFilled, idx) => (
                        <div key={idx} style={{ backgroundColor: isFilled ? '#000000' : 'transparent', width: '100%', height: '100%' }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[7.5px] text-[#99907c] uppercase tracking-[0.2em] mt-1">CHECK-IN QR</p>
                </div>
              </div>
            ))}
          </div>
          </div>
          )}

          {/* Editorial Section */}
          <section className="mt-32">
            <div className="grid grid-cols-12 gap-16 items-center">
              <div className="col-span-6">
                <p className="text-4xl font-headline italic text-[#f1c97d] leading-tight">
                  "La belleza comienza en el momento en que decides ser tú misma."
                </p>
                <div className="mt-8 flex items-center gap-6">
                  <div className="h-[1px] w-20 bg-[#f1c97d]/30"></div>
                  <p className="text-[9px] font-label uppercase tracking-[0.4em] text-[#99907c]">Editorial MujerApp / SS24</p>
                </div>
              </div>
              <div className="col-span-6">
                <div className="relative rounded-[3rem] overflow-hidden group aspect-[16/10]">
                  <img 
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80" 
                    alt="Salon Editorial" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-60"></div>
                  <div className="absolute inset-0 liquid-glass-rich opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-12 right-12 w-20 h-20 liquid-glass-floating rounded-full flex items-center justify-center text-[#f1c97d] group transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(241,201,125,0.3)] z-50">
        <Plus size={32} className="transition-transform duration-500 group-hover:rotate-90" />
      </button>
    </div>
  );
}
