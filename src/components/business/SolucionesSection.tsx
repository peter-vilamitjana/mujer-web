'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  useSpring, useMotionValue, MotionValue,
  motion, useReducedMotion, useTransform,
} from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Calendar, TrendingUp, LayoutDashboard, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ── Tokens ────────────────────────────────────────────────────────────────────
const VIOLET_HEX   = '#a78bfa';
const MOUSE_SPRING = { stiffness: 90, damping: 22, mass: 1 } as const;

const TRAFFIC = [
  { bg: '#FF5F57', label: 'Cerrar' },
  { bg: '#FFBD2E', label: 'Minimizar' },
  { bg: '#28C840', label: 'Pantalla completa' },
];

// ── Data ──────────────────────────────────────────────────────────────────────
const solutions = [
  {
    id: 'reserva',
    title: 'Capa 1: Dashboard',
    subtitle: 'El centro de control de tu salón',
    icon: LayoutDashboard,
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
    bullets: [
      'Visualización clara de ingresos por día, semana y mes.',
      'Historial técnico y preferencias detalladas de clientas.',
      'Métricas de retención y servicios con mayor demanda.',
    ],
  },
];

// ── Mockup components ─────────────────────────────────────────────────────────
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
// SolucionesSection
// ─────────────────────────────────────────────────────────────────────────────

