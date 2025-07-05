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
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled ? "bg-card/80 backdrop-blur-lg border-b" : "bg-transparent"
    )}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant={scrolled ? "ghost" : "outline" } className={cn(!scrolled && "text-white border-white hover:bg-white hover:text-primary")}>Acceder</Button>
            </Link>
            <Link href="/turnos">
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
