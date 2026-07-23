import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSalonBySlug, getSalonServices, getSalonStaff } from '@/lib/services/marketplace.service';
import { notFound } from 'next/navigation';
import BookingFlowClient from './BookingFlowClient';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { tenantSlug } = await params;
  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) return { title: 'Salón no encontrado' };

  return {
    title: `Reservar Turno | ${salon.name}`,
    description: `Agendá tu turno online en ${salon.name}. Seleccioná servicios, profesional y horario de forma simple y rápida.`,
  };
}

export default async function TurnosPage({ params }: Props) {
  const { tenantSlug } = await params;

  // Sesión opcional — guest checkout habilitado
  const session = await getServerSession(authOptions);

  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  const [services, staff] = await Promise.all([
    getSalonServices(salon.id),
    getSalonStaff(salon.id),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto max-w-4xl px-4 pt-48 lg:pt-40 pb-16">
        <div className="mb-10 text-center">
          <h1 className="font-vogue text-3xl md:text-4xl text-on-surface tracking-tight mb-2">Reservar turno en {salon.name}</h1>
          <p className="font-sans text-sm text-on-surface-secondary">Elegí tus servicios, profesional y horario.</p>
        </div>
        <BookingFlowClient
          tenantId={salon.id}
          tenantSlug={tenantSlug}
          services={services}
          staff={staff}
          isAuthenticated={!!session}
        />
      </div>
    </div>
  );
}
