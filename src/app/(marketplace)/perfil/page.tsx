'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, User, Heart, LogOut, Bell, Scissors, Sparkles, Hand } from 'lucide-react'

const MOCK_USER = {
  name: 'Sofia R.',
  email: 'sofia.r@email.com',
  initials: 'S',
}

const MOCK_APPOINTMENTS = [
  {
    id: '1',
    salonType: 'SALÓN',
    salonName: 'CASA BLANCA',
    Icon: Scissors,
    day: '21',
    month: 'AGO',
    staffName: 'Martina Soto',
    serviceName: 'Balayage',
    time: '10:30am',
    location: 'Silla 1',
    checkInCode: '#MB-CB01',
  },
  {
    id: '2',
    salonType: 'SPA',
    salonName: 'AURA WELLNESS',
    Icon: Sparkles,
    day: '23',
    month: 'AGO',
    staffName: 'Javier Gomez',
    serviceName: 'Facial Premium',
    time: '3:00pm',
    location: 'Lounge 4',
    checkInCode: '#MB-AW02',
  },
  {
    id: '3',
    salonType: 'STUDIO',
    salonName: 'STUDIO MINIMAL',
    Icon: Hand,
    day: '26',
    month: 'AGO',
    staffName: 'Ana Lopez',
    serviceName: 'Manicure Gel',
    time: '11:15am',
    location: 'Puesto 2',
    checkInCode: '#MB-SM03',
  },
]

type Appointment = (typeof MOCK_APPOINTMENTS)[0]

export default function PerfilPage() {
  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <Sidebar />
      <MainContent />
      <BackgroundGlow />
    </div>
  )
}

function Sidebar() {
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    // FIX 1: h-screen sticky + flex flex-col — el div interior tiene flex-1
    <aside className="w-64 bg-[#0d0d0d] border-r border-white/[0.06] flex flex-col h-screen sticky top-0 shrink-0">

      {/* FIX 1: flex-1 + overflow-y-auto para que ocupe todo el alto disponible */}
      <div className="flex-1 p-8 flex flex-col items-center text-center overflow-y-auto">

        {/* Avatar con ring gradiente emerald */}
        <div className="relative mb-5">
          <div
            className="w-20 h-20 rounded-full p-[2px]"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.4), rgba(52,211,153,0.05))',
            }}
          >
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
              {/* FIX 2: font-vogue es la clase correcta para Playfair Display */}
              <span className="font-vogue text-2xl text-white">{MOCK_USER.initials}</span>
            </div>
          </div>
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0d0d0d]" />
        </div>

        <span className="text-[9px] tracking-[0.4em] font-bold text-emerald-400 uppercase mb-1">
          BIENVENIDA
        </span>
        <h2 className="text-lg font-semibold text-white">{MOCK_USER.name}</h2>
        <p className="text-[11px] text-zinc-500 mt-1 mb-8">{MOCK_USER.email}</p>

        {/* FIX 1: nav con flex-1 empuja el logout al fondo */}
        <nav className="w-full space-y-1 flex-1">
          <NavItem icon={Calendar} label="Panel de Turnos" href="/perfil" active />
          <NavItem icon={Clock} label="Historial de Citas" href="/perfil/historial" />
          <NavItem icon={User} label="Mi Perfil" href="/perfil/cuenta" />
          <NavItem icon={Heart} label="Favoritos" href="/perfil/favoritos" />
        </nav>
      </div>

      {/* Logout — queda anclado al fondo naturalmente */}
      <div className="p-6 border-t border-white/[0.06]">
        {confirmLogout ? (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500 text-center mb-3">¿Cerrar sesión?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 text-[11px] font-medium text-zinc-500 border border-white/[0.08] py-2 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                No
              </button>
              <button
                onClick={() => {/* conectar signOut() */}}
                className="flex-1 text-[11px] font-medium text-red-400 border border-red-400/20 py-2 rounded-xl hover:bg-red-400/[0.06] transition-all cursor-pointer"
              >
                Sí, salir
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-[13px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-400/[0.06] transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        )}
      </div>
    </aside>
  )
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  href = '#',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  href?: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
        active
          ? 'bg-emerald-950/50 text-emerald-400'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}

