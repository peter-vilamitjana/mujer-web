'use client'

import Link from 'next/link'
import { DashboardSidebar } from '../_components/DashboardSidebar'

const MOCK_HISTORY = [
  {
    id: 'h1',
    month: 'JULIO 2026',
    entries: [
      { id: 'e1', date: '18 Jul', salonName: 'Casa Blanca', service: 'Balayage', time: '10:30 am', slug: 'casa-blanca' },
      { id: 'e2', date: '12 Jul', salonName: 'Aura Wellness', service: 'Facial Premium', time: '3:00 pm', slug: 'aura-wellness' },
    ],
  },
  {
    id: 'h2',
    month: 'JUNIO 2026',
    entries: [
      { id: 'e3', date: '29 Jun', salonName: 'Studio Minimal', service: 'Manicure Gel', time: '11:15 am', slug: 'studio-minimal' },
      { id: 'e4', date: '14 Jun', salonName: 'Casa Blanca', service: 'Corte y Mechas', time: '9:00 am', slug: 'casa-blanca' },
      { id: 'e5', date: '03 Jun', salonName: 'Aura Wellness', service: 'Masaje Relajante', time: '5:30 pm', slug: 'aura-wellness' },
    ],
  },
]

export default function HistorialPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0F1012' }}>
      <DashboardSidebar />

      <main className="flex-1 min-w-0 px-12 py-10">
        <div className="max-w-[800px]">

          {/* Header */}
          <header className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.4em] font-medium mb-2" style={{ color: '#8A8F98' }}>
              ARCHIVO
            </p>
            <h2 className="font-vogue text-[32px] font-semibold leading-none" style={{ color: '#F4F4F5' }}>
              Historial de Citas
            </h2>
            <div className="mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          </header>

          {/* Month groups */}
          {MOCK_HISTORY.length > 0 ? (
            <div className="space-y-10">
              {MOCK_HISTORY.map((group) => (
                <div key={group.id}>
                  {/* Month divider — Playfair Display, 14px, #8A8F98, uppercase */}
                  <p
                    className="font-vogue text-[13px] uppercase tracking-widest mb-4"
                    style={{ color: '#8A8F98' }}
                  >
                    {group.month}
                  </p>

                  <div className="space-y-1">
                    {group.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-5 rounded-lg transition-colors duration-150 cursor-default"
                        style={{
                          height: '64px',
                          maxWidth: '800px',
                          backgroundColor: '#1A1C20',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#22252A')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#1A1C20')}
                      >
                        {/* Date */}
                        <p className="text-[13px] w-16 shrink-0" style={{ color: '#8A8F98' }}>
                          {entry.date}
                        </p>

                        {/* Salon name */}
                        <p
                          className="font-vogue text-[15px] flex-1 mx-6"
                          style={{ color: '#F4F4F5' }}
                        >
                          {entry.salonName}
                        </p>

                        {/* Service */}
                        <p className="text-[13px] flex-1" style={{ color: '#8A8F98' }}>
                          {entry.service}
                        </p>

                        {/* Time */}
                        <p className="text-[13px] w-20 text-right" style={{ color: '#8A8F98' }}>
                          {entry.time}
                        </p>

                        {/* Rebook CTA */}
                        <Link
                          href={`/salones/${entry.slug}`}
                          className="ml-6 text-[13px] font-medium transition-opacity duration-150 hover:opacity-70 shrink-0"
                          style={{ color: '#D4AF37' }}
                        >
                          Volver a reservar
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-24 rounded-[12px]"
              style={{ border: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#1A1C20' }}
            >
              <p className="font-vogue text-xl" style={{ color: '#8A8F98' }}>
                Aún no tenés historial de citas.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
