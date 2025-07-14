'use client';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      scrolled ? "bg-card/80 backdrop-blur-lg border-b" : "bg-transparent"
    )}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo className={cn("transition-colors", !scrolled && "[&_span]:text-white")} />
        <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className={cn(
                  'rounded-full py-1.5 px-4 text-sm font-medium transition-all duration-300 ease-in-out hover:text-white hover:bg-primary hover:shadow-[0_0_10px_rgba(127,70,246,0.4)]',
                  !scrolled 
                    ? 'border-white/20 bg-white/10 text-white backdrop-blur-sm'
                    : 'border-primary text-primary'
                )}
              >
                Acceder
              </Button>
            </Link>
            <Link href="/login">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Reservar Turno
              </Button>
            </Link>
        </div>
      </div>
    </header>
  );
}
