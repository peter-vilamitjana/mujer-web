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

          <Link href="/superadmin/dashboard" className="flex items-center mb-6 group/logo cursor-pointer overflow-hidden h-10 rounded-xl hover:bg-white/5 transition-all duration-200">
            <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-b from-white/[0.15] to-transparent p-[1px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/logo:shadow-[0_0_15px_rgba(90,240,179,0.15)] group-hover/logo:scale-105">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1a211d] to-[#0e1511] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#5af0b3]/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                  <span className="font-sans font-bold text-white text-[15px] relative z-10 transition-colors duration-500 group-hover/logo:text-[#5af0b3]">O</span>
                </div>
              </div>
            </div>
            <span className="text-[22px] font-sans font-semibold tracking-tighter text-white group-hover/logo:text-[#5af0b3] opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
              Ouleeh
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
                      ? 'text-[#5af0b3] bg-[#5af0b3]/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#5af0b3]/20'
                      : 'text-[#bbcac0] hover:text-[#5af0b3] hover:bg-white/5'
                  }`}
                >
                  <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.1em] font-sans font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="w-[calc(100%-12px)] h-px bg-[#3c4a42] my-2 mx-auto" />

          <div className="flex flex-col gap-1 w-full">
            {/* Avatar + label */}
            <div className="flex items-center overflow-hidden h-10 rounded-xl px-0">
              <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-[#5af0b3]/10 border border-[#5af0b3]/20 flex items-center justify-center text-[11px] font-bold text-[#5af0b3]">
                  {userInitial}
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.1em] font-sans font-semibold text-[#bbcac0] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Super Admin
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full h-10 rounded-xl flex items-center text-[#bbcac0] hover:text-[#ffb4ab] hover:bg-white/5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">logout</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.1em] font-sans font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Salir
              </span>
            </button>
          </div>

        </div>
      </aside>

      {/* ══ MOBILE TOP HEADER ══ */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-[#0e1511]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <span className="font-sans text-[22px] font-semibold tracking-tighter text-[#5af0b3]">Ouleeh</span>
        <div className="flex items-center gap-1.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/[0.05] transition-all cursor-pointer text-[#bbcac0]">
            <Bell size={17} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#5af0b3]/15 border border-[#5af0b3]/25 flex items-center justify-center text-[#5af0b3] text-xs font-bold">
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
                  active ? 'text-[#5af0b3]' : 'text-[#bbcac0] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wide leading-none">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
