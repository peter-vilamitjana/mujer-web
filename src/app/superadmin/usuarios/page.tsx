import { getAllUsers } from '@/actions/superadmin.actions'
import { UsuariosTable } from './_components/UsuariosTable'

export default async function UsuariosPage() {
  const users = await getAllUsers(200)

  // Calcular stats
  const totalCustomers = users.filter((u: any) => u.role === 'customer' || !u.role).length
  const totalAdmins    = users.filter((u: any) => u.role === 'admin').length
  const thisWeek       = users.filter((u: any) => {
    const created = u.createdAt?.toDate?.() || new Date(u.createdAt || 0)
    return created > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }).length

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f5f0e8] p-8">

      {/* Glow de fondo — igual al dashboard admin */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 15% 25%, rgba(239,68,68,0.05) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(185,28,28,0.03) 0%, transparent 40%)',
        }} />
      </div>

      <div className="max-w-6xl mx-auto">

        <div className="mb-10">
          <p className="text-[9px] text-[#7a766e] uppercase tracking-[0.4em] font-bold mb-2">
            Super Admin · Gestión
          </p>
          <div className="flex items-end justify-between">
            <h1 className="font-vogue text-4xl italic text-[#f5f0e8]">
              Usuarios
            </h1>
            {thisWeek > 0 && (
              <span className="text-[10px] font-bold text-red-400
                bg-red-500/[0.08] border border-red-500/20
                px-3 py-1.5 rounded-full uppercase tracking-wider mb-1">
                +{thisWeek} esta semana
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total registrados', value: users.length,   icon: 'group' },
            { label: 'Clientas',          value: totalCustomers, icon: 'person' },
            { label: 'Administradoras',   value: totalAdmins,    icon: 'manage_accounts' },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="relative isolate rounded-[1.5rem] border border-white/[0.06]
                bg-[#0d0d0d]/60 p-5 overflow-hidden"
            >
              <div className="absolute inset-0 liquid-glass-rich
                pointer-events-none rounded-[inherit] -z-10" />
              <div className="flex items-center justify-between mb-3">
                <span
                  className="material-symbols-outlined text-red-400/60"
                  style={{ fontSize: '18px' }}
                >
                  {icon}
                </span>
              </div>
              <p className="font-vogue text-3xl italic text-[#f5f0e8] mb-1">
                {value}
              </p>
              <p className="text-[10px] text-[#7a766e] uppercase tracking-[0.2em] font-bold">
                {label}
              </p>
            </div>
          ))}
        </div>

        <UsuariosTable initialUsers={users} />

      </div>
    </div>
  )
}
