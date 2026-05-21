'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { GlassButton } from '@/components/ui/apple-tahoe-liquid-glass-button';

export default function LandingHeader() {
  const { data: session, status } = useSession();
  const [overHero, setOverHero] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const header = document.getElementById('main-header');

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrolled = scrollY > 50;

      if (header) {
        header.style.top = scrolled ? '-10px' : '0px';
      }

      setOverHero(scrollY < window.innerHeight * 0.85);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textWhite = (mounted && theme === 'dark') || overHero;

  return (
    <header
      id="main-header"
      className="fixed top-0 inset-x-0 z-[100] flex justify-center pt-6 px-6 transition-[top] duration-700"
      suppressHydrationWarning
    >
      <div className="w-full max-w-[1600px]">
        <nav
          className={cn(
            'relative flex items-center justify-between w-full rounded-full px-10 py-[18px]',
            'backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)_saturate(180%)] [backdrop-filter:blur(24px)_saturate(180%)]',
            'transition-all duration-500',
            overHero
              ? 'bg-white/8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.18)]'
              : 'bg-white/70 border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:bg-black/40 dark:border-white/10'
          )}
        >
          {/* ── Logo ── */}
          <div className="flex items-center">
            <span className={cn(
              'font-vogue text-3xl font-black tracking-tighter uppercase transition-colors duration-300',
              textWhite ? 'text-white' : 'text-[#1A1A1A]'
            )}>
              Ouleeh
            </span>
          </div>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex gap-6 items-center">
            {[
              { label: 'Reservar turno', href: '/explore' },
              { label: 'Sumá tu salón', href: '/business' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  'relative px-4 py-2 rounded-full text-[11px] tracking-wider uppercase font-semibold',
                  'transition-all duration-300',
                  'before:absolute before:inset-0 before:rounded-full before:opacity-0',
                  'before:transition-opacity before:duration-300 hover:before:opacity-100',
                  textWhite
                    ? 'text-white/60 hover:text-white before:bg-white/10 before:border before:border-white/20'
                    : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] before:bg-black/[0.06] before:border before:border-black/10'
                )}
              >
                {label}
              </Link>
            ))}

            <GlassButton
              size="sm"
              className="text-[11px] uppercase tracking-[0.22em] font-semibold font-inter px-7"
              onClick={() => router.push(status === 'authenticated' ? '/perfil' : '/login')}
            >
              {status === 'authenticated' ? 'Mi Perfil' : 'Iniciar sesión'}
            </GlassButton>
          </div>

          {/* ── Mobile menu ── */}
          <button
            className={cn(
              'md:hidden transition-colors duration-300',
              textWhite ? 'text-white' : 'text-[#1A1A1A]'
            )}
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
