import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Great_Vibes } from 'next/font/google';

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
});

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-black text-white">
      <header className="absolute top-0 left-0 w-full p-4 md:p-6 z-20">
        <Logo className="text-white hover:text-gray-200 transition-colors" />
      </header>

      <main className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Mujer sonriendo en blanco y negro"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40"
            data-ai-hint="woman laughing"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-2 text-center p-4 -mt-8">
          <div
            className={`${greatVibes.variable} font-serif text-8xl md:text-9xl lg:text-[10rem] leading-none`}
          >
            Mujer
          </div>
          <p className="tracking-[0.3em] text-sm md:text-base text-gray-300 uppercase pb-8">
            SALÓN DE BELLEZA
          </p>

          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="group bg-transparent border-2 border-white text-white hover:bg-white hover:text-black rounded-md px-8 py-6 text-base transition-all duration-300"
            >
              Acceso Staff
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}