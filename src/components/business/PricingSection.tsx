import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

const freeFeatures = ['Agenda online', 'Perfil público', 'WhatsApp automático', 'Hasta 3 profesionales'];

const premiumFeatures = [
  'Todo lo del plan base',
  'Profesionales ilimitados',
  'Reportes y métricas',
  'Cobro online con MercadoPago',
  'CRM completo de clientas',
  'Soporte prioritario',
];

export default function PricingSection() {
  return (
    <section className="py-24 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
          Precios
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          Empezá gratis, crecé sin límites
        </h2>
        <p className="text-zinc-500 text-sm mt-3">
          Sin permanencia. Sin tarjeta de crédito para el plan gratuito.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Plan Base */}
        <div className="rounded-2xl bg-[#141414] border border-white/[0.06] p-8 flex flex-col">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Plan Base
          </p>
          <div className="mb-6">
            <span className="font-playfair text-5xl text-white italic">Gratis</span>
            <p className="text-zinc-500 text-sm mt-1">Para siempre</p>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-zinc-600 shrink-0" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/business/register"
            className="block text-center py-4 rounded-full border border-white/[0.12]
              text-zinc-400 font-bold text-[11px] uppercase tracking-widest
              hover:border-white/[0.28] hover:text-white transition-colors duration-200
              cursor-pointer focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-white/30 min-h-[44px] flex items-center justify-center"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Plan Premium */}
        <div className="rounded-2xl bg-emerald-400/[0.04] border border-emerald-400/[0.22] p-8 relative overflow-hidden flex flex-col">
          {/* Glow sutil */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full
            bg-emerald-400/[0.06] blur-2xl pointer-events-none" />

          <div className="absolute top-4 right-4">
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/[0.10]
              border border-emerald-400/[0.20] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Más popular
            </span>
          </div>

          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Plan Premium
          </p>
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="font-playfair text-5xl text-white italic">Próximamente</span>
            </div>
            <p className="text-zinc-500 text-sm mt-1">Precio en pesos argentinos</p>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/business/register"
            className="flex items-center justify-center gap-2 py-4 rounded-full
              bg-white text-zinc-950 font-black text-[11px] uppercase tracking-widest
              hover:bg-zinc-100 active:scale-[0.98] transition-colors duration-200
              cursor-pointer focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-white/60 min-h-[44px]"
          >
            Empezar gratis ahora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
