'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  useScroll, useTransform, useSpring, useMotionValue, MotionValue,
  motion, AnimatePresence, useReducedMotion,
} from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Calendar, TrendingUp, LayoutDashboard, CheckCircle } from 'lucide-react';

// ── Tokens ────────────────────────────────────────────────────────────────────
const VIOLET_HEX  = '#a78bfa';
const VIOLET_GLOW = 'rgba(167,139,250,0.15)';

const TRAFFIC = [
  { bg: '#FF5F57', label: 'Cerrar' },
  { bg: '#FFBD2E', label: 'Minimizar' },
  { bg: '#28C840', label: 'Pantalla completa' },
];

// Apple ease — for crossfade and step transitions
const APPLE_EASE  = [0.25, 0.46, 0.45, 0.94] as const;
// Liquid ease — richer deceleration for accordion height (cubic-bezier WWDC-style)
const LIQUID_EASE = [0.32, 0.72, 0, 1] as const;
// Mouse-tilt spring — slightly stiffer than scroll spring for responsive tracking
const MOUSE_SPRING = { stiffness: 90, damping: 22, mass: 1 } as const;

// ── Data ──────────────────────────────────────────────────────────────────────
const solutions = [
  {
    id: 'reserva',
    title: 'Capa 1: Dashboard',
    subtitle: 'El centro de control de tu salón',
    icon: LayoutDashboard,
    glow: VIOLET_GLOW,
    bullets: [
      'Visualiza tus ingresos diarios y turnos agendados al instante.',
      'Acceso rápido al expediente técnico de cada cliente.',
      'Control centralizado de caja y colaboradores.',
    ],
  },
  {
    id: 'agenda',
    title: 'Capa 2: Agenda inteligente',
    subtitle: 'Adiós a los olvidos y superposiciones',
    icon: Calendar,
    glow: VIOLET_GLOW,
    bullets: [
      'Organización de turnos por profesional, día y horario.',
      'Historial de visitas y notas especiales de clientes integradas.',
      'Envío automático de notificaciones de cobro y reservas.',
    ],
  },
  {
    id: 'metricas',
    title: 'Capa 3: Reportes & Crecimiento',
    subtitle: 'El control absoluto sobre tus números',
    icon: TrendingUp,
    glow: VIOLET_GLOW,
    bullets: [
      'Visualización clara de ingresos por día, semana y mes.',
      'Historial técnico y preferencias detalladas de clientas.',
      'Métricas de retención y servicios con mayor demanda.',
    ],
  },
];

// ── Mockups (pre-cargados en DOM — sin flicker) ───────────────────────────────
function MockupReserva() {
  return (
    <div className="w-full h-full bg-[#0d0d0f] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/dashboard-preview.png"
        alt="Vista previa del dashboard"
        className="w-full h-full object-cover object-top"
        draggable={false}
      />
    </div>
  );
}

function MockupAgenda() {
  return (
    <div className="w-full h-full bg-[#0d0d0f] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/calendar-preview.png"
        alt="Vista previa de la agenda"
        className="w-full h-full object-cover object-top"
        draggable={false}
      />
    </div>
  );
}

