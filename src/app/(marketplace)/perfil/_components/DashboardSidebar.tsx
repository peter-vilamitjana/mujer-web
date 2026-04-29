'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, Clock, User, Heart, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Mi Panel', href: '/perfil', icon: LayoutDashboard },
  { label: 'Historial', href: '/perfil/historial', icon: Clock },
  { label: 'Mi Perfil', href: '/perfil/cuenta', icon: User },
  { label: 'Favoritos', href: '/perfil/favoritos', icon: Heart },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const userName = session?.user?.name ?? ''
  const userEmail = session?.user?.email ?? ''
  const nameInitial = userName.charAt(0).toUpperCase() || '?'

  return (
    <aside className="w-[280px] liquid-glass-floating flex flex-col h-screen sticky top-0 shrink-0">

      {/* Brand */}
      <div className="px-8 py-7 border-b border-white/[0.06]">
        <h1 className="font-vogue text-xl text-[#F4F4F5] tracking-wider">Ouleeh</h1>
        <p className="text-[#8A8F98] text-[11px] mt-0.5 tracking-wide">Panel de Clienta</p>
      </div>

      {/* User */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#050504] shrink-0 overflow-hidden"
            style={{ border: '2px solid #D4AF37' }}
          >
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-vogue text-base" style={{ color: '#D4AF37' }}>{nameInitial}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[#F4F4F5] text-sm font-medium truncate">{userName || 'Clienta'}</p>
            <p className="text-[#8A8F98] text-[11px] truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={isActive ? { borderLeft: '3px solid #D4AF37', paddingLeft: '13px' } : {}}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#D4AF37]/[0.07] pl-[13px]'
                  : 'text-[#8A8F98] hover:text-[#F4F4F5] hover:bg-white/[0.04] rounded-lg'
              }`}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                style={isActive ? { color: '#D4AF37' } : undefined}
              />
              <span style={isActive ? { color: '#D4AF37' } : undefined}>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-white/[0.06]">
        {confirmLogout ? (
          <div>
            <p className="text-[#8A8F98] text-[11px] text-center mb-3">¿Cerrar sesión?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 text-[11px] text-[#8A8F98] border border-white/[0.08] py-2 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                No
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex-1 text-[11px] text-red-400 border border-red-400/20 py-2 rounded-lg hover:bg-red-400/[0.06] transition-all cursor-pointer"
              >
                Sí, salir
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-3 w-full text-[13px] text-[#8A8F98] hover:text-red-400 transition-colors cursor-pointer py-1"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        )}
      </div>
    </aside>
  )
}
