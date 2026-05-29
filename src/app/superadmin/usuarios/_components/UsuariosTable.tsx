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

const FILTER_LABELS: Record<Filter, string> = {
  all:      'Todos',
  customer: 'Clientas',
  admin:    'Dueñas',
}

export function UsuariosTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers]            = useState(initialUsers)
  const [filter, setFilter]          = useState<Filter>('all')
  const [isPending, startTransition] = useTransition()

  const filtered = users.filter(u => {
    if (filter === 'all')      return u.role !== 'superadmin'
    if (filter === 'customer') return u.role === 'customer' || !u.role
    if (filter === 'admin')    return u.role === 'admin'
    return true
  })

  function handleRoleChange(uid: string, role: string) {
    startTransition(async () => {
      await updateUserRole(uid, role as 'customer' | 'admin')
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role } : u))
    })
  }

  return (
    <div className="relative isolate rounded-[2rem] border border-white/[0.06]
      bg-[#0d0d0d]/60 overflow-hidden">
      <div className="absolute inset-0 liquid-glass-rich
        pointer-events-none rounded-[inherit] -z-10" />

      {/* Header con filtros */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <h3 className="font-playfair text-xl italic text-[#f5f0e8]">
          Todos los usuarios
        </h3>
        <div className="flex items-center gap-2">
          {(Object.keys(FILTER_LABELS) as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold
                uppercase tracking-wider transition-all cursor-pointer ${
                filter === f
                  ? 'bg-red-500/[0.12] text-red-400 border border-red-500/20'
                  : 'text-[#7a766e] border border-white/[0.06] hover:text-[#f5f0e8]'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
          <span className="ml-2 text-[11px] text-[#7a766e]">
            {filtered.length} usuarios
          </span>
        </div>
      </div>

      {/* Filas */}
      <div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span
              className="material-symbols-outlined text-[#7a766e]/40 mb-3"
              style={{ fontSize: '40px' }}
            >
              group
            </span>
            <p className="font-playfair text-xl italic text-[#7a766e]">
              Sin usuarios
            </p>
            <p className="text-[12px] text-[#7a766e]/60 mt-1">
              No hay usuarios que coincidan con el filtro
            </p>
          </div>
        ) : (
          filtered.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-4 px-6 py-4
                border-b border-white/[0.04] hover:bg-white/[0.02]
                transition-all group last:border-b-0"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center
                text-[12px] font-bold shrink-0 bg-red-500/10 border border-red-500/20
                text-red-400">
                {(user.name || user.email || '?')[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#f5f0e8] truncate">
                  {user.name || '—'}
                </p>
                <p className="text-[11px] text-[#7a766e] truncate">{user.email}</p>
              </div>

              {/* Fecha */}
              <p className="text-[11px] text-[#7a766e] shrink-0 hidden sm:block">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('es-AR')
                  : '—'}
              </p>

              {/* Badge de rol */}
              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full
                uppercase tracking-wider border shrink-0 ${
                user.role === 'superadmin'
                  ? 'text-red-400 bg-red-500/10 border-red-500/20'
                  : user.role === 'admin'
                    ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                    : 'text-[#7a766e] bg-white/[0.03] border-white/[0.06]'
              }`}>
                {user.role === 'superadmin' ? 'Super Admin'
                  : user.role === 'admin' ? 'Dueña'
                  : 'Clienta'}
              </span>

              {/* Cambiar rol — oculto para superadmin */}
              {user.role !== 'superadmin' && (
                <select
                  value={user.role === 'admin' ? 'admin' : 'customer'}
                  onChange={e => handleRoleChange(user.id, e.target.value)}
                  disabled={isPending}
                  className="bg-[#0d0d0d] border border-white/[0.08] rounded-xl
                    px-3 py-1.5 text-[11px] text-[#7a766e] outline-none
                    hover:border-white/[0.15] transition-all cursor-pointer shrink-0
                    disabled:opacity-40"
                >
                  <option value="customer" className="bg-[#0d0d0d]">Clienta</option>
                  <option value="admin"    className="bg-[#0d0d0d]">Dueña</option>
                </select>
              )}
            </div>
          ))
        )}
      </div>

      {isPending && (
        <div className="px-6 py-2 text-[11px] text-[#7a766e] border-t border-white/[0.04]">
          Guardando…
        </div>
      )}
    </div>
  )
}
