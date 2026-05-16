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
    color: 'text-purple-400',
    glow: 'rgba(168,85,247,0.20)',
    border: 'border-purple-400/[0.20]',
    bg: 'bg-purple-400/[0.05]',
    iconBg: 'bg-purple-400/[0.08] border-purple-400/[0.15]',
  },
  {
    step: '02',
    title: 'Compartí tu link',
    description: 'Cada salón tiene su página propia. Compartila por WhatsApp e Instagram.',
    icon: Share2,
    color: 'text-amber-400',
    glow: 'rgba(234,179,8,0.18)',
    border: 'border-amber-400/[0.20]',
    bg: 'bg-amber-400/[0.04]',
    iconBg: 'bg-amber-400/[0.08] border-amber-400/[0.15]',
  },
  {
    step: '03',
    title: 'Gestioná todo acá',
    description: 'Tu agenda, tus clientes y tus cobros — en un solo lugar, desde cualquier dispositivo.',
    icon: LayoutDashboard,
    color: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.18)',
    border: 'border-emerald-400/[0.20]',
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
        hover:border-opacity-60 transition-colors duration-300`}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${glow} 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Step number + icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.09]
            flex flex-col items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            <p className="text-[8px] text-zinc-600 uppercase tracking-[0.35em] font-bold mb-0.5">Paso</p>
            <p className={`font-playfair text-3xl italic ${color}`}>{step}</p>
          </div>
          <div className={`absolute -bottom-3 -right-3 w-9 h-9 rounded-xl ${iconBg} border
            flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)]`}>
            <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
          </div>
        </div>

        <h3 className="font-playfair text-xl text-white mb-3">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-[220px]">{description}</p>
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
          <p className="text-zinc-500 text-[0.95rem] mt-4 max-w-sm mx-auto leading-relaxed">
            Sin configuraciones complicadas. Sin soporte técnico necesario.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Connector line — desktop only */}
          <motion.div
            initial={shouldReduce ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: 0, left: 'calc(16.67% + 3.5rem)', right: 'calc(16.67% + 3.5rem)' }}
            className="hidden md:block absolute top-10 h-px
              bg-gradient-to-r from-purple-400/20 via-amber-400/20 to-emerald-400/20"
            aria-hidden="true"
          />

          {steps.map((s, i) => (
            <StepCard key={s.step} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
