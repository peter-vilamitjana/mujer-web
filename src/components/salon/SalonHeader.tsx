'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Calendar, Menu } from 'lucide-react';

interface SalonHeaderProps {
  tenantSlug: string;
  salonName: string;
}

export default function SalonHeader({ tenantSlug, salonName }: SalonHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Observer for dark sections
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px 0px 0px', // Header height
      threshold: [0, 0.1, 0.5, 0.9, 1]
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        setIsDarkTheme(entry.isIntersecting);
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const darkSection = document.getElementById('testimonios');
    if (darkSection) observer.observe(darkSection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (darkSection) observer.unobserve(darkSection);
    };
  }, []);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500 isolate",
      scrolled ? "border-b border-white/10" : "bg-transparent border-transparent"
    )}>
      <div 
        className={cn(
          "liquid-glass-lens absolute inset-0 -z-10 transition-opacity duration-500 pointer-events-none",
          scrolled ? "opacity-100" : "opacity-0"
        )} 
      />
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/salones/${tenantSlug}`} className={cn(
          "flex items-center transition-colors duration-500",
          (!scrolled || isDarkTheme) && "md:[&_span]:text-white"
        )}>
          <span className="font-serif text-2xl font-bold text-[#9D6EFE] tracking-tight transition-colors uppercase">
            {salonName}
          </span>
        </Link>

        {/* Mobile Action Button */}
        <div className="md:hidden">
          <Link href={`/salones/${tenantSlug}/login`}>
            <Button
              variant="outline"
              className={cn(
                'rounded-full py-1.5 px-4 text-sm font-medium transition-all duration-500 ease-in-out',
                scrolled
                  ? isDarkTheme
                    ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                    : 'bg-primary text-white border-primary shadow-lg hover:bg-primary/90'
                  : 'bg-primary text-white border-primary shadow-lg hover:bg-primary/90'
              )}
            >
              Acceder
            </Button>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link href={`/salones/${tenantSlug}/login`}>
            <Button
              variant="outline"
              className={cn(
                'rounded-full py-1.5 px-4 text-sm font-medium transition-all duration-500 ease-in-out',
                scrolled
                  ? isDarkTheme
                    ? 'border-white/20 bg-white/5 text-white hover:text-white hover:bg-primary hover:border-primary hover:shadow-[0_0_15px_rgba(127,70,246,0.4)]'
                    : 'border-primary text-primary hover:text-white hover:bg-primary hover:shadow-[0_0_10px_rgba(127,70,246,0.4)]'
                  : 'border-white/20 bg-white/10 text-white backdrop-blur-sm hover:text-white hover:bg-primary hover:border-primary hover:shadow-[0_0_15px_rgba(127,70,246,0.4)]'
              )}
            >
              Acceder
            </Button>
          </Link>
          <Button asChild className={cn(
            "transition-all duration-500",
            isDarkTheme && "bg-white text-primary hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          )}>
            <Link href={`/salones/${tenantSlug}/turnos`}>
              <Calendar className="mr-2 h-4 w-4" />
              Reservar Turno
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
