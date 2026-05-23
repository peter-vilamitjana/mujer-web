'use client';

import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useScroll,
} from 'framer-motion';
import { Store, Share2, LayoutDashboard } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const APPLE_EASE = [0.32, 0.72, 0, 1] as const;
const EASE       = [0.25, 0.46, 0.45, 0.94] as const;

const steps = [
  {
    number: '01',
    title: 'Creá tu perfil',
    description:
      'Registrá tu salón en minutos. Cargá tus servicios, tu equipo y tus horarios desde el celular.',
    icon: Store,
  },
  {
    number: '02',
    title: 'Compartí tu link',
    description:
      'Cada salón tiene su propia página. Compartila por WhatsApp e Instagram — tus clientas reservan solas.',
    icon: Share2,
  },
  {
    number: '03',
    title: 'Gestioná todo acá',
    description:
      'Tu agenda, tus clientas y tus cobros — en un solo lugar, desde cualquier dispositivo, las 24 hs.',
    icon: LayoutDashboard,
  },
];

const STEP_GLOW = [
  { outer: 0.18, mid: 0.10, inset: 0.05, fuchsia: 0.05 },
  { outer: 0.28, mid: 0.18, inset: 0.09, fuchsia: 0.09 },
  { outer: 0.44, mid: 0.28, inset: 0.16, fuchsia: 0.16 },
];

const GLOW_SPRING = { stiffness: 50, damping: 18, mass: 1 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Phone screens
// ─────────────────────────────────────────────────────────────────────────────

function PhoneScreen0() {
  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <p className="text-[10px] text-violet-400 font-semibold tracking-wide mb-3">Configurar salón</p>
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 mb-2.5">
        <p className="text-[8px] text-zinc-600 mb-0.5 uppercase tracking-wider">Nombre</p>
        <p className="text-[11px] text-zinc-200 font-medium">Melina Studio</p>
      </div>
      <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-1.5">Servicios (3)</p>
      {['Corte + color · $8.500', 'Keratina · $12.000', 'Peinado · $5.000'].map((s, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl px-3 py-1.5 mb-1 bg-white/[0.03] border border-white/[0.05]">
          <span className="text-[9px] text-zinc-300">{s}</span>
          <span className="text-violet-400 text-[9px]">✓</span>
        </div>
      ))}
      <div className="mt-2 flex items-center gap-2 text-[8px]">
        <span className="text-zinc-600">Horario</span>
        <span className="text-zinc-400">Lun–Sáb · 9:00–19:00</span>
      </div>
      <div className="mt-auto pt-3">
        <div className="w-full py-2 rounded-xl text-center text-[9px] font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-[0_4px_16px_rgba(139,92,246,0.40)]">
          Guardar perfil →
        </div>
      </div>
    </div>
  );
}

function PhoneScreen1() {
  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <p className="text-[10px] text-violet-400 font-semibold tracking-wide mb-3">Tu página, lista</p>
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-3 mb-3">
        <p className="text-[8px] text-zinc-600 mb-1 uppercase tracking-wider">Tu link único</p>
        <p className="text-[10px] text-violet-300 font-mono">ouleeh.com/melina-studio</p>
      </div>
      <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-2">Compartir en</p>
      <div className="flex gap-2 mb-4">
        {['WhatsApp', 'Instagram', 'Copiar'].map((s) => (
          <div key={s} className="flex-1 py-1.5 rounded-lg text-center text-[8px] text-zinc-300 bg-white/[0.04] border border-white/[0.07]">
            {s}
          </div>
        ))}
      </div>
      <div className="mx-auto w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
        <div className="grid grid-cols-5 gap-0.5 w-12 h-12">
          {Array.from({ length: 25 }).map((_, i) => {
            const corners = [0, 4, 20, 24];
            const inner   = [6, 7, 8, 11, 12, 13, 16, 17, 18];
            return (
              <div key={i} className={`rounded-[1px] ${
                corners.includes(i) ? 'bg-violet-400/70' :
                inner.includes(i)   ? 'bg-white/30'     : 'bg-white/10'
              }`} />
            );
          })}
        </div>
      </div>
      <p className="text-center text-[8px] text-zinc-600 mt-2">Escaneá para reservar</p>
    </div>
  );
}

