'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { CalendarCheck, MessageSquareOff, TrendingUp } from 'lucide-react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  {
    icon: CalendarCheck,
    label: 'Turnos sin papel',
    value: 'Agenda digital',
    accent: 'rgba(139,92,246,0.14)',
    iconColor: 'text-violet-400',
  },
  {
    icon: MessageSquareOff,
    label: 'Sin interrupciones',
    value: 'WhatsApp auto',
    accent: 'rgba(52,211,153,0.12)',
    iconColor: 'text-emerald-400',
  },
  {
    icon: TrendingUp,
    label: 'Negocio en tiempo real',
    value: 'Dashboard vivo',
    accent: 'rgba(139,92,246,0.10)',
    iconColor: 'text-violet-300',
  },
];

const testimonials = [
  {
    quote:
      'Antes perdía 2 horas por semana en WhatsApp. Ahora mis clientas reservan solas y yo me entero por la app.',
    name: 'Valentina G.',
    salon: 'Maison de Beauté · Palermo',
    initials: 'V',
  },
  {
    quote:
      'El dashboard me muestra en 5 segundos cómo está el negocio. Nunca tuve eso antes.',
    name: 'Martina R.',
    salon: 'Studio Lumière · Recoleta',
    initials: 'M',
  },
  {
    quote:
      'Cero cancelaciones sorpresa desde que uso los recordatorios automáticos de WhatsApp.',
    name: 'Carolina S.',
    salon: 'Aura Wellness · Belgrano',
    initials: 'C',
  },
];

export default function SocialProofSection() {
  const headingRef  = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const inView      = useInView(headingRef, { once: true, margin: '-80px' });
  const statsInView = useInView(statsRef,   { once: true, margin: '-50px' });
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative z-10 bg-[#09090b] overflow-hidden">
      {/* Top separator */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
        aria-hidden="true"
      />

      {/* Ambient glow — warm emerald at the bottom edge, consistent with brand */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 100%, rgba(52,211,153,0.05) 0%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="relative py-28 px-6 max-w-5xl mx-auto">

        {/* ── Heading ─────────────────────────────────────────────────────── */}
        <motion.div
          ref={headingRef}
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center mb-14"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Lo que dicen
          </p>
          <h2 className="font-playfair text-[clamp(2.2rem,5vw,3.5rem)] text-white font-bold leading-tight">
            Salones que{' '}
            <span className="text-emerald-400 font-normal italic">ya lo usan</span>
          </h2>
          <p className="text-zinc-500 text-[0.95rem] mt-5 max-w-sm mx-auto leading-relaxed">
            Dueñas de Palermo, Recoleta y Belgrano que cambiaron el caos por claridad.
          </p>
        </motion.div>

        {/* ── Trust signals ────────────────────────────────────────────────── */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value, accent, iconColor }, i) => (
            <motion.div
              key={value}
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.97 }}
              animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.55, delay: i * 0.06, ease: EASE }}
              className="group flex items-center gap-4 rounded-2xl px-5 py-4
                backdrop-blur-xl bg-zinc-900/40 border border-white/[0.06]
                hover:-translate-y-0.5 hover:bg-zinc-800/50 hover:border-white/[0.10]
                transition-all duration-300 cursor-default"
            >
              {/* Icon badge — uses per-stat accent tint */}
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/[0.08]"
                style={{ background: accent }}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{value}</p>
                <p className="text-[11px] text-zinc-600 leading-tight mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Testimonial cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map(({ quote, name, salon, initials }, i) => (
            <motion.div
              key={name}
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 32, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
              className="group relative rounded-3xl p-8 overflow-hidden cursor-default
                backdrop-blur-xl bg-zinc-900/40 border border-white/[0.05]
                hover:-translate-y-1 hover:bg-zinc-800/50 hover:border-white/[0.10]
                transition-all duration-300"
            >
              {/* Five stars — muted amber-gold, understated elegance */}
              <div className="flex gap-1 mb-6" aria-label="5 estrellas">
                {[...Array(5)].map((_, j) => (
                  <svg
                    key={j}
                    className="w-3 h-3"
                    viewBox="0 0 12 12"
                    fill="rgba(180,150,80,0.70)"
                    aria-hidden="true"
                  >
                    <path d="M6 0l1.545 3.13 3.455.502-2.5 2.436.59 3.44L6 7.87 2.91 9.508l.59-3.44L1 3.632l3.455-.502z" />
                  </svg>
                ))}
              </div>

              {/* Quote — sans-serif, no italic, comfortable reading weight */}
              <p className="text-[0.95rem] font-normal text-zinc-300 leading-[1.75] mb-7">
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                <div
                  className="w-9 h-9 rounded-full border border-white/[0.10] flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <span className="font-playfair text-sm font-semibold text-white">{initials}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">{name}</p>
                  <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">{salon}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
