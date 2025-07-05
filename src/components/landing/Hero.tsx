import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center text-center text-white">
       <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('https://cdn.thumbor.leadformance.com/media/clients/5e15eee0ec40d1c7741dd946/501bd8ef-356a-4e1d-97e4-1f2456c30390-loreal-professionnel-6.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Estilo, Belleza y Cuidado
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-200">
            Registrate y gestioná tu turno fácil y rápido.
          </p>
          <div className="mt-10">
            <Link href="/login">
              <Button size="lg" className="group bg-white text-primary hover:bg-white/90">
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
