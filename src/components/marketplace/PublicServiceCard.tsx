import { Card, CardContent } from '@/components/ui/card';
import type { Service } from '@/lib/schema';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PublicServiceCard({ service }: { service: Service }) {
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  let displayPrice = '';
  if (typeof service.price === 'number') {
    displayPrice = formatPrice(service.price);
  } else if (service.price && typeof service.price === 'object') {
    displayPrice = `Desde ${formatPrice(service.price.corto)}`;
  }

  const formatDuration = (mins: number) => {
    if (!mins) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m} min`;
  };

  return (
    <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
      <CardContent className="p-5 flex flex-col h-full gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg leading-tight">{service.name}</h4>
          {service.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{formatDuration(service.durationMinutes)}</span>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-dashed">
          <span className="font-bold text-primary">{displayPrice}</span>
          <Link href={`/login`}>
            <Button size="sm" variant="outline">Reservar</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
