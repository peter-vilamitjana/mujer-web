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
  return (
    <div
      className="relative rounded-2xl p-6 overflow-hidden cursor-default shrink-0 w-full
        bg-zinc-900/50 backdrop-blur-sm border border-white/[0.05]"
    >
      <div className="relative z-10">
        {/* Icon badge */}
        <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/[0.20]
          flex items-center justify-center mb-4">
          <Icon className="w-4 h-4 text-rose-400" aria-hidden="true" />
        </div>

        {/* Primary pain quote — centre of attention */}
        <p className="font-playfair text-[0.98rem] text-zinc-200 italic font-medium leading-snug mb-2.5">
          &ldquo;{quote}&rdquo;
        </p>

        {/* Supporting description — secondary hierarchy */}
        <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </div>
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

  return (
    // Outer div: Framer Motion entrance animation only — no continuous loop here
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/*
        Inner div: CSS animation drives the continuous marquee scroll.
        Using CSS (not Framer Motion) so `animation-play-state` can be
        toggled by the `group-hover:[animation-play-state:paused]` class —
        Framer Motion's JS loop ignores that CSS property entirely.

        The `group` context lives on the grid wrapper two levels up;
        hovering anywhere inside the grid propagates the group-hover signal
        here, freezing all three columns simultaneously.
      */}
      <div
        className="flex flex-col gap-4 pb-4 will-change-transform group-hover:[animation-play-state:paused]"
        style={{
          animation: shouldReduce
            ? 'none'
            : `pain-scroll-${direction} ${duration}s linear infinite`,
        }}
      >
        {/* Three full copies = seamless loop (only 1/3 visible at a time) */}
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
      </div>
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

      {/* Atmospheric background — rose vignette, more sophisticated than pure red */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(244,63,94,0.045) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="py-24 w-full flex flex-col items-center">
        {/* Heading */}
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

        {/*
          Grid wrapper — two responsibilities:
          1. `group`: provides the hover scope so group-hover in children fires
             whenever the cursor enters anywhere inside this div.
          2. `[mask-image:...]`: CSS mask that fades cards at top + bottom,
             creating the cinematographic "cards emerging from darkness" effect.
             Uses `-webkit-mask-image` for Safari + `mask-image` for modern browsers
             (Tailwind's arbitrary `[mask-image:...]` only emits the unprefixed form,
             so we apply both via the style prop for full cross-browser support).
          3. `overflow-hidden`: required so the mask clips correctly and the
             infinite scroll doesn't leak outside the container.
        */}
        <div
          className="group w-full px-6 flex justify-center gap-6 mt-8 max-h-[520px] overflow-hidden"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
            maskImage:
              'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
          }}
        >
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

      </div>

      {/*
        ── Bridge: "Con Ouleeh, todo eso queda atrás." ──────────────────
        Standalone block separated from the pain grid so it gets its own
        breathing room (py-24) without stacking on top of the grid's padding.

        Blur-to-focus: both lines start blurred (filter: blur 12px), at 95%
        scale and fully transparent. As the block enters the viewport,
        opacity→1, scale→1 and blur→0 in ~700ms. The second line is delayed
        120ms so it appears to resolve just after the first — reinforcing the
        "the solution becomes clear" mental model.
      */}
      <div className="w-full py-24 flex flex-col items-center gap-3 text-center px-6">
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0, scale: 0.95, filter: 'blur(12px)' }}
          whileInView={shouldReduce ? {} : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans font-bold text-zinc-100 text-[clamp(1.5rem,3.5vw,2.2rem)] tracking-tight leading-none"
        >
          Con Ouleeh,
        </motion.p>
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0, scale: 0.95, filter: 'blur(12px)' }}
          whileInView={shouldReduce ? {} : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="font-playfair font-normal italic text-transparent bg-clip-text
            bg-gradient-to-r from-violet-400 to-fuchsia-500
            text-[clamp(1.8rem,4.5vw,2.8rem)] leading-none"
        >
          todo eso queda atrás.
        </motion.p>
      </div>
    </section>
  );
}
