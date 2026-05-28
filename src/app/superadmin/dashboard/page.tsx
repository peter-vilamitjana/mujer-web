import { getSuperAdminStats } from '@/actions/superadmin.actions'
import { Store, Users, Calendar, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: number
  sub?: string
  icon: React.ElementType
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4 text-red-400/60" />
      </div>
      <span className="text-3xl font-bold text-white">{value.toLocaleString('es-AR')}</span>
      {sub && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  )
}

function relativeTime(iso: string | null) {
  if (!iso) return '—'
  try {
    return formatDistanceToNow(new Date(iso), { locale: es, addSuffix: true })
  } catch {
    return '—'
  }
}

export default async function CommandCenterPage() {
  const stats = await getSuperAdminStats()

  const planLabels: Record<string, string> = {
    free:       'Free',
    pro:        'Pro',
    enterprise: 'Enterprise',
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-red-400/70 uppercase tracking-widest font-medium mb-1">Super Admin</p>
        <h1 className="text-2xl font-semibold text-white">Command Center</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Salones"
          value={stats.totalTenants}
          sub={`${stats.activeTenants} activos · +${stats.newTenantsThisWeek} esta semana`}
          icon={Store}
        />
        <StatCard
          label="Clientas"
          value={stats.totalCustomers}
          sub={`+${stats.newCustomersThisWeek} esta semana`}
          icon={Users}
        />
        <StatCard
          label="Turnos hoy"
          value={stats.appointmentsToday}
          icon={Calendar}
        />
        <StatCard
          label="Dueñas de salón"
          value={stats.totalAdmins}
          icon={TrendingUp}
        />
      </div>

      {/* Planes */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-8">
        <h2 className="text-sm font-medium text-white/70 mb-4">Distribución de planes</h2>
        <div className="flex gap-6 flex-wrap">
          {Object.entries(stats.planCounts).map(([plan, count]) => (
            <div key={plan} className="flex flex-col gap-1">
              <span className="text-xs text-white/40">{planLabels[plan] ?? plan}</span>
              <span className="text-2xl font-bold text-white">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos registros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos salones */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="text-sm font-medium text-white/70 mb-4">Últimos salones registrados</h2>
          <ul className="space-y-3">
            {stats.recentTenants.length === 0 && (
              <li className="text-sm text-white/30">Sin datos</li>
            )}
            {stats.recentTenants.map(t => (
              <li key={t.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-white">{t.name}</span>
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40">
                    {planLabels[t.plan] ?? t.plan}
                  </span>
                </div>
                <span className="text-xs text-white/30">{relativeTime(t.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Últimas clientas */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="text-sm font-medium text-white/70 mb-4">Últimas clientas registradas</h2>
          <ul className="space-y-3">
            {stats.recentCustomers.length === 0 && (
              <li className="text-sm text-white/30">Sin datos</li>
            )}
            {stats.recentCustomers.map(u => (
              <li key={u.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-sm text-white truncate block">{u.name}</span>
                  <span className="text-xs text-white/30 truncate block">{u.email}</span>
                </div>
                <span className="text-xs text-white/30 shrink-0 ml-3">{relativeTime(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
