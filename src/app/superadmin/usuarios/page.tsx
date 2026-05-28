import { getAllUsers } from '@/actions/superadmin.actions'
import { UsuariosTable } from './_components/UsuariosTable'

export default async function UsuariosPage() {
  const users = await getAllUsers(200)

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <p className="text-xs text-red-400/70 uppercase tracking-widest font-medium mb-1">Super Admin</p>
        <h1 className="text-2xl font-semibold text-white">Usuarios</h1>
        <p className="text-sm text-white/30 mt-1">{users.length} registrados</p>
      </div>

      <UsuariosTable initialUsers={users} />
    </div>
  )
}
