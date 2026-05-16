'use client';

import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

const headingLines = ['Tu salón merece', 'una herramienta mejor.'];

export default function CTAFinalSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative z-10 bg-[#09090b] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" aria-hidden="true" />

      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[120%]"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(168,85,247,0.14) 0%, rgba(52,211,153,0.06) 40%, transparent 70%)' }}
          animate={shouldReduce ? {} : { opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Left orb */}
        <motion.div
          className="absolute -left-40 top-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)' }}
          animate={shouldReduce ? {} : { x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Right orb */}
        <motion.div
          className="absolute -right-40 top-1/3 w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 70%)' }}
          animate={shouldReduce ? {} : { x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      <div ref={ref} className="relative z-10 py-36 px-6 text-center max-w-3xl mx-auto">
        {/* Eyebrow */}
        <motion.p
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-8"
        >
          Empezá hoy
        </motion.p>

        {/* Headline — line by line */}
        <h2 className="font-playfair text-[clamp(2.6rem,7vw,5.5rem)] leading-[1.05] tracking-[-0.02em] mb-8" aria-label="Tu salón merece una herramienta mejor.">
          {headingLines.map((line, i) => (
            <motion.span
              key={line}
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 36, filter: 'blur(8px)' }}
              animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.85, delay: 0.1 + i * 0.16, ease: [0.22, 1, 0.36, 1] }}
              className={`block ${i === 1 ? 'italic text-purple-400' : 'text-white'}`}
            >
              {line}
            </motion.span>
          ))}
        </h2>

        {/* Body */}
        <motion.p
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="text-zinc-400 text-[clamp(1rem,2vw,1.15rem)] leading-[1.75] mb-12"
        >
          Gratis para siempre en el plan base.{' '}
          <span className="text-zinc-500">Sin permanencia, sin letra chica.</span>
        </motion.p>

        {/* CTA button */}
        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.75, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5"
        >
          <Link
            href="/business/register"
            className="group inline-flex items-center gap-3.5 px-12 py-5 rounded-full
              bg-white text-zinc-950 font-bold text-sm tracking-wide min-h-[52px]
              shadow-[0_0_50px_rgba(255,255,255,0.20)] hover:shadow-[0_0_70px_rgba(255,255,255,0.32)]
              hover:bg-zinc-100 active:scale-[0.97] transition-all duration-200 cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Registrá tu salón gratis en Ouleeh"
          >
            Registrá tu salón gratis
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            />
          </Link>

          <p className="text-zinc-600 text-xs tracking-wide">
            Sin tarjeta de crédito · Configuración en 5 minutos
          </p>
        </motion.div>

        {/* Decorative floating badges */}
        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-3"
          aria-hidden="true"
        >
          {['🇦🇷 Hecho para Argentina', 'MercadoPago nativo', 'WhatsApp nativo', 'Dark mode premium'].map((badge) => (
            <span
              key={badge}
              className="text-[11px] text-zinc-600 px-3.5 py-1.5 rounded-full
                backdrop-blur-xl bg-white/[0.03] border border-white/[0.07]"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
