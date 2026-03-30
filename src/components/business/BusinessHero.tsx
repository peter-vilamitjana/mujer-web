import Link from 'next/link';

export default function BusinessHero() {
  return (
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

          {/* Imagen */}
          <div className="relative hidden lg:block h-full py-16">
            <div className="relative h-full min-h-[580px] rounded-[2.5rem] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=80"
                alt="Salón de belleza moderno"
                className="w-full h-full object-cover"
                style={{ filter: 'contrast(1.08) brightness(0.75)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/50 dark:to-[#050505]/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-[#050505]/60 via-transparent to-transparent" />

              {/* Badge flotante */}
              <div className="absolute bottom-8 left-6 right-6">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-inter">Hoy — en vivo</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[9px] text-green-400 font-inter font-semibold">Activo</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-vogue text-2xl text-white">12 turnos</div>
                      <div className="text-[10px] text-white/35 font-inter mt-0.5">94% ocupación</div>
                    </div>
                    <div className="text-right">
                      <div className="font-vogue text-2xl text-white">$45.2k</div>
                      <div className="text-[10px] text-green-400 font-inter mt-0.5">+12% este mes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
