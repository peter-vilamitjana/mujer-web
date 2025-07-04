import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="relative flex items-center justify-center lg:order-2">
           <div className="absolute inset-0 z-0">
            <Image
              src="https://cdn.thumbor.leadformance.com/media/clients/5e15eee0ec40d1c7741dd946/501bd8ef-356a-4e1d-97e4-1f2456c30390-loreal-professionnel-6.jpg"
              alt="Mujer con un peinado elegante en una peluquería"
              fill
              style={{ objectFit: 'cover' }}
              className="opacity-90"
              data-ai-hint="woman hairstyle"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent lg:bg-gradient-to-r" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-8 lg:items-start lg:text-left lg:p-16 lg:order-1">
          <div className="max-w-md space-y-6">
            <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight">
              Mujer.
              <span className="block text-primary text-3xl md:text-4xl mt-2">Estilismo y Belleza</span>
            </h1>

            <p className="text-lg text-muted-foreground">
              Gestioná tu salón de forma sencilla y elegante. Toda la información de tus clientas y turnos en un solo lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto"
                >
                  Acceder a mi cuenta
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
               <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                   className="group w-full sm:w-auto"
                >
                  Soy una clienta
                </Button>
              </Link>
            </div>
             <p className="text-xs text-muted-foreground pt-4">
              ¿No tienes una cuenta? <Link href="/login" className="text-primary hover:underline">Contacta al administrador</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
