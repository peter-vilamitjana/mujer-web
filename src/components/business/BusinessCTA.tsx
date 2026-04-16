import Link from 'next/link';

export default function BusinessCTA() {
  return (
    <section className="py-24 px-8 lg:px-20 bg-white dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto">

        {/* CTA principal — más ancho y con más padding */}
        <div
          className="relative rounded-[3rem] overflow-hidden"
          style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.025)' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[80px] pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.015)' }} />

          {/* Contenido */}
          <div className="relative z-10 px-16 md:px-32 py-24 text-center">

            <span className="text-[9px] uppercase tracking-[0.4em] font-inter block mb-8"
              style={{ color: 'rgba(255,255,255,0.2)' }}>
              ¿Lista para el cambio?
            </span>

            <h2 className="font-vogue text-6xl md:text-8xl text-white mb-6 leading-[0.88]">
              Elevá tu<br/>
              <span className="italic" style={{ color: 'rgba(255,255,255,0.35)' }}>estándar.</span>
            </h2>

            <p className="text-base font-light font-inter mb-12 max-w-lg mx-auto leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              Unite a la red de salones más sofisticada del país.
              Empezá hoy mismo tu transformación digital.
            </p>

            {/* Stats horizontales */}
            <div className="flex items-center justify-center gap-12 mb-14">
              {[
                { value: '+340', label: 'Salones activos' },
                { value: '42k', label: 'Reservas / mes' },
                { value: '98%', label: 'Satisfacción' },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-12">
                  <div className="text-center">
                    <div className="font-vogue text-2xl text-white">{stat.value}</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] font-inter mt-1"
                      style={{ color: 'rgba(255,255,255,0.25)' }}>{stat.label}</div>
                  </div>
                  {i < 2 && <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-5">
              <Link
                href="/business/register"
                className="group relative px-14 py-5 rounded-full font-inter
                  transition-all duration-500 ease-out hover:px-20
                  inline-flex items-center bg-[#0a0a0a] text-white dark:bg-white dark:text-black
                  hover:bg-black/90 dark:hover:bg-[#0a1a0a] hover:text-green-400 dark:hover:text-green-400
                  outline outline-0 hover:outline-[3px] hover:outline-green-500 hover:outline-offset-[6px]
                  hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]"
              >
                <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300">
                  <span className="group-hover:hidden">Comenzar ahora — es gratis</span>
                  <span className="hidden group-hover:inline">Potenciando tu negocio</span>
                </span>
              </Link>
              <p className="text-[10px] font-inter italic" style={{ color: 'rgba(255,255,255,0.18)' }}>
                Sin contratos a largo plazo. Sin tarjeta de crédito.
              </p>
            </div>
          </div>
        </div>

        {/* Footer mínimo */}
        <div className="mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-black/[0.05] dark:border-white/[0.05]"
        >
          <span className="font-vogue text-xl italic text-[#0a0a0a]/50 dark:text-white/35">
            Ouleeh Pro
          </span>
          <div className="flex gap-10">
            {['Privacidad', 'Términos', 'Soporte'].map(item => (
              <a key={item} href="#"
                className="text-[10px] uppercase tracking-widest font-inter transition-colors text-[#0a0a0a]/35 dark:text-white/18 hover:text-[#0a0a0a]/60 dark:hover:text-white/50"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
