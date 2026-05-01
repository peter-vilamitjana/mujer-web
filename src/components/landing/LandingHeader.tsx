'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';

export default function LandingHeader() {
  const { data: session, status } = useSession();
  const [overHero, setOverHero] = useState(true);
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const loginUrl = '/login';
  const { theme, setTheme } = useTheme();
  // Apunta solo a la capa de cristal aislada, no al contenedor de contenido
  const glassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const header = document.getElementById('main-header');

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrolled = scrollY > 50;

      // Animar solo el header — el transform se aplica directamente al DOM sin React state
      if (header) {
        header.style.transform = scrolled ? 'translateY(-10px)' : 'translateY(0)';
      }

      // Opacidad del cristal en scroll: el blur de Chrome falla con transform en el ancestro,
      // pero compensamos con fondo sólido cuando hay scroll (en ese momento el blur es irrelevante)
      if (glassRef.current) {
        glassRef.current.style.background = scrolled
          ? 'rgba(9, 9, 11, 0.88)'
          : '';
        glassRef.current.style.borderColor = scrolled
          ? 'rgba(255, 255, 255, 0.08)'
          : '';
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
    // Sin transform-gpu aquí: el stacking context permanente bloqueaba el backdrop-filter
    // en Chrome incluso cuando scrollY = 0. El translateY se aplica solo vía DOM en scroll.
    <header
      id="main-header"
      className="fixed top-0 inset-x-0 z-[100] isolate flex justify-center pt-6 px-6 transition-transform duration-700"
      suppressHydrationWarning
    >
      <div className="w-full max-w-[1600px]">
        {/*
          Nuclear fix: el <nav> es el contenedor relativo sin fondo propio.
          La capa de cristal vive en un div absoluto aislado con -z-10,
          completamente separada del contenido. Chrome puede aplicar backdrop-filter
          correctamente porque el nodo no tiene hijos que creen sub-contextos.
        */}
        <nav className="relative flex items-center justify-between w-full rounded-full px-10 py-5">

          {/* Capa de cristal aislada — backdrop-filter aquí, sin contenido */}
          <div
            ref={glassRef}
            aria-hidden="true"
            className="absolute inset-0 rounded-full liquid-glass pointer-events-none -z-10"
            style={{ transition: 'background 0.3s ease, border-color 0.3s ease' }}
          />

          {/* Logo — relativo para quedar sobre la capa de cristal */}
          <div className="relative z-10 flex items-center gap-4">
            <span className={cn(
              "font-vogue text-3xl font-black tracking-tighter uppercase transition-colors duration-300",
              textWhite ? "text-white" : "text-[#1A1A1A]"
            )}>Ouleeh</span>
            <div className={cn(
              "w-px h-6 transition-colors duration-300",
              textWhite ? "bg-white/20" : "bg-black/20"
            )} />
            <span className={cn(
              "text-[9px] tracking-[0.5em] uppercase opacity-40 font-bold hidden sm:block transition-colors duration-300",
              textWhite ? "text-white" : "text-[#1A1A1A]"
            )}>Volume No. 01</span>
          </div>

          {/* Links de navegación */}
          <div className="relative z-10 hidden md:flex gap-8 items-center">
            {[
              { label: 'Reservar turno', href: '/explore' },
              { label: 'Sumá tu salón', href: '/business' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  "relative px-4 py-2 rounded-full text-[10px] tracking-[0.35em] uppercase font-medium transition-all duration-300",
                  "before:absolute before:inset-0 before:rounded-full before:opacity-0 before:transition-all before:duration-300",
                  "hover:before:opacity-100",
                  textWhite
                    ? "text-white/60 hover:text-white before:bg-white/10 before:backdrop-blur-sm before:border before:border-white/20"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] before:bg-black/5 before:backdrop-blur-sm before:border before:border-black/10"
                )}
              >
                <span className="relative z-10">{label}</span>
              </Link>
            ))}

            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Alternar tema"
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-all duration-300",
                  textWhite ? "text-white" : "text-[#1A1A1A]"
                )}
              >
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            )}

            <Link
              href={status === 'authenticated' ? '/perfil' : loginUrl}
              className={cn(
                "relative text-[10px] uppercase tracking-[0.3em] font-bold px-8 py-3 rounded-full font-inter overflow-hidden group",
                "transition-all duration-500 ease-out hover:px-12",
                textWhite
                  ? "bg-white/15 backdrop-blur-md border border-white/25 text-white hover:bg-white/25 hover:border-white/40 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                  : "bg-black/10 backdrop-blur-md border border-black/20 text-[#1A1A1A] hover:bg-black/20 hover:border-black/30 hover:shadow-[0_0_24px_rgba(0,0,0,0.1)]"
              )}
            >
              <span className="absolute inset-x-0 top-0 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/50" />
              <span className="relative z-10 group-hover:tracking-[0.45em] transition-all duration-500">
                {status === 'authenticated' ? 'Mi Perfil' : 'Sign In'}
              </span>
            </Link>
          </div>

          {/* Menú mobile */}
          <button
            className={cn(
              "relative z-10 md:hidden transition-colors duration-300",
              textWhite ? "text-white" : "text-[#1A1A1A]"
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
