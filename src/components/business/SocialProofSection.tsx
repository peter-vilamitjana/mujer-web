import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: 'Antes perdía 2 horas por semana en WhatsApp. Ahora mis clientas reservan solas y yo me entero por la app.',
    name: 'Valentina G.',
    salon: 'Maison de Beauté · Palermo',
    initials: 'V',
  },
  {
    quote: 'El dashboard me muestra en 5 segundos cómo está el negocio. Nunca tuve eso antes.',
    name: 'Martina R.',
    salon: 'Studio Lumière · Recoleta',
    initials: 'M',
  },
  {
    quote: 'Cero cancelaciones sorpresa desde que uso los recordatorios automáticos de WhatsApp.',
    name: 'Carolina S.',
    salon: 'Aura Wellness · Belgrano',
    initials: 'C',
  },
];

export default function SocialProofSection() {
  return (
    <section className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-3">
          Lo que dicen
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          Salones que ya lo usan
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map(({ quote, name, salon, initials }) => (
          <div
            key={name}
            className="rounded-2xl bg-[#141414] border border-white/[0.06] p-6
              hover:border-white/[0.10] transition-all duration-300"
          >
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="font-playfair text-base text-white italic leading-relaxed mb-5">
              &ldquo;{quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
              <div className="w-8 h-8 rounded-full bg-emerald-400/[0.10] border border-emerald-400/[0.20]
                flex items-center justify-center shrink-0">
                <span className="font-playfair text-sm text-emerald-400">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{name}</p>
                <p className="text-[11px] text-zinc-600">{salon}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
