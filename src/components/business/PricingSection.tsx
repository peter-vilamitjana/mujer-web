import Link from 'next/link';
import { Check } from 'lucide-react';

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
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-3">
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
        <div className="rounded-2xl bg-[#141414] border border-white/[0.06] p-8">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-4">
            Plan Base
          </p>
          <div className="mb-6">
            <span className="font-playfair text-5xl text-white italic">Gratis</span>
            <p className="text-zinc-500 text-sm mt-1">Para siempre</p>
          </div>
          <ul className="space-y-3 mb-8">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-zinc-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/business/register"
            className="block text-center py-3.5 rounded-full border border-white/[0.12]
              text-zinc-400 font-bold text-[11px] uppercase tracking-widest
              hover:border-white/[0.25] hover:text-white transition-all"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Plan Premium */}
        <div className="rounded-2xl bg-emerald-400/[0.04] border border-emerald-400/[0.20] p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/[0.10]
              border border-emerald-400/[0.20] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Más popular
            </span>
          </div>

          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-4">
            Plan Premium
          </p>
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              {/* TODO Pedro: reemplazar con precio real en ARS cuando esté definido */}
              <span className="font-playfair text-5xl text-white italic">$X.XXX</span>
              <span className="text-zinc-500 text-sm">/ mes</span>
            </div>
            <p className="text-zinc-500 text-sm mt-1">En pesos argentinos</p>
          </div>
          <ul className="space-y-3 mb-8">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/business/register"
            className="block text-center py-3.5 rounded-full bg-white text-zinc-950
              font-black text-[11px] uppercase tracking-widest
              hover:bg-zinc-100 active:scale-[0.98] transition-all"
          >
            Empezar gratis →
          </Link>
        </div>

      </div>
    </section>
  );
}
