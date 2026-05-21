'use client';

import { motion, useReducedMotion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { Store, Share2, LayoutDashboard } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';

// ── Ease curves ───────────────────────────────────────────────────────────────
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// ── Step data ─────────────────────────────────────────────────────────────────
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

// ── Glow intensity table — outer radial, mid halo, inset screen wash, fuchsia bloom
// Each step advances all four scalars; step 03 (the "wow" dashboard) peaks.
const STEP_GLOW: { outer: number; mid: number; inset: number; fuchsia: number }[] = [
  { outer: 0.18, mid: 0.10, inset: 0.05, fuchsia: 0.05 }, // 01 — setup
  { outer: 0.28, mid: 0.18, inset: 0.09, fuchsia: 0.09 }, // 02 — share
  { outer: 0.44, mid: 0.28, inset: 0.16, fuchsia: 0.16 }, // 03 — dashboard
];

// Slow, organic spring so the glow "breathes" in rather than snapping.
const GLOW_SPRING = { stiffness: 50, damping: 18, mass: 1 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Phone screen content — one per step
// All 3 always mounted and stacked; only the active one is visible.
// Pre-loading all screens = zero flash on transition.
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
        <div key={i}
          className="flex items-center justify-between rounded-xl px-3 py-1.5 mb-1
            bg-white/[0.03] border border-white/[0.05]">
          <span className="text-[9px] text-zinc-300">{s}</span>
          <span className="text-violet-400 text-[9px]">✓</span>
        </div>
      ))}

      <div className="mt-2 flex items-center gap-2 text-[8px]">
        <span className="text-zinc-600">Horario</span>
        <span className="text-zinc-400">Lun–Sáb · 9:00–19:00</span>
      </div>

      <div className="mt-auto pt-3">
        <div className="w-full py-2 rounded-xl text-center text-[9px] font-semibold text-white
          bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-[0_4px_16px_rgba(139,92,246,0.40)]">
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
          <div key={s}
            className="flex-1 py-1.5 rounded-lg text-center text-[8px] text-zinc-300
              bg-white/[0.04] border border-white/[0.07]">
            {s}
          </div>
        ))}
      </div>

      <div className="mx-auto w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08]
        flex items-center justify-center">
        <div className="grid grid-cols-5 gap-0.5 w-12 h-12">
          {Array.from({ length: 25 }).map((_, i) => {
            const corners = [0, 4, 20, 24];
            const inner   = [6, 7, 8, 11, 12, 13, 16, 17, 18];
            return (
              <div key={i} className={`rounded-[1px] ${
                corners.includes(i)  ? 'bg-violet-400/70' :
                inner.includes(i)    ? 'bg-white/30' :
                                       'bg-white/10'
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
        {[
          { l: 'Ingresos', v: '$12.400' },
          { l: 'Turnos',   v: '7'       },
          { l: 'Clientes', v: '5'       },
        ].map(s => (
          <div key={s.l}
            className="bg-white/[0.04] rounded-lg p-1.5 border border-white/[0.05]">
            <p className="text-[7px] text-zinc-600 mb-0.5">{s.l}</p>
            <p className="text-[10px] text-violet-300 font-semibold tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>

      <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-1.5">Agenda</p>
      {agenda.map((a, i) => (
        <div key={i}
          className="flex gap-2 items-center rounded-xl px-2.5 py-1.5 mb-1
            bg-white/[0.03] border border-white/[0.05]">
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
// PhoneMockup — Liquid Glass iPhone with spring-driven multi-layer glow
// ─────────────────────────────────────────────────────────────────────────────

function PhoneMockup({
  activeStep,
  prefersReducedMotion,
}: {
  activeStep: number;
  prefersReducedMotion: boolean | null;
}) {
  // 4 independent MotionValues — each spring advances at its own natural pace,
  // giving the multi-layer glow a slightly organic "breathing" quality rather
  // than all layers popping in lockstep.
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

  // 8-layer shadow composed by useMotionTemplate — Framer Motion writes directly
  // to the DOM style attribute, never going through React reconciler. Zero re-renders.
  //
  // Layer 1: inset top highlight — Liquid Glass "bevel" (static)
  // Layer 2: inset 1px ring — glass edge definition (static)
  // Layer 3: inset violet screen wash — brightens as step index rises
  // Layer 4: inset fuchsia bloom at bottom — warm chromatic gradient (step-linked)
  // Layer 5: 1px hard outline — separates device from dark background
  // Layer 6: deep contact shadow — grounds the phone, adds perceived weight
  // Layer 7: mid violet halo ~80px — visible step-progression indicator
  // Layer 8: wide ambient bloom ~160px — cinematic depth field, apple-style
  const boxShadow = useMotionTemplate`inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 0 40px rgba(139,92,246,${smoothInset}), inset 0 -24px 40px rgba(232,121,249,${smoothFuchsia}), 0 0 0 1px rgba(0,0,0,0.55), 0 40px 80px -8px rgba(0,0,0,0.88), 0 0 80px rgba(168,85,247,${smoothMid}), 0 0 160px rgba(139,92,246,${smoothOuter})`;

  return (
    <div className="relative mx-auto select-none" style={{ width: 230, height: 470 }}>
      {/* Outer glass frame — motion.div for spring-animated boxShadow */}
      <motion.div
        className="absolute inset-0 rounded-[44px] border border-white/[0.12]
          bg-zinc-900/40 backdrop-blur-xl"
        style={{ boxShadow }}
      />

      {/* Side buttons */}
      <div className="absolute -left-[3px] top-24 w-[3px] h-8 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -left-[3px] top-36 w-[3px] h-12 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -left-[3px] top-52 w-[3px] h-12 rounded-l-full bg-white/[0.08]" />
      <div className="absolute -right-[3px] top-32 w-[3px] h-16 rounded-r-full bg-white/[0.08]" />

      {/* Screen bezel */}
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

        {/* Screen content — all 3 mounted, only active is visible */}
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

        {/* Home indicator */}
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

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  /*
    Scroll-spy with IntersectionObserver.
    rootMargin: '-30% 0px -50% 0px'
      → trigger zone is the band between 30% and 50% from the viewport top.
      → with each step at h-screen (100vh), only one step can occupy this
        20%-band at a time — clean, non-overlapping activation.
  */
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) setActiveStep(index);
        }
      });
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0,
    });
    const refs = stepRefs.current;
    refs.forEach(el => { if (el) observer.observe(el); });
    return () => refs.forEach(el => { if (el) observer.unobserve(el); });
  }, [handleObserver]);

  return (
    <section
      id="como-funciona"
      className="relative z-10 bg-[#09090b] scroll-mt-20"
    >
      {/* Top separator */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
        aria-hidden="true"
      />

      {/* Ambient violet glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6">

        {/* ── Section heading ──────────────────────────────────────────────── */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center pt-28 pb-16"
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

        {/* ── DESKTOP: Sticky Scroll layout ───────────────────────────────── */}
        {/*
          items-start: required — prevents the grid from stretching the right
          column to the full scroll height, which would break position:sticky.

          Step heights: each step is exactly h-screen (100vh). This is the single
          most important structural change — all three segments are mathematically
          identical in height, so the phone stays uniformly anchored throughout.
          min-h was wrong: it let content drive height, making the last step
          (which has no connector line below it) visually shorter.
        */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-20 items-start pb-32">

          {/* LEFT — scrollable steps */}
          <div className="flex flex-col">
            {steps.map((step, index) => {
              const Icon     = step.icon;
              const isActive = activeStep === index;

              return (
                <div
                  key={step.number}
                  ref={el => { stepRefs.current[index] = el; }}
                  // h-screen: fixed 100vh per step — identical for all three.
                  // flex flex-col justify-center: content floats to vertical centre.
                  className="h-screen flex flex-col justify-center py-20"
                >
                  <div className="flex items-start gap-6">
                    {/* Left rail: number badge + connector */}
                    <div className="flex flex-col items-center shrink-0 pt-1">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center
                          font-playfair font-light text-xl border transition-all duration-700"
                        style={isActive ? {
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(232,121,249,0.08) 100%)',
                          borderColor: 'rgba(167,139,250,0.45)',
                          boxShadow: '0 0 24px rgba(139,92,246,0.20)',
                          color: '#c4b5fd',
                        } : {
                          background: 'rgba(255,255,255,0.02)',
                          borderColor: 'rgba(255,255,255,0.07)',
                          color: '#3f3f46',
                        }}
                      >
                        {step.number}
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className="w-px mt-3 transition-all duration-700"
                          style={{
                            height: '60px',
                            background: isActive
                              ? 'linear-gradient(to bottom, rgba(167,139,250,0.50), rgba(167,139,250,0.05))'
                              : 'rgba(255,255,255,0.06)',
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Step text */}
                    <div className="flex-1 pb-2">
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center mb-5
                          transition-all duration-700"
                        style={isActive ? {
                          background: 'rgba(139,92,246,0.12)',
                          borderColor: 'rgba(167,139,250,0.35)',
                        } : {
                          background: 'rgba(255,255,255,0.02)',
                          borderColor: 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <Icon
                          className="w-4 h-4 transition-colors duration-700"
                          style={{ color: isActive ? '#c4b5fd' : '#3f3f46' }}
                          aria-hidden="true"
                        />
                      </div>

                      <h3
                        className="font-playfair text-4xl font-semibold leading-tight mb-4
                          transition-colors duration-700"
                        style={{ color: isActive ? '#f4f4f5' : '#3f3f46' }}
                      >
                        {step.title}
                      </h3>

                      <p
                        className="text-base leading-relaxed max-w-[380px] transition-colors duration-700"
                        style={{ color: isActive ? '#a1a1aa' : '#3f3f46' }}
                      >
                        {step.description}
                      </p>

                      <motion.div
                        animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -8 }}
                        transition={{ duration: shouldReduce ? 0 : 0.35, ease: EASE }}
                        className="flex items-center gap-2 mt-6"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        <span className="text-xs text-violet-400 font-medium">Paso activo</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT — sticky phone mockup
              top-16 + h-[calc(100vh-8rem)]: the sticky box is 4rem from the viewport
              top and has an equal 4rem gap at the bottom, so the phone is always
              optically centred regardless of which step is active.
              relative: needed so the absolute glow is contained within this box. */}
          <div className="relative self-start sticky top-16 h-[calc(100vh-8rem)] flex items-center justify-center">

            {/* Background ambient glow — opacity animates per step
                The gradient itself is always violet→fuchsia; we animate how
                bright it is, not the colour, to avoid gradient interpolation bugs. */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                opacity: activeStep === 0 ? 0.45 : activeStep === 1 ? 0.65 : 1.0,
              }}
              transition={{ duration: 0.8, ease: EASE }}
              style={{
                background: 'radial-gradient(ellipse 90% 80% at 50% 55%, rgba(139,92,246,0.55) 0%, rgba(232,121,249,0.18) 45%, transparent 70%)',
                filter: 'blur(64px)',
              }}
              aria-hidden="true"
            />

            <div className="relative flex flex-col items-center gap-8">
              <PhoneMockup
                activeStep={activeStep}
                prefersReducedMotion={shouldReduce}
              />

              {/* Step indicator dots */}
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    aria-label={`Paso ${i + 1}`}
                    className="rounded-full transition-all duration-500 cursor-pointer"
                    style={{
                      width:           i === activeStep ? '20px' : '6px',
                      height:          '6px',
                      backgroundColor: i === activeStep
                        ? '#a78bfa'
                        : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE: Stacked steps ────────────────────────────────────────── */}
        <div className="lg:hidden space-y-12 pb-24">
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
                    className="w-10 h-10 rounded-xl border flex items-center justify-center
                      font-playfair text-sm text-violet-400"
                    style={{
                      background: 'rgba(139,92,246,0.10)',
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

                {/* Mini phone preview */}
                <div
                  className="w-full max-w-[240px] mx-auto rounded-[32px] border border-white/[0.10]
                    bg-zinc-900/40 backdrop-blur-xl overflow-hidden"
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
