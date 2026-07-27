import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function PaymentPendingPage({ params }: Props) {
  const { tenantSlug } = await params;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <Clock className="w-20 h-20 text-warning mx-auto" />
        <h1 className="font-vogue text-4xl text-on-surface">Pago en proceso</h1>
        <p className="font-sans text-on-surface-secondary text-lg leading-relaxed">
          Tu pago está siendo procesado. Te notificaremos por WhatsApp cuando se confirme. Mientras tanto, tu turno está reservado.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-primary text-surface hover:bg-primary-dark rounded-full font-sans uppercase tracking-widest text-xs font-semibold shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
            <Link href={`/salones/${tenantSlug}/dashboard`}>Ver mis turnos</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-outline-subtle text-on-surface hover:bg-surface-hover font-sans uppercase tracking-widest text-xs font-semibold">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
