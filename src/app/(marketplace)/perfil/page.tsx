'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
  image: string;
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
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800',
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
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800',
    qrPattern: [true,true,false,true,true,false, false,true,true,false,true,true,true,
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
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800',
    qrPattern: [false,true,true,false,true,true, true,false,false,true,false,true,
                true,true,false,true,true,false, false,true,true,false,true,true,
                true,false,true,true,false,true, true,true,false,true,true,false]
  }
];
const mySalons = [
  { id: 1, name: 'Maison de Beauté', rating: 5, visits: 3, coords: { x: '35%', y: '45%' } },
  { id: 2, name: 'Studio Lumière', rating: 4, visits: 1, coords: { x: '65%', y: '25%' } },
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
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">dashboard</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Panel</span>
            </button>
            <button onClick={() => setActiveTab('turnos')} className={`w-full h-10 rounded-xl flex items-center gap-4 px-2.5 transition-all duration-200 cursor-pointer ${activeTab === 'turnos' ? 'text-[#f1c97d] bg-white/[0.08]' : 'text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5'}`}>
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">calendar_month</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Turnos</span>
            </button>
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">favorite</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Favoritos</span>
            </button>
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">person</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Perfil</span>
            </button>
          </nav>

          {/* Separador */}
          <div className="w-full h-px bg-white/10 my-2 opacity-50" />

          {/* Footer íconos */}
          <div className="flex flex-col gap-1 w-full">
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">settings</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Ajustes</span>
            </button>
            <button className="w-full h-10 rounded-xl flex items-center gap-4 px-2.5 text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[19px] flex-shrink-0">logout</span>
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
              <span className="material-symbols-outlined text-[#99907c] hover:text-[#f1c97d] transition-colors text-[20px]">notifications</span>
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
              {/* HEADER */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-5xl font-headline italic text-[#e5e2e1] mb-2">Mi Panel</h1>
                  <p className="text-[#99907c] text-xs tracking-wide">Tu espacio personal de estética y bienestar</p>
                </div>
                <div className="liquid-glass-rich px-5 py-2 rounded-full border border-[#f1c97d]/20">
                  <span className="text-[#f1c97d] text-[9px] font-bold uppercase tracking-[0.2em]">Premium Member</span>
                </div>
              </div>

              {/* FILA 1 — KPIs */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="liquid-glass-rich rounded-[1.5rem] px-6 py-5 flex flex-col justify-center">
                  <p className="text-[8px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-2">Salones Visitados</p>
                  <span className="text-4xl font-headline italic text-[#f1c97d] leading-none">2</span>
                </div>
                <div className="liquid-glass-rich rounded-[1.5rem] px-6 py-5 flex flex-col justify-center">
                  <p className="text-[8px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-2">Turnos Completados</p>
                  <span className="text-4xl font-headline italic text-[#f1c97d] leading-none">5</span>
                </div>
                <div className="liquid-glass-rich rounded-[1.5rem] px-6 py-5 flex flex-col justify-center">
                  <p className="text-[8px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-2">Invertido Este Año</p>
                  <span className="text-4xl font-headline italic text-[#f1c97d] leading-none">$22.5k</span>
                </div>
              </div>

              {/* FILA 2 — Grid 12 cols: 8 Lo Operativo / 4 El Perfil */}
              <div className="grid grid-cols-12 gap-6 items-stretch">

                {/* COL IZQUIERDA — span 8: Lo Operativo */}
                <div className="col-span-8 flex flex-col gap-6 h-full">

                  {/* Próximo Turno */}
                  <div>
                    <p className="text-[9px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-3 ml-1">Tu próximo turno</p>
                    <div className="relative isolate z-0 overflow-hidden rounded-[2rem] p-0 flex flex-row w-full transition-all duration-700 hover:scale-[1.01] hover:bg-white/[0.02] border border-white/10 group" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                      <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-20"></div>
                      
                      {/* Fondo Escenográfico (Depth Layer) - Maison de Beauté */}
                      <div className="absolute inset-y-0 right-0 w-[45%] z-0 pointer-events-none [mask-image:linear-gradient(to_right,transparent,black_50%)]">
                        <img 
                          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800" 
                          alt="Maison de Beauté" 
                          className="object-cover w-full h-full opacity-15 grayscale mix-blend-luminosity transition-transform duration-1000 group-hover:scale-110" 
                        />
                      </div>

                      {/* FECHA y HORA */}
                      <div className="flex flex-col items-center justify-center w-[150px] shrink-0 border-r border-dashed border-white/10 px-6 py-8 relative z-10">
                        <span className="text-[8px] font-label uppercase tracking-[0.3em] text-[#99907c] mb-2">Mañana</span>
                        <span className="text-5xl font-headline text-[#f1c97d]" style={{ textShadow: '0 0 30px rgba(241,201,125,0.3)' }}>15</span>
                        <span className="text-[9px] font-label uppercase tracking-[0.4em] text-[#99907c] mt-1">Abril</span>
                        <span className="text-sm font-headline italic text-[#e5e2e1] mt-3">10:30am</span>
                      </div>

                      {/* INFO */}
                      <div className="flex-1 px-8 py-6 flex flex-col justify-center relative z-10">
                        <div className="flex items-center gap-2.5 mb-2">
                          <p className="text-[10px] font-label uppercase tracking-[0.2em] text-[#f1c97d]">MAISON DE BEAUTÉ</p>
                          <span className="w-1 h-1 rounded-full bg-[#f1c97d]/30"></span>
                          <p className="text-[#99907c] text-[10px] uppercase tracking-widest font-label flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">location_on</span> Palermo Soho
                          </p>
                        </div>
                        <h2 className="text-2xl font-headline italic text-[#e5e2e1] mb-1 leading-tight">Balayage con Valentina</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <button className="h-8 px-4 rounded-full border border-white/10 hover:border-[#f1c97d]/30 hover:bg-[#f1c97d]/5 transition-all text-[10px] uppercase tracking-[0.1em] font-label text-[#99907c] hover:text-[#f1c97d] flex items-center gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-[14px]">map</span> Ver en mapa
                          </button>
                          <button className="h-8 px-4 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-[10px] uppercase tracking-[0.1em] font-label text-[#99907c] hover:text-[#e5e2e1] flex items-center gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-[14px]">edit_calendar</span> Reagendar
                          </button>
                          <button className="h-8 px-4 rounded-full border border-transparent hover:border-red-500/20 hover:bg-red-500/10 transition-all text-[10px] uppercase tracking-[0.1em] font-label text-[#99907c] hover:text-red-400 flex items-center gap-2 ml-auto cursor-pointer">
                            <span className="material-symbols-outlined text-[14px]">close</span> Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sugerencia Valentina */}
                  <div className="relative isolate z-0 rounded-[2rem] overflow-hidden min-h-[260px] flex flex-col justify-center group border border-white/10" style={{ boxShadow: '0 0 30px -10px rgba(255,255,255,0.05)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-20"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#f1c97d]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 -z-10"></div>
                    <div className="relative z-10 max-w-[60%] pl-14 pr-4 py-8">
                      <div className="inline-flex px-3.5 py-1.5 bg-[#f1c97d]/10 border border-[#f1c97d]/25 rounded-full mb-4">
                        <span className="text-[8px] font-label uppercase tracking-[0.2em] text-[#f1c97d]">PARA VOS</span>
                      </div>
                      <h2 className="text-2xl font-headline italic text-[#e5e2e1] mb-2 leading-tight">
                        Valentina tiene disponibilidad el jueves
                      </h2>
                      <p className="text-[#99907c] text-xs leading-relaxed mb-4 font-label tracking-wide uppercase">
                        <span className="text-[#f1c97d]/50">—</span> TU ESTILISTA HABITUAL EN MAISON
                      </p>
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="flex items-center gap-2 bg-[#080808]/50 border border-white/5 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                          <span className="material-symbols-outlined text-[#f1c97d] text-[14px]">schedule</span>
                          <span className="text-[10px] text-[#e5e2e1] font-label tracking-wider">11:00 am</span>
                        </div>
                        <span className="text-white/20">•</span>
                        <span className="text-sm font-headline italic text-[#e5e2e1] tracking-wide">$4.500</span>
                      </div>
                      <button className="liquid-glass-floating h-10 px-6 flex items-center gap-2 rounded-[1.25rem] text-[13px] font-medium hover:bg-white/10 transition-all duration-300 group/btn border border-white/10 w-fit cursor-pointer">
                        <span className="text-[#e5e2e1] whitespace-nowrap">Reservar en un tap</span>
                        <span className="material-symbols-outlined text-[#e5e2e1] text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                      </button>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"
                      alt="Estilista"
                      className="absolute right-0 top-0 h-full w-[45%] max-w-[280px] object-cover object-center translate-x-4 group-hover:translate-x-0 transition-transform duration-1000 opacity-50 mix-blend-luminosity -z-10 rounded-[inherit]"
                      style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)', maskImage: 'linear-gradient(to right, transparent, black 40%)' }}
                    />
                  </div>
                </div>

                {/* COL DERECHA — span 4: El Perfil */}
                <div className="col-span-4 flex flex-col gap-6 h-full">
                  {/* Tu Expediente */}
                  <div>
                    <p className="text-[9px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-3 ml-1">Tu expediente</p>
                    <div className="relative isolate overflow-hidden rounded-[2rem] p-6 flex flex-col border border-white/10">
                      <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10"></div>
                      <h3 className="text-xl font-headline italic text-[#e5e2e1] mb-1.5 flex items-center gap-2.5 relative z-10">
                        Tu Cabello
                        <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                          <span className="material-symbols-outlined text-[11px]">check</span>
                        </span>
                      </h3>
                      <div className="flex flex-col gap-2.5 mt-3 mb-5 relative z-10">
                        <div>
                          <p className="text-[8px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-1">Último tratamiento</p>
                          <p className="text-[#f1c97d] font-headline italic text-base leading-tight">Balayage</p>
                          <p className="text-[#e5e2e1] font-headline italic text-xs">hace 6 semanas</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-1">Próxima recomendación</p>
                          <p className="text-[#e5e2e1] font-headline italic text-base leading-tight">en 2 semanas</p>
                        </div>
                      </div>
                      <div className="relative z-10 mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[9px] font-label uppercase tracking-[0.15em] text-[#f1c97d]">80%</p>
                          <p className="text-[8px] text-[#99907c] font-label">Buen estado</p>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full relative overflow-hidden" style={{ width: '80%', background: 'linear-gradient(90deg, rgba(241,201,125,0.4) 0%, rgba(241,201,125,1) 100%)' }}>
                            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30"></div>
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10 mt-auto pt-4 border-t border-white/5 flex flex-col gap-1.5">
                        <p className="text-[8px] text-[#99907c] font-label uppercase tracking-widest opacity-60">ID Clínico: #MC-0982-H</p>
                        <button className="text-[9px] uppercase tracking-widest text-[#f1c97d] hover:text-[#e5e2e1] transition-colors flex items-center gap-1 group/link font-label cursor-pointer">
                          Ver historial <span className="material-symbols-outlined text-[12px] group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DESCUBRIMIENTO */}
                  <div className="relative isolate overflow-hidden rounded-[2rem] p-6 border border-white/10 flex flex-col justify-center min-h-[180px] flex-grow">
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10"></div>
                    <div className="relative z-10">
                      <span className="text-[8px] font-label uppercase tracking-[0.2em] text-[#99907c] mb-2.5 block">DESCUBRIMIENTO</span>
                      <h3 className="text-lg lg:text-xl font-headline italic text-[#e5e2e1] mb-5">¿Qué necesitás hoy?</h3>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 rounded-full border border-[#f1c97d]/30 bg-[#f1c97d]/10 hover:bg-[#f1c97d]/20 transition-all text-[9px] uppercase font-label tracking-[0.1em] text-[#f1c97d] cursor-pointer flex-grow text-center flex items-center justify-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span> Agendar Turno
                        </button>
                        {['Corte', 'Color', 'Tratamiento', 'Uñas', 'Maquillaje'].map((tag) => (
                          <button key={tag} className="px-3.5 py-1.5 rounded-full border border-white/10 bg-[#080808]/40 hover:border-[#f1c97d]/30 hover:bg-[#f1c97d]/5 transition-all text-[8px] uppercase font-label tracking-[0.1em] text-[#e5e2e1] hover:text-[#f1c97d] cursor-pointer flex-grow text-center">
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TUS SALONES — Mapa + Grilla (Anclado al fondo) */}
              <div className="mt-8 mb-12">
                <div className="flex justify-between items-center mb-3 ml-1">
                  <p className="text-[9px] font-label uppercase tracking-[0.2em] text-[#99907c]">Tus salones</p>
                  <button className="text-[9px] uppercase tracking-widest text-[#f1c97d] hover:text-[#e5e2e1] transition-colors font-label cursor-pointer">Descubrir más</button>
                </div>
                
                <div className="relative isolate z-0 overflow-hidden rounded-[2rem] border border-white/10 flex flex-col md:flex-row min-h-[260px]" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                  <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10"></div>
                  
                  {/* MAPA PERSONAL */}
                  <div className="flex-1 relative bg-white/[0.02] border-r border-white/5 overflow-hidden">
                    {/* Decoración de mapa — Grid sutil */}
                    <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, #f1c97d 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#f1c97d]/3 to-transparent"></div>
                    
                    {/* Pines */}
                    {mySalons.map((salon) => (
                      <div 
                        key={salon.id} 
                        className="absolute group/pin cursor-pointer transition-transform hover:scale-110" 
                        style={{ left: salon.coords.x, top: salon.coords.y }}
                      >
                        <div className="relative">
                          <span className="material-symbols-outlined text-[#f1c97d] text-[22px] drop-shadow-[0_0_10px_rgba(241,201,125,0.6)]">location_on</span>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/pin:opacity-100 transition-opacity bg-[#080808]/90 border border-[#f1c97d]/20 px-3 py-1.5 rounded-lg backdrop-blur-md pointer-events-none whitespace-nowrap z-20">
                            <p className="text-[9px] text-[#e5e2e1] font-label uppercase tracking-widest">{salon.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* LISTA DE SALONES */}
                  <div className="w-full md:w-[300px] p-6 flex flex-col justify-center gap-5 relative z-10">
                    {mySalons.map((salon) => (
                      <div key={salon.id} className="flex flex-col gap-1 group/item cursor-pointer">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-headline italic text-[#e5e2e1] group-hover/item:text-[#f1c97d] transition-colors">{salon.name}</h4>
                          <span className="text-[8px] text-[#99907c] font-label uppercase tracking-[0.1em] mt-1">{salon.visits} {salon.visits === 1 ? 'visita' : 'visitas'}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`material-symbols-outlined text-[12px] ${i < salon.rating ? 'text-[#f1c97d]' : 'text-[#99907c]/20'}`}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-[8px] text-[#99907c] font-label leading-relaxed uppercase tracking-[0.15em] opacity-40">
                        Espacios de confianza
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MIS TURNOS VIEW */}
          {activeTab === 'turnos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-5">
                  <h1 className="text-5xl font-headline italic text-[#e5e2e1]">Mis Turnos</h1>
                  <div className="liquid-glass-rich px-4 py-1.5 rounded-full border border-[#f1c97d]/20">
                    <span className="text-[#f1c97d] text-[9px] font-bold uppercase tracking-[0.2em]">
                      {confirmedCount} CONFIRMADOS
                    </span>
                  </div>
                </div>
                <p className="text-[#99907c] text-xs tracking-wide">Gestiona tus próximas citas de belleza.</p>
              </div>

              {/* Tickets */}
              <div className="space-y-5">
                {appointments.map((appt) => (
                  <div key={appt.id} className="relative group overflow-hidden specular-highlight liquid-glass-rich ticket-mask rounded-[1.5rem] flex min-h-[120px] transition-all duration-700 hover:scale-[1.02] hover:bg-white/[0.05]" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                    
                    {/* Fondo Escenográfico (Depth Layer) - Refined with mask-image */}
                    <div className="absolute inset-y-0 right-0 w-[42%] z-0 pointer-events-none [mask-image:linear-gradient(to_right,transparent,black_40%)]">
                      <img 
                        src={appt.image} 
                        alt={appt.salonName} 
                        className="object-cover w-full h-full opacity-20 grayscale mix-blend-luminosity transition-transform duration-1000 group-hover:scale-110" 
                      />
                    </div>

                    {/* FECHA col */}
                    <div className="relative z-10 flex flex-col items-center justify-center min-w-[90px] px-5 py-4">
                      <span className="text-4xl font-headline text-[#f1c97d]" style={{ textShadow: '0 0 30px rgba(241,201,125,0.3)' }}>{appt.day}</span>
                      <span className="text-[9px] font-label uppercase tracking-[0.3em] text-[#99907c] mt-0.5">{appt.month}</span>
                    </div>

                    {/* Separador */}
                    <div className="relative z-10" style={{ width: '1px', alignSelf: 'stretch', margin: '12px 0', background: 'linear-gradient(to bottom, transparent, rgba(241,201,125,0.3), transparent)' }} />

                    {/* INFO col */}
                    <div className="relative z-10 flex-grow px-7 py-4 flex flex-col justify-center">
                      <div className="flex items-center gap-3.5 mb-1.5">
                        <h2 className="text-2xl font-headline tracking-wide">{appt.salonName}</h2>
                        {appt.status === 'confirmado' && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">
                            Confirmado
                          </span>
                        )}
                      </div>
                      <p className="text-[#99907c] text-base font-headline italic mb-2.5">{appt.service}</p>
                      <div className="grid grid-cols-3 gap-5">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[#f1c97d]/60 text-[18px]">person</span>
                          <div>
                            <p className="text-[7px] text-[#99907c] uppercase tracking-widest">Profesional</p>
                            <p className="text-[10px] uppercase tracking-wider font-medium">{appt.professional}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[#f1c97d]/60 text-[18px]">location_on</span>
                          <div>
                            <p className="text-[7px] text-[#99907c] uppercase tracking-widest">Ubicación</p>
                            <p className="text-[10px] uppercase tracking-wider font-medium">{appt.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR col */}
                    <div className="relative z-10 w-[120px] flex-shrink-0 flex flex-col items-center justify-center gap-1.5 border-l border-dashed border-white/15 px-3 py-3">
                      <div className="bg-white/95 p-1.5 rounded-lg shadow-2xl transition-transform duration-500 hover:rotate-3">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px', width: '58px', height: '58px', opacity: 0.9 }}>
                          {appt.qrPattern.map((isFilled, idx) => (
                            <div key={idx} style={{ backgroundColor: isFilled ? '#000000' : 'transparent', width: '100%', height: '100%' }} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[6.5px] text-[#99907c] uppercase tracking-[0.2em] mt-0.5">CHECK-IN QR</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editorial Section */}
          <section className="mt-32 pb-12">
            <div className="grid grid-cols-12 gap-10 items-center">
              <div className="col-span-6">
                <p className="text-3xl font-headline italic text-[#f1c97d] leading-tight text-pretty">
                  "La belleza comienza en el momento en que decides ser tú misma."
                </p>
                <div className="mt-6 flex items-center gap-5">
                  <div className="h-[1px] w-16 bg-[#f1c97d]/30"></div>
                  <p className="text-[8px] font-label uppercase tracking-[0.4em] text-[#99907c]">Editorial MujerApp / SS24</p>
                </div>
              </div>
              <div className="col-span-6">
                <div className="relative rounded-[2.5rem] overflow-hidden group aspect-[16/10]">
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

      <button className="fixed bottom-10 right-10 w-14 h-14 liquid-glass-floating rounded-full flex items-center justify-center text-[#f1c97d] group transition-all duration-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(241,201,125,0.3)] z-50">
        <span className="material-symbols-outlined text-[28px] transition-transform duration-500 group-hover:rotate-90">add</span>
      </button>
    </div>
  );
}
