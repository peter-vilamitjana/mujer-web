import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BusinessCTA() {
  return (
    <section className="py-24 px-8 lg:px-20 bg-[#09090b]">
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

            <h2 className="font-playfair text-6xl md:text-8xl text-white mb-6 leading-[0.88]">
              Elevá tu<br/>
              <span className="italic" style={{ color: 'rgba(255,255,255,0.35)' }}>estándar.</span>
            </h2>

            <p className="text-base font-light font-inter mb-12 max-w-lg mx-auto leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              Unite a la red de salones más sofisticada del país.
              Empezá hoy mismo tu transformación digital.
            </p>

            {/* Value props (sin stats falsos) */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
              {[
                'Gratis para empezar',
                'Sin tarjeta de crédito',
                'Configuración en 5 minutos',
              ].map((pill) => (
                <span
                  key={pill}
                  className="px-4 py-2 rounded-full border border-white/[0.08] text-[11px] text-white/40 font-inter uppercase tracking-wider"
                >
                  {pill}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-5">
              <Link
                href="/business/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-zinc-950 font-black text-[12px] uppercase tracking-widest rounded-full hover:bg-zinc-100 active:scale-[0.98] transition-all duration-200"
              >
                Registrá tu salón gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[10px] font-inter italic" style={{ color: 'rgba(255,255,255,0.18)' }}>
                Sin contratos a largo plazo. Sin tarjeta de crédito.
              </p>
            </div>
          </div>
        </div>

        {/* Footer mínimo */}
        <div className="mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/[0.05]">
          <span className="font-playfair text-xl italic text-white/35">
            Ouleeh Pro
          </span>
          <div className="flex gap-10">
            {['Privacidad', 'Términos', 'Soporte'].map(item => (
              <a key={item} href="#"
                className="text-[10px] uppercase tracking-widest font-inter transition-colors text-white/18 hover:text-white/50"
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
