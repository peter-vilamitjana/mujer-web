import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Salón de belleza"
        layout="fill"
        objectFit="cover"
        className="z-0 opacity-20"
        data-ai-hint="bright salon interior"
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center bg-gradient-to-t from-background via-transparent to-transparent p-4 text-center">
        <header className="absolute top-0 left-0 w-full p-4 md:p-6">
          <Logo />
        </header>

        <main className="flex flex-col items-center justify-center space-y-6">
          <h1 className="font-headline text-7xl font-bold tracking-tight text-primary md:text-8xl lg:text-9xl">
            Mujer
          </h1>
          <p className="max-w-xl text-lg text-foreground/80 md:text-xl">
            Estilismo y Belleza. Gestiona tus clientas y turnos de forma
            sencilla y elegante.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="group">
              Acceso del Personal
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </main>
        
        <footer className="absolute bottom-0 w-full p-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mujer Web. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
