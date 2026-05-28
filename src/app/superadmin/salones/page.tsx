import { getAllTenants } from '@/actions/superadmin.actions'
import { SalonesTable } from './_components/SalonesTable'

export default async function SalonesPage() {
  const tenants = await getAllTenants()

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <p className="text-xs text-red-400/70 uppercase tracking-widest font-medium mb-1">Super Admin</p>
        <h1 className="text-2xl font-semibold text-white">Salones</h1>
        <p className="text-sm text-white/30 mt-1">{tenants.length} registrados</p>
      </div>

      <SalonesTable initialTenants={tenants} />
    </div>
  )
}
