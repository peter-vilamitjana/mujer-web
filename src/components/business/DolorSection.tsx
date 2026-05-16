'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { MessageCircle, Calendar, DollarSign, UserX, Clock, Phone } from 'lucide-react';
import { useRef } from 'react';

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
  index,
}: {
  icon: React.ElementType;
  quote: string;
  description: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 36, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-3xl p-6 overflow-hidden cursor-default
        backdrop-blur-xl bg-white/[0.03] border border-white/[0.07]
        hover:border-red-400/[0.20] hover:bg-red-500/[0.03]
        transition-colors duration-300"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(248,113,113,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-red-500/[0.08] border border-red-400/[0.15]
          flex items-center justify-center mb-5 group-hover:border-red-400/[0.30]
          group-hover:bg-red-500/[0.12] transition-all duration-300">
          <Icon className="w-5 h-5 text-red-400" aria-hidden="true" />
        </div>

        <p className="font-playfair text-[1.05rem] text-white italic leading-snug mb-3">
          &ldquo;{quote}&rdquo;
        </p>
        <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export default function DolorSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative z-10 bg-[#09090b] overflow-hidden">
      {/* Subtle top separator */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" aria-hidden="true" />

      <div className="py-28 px-6 max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            El problema
          </p>
          <h2 className="font-playfair text-[clamp(2.2rem,5vw,3.5rem)] text-white italic leading-tight">
            ¿Te suena familiar?
          </h2>
          <p className="text-zinc-500 text-[0.95rem] mt-4 max-w-sm mx-auto leading-relaxed">
            Cada dueña de salón pasa por esto. No tenés que seguir así.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pains.map(({ icon, quote, description }, i) => (
            <PainCard
              key={quote}
              icon={icon}
              quote={quote}
              description={description}
              index={i}
            />
          ))}
        </div>

        {/* Bridge to solution */}
        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 text-center"
        >
          <p className="text-zinc-500 text-sm">
            Con Ouleeh,{' '}
            <span className="text-white font-semibold">todo eso queda atrás.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
