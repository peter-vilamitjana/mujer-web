'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { BarChart2, Store, Users, Activity, Settings, LogOut } from 'lucide-react'

const NAV = [
  { label: 'Command Center', href: '/superadmin/dashboard', icon: BarChart2 },
  { label: 'Salones',        href: '/superadmin/salones',   icon: Store },
  { label: 'Usuarios',       href: '/superadmin/usuarios',  icon: Users },
  { label: 'Actividad',      href: '/superadmin/actividad', icon: Activity },
  { label: 'Sistema',        href: '/superadmin/sistema',   icon: Settings },
]

export function SuperAdminSidebar({ email }: { email?: string | null }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 sticky top-0 h-screen flex flex-col bg-[#0d0d0d] border-r border-white/[0.06]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
            SUPER ADMIN
          </span>
        </div>
        <p className="mt-2 text-[11px] text-white/30 truncate">{email ?? '—'}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-red-500/[0.12] text-red-400 font-medium'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 border-t border-white/[0.06]">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
