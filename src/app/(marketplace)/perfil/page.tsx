'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Scissors, Sparkles, Hand, X } from 'lucide-react'
import { DashboardSidebar } from './_components/DashboardSidebar'

const MOCK_APPOINTMENTS = [
  {
    id: '1',
    salonType: 'SALÓN',
    salonName: 'Casa Blanca',
    Icon: Scissors,
    day: '21',
    month: 'AGO',
    year: '2026',
    staffName: 'Martina Soto',
    serviceName: 'Balayage',
    time: '10:30 am',
    location: 'Silla 1',
    checkInCode: '#MB-CB01',
    status: 'confirmed' as const,
  },
  {
    id: '2',
    salonType: 'SPA',
    salonName: 'Aura Wellness',
    Icon: Sparkles,
    day: '23',
    month: 'AGO',
    year: '2026',
    staffName: 'Javier Gomez',
    serviceName: 'Facial Premium',
    time: '3:00 pm',
    location: 'Lounge 4',
    checkInCode: '#MB-AW02',
    status: 'confirmed' as const,
  },
  {
    id: '3',
    salonType: 'STUDIO',
    salonName: 'Studio Minimal',
    Icon: Hand,
    day: '26',
    month: 'AGO',
    year: '2026',
    staffName: 'Ana Lopez',
    serviceName: 'Manicure Gel',
    time: '11:15 am',
    location: 'Puesto 2',
    checkInCode: '#MB-SM03',
    status: 'confirmed' as const,
  },
]

type Appointment = (typeof MOCK_APPOINTMENTS)[0]

// QR SVG inline — no external URLs
function QRCode({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <rect x="6" y="6" width="22" height="22" rx="2" fill="currentColor" />
      <rect x="10" y="10" width="14" height="14" rx="1" fill="#1A1C20" />
      <rect x="13" y="13" width="8" height="8" fill="currentColor" />
      <rect x="44" y="6" width="22" height="22" rx="2" fill="currentColor" />
      <rect x="48" y="10" width="14" height="14" rx="1" fill="#1A1C20" />
      <rect x="51" y="13" width="8" height="8" fill="currentColor" />
      <rect x="6" y="44" width="22" height="22" rx="2" fill="currentColor" />
      <rect x="10" y="48" width="14" height="14" rx="1" fill="#1A1C20" />
      <rect x="13" y="51" width="8" height="8" fill="currentColor" />
      <rect x="32" y="6" width="4" height="4" fill="currentColor" />
      <rect x="38" y="6" width="4" height="4" fill="currentColor" />
      <rect x="32" y="12" width="4" height="4" fill="currentColor" />
      <rect x="38" y="18" width="4" height="4" fill="currentColor" />
      <rect x="32" y="32" width="4" height="4" fill="currentColor" />
      <rect x="38" y="32" width="4" height="4" fill="currentColor" />
      <rect x="44" y="32" width="4" height="4" fill="currentColor" />
      <rect x="32" y="38" width="4" height="4" fill="currentColor" />
      <rect x="44" y="38" width="4" height="4" fill="currentColor" />
      <rect x="50" y="38" width="4" height="4" fill="currentColor" />
      <rect x="56" y="44" width="4" height="4" fill="currentColor" />
      <rect x="62" y="44" width="4" height="4" fill="currentColor" />
      <rect x="56" y="50" width="4" height="4" fill="currentColor" />
      <rect x="62" y="56" width="4" height="4" fill="currentColor" />
      <rect x="50" y="62" width="4" height="4" fill="currentColor" />
    </svg>
  )
}

// QR Check-in Modal
function QRModal({
  appointment,
  onClose,
}: {
  appointment: Appointment | null
  onClose: () => void
}) {
  if (!appointment) return null

  return (
    // Overlay — click outside closes
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.75)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      {/* Modal card — stop propagation so clicking inside doesn't close */}
      <div
        className="relative flex flex-col items-center p-10 rounded-[12px]"
        style={{
          width: '400px',
          backgroundColor: '#1A1C20',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          animation: 'scaleIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }`}</style>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A8F98] hover:text-[#F4F4F5] transition-colors cursor-pointer p-1"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <p className="text-[10px] text-[#8A8F98] uppercase tracking-[0.3em] mb-1">
          {appointment.salonType}
        </p>
        <h2 className="font-vogue text-xl text-[#F4F4F5] mb-1">{appointment.salonName}</h2>
        <p className="text-[#8A8F98] text-sm mb-8">
          {appointment.day} {appointment.month} · {appointment.time}
        </p>

        {/* QR enlarged 250x250 */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: '#F4F4F5' }}
        >
          <div style={{ color: '#0F1012' }}>
            <QRCode size={210} />
          </div>
        </div>

        {/* Code */}
        <p
          className="text-sm font-mono font-medium tracking-wider"
          style={{ color: '#D4AF37' }}
        >
          {appointment.checkInCode}
        </p>
        <p className="text-[11px] text-[#8A8F98] mt-1">
          Mostrá este código en recepción
        </p>
      </div>
    </div>
  )
}

