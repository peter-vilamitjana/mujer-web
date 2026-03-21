import type { Tenant } from '@/lib/schema';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

export default function PublicSalonHero({ salon }: { salon: Tenant }) {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-muted flex flex-col md:flex-row items-center gap-8 p-6 md:p-12 shadow-sm border border-border/50">
      <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 border-4 border-background shadow-lg">
        {salon.logoUrl ? (
          <Image src={salon.logoUrl} alt={salon.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl text-primary font-bold">{salon.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">{salon.name}</h1>
        <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Reserva tu turno ahora</span>
        </div>
      </div>
    </section>
  );
}
