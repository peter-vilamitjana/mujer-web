'use client';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Calendar, Menu } from 'lucide-react';

export default function LandingHeader() {
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
        if (entry.isIntersecting) {
          setIsDarkTheme(true);
        } else {
          setIsDarkTheme(false);
        }
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
      "fixed top-0 z-50 w-full transition-all duration-500",
      scrolled
        ? isDarkTheme
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10"
          : "bg-white/80 backdrop-blur-lg border-b border-black/5"
        : "bg-transparent"
    )}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo className={cn(
          "transition-colors duration-500",
          (!scrolled || isDarkTheme) && "md:[&_span]:text-white"
        )} />

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button
              variant="outline"
              className={cn(
                'rounded-full py-1.5 px-4 text-sm font-medium transition-all duration-500 ease-in-out',
                scrolled
                  ? isDarkTheme
                    ? 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'border-primary text-primary hover:text-white hover:bg-primary hover:shadow-[0_0_10px_rgba(127,70,246,0.4)]'
                  : 'border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
              )}
            >
              Acceder
            </Button>
          </Link>
          <Link href="/login">
            <Button className={cn(
              "transition-all duration-500",
              isDarkTheme && "bg-white text-primary hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            )}>
              <Calendar className="mr-2 h-4 w-4" />
              Reservar Turno
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
