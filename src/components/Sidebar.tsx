'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, X, Scissors, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { Button } from './ui/button';
import type { UserRole } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/servicios', label: 'Servicios', icon: Scissors },
];

const employeeNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/clientes', label: 'Clientes', icon: Users },
];

const clientNavItems = [
  { href: '/mis-turnos', label: 'Mis Turnos', icon: Home },
  { href: '/servicios', label: 'Servicios', icon: Scissors },
  { href: '/turnos', label: 'Agendar Turno', icon: Calendar },
];


type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
};

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  let navItems = adminNavItems;
  if (userRole === 'empleada') navItems = employeeNavItems;
  if (userRole === 'clienta') navItems = clientNavItems;

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const content = (
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Logo href="/dashboard" />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/mis-turnos' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
                  isActive && 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:text-primary-foreground'
                )}
                onClick={onClose}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
           <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar sesión
           </Button>
        </div>
      </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {content}
        <Button variant="ghost" size="icon" className="absolute top-3 right-3 md:hidden" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-10 md:block md:w-64 md:border-r bg-card">
        {content}
      </aside>
    </>
  );
}
