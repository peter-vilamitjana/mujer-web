'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, X, Scissors, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useUI } from '@/contexts/UIContext';

const adminNavItems = [
  { href: '/dashboard',  label: 'Dashboard',  icon: Home     },
  { href: '/agenda',     label: 'Agenda',      icon: Calendar },
  { href: '/clientes',   label: 'Clientes',    icon: Users    },
  { href: '/servicios',  label: 'Servicios',   icon: Scissors },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

const employeeNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home     },
  { href: '/agenda',    label: 'Agenda',     icon: Calendar },
  { href: '/clientes',  label: 'Clientes',   icon: Users    },
];

const clientNavItems = [
  { href: '/mis-turnos', label: 'Mis Turnos',     icon: Home     },
  { href: '/servicios',  label: 'Servicios',       icon: Scissors },
  { href: '/turnos',     label: 'Agendar Turno',   icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const userCtx  = useUser();
  const { isSidebarOpen: isOpen, setSidebarOpen } = useUI();
  const onClose = () => setSidebarOpen(false);

  const userRole = userCtx?.rol || 'clienta';
  let navItems = adminNavItems;
  if (userRole === 'empleada') navItems = employeeNavItems;
  if (userRole === 'clienta')  navItems = clientNavItems;

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const userName    = userCtx?.nombre || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  const content = (
    <div className="flex h-full flex-col bg-[#0d0d10]">
      {/* Brand */}
      <div className="flex h-16 items-center px-5 border-b border-white/[0.05]">
        <Logo href={userRole === 'clienta' ? '/mis-turnos' : '/dashboard'} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/mis-turnos' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-violet-500/12 text-violet-300 border border-violet-500/20'
                  : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300'
              )}
            >
              <item.icon
                className="h-[17px] w-[17px] shrink-0"
                strokeWidth={isActive ? 2 : 1.75}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/[0.05] space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-default">
          <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-300 text-xs font-bold shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate leading-tight capitalize">{userName}</p>
            <p className="text-[11px] text-zinc-600 truncate leading-tight capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/[0.05] transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {content}
        <button
          className="absolute top-3 right-3 md:hidden w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-all cursor-pointer"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Desktop fixed sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-10 md:block md:w-64 border-r border-white/[0.05]">
        {content}
      </aside>
    </>
  );
}
