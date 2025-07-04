import LandingHeader from '@/components/landing/LandingHeader';
import Hero from '@/components/landing/Hero';
import Promotions from '@/components/landing/Promotions';
import Availability from '@/components/landing/Availability';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Promotions />
        <Availability />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
