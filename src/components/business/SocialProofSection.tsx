import { Star, CalendarCheck, MessageSquareOff, TrendingUp } from 'lucide-react';

const stats = [
  { icon: CalendarCheck, label: 'Turnos gestionados sin papel', value: 'Agenda digital' },
  { icon: MessageSquareOff, label: 'Menos interrupciones por llamadas', value: 'WhatsApp auto' },
  { icon: TrendingUp, label: 'Visibilidad del negocio en tiempo real', value: 'Dashboard vivo' },
];

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
    <section className="relative z-10 bg-[#09090b]">
      <div className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
          Lo que dicen
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          Salones que ya lo usan
        </h2>
        <p className="text-zinc-500 text-sm mt-3">
          Dueñas de Palermo, Recoleta y Belgrano que cambiaron el caos por claridad.
        </p>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={value}
            className="flex items-center gap-3 rounded-xl bg-[#141414] border border-white/[0.06]
              px-4 py-3"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-400/[0.08] border border-emerald-400/[0.15]
              flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{value}</p>
              <p className="text-[10px] text-zinc-600 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map(({ quote, name, salon, initials }) => (
          <div
            key={name}
            className="rounded-2xl bg-[#141414] border border-white/[0.06] p-6
              hover:border-white/[0.12] transition-colors duration-200"
          >
            <div className="flex mb-3" aria-label="5 estrellas">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
              ))}
            </div>
            <p className="font-playfair text-base text-white italic leading-relaxed mb-5">
              &ldquo;{quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
              <div className="w-8 h-8 rounded-full bg-emerald-400/[0.10] border border-emerald-400/[0.20]
                flex items-center justify-center shrink-0" aria-hidden="true">
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
      </div>
    </section>
  );
}
