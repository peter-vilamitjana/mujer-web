'use client';

import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { MessageCircle, Calendar, DollarSign, UserX, Clock, Phone } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatedHeadline } from '@/components/ui/AnimatedHeadline';

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
        <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/[0.20]
          flex items-center justify-center mb-4">
          <Icon className="w-4 h-4 text-rose-400" aria-hidden="true" />
        </div>
        <p className="font-playfair text-[0.98rem] text-zinc-200 italic font-medium leading-snug mb-2.5">
          &ldquo;{quote}&rdquo;
        </p>
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
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="flex flex-col gap-4 pb-4 will-change-transform group-hover:[animation-play-state:paused]"
        style={{
          animation: shouldReduce
            ? 'none'
            : `pain-scroll-${direction} ${duration}s linear infinite`,
        }}
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
      </div>
    </motion.div>
  );
};

const col1 = [pains[0], pains[1]];
const col2 = [pains[2], pains[3]];
const col3 = [pains[4], pains[5]];

export default function DolorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  useGSAP(() => {
    if (shouldReduce) return;

    // ── Parallax — columnas con velocidades distintas de x ──────────────────
    // Targets son string selectors, que GSAP resuelve en el documento (no scoped).
    // El trigger '.dolor-section' también se resuelve globalmente por ScrollTrigger.
    gsap.to('.marquee-row-1', {
      x: '-5%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.dolor-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });

    gsap.to('.marquee-row-2', {
      x: '5%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.dolor-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });

    gsap.to('.marquee-row-3', {
      x: '-3%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.dolor-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.6,
      },
    });

    // ── Bridge pin — Apple AirPods Pro "Silence. Perfected." style ───────────
    // El bridge se pinea en el top del viewport durante 120vh de scroll.
    // Mientras dura el pin, el timeline anima el texto y el glow con scrub:0.8
    // (el playhead del timeline "alcanza" la posición de scroll suavemente).
    // Solo cuando el usuario scrollea más allá del end, el pin se libera
    // y SolucionesSection aparece.
    if (!bridgeRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: bridgeRef.current,
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });

    // Fase 1 (0%–30%): color de fondo transiciona de rose a neutral (ambos ~0 alpha — establece el interpolado)
    tl.fromTo(bridgeRef.current,
      { backgroundColor: 'rgba(244,63,94,0)' },
      { backgroundColor: 'rgba(139,92,246,0)', duration: 0.3 },
    )

    // Fase 2 (0%–50%): "Con Ouleeh," entra desde abajo con blur mientras se scrollea
    .fromTo('.bridge-line-1',
      { yPercent: 60, opacity: 0, filter: 'blur(20px)', scale: 0.92 },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.4, ease: 'power3.out' },
      0,
    )

    // Fase 3 (20%–70%): "todo eso queda atrás." entra 200ms después con el mismo gesto
    .fromTo('.bridge-line-2',
      { yPercent: 60, opacity: 0, filter: 'blur(20px)', scale: 0.92 },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.4, ease: 'power3.out' },
      0.2,
    )

    // Fase 4 (40%–80%): violeta de transición aparece en el fondo
    .fromTo('.bridge-bg-transition',
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      0.4,
    )

    // Fase 5 (50%–90%): glow central florece desde un punto
    .fromTo('.bridge-glow',
      { opacity: 0, scale: 0.4 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
      0.5,
    )

    // Fase final (85%–100%): todo se evapora al dejar la sección — sin corte abrupto
    .to(['.bridge-line-1', '.bridge-line-2'],
      { opacity: 0, yPercent: -20, filter: 'blur(8px)', duration: 0.15, ease: 'power2.in' },
      0.85,
    );
  }, { scope: sectionRef, dependencies: [shouldReduce] });

  return (
    <section
      ref={sectionRef}
      className="dolor-section relative z-10 bg-[#09090b] w-full"
    >
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(244,63,94,0.045) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Heading + marquee ────────────────────────────────────────────── */}
      <div className="py-24 w-full flex flex-col items-center">
        <div ref={headingRef} className="text-center mb-12 px-6 max-w-xl">
          <motion.p
            initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3"
          >
            El problema
          </motion.p>

          <AnimatedHeadline
            tag="h2"
            className="font-playfair text-[clamp(2.2rem,5vw,3.5rem)] text-white italic leading-tight"
          >
            ¿Te suena familiar?
          </AnimatedHeadline>

          <motion.p
            initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-zinc-500 text-xs mt-3.5 leading-relaxed"
          >
            Cada dueña de salón pasa por esto. No tenés que seguir así.
          </motion.p>
        </div>

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
            className="marquee-row-1 flex-1 max-w-[360px] w-full"
            duration={24}
            direction="down"
            delay={0.1}
          />
          <PainColumn
            pains={col2}
            className="marquee-row-2 hidden sm:block flex-1 max-w-[360px] w-full"
            duration={32}
            direction="up"
            delay={0.2}
          />
          <PainColumn
            pains={col3}
            className="marquee-row-3 hidden lg:block flex-1 max-w-[360px] w-full"
            duration={27}
            direction="down"
            delay={0.3}
          />
        </div>
      </div>

      {/* ── Bridge pineado — Apple "Silence. Perfected." ─────────────────── */}
      {/*
        ref={bridgeRef} es el elemento que GSAP pineará (position:fixed en el viewport
        top). min-h-screen garantiza que llena el viewport durante el pin.
        bg-[#09090b] evita que el fondo sea transparente durante el pin.
      */}
      <div
        ref={bridgeRef}
        className="relative w-full min-h-screen flex flex-col items-center
          justify-center gap-4 text-center px-6 bg-[#09090b] overflow-hidden"
      >
        {/* Violeta de transición — GSAP lo anima desde opacity 0 → 1 en fase 4 */}
        <div
          className="bridge-bg-transition absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(167,139,250,0.06) 0%, transparent 60%)',
            opacity: 0,
          }}
          aria-hidden="true"
        />

        {/* Glow central — GSAP lo escala desde scale:0.4 en fase 5 */}
        <div
          className="bridge-glow absolute inset-0 pointer-events-none flex
            items-center justify-center opacity-0"
          aria-hidden="true"
        >
          <div
            className="w-[800px] h-[500px] rounded-full blur-[120px]"
            style={{
              background:
                'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(168,85,247,0.08) 50%, transparent 70%)',
            }}
          />
        </div>

        {/* Línea 1 — empieza invisible; GSAP la revela en fase 2 */}
        <p
          className={`bridge-line-1 font-sans font-bold text-zinc-100
            text-[clamp(3rem,7vw,5.5rem)] tracking-[-0.03em] leading-none
            relative z-10 ${shouldReduce ? 'opacity-100' : 'opacity-0'}`}
        >
          Con Ouleeh,
        </p>

        {/* Línea 2 — gradient text; empieza invisible; GSAP la revela en fase 3 */}
        <p
          className={`bridge-line-2 font-playfair font-normal italic text-transparent
            bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400
            text-[clamp(3.4rem,8vw,7rem)] leading-none pb-2
            relative z-10 ${shouldReduce ? 'opacity-100' : 'opacity-0'}`}
        >
          todo eso queda atrás.
        </p>
      </div>
    </section>
  );
}
