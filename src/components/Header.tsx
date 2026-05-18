'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-transparent isolate px-4 sm:px-6">
      <div className="liquid-glass-lens absolute inset-0 -z-10 pointer-events-none border-b border-black/5 dark:border-white/5" />
      <div className="relative z-10 flex-1" />
      {session?.user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User size={15} />
            <span className="hidden sm:inline truncate max-w-[140px]">
              {session.user.name ?? session.user.email}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      )}
    </header>
  );
}
