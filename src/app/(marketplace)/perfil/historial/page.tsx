import Link from 'next/link'
import { DashboardSidebar } from '../_components/DashboardSidebar'
import { getMyHistorial } from '@/actions/profile.actions'

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function fmtTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default async function HistorialPage() {
  const groups = await getMyHistorial()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#050504' }}>
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

          {groups.length > 0 ? (
            <div className="space-y-10">
              {groups.map((group) => (
                <div key={group.monthLabel}>
                  <p
                    className="font-vogue text-[13px] uppercase tracking-widest mb-4"
                    style={{ color: '#8A8F98' }}
                  >
                    {group.monthLabel}
                  </p>

                  <div className="space-y-1">
                    {group.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-5 rounded-lg transition-colors duration-150 group"
                        style={{ height: '64px', maxWidth: '800px', backgroundColor: '#111010' }}
                      >
                        {/* Date */}
                        <p className="text-[13px] w-16 shrink-0" style={{ color: '#8A8F98' }}>
                          {fmtDate(entry.dateMs)}
                        </p>

                        {/* Salon name */}
                        <p
                          className="font-vogue text-[15px] flex-1 mx-6 truncate"
                          style={{ color: '#F4F4F5' }}
                        >
                          {entry.salonName}
                        </p>

                        {/* Service */}
                        <p className="text-[13px] flex-1 truncate" style={{ color: '#8A8F98' }}>
                          {entry.service}
                        </p>

                        {/* Time */}
                        <p className="text-[13px] w-20 text-right shrink-0" style={{ color: '#8A8F98' }}>
                          {fmtTime(entry.dateMs)}
                        </p>

                        {/* Rebook CTA */}
                        <Link
                          href={`/salones/${entry.salonSlug}`}
                          className="ml-6 text-[13px] font-medium shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-150"
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
              style={{ border: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#111010' }}
            >
              <p className="font-vogue text-xl" style={{ color: '#8A8F98' }}>
                Aún no tenés historial de citas.
              </p>
              <Link
                href="/explore"
                className="mt-4 text-[13px] font-medium transition-opacity hover:opacity-70"
                style={{ color: '#D4AF37' }}
              >
                Explorá salones →
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
