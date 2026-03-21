'use client';

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
import { LogOut, User, Menu } from 'lucide-react';
import Logo from './Logo';
import { useUser } from '@/contexts/UserContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

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

  const userName = userCtx?.nombre || authUser?.displayName || authUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = userCtx?.email || authUser?.email || 'No hay email';
  const userInitial = (userName || "U").charAt(0).toUpperCase();

  const photoURL = userCtx?.photoURL || authUser?.photoURL;
  console.log("Header Avatar Debug:", { userCtxPhoto: userCtx?.photoURL, authPhoto: authUser?.photoURL });

  // Use key to force re-render when photoURL changes
  const avatarSrc = photoURL || undefined;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-card/80 backdrop-blur-lg px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="d-block md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="hidden md:block">
          {/* Logo is now in sidebar */}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar key={avatarSrc} className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={avatarSrc} className="object-cover" alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none capitalize">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

