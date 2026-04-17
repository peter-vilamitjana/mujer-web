import Link from 'next/link';
import ScrollVideoHero from './ScrollVideoHero'

export default function BusinessHero() {
  return (
    <>
      {/* Copy section — unchanged */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-white dark:bg-[#050505]">

        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-black/[0.015] dark:bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 lg:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[calc(100vh-6rem)] overflow-visible">

            {/* Copy */}
            <div className="space-y-10 py-20 overflow-visible">

              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/8">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#0a0a0a]/35 dark:text-white/40 font-inter">
                  Elite Business Solution
                </span>
              </div>

              <div>
                <h1 className="font-vogue text-6xl md:text-7xl lg:text-8xl text-[#0a0a0a] dark:text-white leading-[0.9] mb-6">
                  Transformá<br/>
                  <span className="italic text-[#0a0a0a]/50 dark:text-white/35">tu salón.</span>
                </h1>
                <p className="text-lg text-[#0a0a0a]/50 dark:text-white/40 font-light leading-relaxed max-w-md font-inter">
                  Gestión sofisticada para el profesional contemporáneo.
                  Agenda, clientes, métricas y pagos — todo desde un solo lugar.
                </p>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-8 py-2">
                <div className="text-center">
                  <div className="font-vogue text-3xl text-[#0a0a0a] dark:text-white">+340</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#0a0a0a]/35 dark:text-white/25 font-inter mt-1">Salones activos</div>
                </div>
                <div className="w-px h-10 bg-black/10 dark:bg-white/10" />
                <div className="text-center">
                  <div className="font-vogue text-3xl text-[#0a0a0a] dark:text-white">42k</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#0a0a0a]/35 dark:text-white/25 font-inter mt-1">Reservas / mes</div>
                </div>
                <div className="w-px h-10 bg-black/10 dark:bg-white/10" />
                <div className="text-center">
                  <div className="font-vogue text-3xl text-[#0a0a0a] dark:text-white">Free</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#0a0a0a]/35 dark:text-white/25 font-inter mt-1">Para empezar</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/business/register"
                  className="group relative px-10 py-4 rounded-full font-inter
                    transition-all duration-500 ease-out hover:px-14
                    flex items-center bg-[#0a0a0a] text-white dark:bg-white dark:text-black
                    hover:bg-black/90 dark:hover:bg-[#0a1a0a] hover:text-green-400 dark:hover:text-green-400
                    outline outline-0 hover:outline-[3px] hover:outline-green-500 hover:outline-offset-[6px]
                    hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300">
                    <span className="group-hover:hidden">Comenzar gratis</span>
                    <span className="hidden group-hover:inline">Potenciando tu negocio</span>
                  </span>
                </Link>
                <Link
                  href="/explore"
                  className="px-10 py-4 rounded-full border border-black/15 dark:border-white/12 text-[#0a0a0a]/50 dark:text-white/45
                    text-[10px] font-bold uppercase tracking-widest font-inter
                    hover:border-black/30 hover:text-[#0a0a0a] dark:hover:border-white/25 dark:hover:text-white transition-all duration-300"
                >
                  Ver la plataforma
                </Link>
              </div>

              <p className="text-[10px] text-[#0a0a0a]/30 dark:text-white/18 font-inter italic">
                Sin contratos. Sin tarjeta de crédito. Onboarding en 10 minutos.
              </p>
            </div>

            {/* Right column — hidden on mobile, shown on desktop */}
            <div className="relative hidden lg:block h-full py-16">
              <div className="relative h-full min-h-[580px] rounded-[2.5rem] overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Scroll hacia abajo ↓</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Scroll video hero — Apple Studio Display animation */}
      <ScrollVideoHero
        totalFrames={96}
        framesPath="/frames/studio-display"
        frameExt="jpg"
      >
        <div className="text-center max-w-2xl px-6">
          <p className="text-[10px] text-emerald-400 uppercase tracking-[0.5em] font-bold mb-4">
            MujerApp para Negocios
          </p>
          <h2 className="font-playfair text-4xl text-white italic mb-3">
            Tu salón, en control total
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Agenda, clientes, cobros y métricas — todo en un lugar.
          </p>
        </div>
      </ScrollVideoHero>
    </>
  );
}
