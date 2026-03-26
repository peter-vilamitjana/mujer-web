import { notFound } from 'next/navigation';
import { getSalonBySlug } from '@/lib/services/marketplace.service';
import SalonHero from '@/components/salon/SalonHero';
import SalonFeaturedServices from '@/components/salon/SalonFeaturedServices';

interface Props {
  params: { tenantSlug: string };
}

export async function generateMetadata({ params }: Props) {
  const salon = await getSalonBySlug(params.tenantSlug);
  if (!salon) return { title: 'Salón no encontrado' };
  return {
    title: `${salon.name} | MujerApp`,
    description: `Reservá tu turno en ${salon.name}`,
  };
}

export default async function SalonPage({ params }: Props) {
  const salon = await getSalonBySlug(params.tenantSlug);
  if (!salon) notFound();

  return (
    <div className="min-h-screen">
      <SalonHero
        tenantSlug={params.tenantSlug}
        salonName={salon.name}
      />
      <SalonFeaturedServices
        tenantId={salon.id}
        tenantSlug={params.tenantSlug}
      />
    </div>
  );
}
