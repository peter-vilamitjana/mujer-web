'use client';
import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';
import InfoBar from '@/components/landing/InfoBar';
import Combos from '@/components/landing/Combos';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <InfoBar />
        <Combos />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
