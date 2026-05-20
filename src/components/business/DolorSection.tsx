'use client';

import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { MessageCircle, Calendar, DollarSign, UserX, Clock, Phone } from 'lucide-react';

const pains = [
  {
    icon: MessageCircle,
    quote: 'Seño, ¿me das turno para el viernes?',
    description: 'Confirmaciones por WhatsApp que se pierden entre mensajes.',
  },
  {
    icon: Calendar,
    quote: 'Metí dos clientas a la misma hora... de nuevo.',
    description: 'Sin sistema centralizado, los errores de agenda son inevitables.',
  },
  {
    icon: DollarSign,
    quote: '¿Cuánto gané este mes? No tengo idea.',
    description: 'Sin registros claros, no sabés si tu negocio crece o se estanca.',
  },
  {
    icon: UserX,
    quote: 'Se fue y nunca más llamó. ¿Qué hice mal?',
    description: 'Sin seguimiento, perdés clientas que simplemente se olvidaron de volver.',
  },
  {
    icon: Clock,
    quote: 'Hoy perdí dos horas solo ordenando turnos.',
    description: 'Tiempo que podrías dedicar a tu trabajo lo gastás en administración.',
  },
  {
    icon: Phone,
    quote: 'Me llamaron en pleno tinturado. La tercera vez hoy.',
    description: 'Interrupciones constantes que afectan la calidad de tu servicio.',
  },
];

function PainCard({
  icon: Icon,
  quote,
  description,
}: {
  icon: React.ElementType;
  quote: string;
  description: string;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduce ? {} : { y: -6, scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="group relative rounded-3xl p-6 overflow-hidden cursor-default
        backdrop-blur-xl bg-white/[0.02] border border-white/[0.06]
        hover:border-red-400/20 hover:bg-red-500/[0.03]
        transition-colors duration-300 w-full shrink-0"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(248,113,113,0.07) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="w-9 h-9 rounded-2xl bg-red-500/[0.06] border border-red-400/[0.12]
          flex items-center justify-center mb-4 group-hover:border-red-400/[0.25]
          group-hover:bg-red-500/[0.10] transition-all duration-300">
          <Icon className="w-4.5 h-4.5 text-red-400" aria-hidden="true" />
        </div>

        <p className="font-playfair text-[0.98rem] text-white italic leading-snug mb-2.5">
          &ldquo;{quote}&rdquo;
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

type Pain = { icon: React.ElementType; quote: string; description: string };

const PainColumn = ({
  className,
  pains,
  duration = 24,
  direction = 'down',
  delay = 0,
}: {
  className?: string;
  pains: Pain[];
  duration?: number;
  direction?: 'up' | 'down';
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  const yKeyframes = direction === 'up' ? ['-33.333%', '0%'] : ['0%', '-33.333%'];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={shouldReduce ? {} : { y: yKeyframes }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-4 pb-4 will-change-transform"
      >
        {[0, 1, 2].map((idx) => (
          <React.Fragment key={idx}>
            {pains.map(({ icon, quote, description }: Pain, i: number) => (
              <PainCard
                key={`${idx}-${i}`}
                icon={icon}
                quote={quote}
                description={description}
              />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </motion.div>
  );
};

const col1 = [pains[0], pains[1]];
const col2 = [pains[2], pains[3]];
const col3 = [pains[4], pains[5]];

export default function DolorSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative z-10 bg-[#09090b] overflow-hidden w-full">
      {/* Top separator */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
        aria-hidden="true"
      />

      {/* Atmospheric background — warm red vignette to reinforce the pain theme */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(239,68,68,0.055) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="py-24 w-full flex flex-col items-center">
        {/* Staggered heading — each element animates independently */}
        <div ref={headingRef} className="text-center mb-12 px-6 max-w-xl">
          <motion.p
            initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3"
          >
            El problema
          </motion.p>

          <motion.h2
            initial={shouldReduce ? {} : { opacity: 0, y: 22 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.13, ease: [0.22, 1, 0.36, 1] }}
            className="font-playfair text-[clamp(2.2rem,5vw,3.5rem)] text-white italic leading-tight"
          >
            ¿Te suena familiar?
          </motion.h2>

          <motion.p
            initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-zinc-500 text-xs mt-3.5 leading-relaxed"
          >
            Cada dueña de salón pasa por esto. No tenés que seguir así.
          </motion.p>
        </div>

        {/* Vertically scrolling columns — col2 goes opposite direction */}
        <div className="w-full px-6 flex justify-center gap-6 mt-8 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] max-h-[520px] overflow-hidden">
          <PainColumn
            pains={col1}
            className="flex-1 max-w-[360px] w-full"
            duration={24}
            direction="down"
            delay={0.1}
          />
          <PainColumn
            pains={col2}
            className="hidden sm:block flex-1 max-w-[360px] w-full"
            duration={32}
            direction="up"
            delay={0.2}
          />
          <PainColumn
            pains={col3}
            className="hidden lg:block flex-1 max-w-[360px] w-full"
            duration={27}
            direction="down"
            delay={0.3}
          />
        </div>

        {/* Bridge to solution */}
        <div className="mt-16 text-center px-6 flex flex-col items-center gap-3">
          <motion.span
            initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans font-extrabold text-white text-[clamp(1.5rem,3.5vw,2.2rem)] tracking-tight leading-none"
          >
            Con Ouleeh,
          </motion.span>
          <motion.span
            initial={shouldReduce ? {} : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.13, ease: [0.22, 1, 0.36, 1] }}
            className="font-playfair font-normal italic text-purple-300 text-[clamp(1.8rem,4.5vw,2.8rem)] leading-none"
          >
            todo eso queda atrás.
          </motion.span>
        </div>
      </div>
    </section>
  );
}
