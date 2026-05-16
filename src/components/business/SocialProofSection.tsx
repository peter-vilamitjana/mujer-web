'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Star, CalendarCheck, MessageSquareOff, TrendingUp } from 'lucide-react';
import { useRef } from 'react';

const stats = [
  { icon: CalendarCheck, label: 'Turnos sin papel', value: 'Agenda digital', color: 'text-purple-400', iconBg: 'bg-white/5 border-white/10' },
  { icon: MessageSquareOff, label: 'Sin interrupciones', value: 'WhatsApp auto', color: 'text-emerald-400', iconBg: 'bg-white/5 border-white/10' },
  { icon: TrendingUp, label: 'Negocio en tiempo real', value: 'Dashboard vivo', color: 'text-amber-400', iconBg: 'bg-white/5 border-white/10' },
];

const testimonials = [
  {
    quote: 'Antes perdía 2 horas por semana en WhatsApp. Ahora mis clientas reservan solas y yo me entero por la app.',
    name: 'Valentina G.',
    salon: 'Maison de Beauté · Palermo',
    initials: 'V',
    color: 'bg-white/10 border-white/10 text-white',
  },
  {
    quote: 'El dashboard me muestra en 5 segundos cómo está el negocio. Nunca tuve eso antes.',
    name: 'Martina R.',
    salon: 'Studio Lumière · Recoleta',
    initials: 'M',
    color: 'bg-white/10 border-white/10 text-white',
  },
  {
    quote: 'Cero cancelaciones sorpresa desde que uso los recordatorios automáticos de WhatsApp.',
    name: 'Carolina S.',
    salon: 'Aura Wellness · Belgrano',
    initials: 'C',
    color: 'bg-white/10 border-white/10 text-white',
  },
];

export default function SocialProofSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: '-80px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-50px' });
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative z-10 bg-[#09090b] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" aria-hidden="true" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 100%, rgba(52,211,153,0.08) 0%, transparent 80%)' }}
        aria-hidden="true"
      />

      <div className="relative py-28 px-6 max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Lo que dicen
          </p>
          <h2 className="font-playfair text-[clamp(2.2rem,5vw,3.5rem)] text-white italic leading-tight">
            Salones que{' '}
            <span className="text-emerald-400">ya lo usan</span>
          </h2>
          <p className="text-zinc-500 text-[0.95rem] mt-4 max-w-sm mx-auto leading-relaxed">
            Dueñas de Palermo, Recoleta y Belgrano que cambiaron el caos por claridad.
          </p>
        </motion.div>

        {/* Trust signals */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map(({ icon: Icon, label, value, color, iconBg }, i) => (
            <motion.div
              key={value}
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 rounded-2xl backdrop-blur-xl
                bg-white/[0.03] border border-white/[0.07] px-5 py-4"
            >
              <div className={`w-10 h-10 rounded-2xl ${iconBg} border flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{value}</p>
                <p className="text-[11px] text-zinc-600 leading-tight mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ quote, name, salon, initials, color }, i) => (
            <motion.div
              key={name}
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 36, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-3xl p-6 overflow-hidden cursor-default
                backdrop-blur-xl bg-white/[0.03] border border-white/[0.07]
                hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4" aria-label="5 estrellas">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                ))}
              </div>

              <p className="font-playfair text-[1rem] text-white italic leading-[1.65] mb-6">
                &ldquo;{quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${color}`}>
                  <span className="font-playfair text-sm font-bold">{initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-[11px] text-zinc-600 leading-tight">{salon}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
