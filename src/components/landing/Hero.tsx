import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-24 md:py-32 lg:py-48 text-center bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-serif text-primary">
            Estilo, Belleza y Cuidado
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground">
            El cuidado que mereces, la belleza que buscas. Agendá tu próximo turno en segundos y déjanos realzar tu estilo.
          </p>
          <div className="mt-10">
            <Link href="/servicios">
              <Button size="lg" className="group">
                Reservar Turno
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