// Ticket card component
function TicketCard({
  appointment,
  onQRClick,
}: {
  appointment: Appointment
  onQRClick: (appt: Appointment) => void
}) {
  const { salonType, salonName, Icon, day, month, staffName, serviceName, time, location, checkInCode } =
    appointment

  return (
    <div
      className="flex w-full rounded-[12px] overflow-hidden cursor-pointer transition-colors duration-200 group"
      style={{
        backgroundColor: '#1A1C20',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
        maxWidth: '800px',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#22252A')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#1A1C20')}
    >
      {/* Left — 75% */}
      <div className="flex-[3] p-6 flex flex-col justify-between">

        {/* Top row: salon name + date */}
        <div className="flex justify-between items-start">
          <div>
            <p
              className="text-[9px] font-medium uppercase tracking-widest mb-1.5"
              style={{ color: '#8A8F98' }}
            >
              {salonType}
            </p>
            <h3 className="font-vogue text-xl leading-tight" style={{ color: '#F4F4F5' }}>
              {salonName}
            </h3>
            {/* Status badge */}
            <span
              className="inline-flex items-center mt-3 px-3 py-1 rounded-sm text-[11px] font-medium tracking-wide"
              style={{ backgroundColor: '#3C5A45', color: '#F4F4F5' }}
            >
              Confirmado
            </span>
          </div>

          {/* Date block */}
          <div className="text-right shrink-0 ml-6">
            <p
              className="font-vogue text-4xl font-semibold leading-none"
              style={{ color: '#D4AF37' }}
            >
              {day}
            </p>
            <p
              className="text-[11px] uppercase tracking-widest mt-1"
              style={{ color: '#8A8F98' }}
            >
              {month}
            </p>
            <div className="flex justify-end mt-2">
              <Icon className="w-4 h-4" style={{ color: '#8A8F98' } as React.CSSProperties} />
            </div>
          </div>
        </div>

        {/* Bottom row: metadata */}
        <div
          className="grid grid-cols-4 gap-4 pt-5 mt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {[
            { label: 'CON', value: staffName, highlight: true },
            { label: 'SERVICIO', value: serviceName, highlight: false },
            { label: 'HORA', value: time, highlight: false },
            { label: 'LUGAR', value: location, highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label}>
              <p
                className="text-[10px] uppercase tracking-wider mb-1"
                style={{ color: '#8A8F98' }}
              >
                {label}
              </p>
              <p
                className="text-[13px] font-medium"
                style={{ color: highlight ? '#F4F4F5' : '#8A8F98' }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dashed divider — spec: 1px dashed #8A8F98 */}
      <div
        className="my-5 shrink-0"
        style={{ width: '1px', borderLeft: '1px dashed #8A8F98', opacity: 0.4 }}
      />

      {/* Right — 25%, clickable for QR modal */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 gap-3"
        onClick={(e) => {
          e.stopPropagation()
          onQRClick(appointment)
        }}
      >
        <div
          className="rounded-lg p-2 transition-opacity duration-150 group-hover:opacity-90"
          style={{ backgroundColor: '#F4F4F5', color: '#0F1012' }}
        >
          <QRCode size={80} />
        </div>
        <div className="text-center">
          <p
            className="text-[9px] font-mono tracking-wider"
            style={{ color: '#D4AF37' }}
          >
            {checkInCode}
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#8A8F98' }}>
            Toque para check-in
          </p>
        </div>
      </div>
    </div>
  )
}

export default function MiPanelPage() {
  const [activeQR, setActiveQR] = useState<Appointment | null>(null)

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0F1012' }}>
      <DashboardSidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 px-12 py-10">
        <div className="max-w-[860px]">

          {/* Page header */}
          <header className="mb-10">
            <p
              className="text-[10px] uppercase tracking-[0.4em] font-medium mb-2"
              style={{ color: '#8A8F98' }}
            >
              PRÓXIMOS
            </p>
            <div className="flex items-end justify-between">
              <h2 className="font-vogue text-[32px] font-semibold leading-none" style={{ color: '#F4F4F5' }}>
                Mis Turnos
              </h2>
              <span
                className="text-[11px] font-medium px-3 py-1.5 rounded-full border mb-0.5"
                style={{
                  color: '#D4AF37',
                  backgroundColor: 'rgba(212,175,55,0.08)',
                  borderColor: 'rgba(212,175,55,0.2)',
                }}
              >
                {MOCK_APPOINTMENTS.length} confirmados
              </span>
            </div>
            <div className="mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          </header>

          {/* Ticket list */}
          <div className="space-y-4">
            {MOCK_APPOINTMENTS.length > 0 ? (
              MOCK_APPOINTMENTS.map((appt) => (
                <TicketCard key={appt.id} appointment={appt} onQRClick={setActiveQR} />
              ))
            ) : (
              /* Empty state */
              <div
                className="flex flex-col items-center justify-center py-24 rounded-[12px]"
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: '#1A1C20',
                }}
              >
                <Calendar className="w-10 h-10 mb-4" style={{ color: '#8A8F98' }} />
                <p className="font-vogue text-xl mb-2" style={{ color: '#8A8F98' }}>
                  No tenés turnos próximos
                </p>
                <p className="text-sm mb-8" style={{ color: '#8A8F98', opacity: 0.6 }}>
                  Reservá en tus salones favoritos.
                </p>
                <Link
                  href="/explore"
                  className="text-[11px] font-semibold uppercase tracking-widest px-6 py-3 rounded-[6px] transition-colors duration-150 cursor-pointer"
                  style={{
                    backgroundColor: '#D4AF37',
                    color: '#0F1012',
                  }}
                >
                  Explorar Salones
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* QR Modal */}
      <QRModal appointment={activeQR} onClose={() => setActiveQR(null)} />
    </div>
  )
}
