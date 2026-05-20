import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSalonBySlug, getSalonServices, getSalonStaff } from '@/lib/services/marketplace.service';
import { notFound } from 'next/navigation';
import BookingFlowClient from './BookingFlowClient';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function BookPage({ params }: Props) {
  const { tenantSlug } = await params;

  // Sesión opcional — no redirigir si no hay (guest checkout habilitado)
  const session = await getServerSession(authOptions);

  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  const [services, staff] = await Promise.all([
    getSalonServices(salon.id),
    getSalonStaff(salon.id),
  ]);

  return (
    <div className="container mx-auto mt-4 px-2">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold mb-1 tracking-tight">Reservar turno en {salon.name}</h1>
        <p className="text-sm text-muted-foreground">Elegí tus servicios, profesional y horario.</p>
      </div>
      <BookingFlowClient
        tenantId={salon.id}
        tenantSlug={tenantSlug}
        services={services}
        staff={staff}
        isAuthenticated={!!session}
      />

    </div>
  );
}
