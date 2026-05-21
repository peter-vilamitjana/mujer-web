'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, useSpring, useMotionValue, motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Calendar, TrendingUp, LayoutDashboard, CheckCircle } from 'lucide-react';

// ── Paleta violeta unificada ───────────────────────────────────────────────────
const VIOLET_HEX = '#a78bfa'; // violet-400

const solutions = [
  {
    id: 'reserva',
    title: 'Capa 1: Dashboard',
    subtitle: 'El centro de control de tu salón',
    icon: LayoutDashboard,
    color: 'text-violet-400',
    glow: 'rgba(167,139,250,0.15)',
    image: '/landing/dashboard-preview.png',
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
    color: 'text-violet-400',
    glow: 'rgba(167,139,250,0.15)',
    image: '/landing/calendar-preview.png',
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
    color: 'text-violet-400',
    glow: 'rgba(167,139,250,0.15)',
    image: '/landing/dashboard-preview.png?v=2',
    bullets: [
      'Visualización clara de ingresos por día, semana y mes.',
      'Historial técnico y preferencias detalladas de clientas.',
      'Métricas de retención y servicios con mayor demanda.',
    ],
  },
];

// ─── Mockups ─────────────────────────────────────────────────────────────────
// Todos se renderizan al mismo tiempo (stacked) para que el crossfade sea instantáneo.

function MockupReserva() {
  return (
    <div className="w-full h-full bg-[#0d0d0f] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/dashboard-preview.png"
        alt="Vista previa del link de reservas"
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
        alt="Vista previa de la agenda inteligente"
        className="w-full h-full object-cover object-top"
        draggable={false}
      />
    </div>
  );
}

