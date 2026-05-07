'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Menu, Bell } from 'lucide-react';
import BranchSelector from './BranchSelector';
import { ThemeToggle } from './ThemeToggle';
import { useUser } from '@/contexts/UserContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useUI } from '@/contexts/UIContext';

export default function Header() {
  const { setSidebarOpen } = useUI();
  const router = useRouter();
  const userCtx = useUser();
  const authUser = auth.currentUser;

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const userName    = userCtx?.nombre || authUser?.displayName || authUser?.email?.split('@')[0] || 'Usuario';
  const userEmail   = userCtx?.email  || authUser?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarSrc   = userCtx?.photoURL || authUser?.photoURL || undefined;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#0d0d10]/90 backdrop-blur-xl border-b border-white/[0.05] px-4 sm:px-5">
      {/* Left: mobile menu toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] rounded-xl"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-[18px] w-[18px]" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-1.5">
        <BranchSelector />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] rounded-xl"
        >
          <Bell className="h-[17px] w-[17px]" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 hover:bg-white/[0.04]">
              <Avatar key={avatarSrc} className="h-8 w-8 border border-violet-500/25">
                <AvatarImage src={avatarSrc} className="object-cover" alt={userName} />
                <AvatarFallback className="bg-violet-500/15 text-violet-300 text-xs font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 bg-[#111115] border-white/[0.08] text-zinc-200"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal px-3 py-2.5">
              <p className="text-sm font-medium leading-none capitalize text-zinc-100">{userName}</p>
              {userEmail && (
                <p className="text-xs leading-none text-zinc-500 mt-1 truncate">{userEmail}</p>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-white/[0.06]" />

            <DropdownMenuItem asChild>
              <Link
                href="/perfil"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.04] rounded-lg cursor-pointer transition-colors"
              >
                <User className="h-4 w-4 text-zinc-500" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/[0.06]" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/[0.06] rounded-lg cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
