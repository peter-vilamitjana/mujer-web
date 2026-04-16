import { notFound } from 'next/navigation';
import { getSalonBySlug } from '@/lib/services/marketplace.service';
import SalonHero from '@/components/salon/SalonHero';
import SalonFeaturedServices from '@/components/salon/SalonFeaturedServices';
import InfoBar from '@/components/landing/InfoBar';
import PromoSection from '@/components/landing/PromoSection';
import Testimonials from '@/components/landing/Testimonials';
import MapAndReviews from '@/components/landing/MapAndReviews';
import Footer from '@/components/landing/Footer';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { tenantSlug } = await params;
  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) return { title: 'Salón no encontrado' };
  return {
    title: `${salon.name} | Ouleeh`,
    description: `Reservá tu turno en ${salon.name}`,
  };
}

export default async function SalonPage({ params }: Props) {
  const { tenantSlug } = await params;
  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  return (
    <div className="min-h-screen">
      <SalonHero
        tenantSlug={tenantSlug}
        salonName={salon.name}
      />
      <InfoBar />
      <SalonFeaturedServices
        tenantId={salon.id}
        tenantSlug={tenantSlug}
      />
      <PromoSection tenantSlug={tenantSlug} />
      <Testimonials />
      <MapAndReviews />
      <Footer tenantSlug={tenantSlug} />
    </div>
  );
}
