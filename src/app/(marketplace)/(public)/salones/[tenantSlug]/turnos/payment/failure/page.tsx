import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function PaymentFailurePage({ params }: Props) {
  const { tenantSlug } = await params;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <XCircle className="w-20 h-20 text-red-400 mx-auto" />
        <h1 className="font-playfair text-4xl text-white">El pago no se completó</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          No se procesó ningún cobro. Tu turno quedó pendiente de seña. Podés intentar de nuevo cuando quieras.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="lg">
            <Link href={`/salones/${tenantSlug}/turnos`}>Volver al turno</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/salones/${tenantSlug}/dashboard`}>Ver mis turnos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
