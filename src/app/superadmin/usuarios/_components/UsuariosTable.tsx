'use client'

import { useState, useTransition } from 'react'
import { updateUserRole } from '@/actions/superadmin.actions'

type UserRow = {
  id: string
  email: string
  name: string
  role: string
  createdAt: string | null
  phone: string | null
}

type Filter = 'all' | 'customer' | 'admin'

export function UsuariosTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers]     = useState(initialUsers)
  const [filter, setFilter]   = useState<Filter>('all')
  const [isPending, startTransition] = useTransition()

  const filtered = users.filter(u => {
    if (filter === 'all') return u.role !== 'superadmin'
    if (filter === 'customer') return u.role === 'customer' || !u.role
    if (filter === 'admin') return u.role === 'admin'
    return true
  })

  function handleRoleChange(uid: string, role: string) {
    startTransition(async () => {
      await updateUserRole(uid, role as 'customer' | 'admin')
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role } : u))
    })
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(['all', 'customer', 'admin'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              'text-xs px-3 py-1.5 rounded-full border transition-colors',
              filter === f
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/[0.15]',
            ].join(' ')}
          >
            {f === 'all' ? 'Todos' : f === 'customer' ? 'Clientas' : 'Dueñas'}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/30 self-center">{filtered.length} usuarios</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Usuario</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Rol</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Registrado</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wide">Cambiar rol</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-white/30 text-sm">
                  Sin resultados
                </td>
              </tr>
            )}
            {filtered.map(user => (
              <tr
                key={user.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <span className="text-white font-medium">{user.name}</span>
                    <span className="block text-xs text-white/30">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={[
                    'text-xs px-2 py-0.5 rounded font-medium',
                    user.role === 'admin'
                      ? 'text-violet-400 bg-violet-400/10'
                      : 'text-white/40 bg-white/[0.05]',
                  ].join(' ')}>
                    {user.role === 'admin' ? 'Dueña' : 'Clienta'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/30">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={user.role === 'admin' ? 'admin' : 'customer'}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending}
                    className="bg-transparent border border-white/[0.08] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
                  >
                    <option value="customer" className="bg-[#0d0d0d]">Clienta</option>
                    <option value="admin" className="bg-[#0d0d0d]">Dueña</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isPending && (
          <div className="px-4 py-2 text-xs text-white/30 border-t border-white/[0.04]">
            Guardando…
          </div>
        )}
      </div>
    </div>
  )
}
