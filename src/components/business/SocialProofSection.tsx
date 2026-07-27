'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatedHeadline } from '@/components/ui/AnimatedHeadline';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.16, 1, 0.3, 1] as const;

const numericStats = [
  {
    value: 2400,
    suffix: '+',
    label: 'turnos gestionados por mes',
    color: 'text-violet-400',
  },
  {
    value: 91,
    suffix: '%',
    label: 'tasa de retención de clientas',
    color: 'text-emerald-400',
  },
  {
    value: 5,
    suffix: ' min',
    label: 'para configurar tu salón',
    color: 'text-violet-300',
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
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  // Countup — numbers tick from 0 to target when the stat scrolls into view
  useGSAP(() => {
    if (shouldReduce) return;

    gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el) => {
      const target = parseInt(el.dataset.value ?? '0', 10);
      const suffix = el.dataset.suffix ?? '';
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val).toLocaleString('es-AR') + suffix;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    });
  }, { scope: sectionRef, dependencies: [shouldReduce] });

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-[#09090b] overflow-hidden"
    >
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 100%, rgba(52,211,153,0.05) 0%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="relative py-36 px-6 max-w-5xl mx-auto">

        {/* ── Heading ─────────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Lo que dicen
          </p>
          <AnimatedHeadline
            tag="h2"
            className="font-playfair text-[clamp(3rem,6vw,5rem)] text-white font-bold leading-[1.05] tracking-[-0.02em]"
          >
            Salones que ya lo usan
          </AnimatedHeadline>
          <p className="text-zinc-500 text-[0.95rem] mt-5 max-w-sm mx-auto leading-relaxed">
            Dueñas de Palermo, Recoleta y Belgrano que cambiaron el caos por claridad.
          </p>
        </div>

        {/* ── Numeric stats — GSAP countup ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {numericStats.map(({ value, suffix, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-2xl px-5 py-6
                backdrop-blur-xl bg-zinc-900/40 border border-white/[0.06]
                hover:-translate-y-0.5 hover:bg-zinc-800/50 hover:border-white/[0.10]
                transition-all duration-300 cursor-default text-center"
            >
              <span
                className={`stat-number text-4xl font-bold tabular-nums ${color}`}
                data-value={value}
                data-suffix={suffix}
                aria-label={`${value.toLocaleString('es-AR')}${suffix} ${label}`}
              >
                {/* Fallback for reduced-motion / no-JS */}
                {shouldReduce ? `${value.toLocaleString('es-AR')}${suffix}` : '0'}
              </span>
              <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonial cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map(({ quote, name, salon, initials }, i) => (
            <motion.div
              key={name}
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 36, scale: 0.97, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.65, delay: i * 0.10, ease: EASE }}
              className="group relative rounded-3xl p-8 overflow-hidden cursor-default
                backdrop-blur-xl bg-zinc-900/40 border border-white/[0.05]
                hover:-translate-y-1 hover:bg-zinc-800/50 hover:border-white/[0.10]
                transition-all duration-300"
            >
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

              <p className="text-[0.95rem] font-normal text-zinc-300 leading-[1.75] mb-7">
                &ldquo;{quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                <div
                  className="w-9 h-9 rounded-full border border-violet-400/[0.22] flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(168,85,247,0.10) 100%)' }}
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