function PhoneScreen2() {
  const agenda = [
    { t: '09:00', c: 'Valentina G.', s: 'Corte + color' },
    { t: '11:30', c: 'Martina R.',   s: 'Keratina'      },
    { t: '14:00', c: 'Carolina S.',  s: 'Peinado'       },
  ];
  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-zinc-200 font-semibold">Hoy, Lunes</p>
        <p className="text-[8px] text-violet-400 font-semibold">3 turnos</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[{ l: 'Ingresos', v: '$12.400' }, { l: 'Turnos', v: '7' }, { l: 'Clientes', v: '5' }].map(s => (
          <div key={s.l} className="bg-white/[0.04] rounded-lg p-1.5 border border-white/[0.05]">
            <p className="text-[7px] text-zinc-600 mb-0.5">{s.l}</p>
            <p className="text-[10px] text-violet-300 font-semibold tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-1.5">Agenda</p>
      {agenda.map((a, i) => (
        <div key={i} className="flex gap-2 items-center rounded-xl px-2.5 py-1.5 mb-1 bg-white/[0.03] border border-white/[0.05]">
          <span className="text-[8px] text-violet-400 font-mono w-8 shrink-0 tabular-nums">{a.t}</span>
          <div className="w-px h-4 bg-violet-400/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-zinc-200 truncate font-medium">{a.c}</p>
            <p className="text-[7px] text-zinc-600">{a.s}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400/70 shrink-0" />
        </div>
      ))}
    </div>
  );
}

const PHONE_SCREENS = [PhoneScreen0, PhoneScreen1, PhoneScreen2];

// ─────────────────────────────────────────────────────────────────────────────
// PhoneMockup — spring-driven glow via useMotionTemplate
// ─────────────────────────────────────────────────────────────────────────────
function PhoneMockup({
  activeStep,
  prefersReducedMotion,
}: {
  activeStep: number;
  prefersReducedMotion: boolean | null;
}) {
  const glowOuter   = useMotionValue(STEP_GLOW[0].outer);
  const glowMid     = useMotionValue(STEP_GLOW[0].mid);
  const glowInset   = useMotionValue(STEP_GLOW[0].inset);
  const glowFuchsia = useMotionValue(STEP_GLOW[0].fuchsia);

  const smoothOuter   = useSpring(glowOuter,   GLOW_SPRING);
  const smoothMid     = useSpring(glowMid,     GLOW_SPRING);
  const smoothInset   = useSpring(glowInset,   GLOW_SPRING);
  const smoothFuchsia = useSpring(glowFuchsia, GLOW_SPRING);

  useEffect(() => {
    const g = STEP_GLOW[activeStep];
    glowOuter.set(g.outer);
    glowMid.set(g.mid);
    glowInset.set(g.inset);
    glowFuchsia.set(g.fuchsia);
  }, [activeStep, glowOuter, glowMid, glowInset, glowFuchsia]);

  const boxShadow = useMotionTemplate`inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 0 40px rgba(139,92,246,${smoothInset}), inset 0 -24px 40px rgba(232,121,249,${smoothFuchsia}), 0 0 0 1px rgba(0,0,0,0.55), 0 40px 80px -8px rgba(0,0,0,0.88), 0 0 80px rgba(168,85,247,${smoothMid}), 0 0 160px rgba(139,92,246,${smoothOuter})`;

  return (
    <div className="relative mx-auto select-none" style={{ width: 230, height: 470 }}>
      <motion.div
        className="absolute inset-0 rounded-[44px] border border-white/[0.12] bg-zinc-900/40 backdrop-blur-xl"
        style={{ boxShadow }}
      />

      <div className="absolute -left-[3px] top-24 w-[3px] h-8 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -left-[3px] top-36 w-[3px] h-12 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -left-[3px] top-52 w-[3px] h-12 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -right-[3px] top-32 w-[3px] h-16 rounded-r-full bg-white/[0.08]" />

      <div className="absolute inset-[3px] rounded-[41px] bg-[#0a0a0c] overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0">
          <span className="text-[9px] text-white font-semibold tabular-nums">9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-px items-end h-2.5">
              {[3, 4, 5, 6].map((h, i) => (
                <div key={i} className="w-[3px] rounded-sm bg-white" style={{ height: `${h * 15}%` }} />
              ))}
            </div>
            <div className="w-5 h-2.5 rounded-[3px] border border-white/40 relative">
              <div className="absolute inset-[1.5px] rounded-[2px] bg-white" />
            </div>
          </div>
        </div>

        <div className="mx-auto w-20 h-6 bg-black rounded-full mb-1" />

        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <span className="text-[7px] text-white font-black">O</span>
            </div>
            <span className="text-[10px] text-zinc-200 font-semibold">Ouleeh</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <span className="text-[8px] text-zinc-400">⚙</span>
          </div>
        </div>

        <div className="relative overflow-hidden" style={{ height: 'calc(100% - 82px)' }}>
          {PHONE_SCREENS.map((Screen, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{
                opacity: i === activeStep ? 1 : 0,
                scale:   i === activeStep ? 1 : 0.96,
              }}
              transition={{
                opacity: { duration: prefersReducedMotion ? 0 : 0.35, ease: EASE },
                scale:   { duration: prefersReducedMotion ? 0 : 0.40, ease: EASE },
              }}
              style={{ transformOrigin: 'center top' }}
            >
              <Screen />
            </motion.div>
          ))}
        </div>

        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main section
// ─────────────────────────────────────────────────────────────────────────────
export default function ComoFuncionaSection() {
  const shouldReduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  /*
    containerRef = the 300vh scroll track.
    useScroll offset ['start start', 'end end']:
      progress 0  → container top  hits viewport top
      progress 1  → container bottom hits viewport bottom
    Travel distance = 300vh − 100vh = 200vh.
    Each third ≈ 66.7vh  →  thresholds at 0.33 / 0.66.
  */
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      const next = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
      setActiveStep((prev) => (prev === next ? prev : next));
    });
  }, [scrollYProgress]);

  return (
    <section
      id="como-funciona"
      className="relative z-10 bg-[#09090b] scroll-mt-20 pb-24"
    >
      {/* Top separator */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
        aria-hidden="true"
      />

      {/* Section-level ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      {/* ── Section heading — scrolls normally, outside the sticky zone ───── */}
      <div className="max-w-5xl mx-auto px-8">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center pt-24 pb-16"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Simple por diseño
          </p>
          <h2 className="font-playfair text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.05] tracking-tight">
            <span className="text-white font-bold">De cero a online.</span>
            <br />
            <span
              className="font-normal italic"
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #e879f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              En menos de 5 minutos.
            </span>
          </h2>
          <p className="text-zinc-500 text-sm mt-5 max-w-xs mx-auto leading-relaxed">
            Sin soporte técnico. Sin configuraciones complicadas.
          </p>
        </motion.div>
      </div>

      {/* ── DESKTOP: 300vh scroll track ────────────────────────────────────── */}
      <div ref={containerRef} className="hidden lg:block h-[300vh]">

        {/*
          Sticky stage: stays fixed in viewport for the full 300vh scroll travel.
          flex items-center → grid is vertically centred in the viewport.
        */}
        <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
          <div className="max-w-5xl mx-auto w-full px-8">

            {/*
              items-start → both columns begin at the same y-coordinate.
              Left text top-0 == right phone top edge.  Alignment guaranteed.
            */}
            <div className="grid grid-cols-2 gap-16 items-start">

              {/* ── LEFT: in-place crossfade ───────────────────────────── */}
              {/*
                Relative container with an explicit height.
                Each step is position:absolute inset-0 — same origin, same size.
                Title + description + paginator are ALL inside this block,
                so they enter and exit as a single unit.
              */}
              <div className="relative" style={{ height: 280 }}>

                {steps.map((step, i) => {
                  const isActive = i === activeStep;
                  const isPast   = i < activeStep;

                  return (
                    <motion.div
                      key={step.number}
                      className="absolute inset-0 flex flex-col"
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        y:       isActive ? 0 : isPast ? -14 : 14,
                      }}
                      style={{ zIndex: isActive ? 10 : 0, pointerEvents: isActive ? 'auto' : 'none' }}
                      transition={{
                        duration: shouldReduce ? 0 : 0.5,
                        ease: APPLE_EASE,
                      }}
                    >
                      {/* ── Step content ── */}
                      <div className="flex items-start gap-5">
                        {/* Number badge */}
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center
                            font-playfair font-light text-lg border shrink-0 mt-1"
                          style={{
                            background:  'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(232,121,249,0.08) 100%)',
                            borderColor: 'rgba(167,139,250,0.45)',
                            boxShadow:   '0 0 24px rgba(139,92,246,0.20)',
                            color:       '#c4b5fd',
                          }}
                        >
                          {step.number}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-playfair text-[2.2rem] font-semibold leading-tight mb-4 text-white">
                            {step.title}
                          </h3>
                          <p className="text-base leading-relaxed max-w-[360px] text-zinc-400">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* ── Paginator — grouped inside this step block ── */}
                      <div className="mt-auto flex items-center gap-4 pt-6">
                        <span className="font-playfair text-xl text-violet-400/70 font-light tabular-nums select-none">
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        <div className="relative w-20 h-px bg-white/[0.08] overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-violet-400/50"
                            style={{ width: `${((i + 1) / steps.length) * 100}%` }}
                          />
                        </div>

                        <span className="text-xs text-zinc-700 font-mono tabular-nums select-none">
                          {String(steps.length).padStart(2, '0')}
                        </span>
                      </div>

                    </motion.div>
                  );
                })}
              </div>

              {/* ── RIGHT: phone + cinematic glow ─────────────────────── */}
              <div className="flex flex-col items-center">

                {/* Phone-sized relative wrapper — glow layers overflow but are pointer-events-none */}
                <div className="relative" style={{ width: 230, height: 470 }}>

                  {/* Layer 1: Wide ambient violet bloom */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      width: 480, height: 560,
                      top: '50%', left: '50%',
                      translateX: '-50%',
                      translateY: '-50%',
                      borderRadius: '50%',
                      background: 'radial-gradient(ellipse, rgba(139,92,246,0.55) 0%, rgba(109,40,217,0.20) 40%, transparent 70%)',
                      filter: 'blur(72px)',
                    }}
                    animate={{
                      opacity: activeStep === 0 ? 0.38 : activeStep === 1 ? 0.55 : 0.82,
                    }}
                    transition={{ duration: 1.0, ease: EASE }}
                  />

                  {/* Layer 2: Fuchsia warmth */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      width: 280, height: 280,
                      top: '62%', left: '50%',
                      translateX: '-50%',
                      translateY: '-50%',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(232,121,249,0.60) 0%, transparent 70%)',
                      filter: 'blur(42px)',
                    }}
                    animate={{
                      opacity: activeStep === 0 ? 0.18 : activeStep === 1 ? 0.32 : 0.52,
                    }}
                    transition={{ duration: 0.9, ease: EASE }}
                  />

                  {/* Layer 3: Tight violet halo */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      width: 210, height: 400,
                      top: '50%', left: '50%',
                      translateX: '-50%',
                      translateY: '-50%',
                      borderRadius: '50%',
                      background: 'radial-gradient(ellipse, rgba(139,92,246,0.75) 0%, transparent 70%)',
                      filter: 'blur(22px)',
                    }}
                    animate={{
                      opacity: activeStep === 0 ? 0.10 : activeStep === 1 ? 0.20 : 0.36,
                    }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />

                  <PhoneMockup activeStep={activeStep} prefersReducedMotion={shouldReduce} />
                </div>

                {/* Visual dots — scroll drives state, no click handlers */}
                <div className="flex gap-2 mt-6">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      aria-hidden="true"
                      className="rounded-full transition-all duration-500"
                      style={{
                        width:           i === activeStep ? '20px' : '6px',
                        height:          '6px',
                        backgroundColor: i === activeStep ? '#a78bfa' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: stacked cards ─────────────────────────────────────────── */}
      <div className="lg:hidden space-y-12 px-8 pb-8">
        {steps.map((step, index) => {
          const Icon   = step.icon;
          const Screen = PHONE_SCREENS[index];
          return (
            <motion.div
              key={step.number}
              initial={shouldReduce ? {} : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border flex items-center justify-center font-playfair text-sm text-violet-400"
                  style={{ background: 'rgba(139,92,246,0.10)', borderColor: 'rgba(167,139,250,0.30)' }}
                >
                  {step.number}
                </div>
                <Icon className="w-4 h-4 text-violet-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-playfair text-2xl font-semibold text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
              </div>
              <div
                className="w-full max-w-[240px] mx-auto rounded-[32px] border border-white/[0.10] bg-zinc-900/40 backdrop-blur-xl overflow-hidden"
                style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.08)', height: 220 }}
              >
                <div className="w-16 h-4 bg-black rounded-full mx-auto mt-2 mb-1" />
                <Screen />
              </div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
