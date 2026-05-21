'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Store, Share2, LayoutDashboard } from 'lucide-react';
import { useRef } from 'react';

const steps = [
  {
    step: '01',
    title: 'Creá tu perfil',
    description: 'Registrá tu salón en 5 minutos. Cargá tus servicios, tu equipo y tus horarios.',
    icon: Store,
    color: 'text-emerald-300',
    glow: 'rgba(110,231,183,0.16)',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/[0.03]',
    iconBg: 'bg-emerald-300/[0.08] border-emerald-300/[0.18]',
  },
  {
    step: '02',
    title: 'Compartí tu link',
    description: 'Cada salón tiene su página propia. Compartila por WhatsApp e Instagram.',
    icon: Share2,
    color: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.18)',
    border: 'border-emerald-400/25',
    bg: 'bg-emerald-400/[0.04]',
    iconBg: 'bg-emerald-400/[0.08] border-emerald-400/[0.20]',
  },
  {
    step: '03',
    title: 'Gestioná todo acá',
    description: 'Tu agenda, tus clientes y tus cobros — en un solo lugar, desde cualquier dispositivo.',
    icon: LayoutDashboard,
    color: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.18)',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/[0.04]',
    iconBg: 'bg-emerald-400/[0.08] border-emerald-400/[0.15]',
  },
];

function StepCard({
  step,
  title,
  description,
  icon: Icon,
  color,
  glow,
  border,
  bg,
  iconBg,
  index,
}: (typeof steps)[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 44, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col items-center text-center rounded-3xl
        p-8 overflow-hidden backdrop-blur-xl ${bg} border ${border}
        cursor-pointer transition-all duration-300
        hover:-translate-y-1 hover:border-emerald-400/50
        hover:shadow-[0_0_28px_rgba(52,211,153,0.14)]`}
    >
      {/* Glow overlay on hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${glow} 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Step number box + centered icon badge */}
        <div className="relative mb-10">
          <div className="w-20 h-20 rounded-3xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.09]
            flex flex-col items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            <p className="text-[8px] text-zinc-600 uppercase tracking-[0.35em] font-bold mb-0.5">Paso</p>
            {/* Removed italic; font-light for elegant thin numerals */}
            <p className={`font-playfair text-3xl font-light ${color}`}>{step}</p>
          </div>
          {/* Icon centered below the step box */}
          <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-xl ${iconBg} border
            flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)]`}>
            <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
          </div>
        </div>

        {/* Bold white title */}
        <h3 className="font-playfair text-xl font-bold text-white mb-3">{title}</h3>
        {/* Brighter muted text for better readability */}
        <p className="text-sm text-zinc-400 leading-relaxed max-w-[220px]">{description}</p>
      </div>
    </motion.div>
  );
}

export default function ComoFuncionaSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  return (
    <section id="como-funciona" className="relative z-10 bg-[#09090b] scroll-mt-20 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" aria-hidden="true" />

      <div className="py-28 px-6 max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Simple por diseño
          </p>
          <h2 className="font-playfair text-[clamp(2.2rem,5vw,3.5rem)] text-white italic leading-tight">
            En 3 pasos,{' '}
            <span className="text-emerald-400">tu salón online</span>
          </h2>
          {/* Brighter subtitle for legibility */}
          <p className="text-zinc-300 font-semibold text-[0.95rem] mt-4 max-w-sm mx-auto leading-relaxed">
            Sin configuraciones complicadas. Sin soporte técnico necesario.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/*
            Dos segmentos de línea dashed, uno por cada gap entre cards.
            gap-5 = 1.25rem. Cada segmento ocupa exactamente ese gap.
            top: 50% centra la línea verticalmente en las cards.
            Fórmula de posición:
              gap 1: left = 1 columna = calc((100% - 2 * 1.25rem) / 3)
              gap 2: left = 2 columnas + 1 gap = calc(2 * (100% - 2 * 1.25rem) / 3 + 1.25rem)
          */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="hidden md:block absolute pointer-events-none h-px"
              style={{
                top: '50%',
                left: i === 0
                  ? 'calc((100% - 2 * 1.25rem) / 3)'
                  : 'calc(2 * (100% - 2 * 1.25rem) / 3 + 1.25rem)',
                width: '1.25rem',
                backgroundImage:
                  'repeating-linear-gradient(to right, rgba(52,211,153,0.30) 0, rgba(52,211,153,0.30) 4px, transparent 4px, transparent 9px)',
              }}
              aria-hidden="true"
            />
          ))}

          {steps.map((s, i) => (
            <StepCard key={s.step} {...s} index={i} />
          ))}
        </div>

        {/* CTA primario centrado */}
        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mt-14"
        >
          <a
            href="/business/register"
            className="inline-flex items-center gap-2 bg-emerald-400 text-zinc-900 font-bold
              px-8 py-4 rounded-2xl text-sm tracking-wide cursor-pointer
              hover:bg-emerald-300 active:scale-[0.98]
              transition-all duration-200
              shadow-[0_8px_28px_rgba(52,211,153,0.28)]"
          >
            Crear mi salón
          </a>
        </motion.div>
      </div>
    </section>
  );
}
