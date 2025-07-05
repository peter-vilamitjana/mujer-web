'use client';
import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import Promotions from '@/components/landing/Promotions';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function BookingCTA() {
  return (
    <section id="horarios" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">¿Lista para tu cambio de look?</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explora nuestros servicios y encuentra el horario perfecto para ti. Agendar tu cita es rápido, fácil y seguro.
        </p>
        <div className="mt-8">
          <Link href="/servicios">
            <Button size="lg">Ver Servicios y Agendar</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Promotions />
        <BookingCTA />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