function MockupMetricas() {
  const bars = [45, 62, 38, 78, 55, 91, 67];
  const days = ['L','M','X','J','V','S','D'];
  return (
    <div className="w-full h-full bg-[#0d0d0f] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] shrink-0">
        <span className="text-white text-[11px] font-semibold">Reportes · Mayo 2026</span>
        <span className="text-[9px] text-violet-400 font-semibold">↑ +18% vs abril</span>
      </div>
      <div className="grid grid-cols-3 border-b border-white/[0.04] shrink-0">
        {[
          { label: 'Ingresos',  val: '$48.500', color: '#c4b5fd' },
          { label: 'Turnos',    val: '23',      color: '#a78bfa' },
          { label: 'Valoración',val: '4.8 ★',  color: '#ddd6fe' },
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
                      ? 'linear-gradient(to top, #6d28d9, #a78bfa)'
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
        {[{ name: 'Coloración', pct: 78 }, { name: 'Keratina', pct: 55 }, { name: 'Corte', pct: 42 }].map(s => (
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const activeStepRef = useRef(0);
  const isCompleteRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 42,
    damping: 14,
    restDelta: 0.001,
  });

  const rotateX = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [15, 5]);
  const rotateY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-12, -4]);
  const scale   = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [0.95, 1.02]);

  const exitOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0.82]);
  const exitScale   = useTransform(scrollYProgress, [0.85, 1], [1, 0.97]);

  useLenis(({ scroll }) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = rect.top + scroll;
    const scrollable = containerRef.current.offsetHeight - window.innerHeight;
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

  return (
    <div
      ref={containerRef}
      className={`relative z-10 ${isMobile ? '' : 'h-[400vh]'}`}
    >
      <section
        className={`bg-[#09090b] border-b border-white/[0.04]
          ${isMobile ? 'py-20' : 'sticky top-0 h-screen overflow-hidden'}`}
      >
        <div className={`max-w-6xl mx-auto px-6 ${isMobile ? 'block' : 'h-full flex items-center pt-20'}`}>

          {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
          {!isMobile ? (
            <motion.div
              style={{ opacity: exitOpacity, scale: exitScale }}
              className="grid grid-cols-12 gap-8 w-full items-center"
            >

              {/* LEFT — Monitor con crossfade entre mockups */}
              <div className="col-span-8 flex flex-col justify-center relative">
                {/* Glow de fondo que sigue el step activo */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2
                    w-[600px] h-[600px] rounded-full opacity-30 blur-[80px]
                    transition-all duration-700"
                  style={{ background: `radial-gradient(circle, ${solutions[activeStep].glow} 0%, transparent 70%)` }}
                />

                <div className="mb-8 max-w-md relative z-10">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
                    Potencia y Simplicidad
                  </p>
                  <h2 className="font-playfair text-[clamp(2.2rem,4vw,3rem)] text-white italic leading-tight">
                    Tu salón bajo control,{' '}
                    <span className="text-violet-400">capa por capa.</span>
                  </h2>
                </div>

                <div
                  className="w-full flex justify-center relative z-10"
                  style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    style={{
                      rotateX,
                      rotateY,
                      scale,
                      boxShadow:
                        'inset 0 1px 1px rgba(255,255,255,0.15), 0 24px 48px -12px rgba(0,0,0,0.5), 0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026',
                    }}
                    className="w-full h-[360px] lg:h-[420px] border border-[#444] p-1.5 bg-[#222222] rounded-[28px] shadow-2xl relative overflow-hidden"
                  >
                    <div className="h-full w-full overflow-hidden rounded-[20px] bg-[#050504] relative z-10">
                      {/* Barra de título del "navegador" */}
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-black/40 border-b border-white/[0.04] absolute top-0 inset-x-0 z-30">
                        <div className="w-2 h-2 rounded-full bg-red-400/50" />
                        <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                        <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                        <div className="h-3 w-28 rounded-full bg-white/[0.04] border border-white/[0.06] mx-auto" />
                      </div>

                      {/*
                        Crossfade: todos los mockups se renderizan siempre (stacked absolute).
                        Solo cambia la opacidad → sin parpadeo, sin skeleton vacío.
                        Las imágenes se pre-cargan en background al montar el componente.
                      */}
                      <div className="w-full h-full pt-7 relative">
                        {MOCKUPS.map((MockupComponent, i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0"
                            animate={{ opacity: i === activeStep ? 1 : 0 }}
                            transition={{
                              duration: prefersReducedMotion ? 0 : 0.45,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                          >
                            <MockupComponent />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* RIGHT — Acordeón de capas */}
              <div className="col-span-4 flex flex-col justify-center gap-2">

                {solutions.map((sol, index) => {
                  const Icon = sol.icon;
                  const isActive = activeStep === index;

                  return (
                    <motion.div
                      key={sol.id}
                      animate={{ opacity: isActive ? 1 : 0.5 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.4, 0, 0.2, 1] }}
                      onClick={() => setActiveStep(index)}
                      className={`rounded-2xl border cursor-pointer overflow-hidden
                        transition-colors duration-300
                        ${isActive
                          ? 'border-violet-400/20 bg-violet-400/[0.04]'
                          : 'border-white/[0.04] bg-transparent hover:border-white/[0.08]'
                        }`}
                    >
                      {/* Header — siempre visible */}
                      <div className="flex gap-4 items-center p-5">
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0
                          transition-all duration-400
                          ${isActive
                            ? 'bg-violet-400/[0.08] border-violet-400/30 scale-105'
                            : 'bg-white/[0.02] border-white/[0.06]'
                          }`}>
                          <Icon className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-playfair text-xl font-medium text-white leading-tight">
                            {sol.title}
                          </h3>
                          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
                            {sol.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Bullets — se despliegan suavemente al activarse */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.ul
                            key="bullets"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: prefersReducedMotion ? 0 : 0.35,
                              ease: [0.4, 0, 0.2, 1],
                              opacity: { duration: prefersReducedMotion ? 0 : 0.25 },
                            }}
                            className="space-y-3 px-5 pb-5 overflow-hidden"
                          >
                            {sol.bullets.map((bullet, bIdx) => (
                              <motion.li
                                key={bIdx}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: prefersReducedMotion ? 0 : 0.3,
                                  delay: prefersReducedMotion ? 0 : 0.08 + bIdx * 0.07,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                                className="flex gap-3 items-start text-sm text-zinc-400"
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

                {/* Puntos de navegación — únicos controles de paginación */}
                <div className="flex gap-2 justify-center pt-3">
                  {solutions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      aria-label={`Ir a capa ${i + 1}`}
                      className="rounded-full transition-all duration-400 cursor-pointer"
                      style={{
                        width:           i === activeStep ? '16px' : '6px',
                        height:          '6px',
                        backgroundColor: i === activeStep ? VIOLET_HEX : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>

                {/* Nudge al completar todas las capas */}
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

            /* ── MOBILE — stacked, sin efectos de scroll ─────────────────── */
            <div className="space-y-16">
              <div className="text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
                  Potencia y Simplicidad
                </p>
                <h2 className="font-playfair text-3xl text-white italic leading-tight">
                  Tu salón bajo control,<br />
                  <span className="text-violet-400">capa por capa.</span>
                </h2>
              </div>

              <div className="space-y-24">
                {solutions.map((sol, index) => {
                  const Icon = sol.icon;
                  const MockupComponent = MOCKUPS[index];

                  return (
                    <div key={sol.id} className="space-y-8">
                      <div className="w-full max-w-sm mx-auto border border-[#444] p-1.5 bg-[#222222] rounded-[20px] shadow-xl overflow-hidden">
                        <div className="overflow-hidden rounded-[14px] bg-[#050504]">
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-black/40 border-b border-white/[0.04]">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                          </div>
                          <div className="h-48">
                            <MockupComponent />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 max-w-md mx-auto">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-xl border flex items-center justify-center bg-violet-400/[0.06] border-violet-400/20">
                            <Icon className="w-4 h-4 text-violet-400" />
                          </div>
                          <div>
                            <h3 className="font-playfair text-xl font-bold text-white">{sol.title}</h3>
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