function MainContent() {
  return (
    <main className="flex-1 min-w-0 px-12 py-12">
      <div className="max-w-4xl">

        <header className="flex justify-between items-center mb-12">
          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-1">
              MujerApp
            </p>
            {/* FIX 2: font-vogue para el título del panel */}
            <h1 className="font-vogue text-2xl text-white tracking-tight">Mi Panel</h1>
          </div>
          <button className="relative p-2 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04] cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          </button>
        </header>

        <section className="mb-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-2">
                PRÓXIMOS
              </p>
              {/* FIX 2: font-vogue font-normal (400) — estética Vogue sin bold */}
              <h2 className="font-vogue font-normal text-3xl text-white">Mis Turnos</h2>
            </div>
            {/* FIX 3: badge dorado premium — amber en lugar de emerald */}
            <span className="text-[11px] font-bold text-amber-300 bg-amber-950/50 px-3 py-1.5 rounded-full border border-amber-400/20 mb-1">
              {MOCK_APPOINTMENTS.length} confirmados
            </span>
          </div>
          <div className="mt-6 border-t border-white/[0.04]" />
        </section>

        <div className="space-y-6">
          {MOCK_APPOINTMENTS.length > 0 ? (
            MOCK_APPOINTMENTS.map((appt) => (
              <BoardingPass key={appt.id} {...appt} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 border border-white/[0.04] rounded-2xl bg-white/[0.01]">
              <Calendar className="w-10 h-10 text-zinc-700 mb-4" />
              <p className="font-vogue text-xl text-zinc-500 mb-2">Sin turnos próximos</p>
              <p className="text-sm text-zinc-600 mb-6">Todavía no tenés reservas confirmadas.</p>
              <Link
                href="/explore"
                className="text-[11px] font-bold text-emerald-400 border border-emerald-400/20 px-5 py-2.5 rounded-full hover:bg-emerald-400/[0.06] transition-all uppercase tracking-widest"
              >
                Descubrir salones
              </Link>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

function BoardingPass({
  salonType,
  salonName,
  Icon,
  day,
  month,
  staffName,
  serviceName,
  time,
  location,
  checkInCode,
}: Appointment) {
  return (
    <div
      className="relative flex cursor-pointer transition-all duration-300 hover:scale-[1.015] group"
      style={{
        backgroundColor: '#141414',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 0)',
        backgroundSize: '20px 20px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Muescas externas izquierda y derecha */}
      <div
        className="absolute z-10"
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: '#09090b',
          borderRadius: '50%',
          top: '50%',
          left: '-12px',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        className="absolute z-10"
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: '#09090b',
          borderRadius: '50%',
          top: '50%',
          right: '-12px',
          transform: 'translateY(-50%)',
        }}
      />

      {/* Lado izquierdo — datos del turno */}
      <div className="flex-1 p-7 flex flex-col justify-between">

        <div className="flex justify-between items-start">
          <div>
            {/* FIX 3: salonType — text-zinc-400 tracking-widest */}
            <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase mb-1.5">
              {salonType}
            </p>
            {/* FIX 2+3: font-vogue tracking-widest, text-white puro — máxima jerarquía */}
            <h3 className="font-vogue text-[1.55rem] font-bold text-white leading-none tracking-widest">
              {salonName}
            </h3>
          </div>
          <div className="flex items-start gap-5">
            <Icon className="w-5 h-5 text-emerald-400 mt-1" />
            <div className="text-right">
              <p className="text-[9px] text-zinc-500 font-bold tracking-[0.3em] uppercase mb-0.5">
                FECHA
              </p>
              {/* FIX 3: número de fecha en dorado metálico sutil */}
              <span className="font-vogue text-4xl font-black text-amber-300/70 leading-none">{day}</span>
              <span className="text-[11px] tracking-[0.3em] uppercase text-zinc-400 font-bold ml-1">
                {month}
              </span>
            </div>
          </div>
        </div>

        {/* FIX 3: jerarquía de color diferenciada por campo */}
        <div className="grid grid-cols-5 gap-3 border-t border-white/5 pt-4 mt-4">
          {/* CON — nombre del profesional: text-white puro */}
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">CON</p>
            <p className="text-sm font-medium text-white">{staffName}</p>
          </div>
          {/* SERVICIO, HORA, LUGAR — text-zinc-300 */}
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">SERVICIO</p>
            <p className="text-sm font-medium text-zinc-300">{serviceName}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">HORA</p>
            <p className="text-sm font-medium text-zinc-300">{time}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">LUGAR</p>
            <p className="text-sm font-medium text-zinc-300">{location}</p>
          </div>

          {/* Cancelar — acción destructiva rose */}
          <div className="flex items-end justify-end">
            <button className="text-[10px] text-rose-400/70 hover:text-rose-400 border border-rose-400/20 hover:border-rose-400/40 px-3 py-1.5 rounded-full font-medium transition-all duration-200 hover:bg-rose-950 cursor-pointer">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* FIX 3: divisor dorado sutil — gradient vertical evoca separador metálico */}
      <div
        className="w-px my-6"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.2), transparent)',
        }}
      />

      {/* Lado derecho — QR */}
      <div className="w-44 flex flex-col items-center justify-center px-6 py-7 shrink-0">
        <p className="text-[7px] text-zinc-600 font-bold tracking-[0.2em] uppercase text-center leading-relaxed mb-3">
          CHECK-IN CODE
        </p>
        <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-2.5">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect x="6" y="6" width="22" height="22" rx="2" fill="black" />
            <rect x="10" y="10" width="14" height="14" rx="1" fill="white" />
            <rect x="13" y="13" width="8" height="8" fill="black" />
            <rect x="44" y="6" width="22" height="22" rx="2" fill="black" />
            <rect x="48" y="10" width="14" height="14" rx="1" fill="white" />
            <rect x="51" y="13" width="8" height="8" fill="black" />
            <rect x="6" y="44" width="22" height="22" rx="2" fill="black" />
            <rect x="10" y="48" width="14" height="14" rx="1" fill="white" />
            <rect x="13" y="51" width="8" height="8" fill="black" />
            <rect x="32" y="6" width="4" height="4" fill="black" />
            <rect x="38" y="6" width="4" height="4" fill="black" />
            <rect x="32" y="12" width="4" height="4" fill="black" />
            <rect x="38" y="18" width="4" height="4" fill="black" />
            <rect x="32" y="32" width="4" height="4" fill="black" />
            <rect x="38" y="32" width="4" height="4" fill="black" />
            <rect x="44" y="32" width="4" height="4" fill="black" />
            <rect x="32" y="38" width="4" height="4" fill="black" />
            <rect x="44" y="38" width="4" height="4" fill="black" />
            <rect x="50" y="38" width="4" height="4" fill="black" />
            <rect x="56" y="44" width="4" height="4" fill="black" />
            <rect x="62" y="44" width="4" height="4" fill="black" />
            <rect x="56" y="50" width="4" height="4" fill="black" />
            <rect x="62" y="56" width="4" height="4" fill="black" />
            <rect x="50" y="62" width="4" height="4" fill="black" />
          </svg>
        </div>
        {/* FIX 3: código QR en dorado — número de serie de lujo */}
        <p className="text-[9px] font-mono text-amber-300/60 mt-2.5">{checkInCode}</p>
      </div>

      {/* Hover glow sutil */}
      <div
        className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(52,211,153,0.08)' }}
      />
    </div>
  )
}

function BackgroundGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute top-[15%] right-[5%] w-[500px] h-[500px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.07), transparent)' }}
      />
      <div
        className="absolute bottom-[5%] left-[10%] w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{ background: 'rgba(255,255,255,0.025)' }}
      />
    </div>
  )
}
