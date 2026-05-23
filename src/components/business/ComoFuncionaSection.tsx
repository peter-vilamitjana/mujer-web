'use client';

import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { Store, Share2, LayoutDashboard } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// Transition curve used for discrete state changes (phone screen, glow)
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

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

/*
  STRICT ISOLATION — scroll-progress windows for each step.
  The 300vh track yields 200vh of travel (progress 0→1).

  Phase 1 — Header exits  : [0.00 → 0.15]  opacity 1→0, y 0→-40
  Phase 2 — Steps (0.15→1.0 split equally into thirds ≈ 0.2833 each):

    Step 0: enter [0.15, 0.22]  exit [0.43, 0.50]
    Step 1: enter [0.50, 0.57]  exit [0.72, 0.79]
    Step 2: enter [0.79, 0.86]  exit [0.98, 1.00]

  Rule: step N's exit ENDS exactly where step N+1's enter BEGINS (0.50 / 0.79).
  At any scroll position only one element (header OR one step) has opacity > 0.
  No visual overlap is possible.

  enter[0] → enter[1] : opacity 0→1, scale 0.88→1, y 28→0   (lifts into focus)
  exit[0]  → exit[1]  : opacity 1→0, scale 1→0.94, y 0→-16  (drifts above)
*/
const STEP_RANGES = [
  { enter: [0.15, 0.22] as const, exit: [0.43, 0.50] as const },
  { enter: [0.50, 0.57] as const, exit: [0.72, 0.79] as const },
  { enter: [0.79, 0.86] as const, exit: [0.98, 1.00] as const },
];

// Glow intensity ramps dramatically with each step — builds cinematic depth
const STEP_GLOW = [
  { outer: 0.20, mid: 0.12, inset: 0.06, fuchsia: 0.06 },
  { outer: 0.32, mid: 0.20, inset: 0.10, fuchsia: 0.10 },
  { outer: 0.50, mid: 0.32, inset: 0.18, fuchsia: 0.18 },
];

