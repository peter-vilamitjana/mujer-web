'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string | undefined;

  const loginUrl = tenantSlug ? `/salones/${tenantSlug}/login` : '/login';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
        className={cn(
            "fixed top-0 w-full z-50 transition-transform duration-700 pt-6 px-6",
            scrolled ? "-translate-y-[10px]" : "translate-y-0"
        )} 
        id="main-header"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="liquid-glass rounded-full px-10 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-vogue text-3xl font-black tracking-tighter uppercase text-brand-primary">Mujer</span>
            <div className="w-px h-6 bg-black/20 dark:bg-white/20"></div>
            <span className="text-[9px] tracking-[0.5em] uppercase opacity-40 font-bold hidden sm:block text-brand-primary">Volume No. 01</span>
          </div>
          <nav className="hidden md:flex gap-12 items-center">
            <a className="nav-link text-brand-primary" href="#">L'Atelier</a>
            <a className="nav-link text-brand-primary" href="#">Édition</a>
            <a className="nav-link text-brand-primary" href="#">Membres</a>
            <Link 
                className="text-[10px] uppercase tracking-[0.3em] font-bold bg-[#1A1A1A] text-white dark:bg-white dark:text-black px-8 py-3 rounded-full hover:opacity-90 transition-all font-inter" 
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
