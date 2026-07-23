import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ appointmentId?: string }>;
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const { appointmentId } = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto" />
        <h1 className="font-playfair text-4xl text-white">¡Seña pagada!</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Tu turno quedó confirmado. Recibirás la confirmación por WhatsApp en los próximos minutos.
        </p>
        {appointmentId && (
          <p className="text-zinc-600 text-xs font-mono">Ref: {appointmentId}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="lg">
            <Link href={`/salones/${tenantSlug}/dashboard`}>Ver mis turnos</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
