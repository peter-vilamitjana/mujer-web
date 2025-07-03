import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="absolute top-0 left-0 w-full p-4 md:p-6 z-20">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-violet-200 via-pink-200 to-blue-200 animate-[move-bg_20s_ease-in-out_infinite]"
            style={{ backgroundSize: '400% 400%' }}
          ></div>
           <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-6 text-center p-4">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Gestión de belleza, reinventada.</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tighter text-foreground md:text-6xl lg:text-7xl">
                Eleva la experiencia de tu salón
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                Organiza citas, gestiona clientes y potencia tu negocio con una herramienta tan elegante como tu trabajo.
            </p>
            <Link href="/dashboard">
                <Button size="lg" className="group shadow-lg shadow-primary/20">
                    Acceder al Panel
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>
      </main>

      <footer className="relative z-10 w-full p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Mujer Web. Todos los derechos reservados.
      </footer>
    </div>
  );
}
