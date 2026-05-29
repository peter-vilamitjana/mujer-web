'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Bell } from 'lucide-react'

const SUPER_NAV = [
  { icon: 'dashboard',    label: 'Command',     href: '/superadmin/dashboard' },
  { icon: 'store',        label: 'Salones',     href: '/superadmin/salones' },
  { icon: 'group',        label: 'Usuarios',    href: '/superadmin/usuarios' },
  { icon: 'monitoring',   label: 'Actividad',   href: '/superadmin/actividad' },
  { icon: 'settings',     label: 'Sistema',     href: '/superadmin/sistema' },
]

export function SuperAdminSidebar({ userInitial }: { userInitial: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* ══ SIDEBAR ══ */}
      <aside className="hidden md:block fixed left-3 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 group sidebar-expand">
        <div className="sidebar-liquid relative rounded-[2rem] flex flex-col py-5 px-2 gap-1 w-full overflow-hidden isolate">
          {/* Isolated Lens */}
          <div className="sidebar-liquid-lens absolute inset-0 -z-10 rounded-[2rem] pointer-events-none" />

          <Link href="/" className="flex items-center mb-6 group/logo cursor-pointer overflow-hidden h-10 rounded-xl hover:bg-white/5 transition-all duration-200">
            <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-b from-white/[0.15] to-transparent p-[1px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/logo:shadow-[0_0_15px_rgba(239,68,68,0.15)] group-hover/logo:scale-105">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-400/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                  <span className="font-playfair italic text-[#f5f0e8] text-[15px] tracking-widest relative z-10 transition-colors duration-500 group-hover/logo:text-red-400">S</span>
                </div>
              </div>
            </div>
            <span className="text-[22px] font-playfair italic text-[#f5f0e8] group-hover/logo:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
              SuperAdmin
            </span>
          </Link>

          <nav className="flex flex-col gap-1 w-full">
            {SUPER_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 cursor-pointer overflow-hidden ${
                    active
                      ? 'text-red-400 bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : 'text-[#7a766e] hover:text-red-400 hover:bg-white/5'
                  }`}
                >
                  <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="w-[calc(100%-12px)] h-px bg-white/10 my-2 opacity-50 mx-auto" />

          <div className="flex flex-col gap-1 w-full">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full h-10 rounded-xl flex items-center text-[#7a766e] hover:text-red-400 hover:bg-white/5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">logout</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.1em] font-label opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Salir
              </span>
            </button>
          </div>

        </div>
      </aside>

      {/* ══ MOBILE TOP HEADER ══ */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-[#050504]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <span className="font-playfair text-lg font-bold text-red-400 italic">MujerApp</span>
        <div className="flex items-center gap-1.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/[0.05] transition-all cursor-pointer text-[#7a766e]">
            <Bell size={17} />
          </button>
          <div className="w-8 h-8 rounded-full bg-red-400/15 border border-red-400/25 flex items-center justify-center text-red-400 text-xs font-bold">
            {userInitial}
          </div>
        </div>
      </header>

      {/* ══ MOBILE BOTTOM NAV ══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 sidebar-liquid isolate">
        <div className="sidebar-liquid-lens absolute inset-0 -z-10 pointer-events-none rounded-t-3xl" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] relative z-10">
          {SUPER_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[52px] ${
                  active ? 'text-red-400' : 'text-[#7a766e] hover:text-[#f5f0e8]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[10px] font-label uppercase tracking-wide leading-none">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