const GLOW_SPRING = { stiffness: 50, damping: 18, mass: 1 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Phone screens — all three always mounted; only the active one is visible
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
// PhoneMockup — spring-driven 8-layer boxShadow glow via useMotionTemplate
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

  // Drive glow intensity from discrete activeStep — spring smooths each change
  useEffect(() => {
    const g = STEP_GLOW[activeStep];
    glowOuter.set(g.outer);
    glowMid.set(g.mid);
    glowInset.set(g.inset);
    glowFuchsia.set(g.fuchsia);
  }, [activeStep, glowOuter, glowMid, glowInset, glowFuchsia]);

  // useMotionTemplate composes an animated string from MotionValues —
  // writes directly to the DOM on each rAF tick without React re-renders
  const boxShadow = useMotionTemplate`inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 0 40px rgba(139,92,246,${smoothInset}), inset 0 -24px 40px rgba(232,121,249,${smoothFuchsia}), 0 0 0 1px rgba(0,0,0,0.55), 0 40px 80px -8px rgba(0,0,0,0.88), 0 0 80px rgba(168,85,247,${smoothMid}), 0 0 160px rgba(139,92,246,${smoothOuter})`;

  return (
    <div className="relative mx-auto select-none" style={{ width: 230, height: 470 }}>
      <motion.div
        className="absolute inset-0 rounded-[44px] border border-white/[0.12] bg-zinc-900/40 backdrop-blur-xl"
        style={{ boxShadow }}
      />
      {/* Physical side buttons */}
      <div className="absolute -left-[3px] top-24 w-[3px] h-8 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -left-[3px] top-36 w-[3px] h-12 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -left-[3px] top-52 w-[3px] h-12 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -right-[3px] top-32 w-[3px] h-16 rounded-r-full bg-white/[0.08]" />

      <div className="absolute inset-[3px] rounded-[41px] bg-[#0a0a0c] overflow-hidden">
        {/* Status bar */}
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

        {/* Dynamic Island */}
        <div className="mx-auto w-20 h-6 bg-black rounded-full mb-1" />

        {/* App header */}
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

        {/* Screen content — all three mounted; the active one crossfades in */}
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
// SectionHeader — lives inside the sticky zone and fades out scroll-linked.
// This creates the Apple-style "headline gives way to feature story" effect.
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({
  scrollYProgress,
  shouldReduce,
}: {
  scrollYProgress: MotionValue<number>;
  shouldReduce: boolean | null;
}) {
  // Header exits over [0 → 0.15] — exactly the Phase 1 window.
  // Must be fully gone (opacity 0) before any step begins at 0.15.
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scrollY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);
  const y       = shouldReduce ? 0 : scrollY;

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center"
      // zIndex 5 — BELOW steps (zIndex 10). Steps always paint over the header.
      style={{ opacity, y, zIndex: 5, pointerEvents: 'none' }}
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
      <p className="text-zinc-500 text-sm mt-5 max-w-xs leading-relaxed">
        Sin soporte técnico. Sin configuraciones complicadas.
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StepBlock — a single step with perfectly scroll-linked entry and exit.
//
// Motion contract per step:
//   enter[0] → enter[1] : opacity 0→1, scale 0.88→1, y 28px→0   (lifts into focus)
//   exit[0]  → exit[1]  : opacity 1→0, scale 1→0.94, y 0→-16px  (drifts above)
//
// The paginator is grouped INSIDE this block so it enters and exits
// as a single unified unit — no floating elements.
// ─────────────────────────────────────────────────────────────────────────────
function StepBlock({
  step,
  index,
  totalSteps,
  scrollYProgress,
  range,
  isActive,
  shouldReduce,
}: {
  step:           (typeof steps)[number];
  index:          number;
  totalSteps:     number;
  scrollYProgress: MotionValue<number>;
  range:          (typeof STEP_RANGES)[number];
  isActive:       boolean;
  shouldReduce:   boolean | null;
}) {
  // Four-keypoint map: invisible → fade in → visible → fade out
  const [ea, eb] = range.enter;
  const [xa, xb] = range.exit;

  const scrollOpacity = useTransform(scrollYProgress, [ea, eb, xa, xb], [0, 1, 1, 0]);
  const scrollScale   = useTransform(scrollYProgress, [ea, eb, xa, xb], [0.88, 1, 1, 0.94]);
  const scrollYVal    = useTransform(scrollYProgress, [ea, eb, xa, xb], [28, 0, 0, -16]);

  // For reduced-motion users: use discrete opacity (on/off with isActive) and no transforms
  const opacity = shouldReduce ? (isActive ? 1 : 0) : scrollOpacity;
  const scale   = shouldReduce ? 1 : scrollScale;
  const y       = shouldReduce ? 0 : scrollYVal;

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{
        opacity,
        scale,
        y,
        zIndex:        isActive ? 10 : 1,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      {/* ── Number badge + title + description ── */}
      <div className="flex items-start gap-5">
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

      {/* ── Paginator — grouped here so it moves with its step, not independently ── */}
      <div className="mt-auto flex items-center gap-4 pt-6">
        <span className="font-playfair text-xl text-violet-400/70 font-light tabular-nums select-none">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="relative w-20 h-px bg-white/[0.08] overflow-hidden">
          {/* Static fill — correct for the step since this block is only visible for one step */}
          <div
            className="absolute inset-y-0 left-0 bg-violet-400/50"
            style={{ width: `${((index + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <span className="text-xs text-zinc-700 font-mono tabular-nums select-none">
          {String(totalSteps).padStart(2, '0')}
        </span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main section
// ─────────────────────────────────────────────────────────────────────────────
export default function ComoFuncionaSection() {
  const shouldReduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  /*
    containerRef wraps the entire 300vh scroll track.
    useScroll offset ['start start', 'end end']:
      progress 0 → container top  at viewport top
      progress 1 → container bottom at viewport bottom
    Effective travel = 300vh − 100vh = 200vh.

    Phone screen switches at step transition midpoints (not at text thresholds)
    so the screen change feels perfectly in sync with the crossfade.
  */
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      // Midpoints between step enter/exit ranges → phone switches exactly when
      // the outgoing step's text is half-faded and the incoming is half-visible
      // Thresholds align with step relay points (where exit ends = enter begins)
      const next = v < 0.50 ? 0 : v < 0.79 ? 1 : 2;
      setActiveStep((prev) => (prev === next ? prev : next));
    });
  }, [scrollYProgress]);

  // Dots appear as step 0 fades in — start at 0.15 (after header is fully gone)
  const dotsOpacity = useTransform(scrollYProgress, [0.15, 0.22], [0, 1]);

  return (
    <section
      id="como-funciona"
      className="relative z-10 bg-[#09090b] scroll-mt-20 pb-24"
    >
      {/* Top edge separator */}
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

      {/* ── DESKTOP: 300vh scroll track ────────────────────────────────────── */}
      <div ref={containerRef} className="hidden lg:block h-[300vh]">

        {/*
          Sticky stage: pinned to the viewport for the full 300vh scroll.
          flex items-center → content is vertically centred in the viewport.
          overflow-hidden prevents glow from causing horizontal scroll.
        */}
        <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
          <div className="max-w-5xl mx-auto w-full px-8">

            {/*
              items-start → both columns top-align at the same y coordinate.
              Left column top == phone top edge — strict alignment guarantee.
            */}
            <div className="grid grid-cols-2 gap-16 items-start">

              {/* ── LEFT: header cross-dissolves into step blocks ──────── */}
              {/*
                Height matches the phone (470px) for proportional symmetry.
                Every child is position:absolute inset-0, sharing the same origin.
                The header and all 3 steps are layered here; only one is opaque
                at any given scroll position.
              */}
              <div className="relative" style={{ height: 470 }}>

                {/* Section heading — fades out [progress 0 → 0.14] */}
                <SectionHeader
                  scrollYProgress={scrollYProgress}
                  shouldReduce={shouldReduce}
                />

                {/* Steps — each with its own scroll-linked crossfade window */}
                {steps.map((step, i) => (
                  <StepBlock
                    key={step.number}
                    step={step}
                    index={i}
                    totalSteps={steps.length}
                    scrollYProgress={scrollYProgress}
                    range={STEP_RANGES[i]}
                    isActive={i === activeStep}
                    shouldReduce={shouldReduce}
                  />
                ))}
              </div>

              {/* ── RIGHT: cinematic phone + 4-layer aura ──────────────── */}
              <div className="flex flex-col items-center">

                {/*
                  Phone-sized relative wrapper.
                  Glow layers overflow this container but are pointer-events-none,
                  so they don't interfere with layout or interaction.
                */}
                <div className="relative" style={{ width: 230, height: 470 }}>

                  {/* Layer 0: Always-on base plate — establishes depth context */}
                  <div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      width: 380, height: 480,
                      top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      background:
                        'radial-gradient(ellipse, rgba(109,40,217,0.22) 0%, transparent 70%)',
                      filter: 'blur(56px)',
                    }}
                  />

                  {/* Layer 1: Wide violet bloom — expands dramatically per step */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      width: 500, height: 580,
                      top: '50%', left: '50%',
                      translateX: '-50%',
                      translateY: '-50%',
                      borderRadius: '50%',
                      background:
                        'radial-gradient(ellipse, rgba(139,92,246,0.55) 0%, rgba(109,40,217,0.20) 40%, transparent 70%)',
                      filter: 'blur(72px)',
                    }}
                    animate={{
                      opacity: [0.38, 0.55, 0.82][activeStep],
                    }}
                    transition={{ duration: 1.0, ease: EASE }}
                  />

                  {/* Layer 2: Fuchsia warmth — creates chromatic aberration depth */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      width: 300, height: 300,
                      top: '64%', left: '50%',
                      translateX: '-50%',
                      translateY: '-50%',
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle, rgba(232,121,249,0.65) 0%, transparent 70%)',
                      filter: 'blur(40px)',
                    }}
                    animate={{
                      opacity: [0.18, 0.32, 0.52][activeStep],
                    }}
                    transition={{ duration: 0.9, ease: EASE }}
                  />

                  {/* Layer 3: Tight violet halo — outlines the device silhouette */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      width: 220, height: 420,
                      top: '50%', left: '50%',
                      translateX: '-50%',
                      translateY: '-50%',
                      borderRadius: '50%',
                      background:
                        'radial-gradient(ellipse, rgba(139,92,246,0.80) 0%, transparent 70%)',
                      filter: 'blur(20px)',
                    }}
                    animate={{
                      opacity: [0.10, 0.20, 0.38][activeStep],
                    }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />

                  {/* Phone — rendered above all glow layers via DOM order */}
                  <PhoneMockup
                    activeStep={activeStep}
                    prefersReducedMotion={shouldReduce}
                  />
                </div>

                {/* Step dots — fade in with first step, invisible during header phase */}
                <motion.div
                  className="flex gap-2 mt-6"
                  style={{ opacity: shouldReduce ? 1 : dotsOpacity }}
                >
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      aria-hidden="true"
                      className="rounded-full transition-all duration-500"
                      style={{
                        width:           i === activeStep ? '20px' : '6px',
                        height:          '6px',
                        backgroundColor: i === activeStep
                          ? '#a78bfa'
                          : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </motion.div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: stacked step cards ────────────────────────────────────── */}
      <div className="lg:hidden px-8 pb-8 pt-16">

        {/* Mobile heading — static, not sticky */}
        <div className="text-center mb-14">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Simple por diseño
          </p>
          <h2 className="font-playfair text-[clamp(2rem,8vw,3rem)] leading-[1.05] tracking-tight">
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
          <p className="text-zinc-500 text-sm mt-4 max-w-xs mx-auto leading-relaxed">
            Sin soporte técnico. Sin configuraciones complicadas.
          </p>
        </div>

        <div className="space-y-12">
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
                    style={{
                      background:  'rgba(139,92,246,0.10)',
                      borderColor: 'rgba(167,139,250,0.30)',
                    }}
                  >
                    {step.number}
                  </div>
                  <Icon className="w-4 h-4 text-violet-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-playfair text-2xl font-semibold text-zinc-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
                </div>
                <div
                  className="w-full max-w-[240px] mx-auto rounded-[32px] border border-white/[0.10] bg-zinc-900/40 backdrop-blur-xl overflow-hidden"
                  style={{
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.08)',
                    height: 220,
                  }}
                >
                  <div className="w-16 h-4 bg-black rounded-full mx-auto mt-2 mb-1" />
                  <Screen />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
