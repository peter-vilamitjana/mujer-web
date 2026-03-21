'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function PublicHeader() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-sm dark:shadow-none tonal-transition">
      <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/explore">
            <span className="text-2xl font-semibold tracking-tighter text-[#191c1d] dark:text-white italic">MujerApp</span>
          </Link>
          <div className="hidden md:flex gap-6 font-display font-medium text-sm tracking-tight text-on-surface">
            <Link href="/explore" className="text-primary font-bold border-b-2 border-primary pb-0.5">Explorar</Link>
            <Link href="/salones" className="text-on-surface/80 hover:text-primary transition-opacity duration-300">Salones</Link>
            <Link href="/business" className="text-on-surface/80 hover:text-primary transition-opacity duration-300">Para Salones</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {session ? (
            <Link href="/mis-turnos" className="px-5 py-2 rounded-full text-sm font-semibold bg-on-surface text-surface scale-95 duration-200 ease-in-out hover:opacity-90">
              Ir a la App
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2 rounded-full text-sm font-semibold text-[#191c1d] hover:bg-surface-container-high transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-5 py-2 rounded-full text-sm font-semibold bg-on-surface text-surface scale-95 duration-200 ease-in-out hover:opacity-90">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
