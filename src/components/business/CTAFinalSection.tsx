import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTAFinalSection() {
  return (
    <section className="py-32 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08), transparent)' }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-4">
          Empezá hoy
        </p>
        <h2 className="font-playfair text-5xl text-white italic leading-tight mb-6">
          Tu salón merece<br />una herramienta mejor.
        </h2>
        <p className="text-zinc-400 text-lg mb-10">
          Gratis para siempre en el plan base.
          Sin permanencia, sin letra chica.
        </p>
        <Link
          href="/business/register"
          className="inline-flex items-center gap-3 px-10 py-5 bg-white text-zinc-950
            font-black text-[12px] uppercase tracking-widest rounded-full
            hover:bg-zinc-100 active:scale-[0.98] transition-all"
        >
          Registrá tu salón gratis
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-zinc-600 text-xs mt-6">
          Sin tarjeta de crédito · Configuración en 5 minutos
        </p>
      </div>
    </section>
  );
}
