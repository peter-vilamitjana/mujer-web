import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F2F2F7]/50 md:bg-transparent">
      {/* Desktop Background (Hidden on mobile) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 hidden md:block"
        style={{ backgroundImage: "url('https://cdn.thumbor.leadformance.com/media/clients/5e15eee0ec40d1c7741dd946/501bd8ef-356a-4e1d-97e4-1f2456c30390-loreal-professionnel-6.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-12 md:py-0 md:h-[80vh] md:min-h-[500px] flex items-center justify-center">
        <div className="max-w-3xl mx-auto w-full">
          {/* Mobile view content (Visible only on mobile) */}
          <div className="md:hidden flex flex-col items-center justify-center w-full">
            <ScrollReveal direction="down" className="w-full flex justify-center">
              {/* Flex Container for Static Strip Layout - Vertically Centered */}
              <div className="relative w-full flex justify-center items-center gap-8 mb-6 overflow-visible">

                {/* Left Card (Decorative - Peek - Slightly focused) */}
                <div className="relative w-[200px] h-[360px] rounded-[2rem] overflow-hidden shrink-0 select-none pointer-events-none">
                  <img
                    src="/landing/hero-left.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Center Card (Original Hero - unchanged pixels) */}
                <div className="relative z-20 w-[320px] aspect-[4/5] shadow-xl rounded-[2rem] overflow-hidden shrink-0">
                  <img
                    src="/landing/hero-mobile.jpg"
                    alt="Mujer disfrutando"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Card (Decorative - Peek - Slightly focused) */}
                <div className="relative w-[200px] h-[360px] rounded-[2rem] overflow-hidden shrink-0 select-none pointer-events-none">
                  <img
                    src="/landing/hero-right.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="w-full flex flex-col items-center">
              <div className="text-center mb-4">
                <h1 className="font-serif text-3xl leading-tight text-black">
                  Tu belleza, <br />
                  <span className="text-[#9D6EFE] italic">nuestra pasión.</span>
                </h1>
              </div>
              <p className="text-muted-foreground text-xs max-w-[260px] mx-auto mb-8 leading-relaxed text-center">
                Expertas en resaltar tu esencia con servicios exclusivos y atención personalizada en un ambiente de lujo accesible.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4} direction="up" className="w-full">
              <div className="w-full max-w-[320px] mx-auto">
                <Link href="/login" className="w-full">
                  <Button size="lg" className="w-full bg-[#9D6EFE] hover:bg-[#8B5CF6] text-white rounded-full py-6 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3">
                    RESERVAR TURNO
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Desktop view content (Hidden on mobile) */}
          <div className="hidden md:block text-white text-center">
            <ScrollReveal direction="down">
              <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-sm uppercase">MUJER</h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-xl md:text-2xl font-light mb-10 tracking-widest uppercase opacity-90 drop-shadow-sm">Estilo & Belleza Profesional</p>
            </ScrollReveal>
            <ScrollReveal delay={0.4} direction="up">
              <Link href="/login">
                <Button size="lg" className="group bg-white text-primary hover:bg-white/90 rounded-full px-10 py-7 text-lg font-bold uppercase tracking-wider shadow-xl shadow-black/20 transition-all duration-500 hover:scale-105 active:scale-95">
                  Reservar Turno
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