export default function SolucionesSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile,   setIsMobile]   = useState(false);

  const layerRefs     = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const glareRef      = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef(0);

  // GSAP scope + title targets
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const h2Ref      = useRef<HTMLHeadingElement>(null);
  const mobileRef  = useRef<HTMLDivElement>(null);

  // ── Mejora 1 — Container entrance via Lenis scroll progress ──────────────
  const lenisScroll            = useMotionValue(0);
  const containerEntranceY     = useMotionValue(60);
  const containerEntranceOpacity = useMotionValue(0);
  const containerEntranceScale = useMotionValue(0.94);

  // ── Mejora 3 — Breathing MotionValue ──────────────────────────────────────
  const breathingY = useMotionValue(0);

  const prefersReducedMotion = useReducedMotion();

  // Mouse-tilt MotionValues — normalized [-0.5, 0.5]
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // isMobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Mejora 3 — Breathing: sinusoidal RAF loop ──────────────────────────────
  useEffect(() => {
    if (prefersReducedMotion) return;
    let startTime: number | null = null;
    let rafId: number;
    const tick = (ts: number) => {
      if (!startTime) startTime = ts;
      const t = (ts - startTime) / 1000;
      breathingY.set(Math.sin(t * (Math.PI * 2 / 6)) * 4);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReducedMotion, breathingY]);

  // ── Mejora 1 — Track raw Lenis scroll position ────────────────────────────
  useLenis(({ scroll }: { scroll: number }) => {
    lenisScroll.set(scroll);
  });

  // ── Lenis: ScrollTrigger sync + layer detection + entrance progress ────────
  useLenis(() => {
    ScrollTrigger.update();

    // Mejora 1 — entrance progress from section top crossing 80% viewport
    if (sectionRef.current && !prefersReducedMotion) {
      const rect  = sectionRef.current.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = Math.max(0, Math.min(1,
        (viewH * 0.8 - rect.top) / (viewH * 0.4),
      ));
      containerEntranceY.set(60 * (1 - progress));
      containerEntranceOpacity.set(progress);
      containerEntranceScale.set(0.94 + 0.06 * progress);
    }

    if (isMobile) return;

    // Active layer detection — closest center to viewport midpoint
    const vhCenter = window.innerHeight / 2;
    let closestIdx  = 0;
    let closestDist = Infinity;
    layerRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const rect     = ref.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const dist     = Math.abs(elCenter - vhCenter);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    });
    if (closestIdx !== activeStepRef.current) {
      activeStepRef.current = closestIdx;
      setActiveStep(closestIdx);
    }
  });

  // ── GSAP ScrollTrigger: title entrance + mobile cards ─────────────────────
  useGSAP(() => {
    if (prefersReducedMotion) return;

    const titleTl = gsap.timeline({
      scrollTrigger: {
        trigger: eyebrowRef.current,
        start: 'top 88%',
        once: true,
      },
    });
    titleTl
      .from(eyebrowRef.current, { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' })
      .from(h2Ref.current,      { opacity: 0, y: 36, duration: 1.0, ease: 'power3.out' }, '-=0.3');

    const mm = gsap.matchMedia();
    mm.add('(max-width: 1023px)', () => {
      if (!mobileRef.current) return;
      const cards = mobileRef.current.querySelectorAll('.mobile-card');
      if (!cards.length) return;
      ScrollTrigger.batch(cards, {
        onEnter: (elements) => {
          gsap.from(elements, { opacity: 0, y: 52, duration: 0.78, stagger: 0.13, ease: 'power2.out' });
        },
        start: 'top 88%',
        once: true,
      });
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  // ── Mouse micro-tilt springs (+4° max, both axes) ─────────────────────────
  const mouseRotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [4, -4]),
    MOUSE_SPRING,
  );
  const mouseRotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [-4, 4]),
    MOUSE_SPRING,
  );

  // Static base tilt (8° rotateX, -6° rotateY) + mouse offset
  const combinedRotateX = useTransform(
    [mouseRotateX] as any,
    ([m]: number[]) => (prefersReducedMotion ? 0 : 8) + m,
  ) as MotionValue<number>;
  const combinedRotateY = useTransform(
    [mouseRotateY] as any,
    ([m]: number[]) => (prefersReducedMotion ? 0 : -6) + m,
  ) as MotionValue<number>;

  // ── Mejora 4 — Dynamic shadow that follows the tilt ───────────────────────
  const shadowX = useTransform(
    mouseRotateY, [-4, 4],
    prefersReducedMotion ? [0, 0] : [-8, 8],
  );
  const shadowY = useTransform(
    mouseRotateX, [-4, 4],
    prefersReducedMotion ? [0, 0] : [4, -4],
  );
  const dynamicShadow = useTransform(
    [shadowX, shadowY] as any,
    ([sx, sy]: number[]) => [
      'inset 0 1px 0 rgba(255,255,255,0.18)',
      'inset 0 0 0 1px rgba(255,255,255,0.06)',
      '0 0 0 1px rgba(255,255,255,0.08)',
      `${-sx * 2}px ${32 + sy * 2}px 80px -12px rgba(0,0,0,0.85)`,
      `${-sx * 4}px ${72 + sy * 4}px 160px -24px rgba(0,0,0,0.60)`,
      '0 0 140px rgba(167,139,250,0.14)',
    ].join(', '),
  ) as MotionValue<string>;

  // ── Glare — direct DOM mutation, zero re-renders ──────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width  - 0.5;
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
    if (glareRef.current) {
      const gx = (nx + 0.5) * 100;
      const gy = (ny + 0.5) * 100;
      glareRef.current.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 30%, transparent 62%)`;
    }
  }, [mouseX, mouseY, prefersReducedMotion]);

  const handleMouseEnter = useCallback(() => {
    if (glareRef.current) glareRef.current.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    if (glareRef.current) glareRef.current.style.opacity = '0';
  }, [mouseX, mouseY]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="relative bg-[#09090b] border-b border-white/[0.04]"
      style={{
        background: [
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(167,139,250,0.09) 0%, transparent 55%)',
          'radial-gradient(ellipse 40% 60% at 80% 50%, rgba(139,92,246,0.06) 0%, transparent 50%)',
          '#09090b',
        ].join(', '),
      }}
    >

      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto text-center px-6 pt-32 pb-20 md:pb-28 relative">
        {/* Mini ribbon detrás del título — eco del gesto orgánico del hero */}
        {!prefersReducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 600 200"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="title-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path
                d="M 0 100 C 150 40, 300 160, 600 80"
                stroke="url(#title-ribbon)"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
        )}
        <p
          ref={eyebrowRef}
          className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4"
        >
          Potencia y Simplicidad
        </p>
        <h2
          ref={h2Ref}
          className="font-playfair text-[clamp(2.8rem,5vw,4.2rem)] font-normal
            text-white leading-[1.08] tracking-tight"
        >
          Tu salón bajo control,{' '}
          <span className="text-violet-400 italic">capa por capa.</span>
        </h2>
      </div>

      {/* ── Mobile — stacked ──────────────────────────────────────────────── */}
      {isMobile ? (
        <div ref={mobileRef} className="px-6 pb-24 space-y-24">
          {solutions.map((sol, index) => {
            const Icon            = sol.icon;
            const MockupComponent = MOCKUPS[index];
            return (
              <div key={sol.id} className="mobile-card space-y-8">
                <div
                  className="w-full rounded-[10px] overflow-hidden border border-white/[0.10] bg-zinc-900/30"
                  style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 60px rgba(167,139,250,0.06)' }}
                >
                  <div
                    className="h-7 border-b border-white/[0.06] flex items-center px-3 gap-1.5"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}
                  >
                    {TRAFFIC.map(({ bg, label }) => (
                      <div key={label} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bg }} />
                    ))}
                  </div>
                  <div className="h-64 bg-[#050504]"><MockupComponent /></div>
                </div>
                <div className="space-y-5">
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
                  <ul className="space-y-3">
                    {sol.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex gap-2.5 items-start text-sm text-zinc-400">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-violet-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* ── Desktop — Sticky Split-View ──────────────────────────────────── */
        <div className="grid grid-cols-2 max-w-7xl mx-auto">

          {/* LEFT — Scrollable text layers ───────────────────────────────── */}
          <div>
            {solutions.map((sol, i) => {
              const Icon     = sol.icon;
              const isActive = activeStep === i;
              return (
                <div
                  key={sol.id}
                  ref={(el) => { layerRefs.current[i] = el; }}
                  className="h-screen flex flex-col justify-center px-12 xl:px-20"
                >
                  {/*
                    Mejora 6 — key changes with isActive so active layer
                    re-mounts with initial { opacity:0, y:12 } for a
                    micro-slide entrance; inactive layers snap to dimmed state.
                  */}
                  <motion.div
                    key={`text-${i}-${isActive}`}
                    initial={isActive && !prefersReducedMotion
                      ? { opacity: 0, y: 12 }
                      : false
                    }
                    animate={{
                      opacity: isActive ? 1 : 0.18,
                      y:       isActive ? 0  : 8,
                    }}
                    transition={{
                      opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      y:       { type: 'spring', stiffness: 300, damping: 28 },
                    }}
                  >
                    {/* Icon + subtitle label */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border
                        transition-all duration-500
                        ${isActive
                          ? 'bg-violet-400/[0.12] border-violet-400/[0.32]'
                          : 'bg-white/[0.02] border-white/[0.06]'}`}>
                        <Icon className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.35em]
                        transition-colors duration-500
                        ${isActive ? 'text-violet-400' : 'text-zinc-700'}`}>
                        {sol.subtitle}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`font-playfair text-[clamp(1.9rem,3vw,2.8rem)] font-normal
                      leading-tight tracking-tight mb-5 transition-colors duration-500
                      ${isActive ? 'text-white' : 'text-zinc-700'}`}>
                      {sol.title}
                    </h3>

                    {/* Bullets */}
                    <ul className="space-y-3.5 max-w-sm">
                      {sol.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          className={`flex gap-3 items-start text-[0.95rem] leading-relaxed
                            transition-colors duration-500
                            ${isActive ? 'text-zinc-300' : 'text-zinc-700'}`}
                        >
                          <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 transition-colors duration-500
                            ${isActive ? 'text-violet-400' : 'text-zinc-700'}`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* RIGHT — Sticky 3D macOS window ──────────────────────────────── */}
          <div className="sticky top-0 h-screen flex items-center justify-center">
            {/* Scroll progress bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden" aria-hidden="true">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"
                animate={{ scaleX: (activeStep + 1) / solutions.length }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{ transformOrigin: 'left' }}
              />
            </div>

            {/*
              Mejora 1 — Entrance driven by Lenis scroll progress:
              containerEntranceY/Opacity/Scale animate from initial values
              as the section top crosses 80% of the viewport height.
            */}
            <motion.div
              className="relative flex flex-col items-center"
              style={{
                perspective:      '1200px',
                transformStyle:   'preserve-3d',
                y:       prefersReducedMotion ? 0 : containerEntranceY,
                opacity: prefersReducedMotion ? 1 : containerEntranceOpacity,
                scale:   prefersReducedMotion ? 1 : containerEntranceScale,
              }}
            >
              {/*
                Mejora 3 — Breathing: breathingY floats the window ±4px on a
                6-second sine cycle via RAF.
                Mejora 4 — dynamicShadow: boxShadow follows the mouse tilt.
              */}
              <motion.div
                style={{
                  rotateX:   combinedRotateX,
                  rotateY:   combinedRotateY,
                  y:         prefersReducedMotion ? 0 : breathingY,
                  boxShadow: dynamicShadow,
                }}
                className="w-[min(48vw,680px)] h-[min(56vh,520px)]
                  rounded-[12px] overflow-hidden flex flex-col
                  border border-white/[0.12]
                  bg-zinc-900/30 backdrop-blur-2xl"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Title bar */}
                <div
                  className="h-9 shrink-0 border-b border-white/[0.06]
                    flex items-center px-4 relative select-none"
                  style={{
                    background:     'linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
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
                  <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 h-5 px-3 rounded-md bg-white/[0.06] border border-white/[0.06]">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                      <span className="text-[9px] text-zinc-600 tracking-tight">
                        mujerapp.com/dashboard
                      </span>
                    </div>
                  </div>
                </div>

                {/*
                  Mejora 2 — 3D mockup transition:
                  Inactive mockups rest at rotateX:6 + blur(2px).
                  Active mockup animates to rotateX:0 + blur(0px) with spring.
                  Creates a "page turn from depth" effect on transition.
                */}
                <div className="flex-1 relative overflow-hidden bg-[#050504]">
                  {MOCKUPS.map((MockupComponent, mi) => (
                    <motion.div
                      key={mi}
                      className="absolute inset-0"
                      initial={prefersReducedMotion ? {} : {
                        opacity: 0,
                        scale:   0.95,
                        rotateX: -8,
                        filter:  'blur(3px)',
                      }}
                      animate={{
                        opacity: mi === activeStep ? 1    : 0,
                        scale:   mi === activeStep ? 1    : 0.96,
                        rotateX: mi === activeStep ? 0    : 6,
                        filter:  mi === activeStep ? 'blur(0px)' : 'blur(2px)',
                      }}
                      transition={{
                        opacity: {
                          duration: prefersReducedMotion ? 0 : 0.42,
                          ease:     [0.16, 1, 0.3, 1],
                        },
                        scale: prefersReducedMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 280, damping: 28 },
                        rotateX: prefersReducedMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 200, damping: 24 },
                        filter: {
                          duration: prefersReducedMotion ? 0 : 0.35,
                        },
                      }}
                      style={{
                        transformOrigin: 'center top',
                        transformStyle:  'preserve-3d',
                      }}
                    >
                      <MockupComponent />
                    </motion.div>
                  ))}

                  {/* Glare */}
                  <div
                    ref={glareRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20"
                    style={{
                      opacity:      0,
                      background:   'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 60%)',
                      mixBlendMode: 'screen',
                      transition:   'opacity 300ms ease',
                    }}
                  />
                </div>
              </motion.div>

              {/*
                Mejora 5 — Step dots with spring width + hover scale physics.
              */}
              <div className="flex gap-2.5 justify-center mt-8" role="tablist">
                {solutions.map((sol, di) => (
                  <motion.button
                    key={di}
                    onClick={() => setActiveStep(di)}
                    aria-label={`Ir a ${sol.title}`}
                    aria-selected={di === activeStep}
                    role="tab"
                    className="rounded-full cursor-pointer
                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-violet-400/60"
                    animate={{
                      width:           di === activeStep ? 24 : 6,
                      backgroundColor: di === activeStep
                        ? VIOLET_HEX
                        : 'rgba(255,255,255,0.15)',
                      scale: di === activeStep ? 1 : 0.9,
                    }}
                    whileHover={{ scale: di === activeStep ? 1 : 1.3 }}
                    transition={{
                      width:           { type: 'spring', stiffness: 400, damping: 30 },
                      scale:           { type: 'spring', stiffness: 400, damping: 25 },
                      backgroundColor: { duration: 0.3 },
                    }}
                    style={{ height: 6 }}
                  />
                ))}
              </div>

            </motion.div>
          </div>

        </div>
      )}
    </section>
  );
}
