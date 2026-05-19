'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

const headline = [
  { text: 'Tu salón,', accent: false },
  { text: 'sin el', accent: true },
  { text: 'caos.', accent: true },
];

function DashboardMockup() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0d0d0d]">
      <img 
        src="/landing/dashboard-preview.png?v=2" 
        alt="Dashboard Profesional Ouleeh" 
        className="w-full h-full object-cover object-top opacity-90 transition-opacity duration-500 hover:opacity-100"
      />
    </div>
  );
}

export default function BusinessHero() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="relative bg-[#09090b]"
      aria-label="Hero — Ouleeh para negocios"
      suppressHydrationWarning
    >
      {/* Ambient orbs — fixed behind everything */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%)' }}
          animate={shouldReduce ? {} : { scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -left-80 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)' }}
          animate={shouldReduce ? {} : { scale: [1, 1.10, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        />
        <motion.div
          className="absolute top-2/3 -right-60 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.07) 0%, transparent 70%)' }}
          animate={shouldReduce ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ContainerScroll — offsets the fixed navbar */}
      <div className="relative z-10 pt-28 lg:pt-36">
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center text-center">

              {/* Headline — word by word */}
              <h1
                className="font-playfair text-[clamp(3rem,8vw,7rem)] leading-[1.02] tracking-[-0.02em] mb-6"
                aria-label="Tu salón, sin el caos."
              >
                {headline.map(({ text, accent }, i) => (
                  <motion.span
                    key={text}
                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`inline-block mr-[0.22em] last:mr-0 ${accent ? 'italic text-purple-400' : 'text-white'}`}
                  >
                    {text}
                  </motion.span>
                ))}
              </h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-zinc-400 text-[clamp(0.95rem,2.5vw,1.15rem)] leading-[1.75] max-w-xl mb-10"
              >
                Agenda inteligente, clientas fidelizadas y cobros simples.{' '}
                <span className="text-zinc-500">
                  Diseñado para salones de Argentina.
                </span>
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link
                  href="/business/register"
                  className="group inline-flex items-center gap-3 px-9 py-4 rounded-full
                    bg-white text-zinc-950 font-bold text-sm tracking-wide min-h-[48px]
                    shadow-[0_8px_30px_rgb(255,255,255,0.12)] hover:shadow-[0_8px_30px_rgb(255,255,255,0.2)]
                    hover:bg-zinc-100 active:scale-[0.97] transition-all duration-200 cursor-pointer
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-label="Empezar gratis en Ouleeh"
                >
                  Empezar gratis
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full min-h-[48px]
                    backdrop-blur-xl bg-white/[0.05] border border-white/[0.12] text-white font-medium text-sm
                    hover:bg-white/[0.09] hover:border-white/[0.22] active:scale-[0.97]
                    transition-all duration-200 cursor-pointer"
                >
                  Ver cómo funciona
                </Link>
              </motion.div>
            </div>
          }
        >
          <DashboardMockup />
        </ContainerScroll>
      </div>
    </section>
  );
}
