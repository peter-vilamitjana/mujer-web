import { notFound } from 'next/navigation';
import {
  getSalonBySlug,
  getSalonServices,
  getSalonStaff,
} from '@/lib/services/marketplace.service';
import PublicSalonHero from '@/components/marketplace/PublicSalonHero';
import PublicServiceCard from '@/components/marketplace/PublicServiceCard';
import PublicStaffCard from '@/components/marketplace/PublicStaffCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

  // Si el slug no existe o el salón no es público → 404
  if (!salon) notFound();

  const [services, staff] = await Promise.all([
    getSalonServices(salon.id),
    getSalonStaff(salon.id),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 max-w-7xl">
      <PublicSalonHero salon={salon} />

      <div className="flex justify-center mt-6">
        <Link href={`/salones/${params.tenantSlug}/book`}>
          <Button size="lg" className="px-10 py-6 text-lg font-bold shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 rounded-2xl">
            Reservar turno online
          </Button>
        </Link>
      </div>

      {services.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Servicios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <PublicServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {staff.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Nuestro equipo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {staff.map(member => (
              <PublicStaffCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
