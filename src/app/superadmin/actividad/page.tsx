import { getRecentActivity } from '@/actions/superadmin.actions'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Store, User, Calendar } from 'lucide-react'

function relativeTime(iso: string | null) {
  if (!iso) return '—'
  try {
    return formatDistanceToNow(new Date(iso), { locale: es, addSuffix: true })
  } catch {
    return '—'
  }
}

const TYPE_CONFIG = {
  salon:       { icon: Store,    color: 'text-violet-400', bg: 'bg-violet-400/10',  label: 'SALÓN' },
  user:        { icon: User,     color: 'text-blue-400',   bg: 'bg-blue-400/10',    label: 'USUARIA' },
  appointment: { icon: Calendar, color: 'text-green-400',  bg: 'bg-green-400/10',   label: 'TURNO' },
}

export default async function ActividadPage() {
  const events = await getRecentActivity(50)

  return (
    <div className="max-w-4xl mx-auto pb-6">
      <div className="mb-8 md:mb-10">
        <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-2">Super Admin · Monitor</p>
        <div className="flex items-end justify-between">
          <h1 className="font-playfair text-3xl md:text-4xl italic text-[#f5f0e8]">Actividad</h1>
          {events.length > 0 && (
            <span className="text-[10px] font-bold text-[#7a766e] bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full uppercase tracking-wider mb-1">
              {events.length} eventos
            </span>
          )}
        </div>
      </div>

      <div className="relative isolate rounded-[1.5rem] border border-white/[0.06] bg-[#0d0d0d]/60 overflow-hidden">
        <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[#7a766e]/30 mb-3" style={{ fontSize: '36px' }}>
              timeline
            </span>
            <p className="text-sm text-[#7a766e]">Sin actividad registrada</p>
          </div>
        )}

        {events.map((event, i) => {
          const config = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.appointment
          const Icon = config.icon
          return (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#f5f0e8] truncate leading-snug">{event.description}</p>
                <span className={`text-[10px] font-bold tracking-widest ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <span className="text-[11px] text-[#7a766e] font-mono shrink-0">{relativeTime(event.createdAt)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
