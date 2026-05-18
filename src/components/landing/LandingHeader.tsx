'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { GlassButton } from '@/components/ui/apple-tahoe-liquid-glass-button';

// Specular box-shadow stack — same as GlassButton
const GLASS_BOX_SHADOW = [
  'inset 0 0 0 1px color-mix(in srgb, white 12%, transparent)',
  'inset 1.8px 3px 0px -2px color-mix(in srgb, white 90%, transparent)',
  'inset -2px -2px 0px -2px color-mix(in srgb, white 80%, transparent)',
  'inset -3px -8px 1px -6px color-mix(in srgb, white 60%, transparent)',
  'inset -0.3px -1px 4px 0px color-mix(in srgb, black 12%, transparent)',
  'inset -1.5px 2.5px 0px -2px color-mix(in srgb, black 20%, transparent)',
  'inset 0px 3px 4px -2px color-mix(in srgb, black 20%, transparent)',
  'inset 2px -6.5px 1px -4px color-mix(in srgb, black 10%, transparent)',
  '0px 1px 5px 0px color-mix(in srgb, black 12%, transparent)',
  '0px 8px 28px 0px color-mix(in srgb, black 14%, transparent)',
].join(', ');

export default function LandingHeader() {
  const { data: session, status } = useSession();
  const [overHero, setOverHero] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const glassRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const header = document.getElementById('main-header');

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrolled = scrollY > 50;

      // Translate header slightly on scroll (no transform — would break backdrop-filter)
      if (header) {
        header.style.top = scrolled ? '-10px' : '0px';
      }

      // On scroll: go opaque so content behind remains readable
      if (glassRef.current) {
        glassRef.current.style.backgroundColor = scrolled
          ? 'rgba(9, 9, 11, 0.88)'
          : '';
        // Rebuild box-shadow: tighten specular on scroll (solid background replaces blur)
        glassRef.current.style.boxShadow = scrolled
          ? '0px 1px 0px 0px rgba(255,255,255,0.06), 0px 8px 28px 0px rgba(0,0,0,0.25)'
          : GLASS_BOX_SHADOW;
      }

      setOverHero(scrollY < window.innerHeight * 0.85);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLight = mounted && theme === 'light';
  const textWhite = !isLight || overHero;
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    // No transform-gpu here: creates a permanent stacking context that breaks
    // Chrome's backdrop-filter when scrollY = 0. Top offset applied via DOM.
    <header
      id="main-header"
      className="fixed top-0 inset-x-0 z-[100] isolate flex justify-center pt-6 px-6 transition-[top] duration-700"
      suppressHydrationWarning
    >
      <div className="w-full max-w-[1600px]">
        {/*
          The <nav> is the relative container with no background of its own.
          The glass layer lives in an isolated absolute div at -z-10,
          completely separate from content so Chrome can apply backdrop-filter
          without child sub-contexts interfering.
        */}
        <nav className="relative flex items-center justify-between w-full rounded-full px-10 py-[18px]">

          {/* ── Isolated glass lens layer ── no content here, ever ── */}
          <div
            ref={glassRef}
            aria-hidden="true"
            className="absolute inset-0 rounded-full pointer-events-none -z-10"
            style={{
              backgroundColor: 'oklch(from var(--foreground) l c h / 6%)',
              backdropFilter: 'blur(16px) url(#liquid-glass-nav) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: GLASS_BOX_SHADOW,
              transition: 'background-color 0.35s ease, box-shadow 0.35s ease',
            }}
          />

          {/* ── Logo ── */}
          <div className="relative z-10 flex items-center">
            <span className={cn(
              'font-vogue text-3xl font-black tracking-tighter uppercase transition-colors duration-300',
              textWhite ? 'text-white' : 'text-[#1A1A1A]'
            )}>
              Ouleeh
            </span>
          </div>

          {/* ── Desktop nav ── */}
          <div className="relative z-10 hidden md:flex gap-6 items-center">
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
                <span className="relative z-10">{label}</span>
              </Link>
            ))}

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Alternar tema"
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full',
                  'opacity-50 hover:opacity-100 transition-opacity duration-300',
                  textWhite ? 'text-white' : 'text-[#1A1A1A]'
                )}
              >
                {theme === 'dark' ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            )}

            {/* CTA — liquid glass button */}
            <GlassButton
              size="sm"
              className="text-[11px] uppercase tracking-[0.22em] font-semibold font-inter px-7"
              onClick={() => router.push(status === 'authenticated' ? '/perfil' : '/login')}
            >
              {status === 'authenticated' ? 'Mi Perfil' : 'Sign In'}
            </GlassButton>
          </div>

          {/* ── Mobile menu ── */}
          <button
            className={cn(
              'relative z-10 md:hidden transition-colors duration-300',
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