function MockupMetricas() {
  const bars = [45, 62, 38, 78, 55, 91, 67];
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return (
    <div className="w-full h-full bg-[#0d0d0f] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] shrink-0">
        <span className="text-white text-[11px] font-semibold">Reportes · Mayo 2026</span>
        <span className="text-[9px] text-violet-400 font-semibold">↑ +18% vs abril</span>
      </div>
      <div className="grid grid-cols-3 border-b border-white/[0.04] shrink-0">
        {[
          { label: 'Ingresos',   val: '$48.500', color: '#c4b5fd' },
          { label: 'Turnos',     val: '23',      color: '#a78bfa' },
          { label: 'Valoración', val: '4.8 ★',   color: '#ddd6fe' },
        ].map((s, i) => (
          <div key={s.label} className={`px-3 py-2 ${i < 2 ? 'border-r border-white/[0.04]' : ''}`}>
            <p className="text-[8px] text-zinc-600 mb-0.5">{s.label}</p>
            <p className="text-[11px] font-bold" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 px-3 pt-2.5 pb-1 flex flex-col min-h-0">
        <p className="text-[8px] text-zinc-600 mb-2 shrink-0">Ingresos por día esta semana</p>
        <div className="flex items-end gap-1.5 flex-1">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1 h-full">
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 5
                      ? 'linear-gradient(to top, #4c1d95, #7c3aed, #c4b5fd)'
                      : 'rgba(167,139,250,0.18)',
                  }}
                />
              </div>
              <span className="text-[7px] text-zinc-600 shrink-0">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 pb-2.5 border-t border-white/[0.04] pt-2 shrink-0">
        <p className="text-[8px] text-zinc-600 mb-1.5">Servicios más pedidos</p>
        {[
          { name: 'Coloración', pct: 78 },
          { name: 'Keratina',   pct: 55 },
          { name: 'Corte',      pct: 42 },
        ].map(s => (
          <div key={s.name} className="flex items-center gap-2 mb-1">
            <span className="text-[8px] text-zinc-500 w-16 shrink-0">{s.name}</span>
            <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-violet-500/60 rounded-full" style={{ width: `${s.pct}%` }} />
            </div>
            <span className="text-[8px] text-zinc-600 w-6 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCKUPS = [MockupReserva, MockupAgenda, MockupMetricas];

// ─────────────────────────────────────────────────────────────────────────────

export default function SolucionesSection() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const glareRef      = useRef<HTMLDivElement>(null);   // direct DOM — no re-renders

  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  const activeStepRef  = useRef(0);
  const isCompleteRef  = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const scrollProgress = useMotionValue(0);

  // ── Mouse-driven tilt MotionValues ──────────────────────────────────────────
  // Normalized to [-0.5, 0.5] where (0,0) = card center = no extra rotation.
  // These ADD to the scroll-driven base rotation so the card feels alive on hover
  // while still respecting its scroll-animated resting angle.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 42, damping: 14, restDelta: 0.001 });

  const rotateX  = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [15, 5]);
  const rotateY  = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-12, -4]);
  const tiltScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [0.95, 1.02]);

  // ── Mouse micro-tilt — ±4° added on top of scroll-driven base ───────────────
  // mouseY positive (cursor below center) → rotateX negative → top of card
  //   tilts away (matches how a real surface reacts to a light source below).
  // mouseX positive (cursor right of center) → rotateY positive → right side
  //   tilts away — same direction as the glare reflection (physically correct).
  const mouseRotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [4, -4]),
    MOUSE_SPRING
  );
  const mouseRotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [-4, 4]),
    MOUSE_SPRING
  );

  // Compose scroll + mouse into a single MotionValue — Framer Motion merges
  // them in one rAF pass with no intermediate React renders.
  // `as any` is needed because Framer Motion's TS overloads don't narrow
  // the multi-value array form correctly; the runtime behaviour is correct.
  const combinedRotateX = useTransform(
    [rotateX, mouseRotateX] as any,
    ([s, m]: number[]) => s + m
  ) as MotionValue<number>;
  const combinedRotateY = useTransform(
    [rotateY, mouseRotateY] as any,
    ([s, m]: number[]) => s + m
  ) as MotionValue<number>;

  const exitOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0.82]);
  const exitScale   = useTransform(scrollYProgress, [0.85, 1], [1, 0.97]);

  useLenis(({ scroll }) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = rect.top + scroll;
    const scrollable   = containerRef.current.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const p = Math.max(0, Math.min(1, (scroll - containerTop) / scrollable));

    scrollProgress.set(p);

    const newStep = p < 0.30 ? 0 : p < 0.65 ? 1 : 2;
    if (newStep !== activeStepRef.current) {
      activeStepRef.current = newStep;
      setActiveStep(newStep);
    }
    const complete = p >= 0.90;
    if (complete !== isCompleteRef.current) {
      isCompleteRef.current = complete;
      setIsComplete(complete);
    }
  });

  // ── Glare: coordinate calculation ────────────────────────────────────────────
  // We read mouse position relative to the window container, then map to
  // percentage coords (0-100%). The gradient center follows the cursor with
  // zero React re-renders — we mutate the overlay DOM element directly.
  //
  //   x% = (clientX - containerLeft) / containerWidth  × 100
  //   y% = (clientY - containerTop)  / containerHeight × 100
  //
  // mix-blend-mode: screen means the glare only adds light — it can't darken,
  // which is physically correct for light hitting glass.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();

    // Normalized [-0.5, 0.5] — drives the tilt springs
    const nx = (e.clientX - rect.left) / rect.width  - 0.5;
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);

    // Percentage [0, 100] — drives the glare overlay directly on the DOM node
    if (glareRef.current) {
      const gx = (nx + 0.5) * 100;
      const gy = (ny + 0.5) * 100;
      glareRef.current.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 30%, transparent 62%)`;
    }
  }, [mouseX, mouseY, prefersReducedMotion]);

  const handleMouseEnter = useCallback(() => {
    if (glareRef.current) glareRef.current.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Springs pull back to (0,0) — no abrupt snap
    mouseX.set(0);
    mouseY.set(0);
    if (glareRef.current) glareRef.current.style.opacity = '0';
  }, [mouseX, mouseY]);

  // ── Monitor shadow — Apple product-page fidelity ──────────────────────────
  const monitorShadow = [
    'inset 0 1px 0 rgba(255,255,255,0.18)',   // glass bevel top edge
    'inset 0 0 0 1px rgba(255,255,255,0.06)', // inner rim glow
    '0 0 0 1px rgba(255,255,255,0.08)',       // outer rim
    '0 32px 80px -12px rgba(0,0,0,0.85)',     // depth shadow
    '0 72px 160px -24px rgba(0,0,0,0.60)',    // wide ambient shadow
    '0 0 140px rgba(167,139,250,0.12)',        // violet ambient glow
  ].join(', ');

  // ── Active accordion card shadow — inset violet on glass ─────────────────
  const activeAccordionShadow = [
    'inset 0 1px 0 rgba(255,255,255,0.07)',   // glass top bevel
    'inset 0 0 20px rgba(139,92,246,0.06)',   // inner violet wash
    '0 0 0 1px rgba(167,139,250,0.22)',       // outer violet ring
    '0 8px 32px rgba(167,139,250,0.09)',      // depth glow
  ].join(', ');

  return (
    <div
      ref={containerRef}
      className={`relative z-10 ${isMobile ? '' : 'h-[400vh]'}`}
    >
      <section
        className={`border-b border-white/[0.04]
          ${isMobile ? 'py-20' : 'sticky top-0 h-screen overflow-hidden'}`}
        style={{
          background: [
            'radial-gradient(ellipse 90% 55% at 50% -8%, rgba(167,139,250,0.08) 0%, transparent 60%)',
            '#09090b',
          ].join(', '),
        }}
      >
        <div className={`max-w-6xl mx-auto px-2 md:px-4 ${isMobile ? 'block' : 'h-full flex items-center pt-20'}`}>

          {/* ── DESKTOP ──────────────────────────────────────────────────── */}
          {!isMobile ? (
            <motion.div
              style={{ opacity: exitOpacity, scale: exitScale }}
              className="grid grid-cols-12 gap-10 w-full items-center"
            >

              {/* LEFT — Ventana macOS con Liquid Glass */}
              <div className="col-span-7 flex flex-col justify-center relative">

                {/* Glow ambiental violeta */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2
                    w-[560px] h-[560px] rounded-full opacity-30 blur-[90px] transition-all duration-700"
                  style={{ background: `radial-gradient(circle, ${solutions[activeStep].glow} 0%, transparent 70%)` }}
                />

                {/* Heading */}
                <div className="mb-8 max-w-lg relative z-10">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
                    Potencia y Simplicidad
                  </p>
                  <h2 className="font-playfair text-[clamp(2.5rem,4.5vw,3.6rem)] font-normal text-white leading-[1.1] tracking-tight">
                    Tu salón bajo control,{' '}
                    <span className="text-violet-400">capa por capa.</span>
                  </h2>
                </div>

                {/* ── Ventana macOS — Liquid Glass ──────────────────────── */}
                <div
                  className="w-full relative z-10"
                  style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    style={{ rotateX: combinedRotateX, rotateY: combinedRotateY, scale: tiltScale, boxShadow: monitorShadow }}
                    className="w-full h-[360px] lg:h-[420px] rounded-[12px] overflow-hidden
                      flex flex-col
                      border border-white/[0.12]
                      bg-zinc-900/30 backdrop-blur-2xl"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Title bar — glass gradient, simula el grosor del cristal */}
                    <div
                      className="h-9 shrink-0 border-b border-white/[0.06]
                        flex items-center px-4 relative select-none"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {TRAFFIC.map(({ bg, label }) => (
                          <div
                            key={label}
                            aria-label={label}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: bg }}
                          />
                        ))}
                      </div>
                      {/* URL bar */}
                      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
                        <div className="flex items-center gap-1.5 h-5 px-3 rounded-md
                          bg-white/[0.06] border border-white/[0.06]">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                          <span className="text-[9px] text-zinc-600 tracking-tight">
                            mujerapp.com/dashboard
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Área de contenido — opaca para los mockups */}
                    <div className="flex-1 relative overflow-hidden bg-[#050504]">
                      {/* Crossfade de mockups — todos en DOM → sin flicker */}
                      {MOCKUPS.map((MockupComponent, i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0"
                          animate={{
                            opacity: i === activeStep ? 1 : 0,
                            scale:   i === activeStep ? 1 : 0.97,
                          }}
                          transition={{
                            opacity: {
                              duration: prefersReducedMotion ? 0 : 0.38,
                              ease: APPLE_EASE,
                            },
                            scale: prefersReducedMotion
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 300, damping: 26, mass: 0.8 },
                          }}
                          style={{ transformOrigin: 'center top' }}
                        >
                          <MockupComponent />
                        </motion.div>
                      ))}

                      {/*
                        ── Dynamic Glare overlay ────────────────────────────
                        Tracks mouse position on the parent motion.div.
                        Coordinates: x% = (clientX − left) / width × 100
                                     y% = (clientY − top)  / height × 100
                        We mutate style.background directly → zero re-renders.
                        mix-blend-mode: screen ensures it only ADDS light
                        (physically correct for glass reflection — can't darken).
                        opacity transitions via CSS transition: 300ms.
                      */}
                      <div
                        ref={glareRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-20"
                        style={{
                          opacity: 0,
                          background:
                            'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 60%)',
                          mixBlendMode: 'screen',
                          transition: 'opacity 300ms ease',
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* RIGHT — Acordeón Liquid Glass ───────────────────────────── */}
              <div className="col-span-5 flex flex-col justify-center gap-2">

                {solutions.map((sol, index) => {
                  const Icon     = sol.icon;
                  const isActive = activeStep === index;

                  return (
                    <motion.div
                      key={sol.id}
                      animate={{ opacity: isActive ? 1 : 0.45 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: LIQUID_EASE }}
                      onClick={() => setActiveStep(index)}
                      style={isActive ? { boxShadow: activeAccordionShadow } : {}}
                      className={`rounded-2xl border cursor-pointer overflow-hidden
                        transition-[background-color,border-color,backdrop-filter] duration-500
                        ${isActive
                          // Liquid Glass activo: translúcido + blur + borde violeta iluminado
                          ? 'border-violet-500/30 bg-zinc-800/40 backdrop-blur-md'
                          : 'border-white/[0.04] bg-transparent hover:border-white/[0.09]'
                        }`}
                    >
                      {/* Header — siempre visible */}
                      <div className="flex gap-4 items-center p-5">
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0
                          transition-all duration-400
                          ${isActive
                            ? 'bg-violet-400/[0.12] border-violet-400/[0.32] scale-105'
                            : 'bg-white/[0.02] border-white/[0.07]'
                          }`}>
                          <Icon className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`font-playfair text-[1.15rem] font-normal leading-tight
                            transition-colors duration-300
                            ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                            {sol.title}
                          </h3>
                          <p className={`text-xs font-medium uppercase tracking-widest mt-0.5 truncate
                            transition-colors duration-300
                            ${isActive ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {sol.subtitle}
                          </p>
                        </div>
                      </div>

                      {/*
                        Bullets: height + opacity con LIQUID_EASE (0.32, 0.72, 0, 1).
                        Height a 450ms → decelera rápido al inicio, llega suave al final.
                        Opacity a 280ms → el texto aparece antes de que el acordeón
                        termine de abrirse, creando profundidad temporal.
                      */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.ul
                            key="bullets"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              height:  { duration: prefersReducedMotion ? 0 : 0.45, ease: LIQUID_EASE },
                              opacity: { duration: prefersReducedMotion ? 0 : 0.28, ease: APPLE_EASE },
                            }}
                            className="space-y-4 px-5 pb-5 overflow-hidden"
                          >
                            {sol.bullets.map((bullet, bIdx) => (
                              <motion.li
                                key={bIdx}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: prefersReducedMotion ? 0 : 0.3,
                                  delay:    prefersReducedMotion ? 0 : 0.06 + bIdx * 0.07,
                                  ease:     APPLE_EASE,
                                }}
                                className="flex gap-3 items-start text-sm leading-relaxed text-zinc-400"
                              >
                                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-violet-400" />
                                <span>{bullet}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Puntos de navegación */}
                <div className="flex gap-2 justify-center pt-3">
                  {solutions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      aria-label={`Ir a capa ${i + 1}`}
                      className="rounded-full cursor-pointer transition-all duration-500"
                      style={{
                        width:           i === activeStep ? '18px' : '6px',
                        height:          '6px',
                        backgroundColor: i === activeStep ? VIOLET_HEX : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>

                {/* Nudge al completar */}
                <AnimatePresence>
                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="flex items-center justify-center gap-3 pt-1"
                    >
                      <div className="h-px flex-1 bg-white/[0.06]" />
                      <span className="text-[11px] text-zinc-600 flex items-center gap-1.5 select-none">
                        <motion.span
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          ↓
                        </motion.span>
                        Seguí explorando
                      </span>
                      <div className="h-px flex-1 bg-white/[0.06]" />
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          ) : (

            /* ── MOBILE — stacked, sin efectos de scroll ────────────────── */
            <div className="space-y-16">
              <div className="text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
                  Potencia y Simplicidad
                </p>
                <h2 className="font-playfair text-[clamp(2.2rem,8vw,3rem)] font-normal text-white leading-[1.1] tracking-tight">
                  Tu salón bajo control,<br />
                  <span className="text-violet-400">capa por capa.</span>
                </h2>
              </div>

              <div className="space-y-24">
                {solutions.map((sol, index) => {
                  const Icon            = sol.icon;
                  const MockupComponent = MOCKUPS[index];
                  return (
                    <div key={sol.id} className="space-y-8">
                      <div
                        className="w-full max-w-lg mx-auto rounded-[10px] overflow-hidden
                          border border-white/[0.10] bg-zinc-900/30 backdrop-blur-xl"
                        style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 60px rgba(167,139,250,0.06)' }}
                      >
                        <div className="h-7 border-b border-white/[0.06] flex items-center px-3 gap-1.5"
                          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}>
                          {TRAFFIC.map(({ bg, label }) => (
                            <div key={label} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bg }} />
                          ))}
                        </div>
                        <div className="h-60 bg-[#050504]">
                          <MockupComponent />
                        </div>
                      </div>

                      <div className="space-y-4 max-w-md mx-auto">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-xl border flex items-center justify-center
                            bg-violet-400/[0.06] border-violet-400/20">
                            <Icon className="w-4 h-4 text-violet-400" />
                          </div>
                          <div>
                            <h3 className="font-playfair text-xl font-normal text-white">{sol.title}</h3>
                            <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">{sol.subtitle}</p>
                          </div>
                        </div>
                        <ul className="space-y-2.5 pl-1">
                          {sol.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex gap-2.5 items-start text-xs text-zinc-400">
                              <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-violet-400" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
