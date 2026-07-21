'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { GlassButton } from '@/components/ui/apple-tahoe-liquid-glass-button';
import { getSalonHeaderInfo } from '@/actions/tenant.actions';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingHeader() {
  const { data: session, status } = useSession();
  const [overHero, setOverHero] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [salon, setSalon] = useState<{ name: string; slug: string } | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  const salonSlug = useMemo(() => {
    const match = pathname?.match(/^\/salones\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Nav flotante: se "levanta" 10px al pasar los primeros 50px de scroll, y el
  // texto/fondo cambian de modo "sobre el hero" a "sobre contenido" al bajar
  // el 85% de la altura de viewport. Antes esto corría en un listener de
  // window.scroll mutando estilos a mano en cada tick — acá queda resuelto
  // con dos ScrollTrigger que solo notifican en el cruce del umbral.
  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top -50px',
      onEnter: () => gsap.set(header, { top: '-10px' }),
      onLeaveBack: () => gsap.set(header, { top: '0px' }),
    });

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: () => `+=${window.innerHeight * 0.85}`,
      onToggle: (self) => setOverHero(self.isActive),
    });
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    if (!salonSlug) {
      setSalon(null);
      return;
    }
    let cancelled = false;
    getSalonHeaderInfo(salonSlug).then((info) => {
      if (!cancelled) setSalon(info);
    });
    return () => {
      cancelled = true;
    };
  }, [salonSlug]);

  const textWhite = (mounted && theme === 'dark') || overHero;

  const navLinks = salon
    ? [{ label: 'Reservar turno', href: `/salones/${salon.slug}/book` }]
    : [
        { label: 'Reservar turno', href: '/explore' },
        { label: 'Sumá tu salón', href: '/business' },
      ];

  const logoHref = salon ? `/salones/${salon.slug}` : '/';
  const logoLabel = salon?.name ?? 'Ouleeh';

  return (
    <header
      id="main-header"
      ref={headerRef}
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
          <Link href={logoHref} className="flex items-center min-w-0">
            <span className={cn(
              'font-vogue text-3xl font-black tracking-tighter uppercase transition-colors duration-300 truncate',
              textWhite ? 'text-white' : 'text-[#1A1A1A]'
            )}>
              {logoLabel}
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map(({ label, href }) => (
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

          {/* ── Mobile menu toggle ── */}
          <button
            className={cn(
              'md:hidden transition-colors duration-300',
              textWhite ? 'text-white' : 'text-[#1A1A1A]'
            )}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>

          {/* ── Mobile menu panel ── */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-3 rounded-[2rem] overflow-hidden bg-white/95 dark:bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.25)] flex flex-col p-2">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-5 py-3 rounded-2xl text-[13px] font-semibold uppercase tracking-wide text-[#1A1A1A] dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors"
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push(status === 'authenticated' ? '/perfil' : '/login');
                }}
                className="px-5 py-3 rounded-2xl text-[13px] font-semibold uppercase tracking-wide text-left text-[#1A1A1A] dark:text-white hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors"
              >
                {status === 'authenticated' ? 'Mi Perfil' : 'Iniciar sesión'}
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
