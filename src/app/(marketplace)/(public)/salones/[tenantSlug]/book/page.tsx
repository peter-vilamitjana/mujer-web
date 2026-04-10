import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSalonBySlug, getSalonServices, getSalonStaff } from '@/lib/services/marketplace.service';
import { notFound } from 'next/navigation';
import BookingFlow from '@/components/marketplace/BookingFlow';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function BookPage({ params }: Props) {
  const { tenantSlug } = await params;
  // Verificar sesión en el servidor — si no hay sesión, redirigir a login
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?callbackUrl=/${tenantSlug}/book`);
  }

  // Obtener datos del salón
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
      <BookingFlow
        tenantId={salon.id}
        services={services}
        staff={staff}
      />
    </div>
  );
}
