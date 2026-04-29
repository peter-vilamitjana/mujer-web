import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function PaymentPendingPage({ params }: Props) {
  const { tenantSlug } = await params;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <Clock className="w-20 h-20 text-amber-400 mx-auto" />
        <h1 className="font-playfair text-4xl text-white">Pago en proceso</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Tu pago está siendo procesado. Te notificaremos por WhatsApp cuando se confirme. Mientras tanto, tu turno está reservado.
        </p>
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
