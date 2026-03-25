import { notFound } from 'next/navigation';
import { getSalonBySlug, getSalonStaff } from '@/lib/services/marketplace.service';
import SalonHeader from '@/components/salon/SalonHeader';
import SalonHero from '@/components/salon/SalonHero';
import SalonFeaturedServices from '@/components/salon/SalonFeaturedServices';
import PublicStaffCard from '@/components/marketplace/PublicStaffCard';

interface Props {
  params: { tenantSlug: string };
}

export async function generateMetadata({ params }: Props) {
  const salon = await getSalonBySlug(params.tenantSlug);
  if (!salon) return { title: 'Salón no encontrado | MujerApp' };
  return {
    title: `${salon.name} | MujerApp`,
    description: `Reservá tu turno en ${salon.name}`,
  };
}

export default async function SalonPage({ params }: Props) {
  const salon = await getSalonBySlug(params.tenantSlug);
  if (!salon) notFound();

  const staff = await getSalonStaff(salon.id);

  return (
    <div className="min-h-screen">
      <SalonHeader tenantSlug={params.tenantSlug} salonName={salon.name} />
      <SalonHero tenantSlug={params.tenantSlug} salonName={salon.name} />
      <SalonFeaturedServices tenantId={salon.id} tenantSlug={params.tenantSlug} />
      {staff.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center uppercase">
            Nuestro Equipo
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {staff.map(member => (
              <PublicStaffCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
