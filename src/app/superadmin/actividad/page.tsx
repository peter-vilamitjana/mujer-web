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
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-xs text-red-400/70 uppercase tracking-widest font-medium mb-1">Super Admin</p>
        <h1 className="text-2xl font-semibold text-white">Actividad reciente</h1>
        <p className="text-sm text-white/30 mt-1">Últimos {events.length} eventos</p>
      </div>

      <div className="space-y-2">
        {events.length === 0 && (
          <p className="text-sm text-white/30">Sin actividad registrada</p>
        )}
        {events.map((event, i) => {
          const config = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.appointment
          const Icon = config.icon
          return (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold tracking-widest ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-white/80 truncate">{event.description}</p>
              </div>
              <span className="text-xs text-white/30 shrink-0">{relativeTime(event.createdAt)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
