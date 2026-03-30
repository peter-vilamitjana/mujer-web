'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string | undefined;
  const loginUrl = tenantSlug ? `/salones/${tenantSlug}/login` : '/login';
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header 
        className={cn(
            "fixed top-0 w-full z-50 transition-transform duration-700 pt-6 px-6",
            scrolled ? "-translate-y-[10px]" : "translate-y-0"
        )} 
        id="main-header"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="liquid-glass rounded-full px-10 py-5 flex justify-between items-center theme-transition">
          <div className="flex items-center gap-4">
            <span className="font-vogue text-3xl font-black tracking-tighter uppercase text-brand-primary">Mujer</span>
            <div className="w-px h-6 bg-black/20 dark:bg-white/20"></div>
            <span className="text-[9px] tracking-[0.5em] uppercase opacity-40 font-bold hidden sm:block text-brand-primary">Volume No. 01</span>
          </div>
          <nav className="hidden md:flex gap-12 items-center">
            <a className="nav-link text-brand-primary" href="#">L'Atelier</a>
            <a className="nav-link text-brand-primary" href="#">Édition</a>
            <a className="nav-link text-brand-primary" href="#">Membres</a>

            {/* Toggle dark/light — solo se renderiza después del mount para evitar hydration mismatch */}
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Alternar tema"
                className="w-8 h-8 flex items-center justify-center rounded-full text-brand-primary opacity-60 hover:opacity-100 transition-opacity"
              >
                {theme === 'dark' ? (
                  // Ícono sol — indica que clickear va a light
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  // Ícono luna — indica que clickear va a dark
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            )}

            <Link 
                className="text-[10px] uppercase tracking-[0.3em] font-bold bg-[#1A1A1A] text-white dark:bg-white dark:text-black px-8 py-3 rounded-full hover:opacity-90 transition-all font-inter theme-transition" 
                href={loginUrl}
            >
                Sign In
            </Link>
          </nav>
          <button className="md:hidden text-brand-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
