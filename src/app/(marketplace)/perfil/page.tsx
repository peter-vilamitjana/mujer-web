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
  Plus
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
  const userInitial = userName.charAt(0).toUpperCase();
  const confirmedCount = appointments.filter(a => a.status === 'confirmado').length;

  return (
    <div 
      className="min-h-screen text-[#e5e2e1] font-body selection:bg-[#f1c97d] selection:text-[#080808] relative"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #1a160f 0%, #080808 50%), radial-gradient(circle at 100% 100%, #121212 0%, #080808 50%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="mesh-glow"></div>

      {/* Sidebar — cápsula flotante, solo íconos, estático */}
      <aside className="fixed left-3 top-1/2 -translate-y-1/2 z-50">
        <div className="liquid-glass-floating rounded-[2rem] flex flex-col items-center py-5 px-2 gap-1 w-[60px]">

          {/* Logo M */}
          <div className="w-9 h-9 rounded-full flex-shrink-0 mb-6 bg-gradient-to-br from-[#f1c97d] to-amber-700 flex items-center justify-center">
            <span className="font-headline italic text-[#1a1008] text-sm font-semibold">M</span>
          </div>

          {/* Nav items — solo íconos */}
          <nav className="flex flex-col items-center gap-1 w-full">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <LayoutDashboard size={19} />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#f1c97d] bg-white/[0.08] transition-all duration-200 cursor-pointer">
              <CalendarDays size={19} />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <Heart size={19} />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <User size={19} />
            </button>
          </nav>

          {/* Separador */}
          <div className="w-8 h-px bg-white/10 my-2" />

          {/* Footer íconos */}
          <div className="flex flex-col items-center gap-1 w-full">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <Settings size={19} />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#99907c] hover:text-[#f1c97d] hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <LogOut size={19} />
            </button>
          </div>

        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-40 px-12 py-6 flex justify-end items-center pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          <div className="relative flex items-center liquid-glass-rich px-6 py-2.5 rounded-full w-72">
            <Search size={16} className="text-[#99907c]" />
            <input 
              type="text" 
              placeholder="BUSCAR SERVICIO..." 
              className="bg-transparent border-none focus:ring-0 text-[10px] uppercase tracking-[0.2em] font-label placeholder-[#99907c]/50 w-full ml-3 outline-none"
            />
          </div>
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
        <div className="max-w-6xl mx-auto">
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
