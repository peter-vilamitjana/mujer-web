import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTAFinalSection() {
  return (
    <section className="relative z-10 bg-[#09090b] py-32 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div
          className="w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.10), transparent)' }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
          Empezá hoy
        </p>
        <h2 className="font-playfair text-5xl text-white italic leading-tight mb-6">
          Tu salón merece<br />una herramienta mejor.
        </h2>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
          Gratis para siempre en el plan base.
          <br className="hidden sm:block" />
          Sin permanencia, sin letra chica.
        </p>
        <Link
          href="/business/register"
          className="inline-flex items-center gap-3 px-10 py-5 bg-white text-zinc-950
            font-black text-[12px] uppercase tracking-widest rounded-full
            hover:bg-zinc-100 active:scale-[0.98] transition-colors duration-200
            cursor-pointer focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-white/60 min-h-[44px]"
          aria-label="Registrá tu salón gratis en Ouleeh"
        >
          Registrá tu salón gratis
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <p className="text-zinc-600 text-xs mt-6 tracking-wide">
          Sin tarjeta de crédito · Configuración en 5 minutos
        </p>
      </div>
    </section>
  );
}
