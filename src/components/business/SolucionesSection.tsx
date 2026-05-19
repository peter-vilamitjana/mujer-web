'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, useSpring, useMotionValue, motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Calendar, TrendingUp, Smartphone, CheckCircle } from 'lucide-react';

const solutions = [
  {
    id: 'reserva',
    title: 'Capa 1: Tu Link de Reservas',
    subtitle: 'La cara de tu salón ante tus clientas',
    icon: Smartphone,
    color: 'text-purple-400',
    glow: 'rgba(168,85,247,0.15)',
    image: '/landing/booking-preview.png',
    bullets: [
      'Perfil web autogestionable y adaptado a celulares.',
      'Tus clientas reservan solas en 3 simples clics.',
      'Sincronización en tiempo real con tu agenda interna.',
    ],
  },
  {
    id: 'agenda',
    title: 'Capa 2: Agenda Inteligente',
    subtitle: 'Adiós a los olvidos y superposiciones',
    icon: Calendar,
    color: 'text-amber-400',
    glow: 'rgba(234,179,8,0.15)',
    image: '/landing/calendar-preview.png',
    bullets: [
      'Organización de turnos por profesional y servicio.',
      'Bloqueo inteligente de horarios no disponibles.',
      'Recordatorios automáticos de turnos por WhatsApp.',
    ],
  },
  {
    id: 'metricas',
    title: 'Capa 3: Reportes & Crecimiento',
    subtitle: 'El control absoluto sobre tus números',
    icon: TrendingUp,
    color: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.15)',
    image: '/landing/dashboard-preview.png?v=2',
    bullets: [
      'Visualización clara de ingresos por día, semana y mes.',
      'Historial técnico y preferencias detalladas de clientas.',
      'Métricas de retención y servicios con mayor demanda.',
    ],
  },
];

// ─── Mockups inline — reemplazar con screenshots reales cuando estén listos ───

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
  const staff = [
    { name: 'Valeria', hex: '#a78bfa', appts: [{ top: 4, h: 52, text: 'Coloración · Ana P.' }, { top: 92, h: 38, text: 'Corte · Sol R.' }] },
    { name: 'Lucía', hex: '#fbbf24', appts: [{ top: 22, h: 68, text: 'Mechas · María J.' }] },
    { name: 'Camila', hex: '#34d399', appts: [{ top: 0, h: 44, text: 'Keratina · Vane' }, { top: 100, h: 52, text: 'Balayage · Caro' }] },
  ];
  return (
    <div className="w-full h-full bg-[#0d0d0f] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] shrink-0">
        <span className="text-white text-[11px] font-semibold">Agenda · Lunes 15</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold">HOY</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-9 border-r border-white/[0.04] pt-4 shrink-0">
          {['9','10','11','12','13','14'].map(h => (
            <div key={h} className="h-[34px] flex items-start justify-end pr-1.5 text-[8px] text-zinc-700 pt-0.5">{h}</div>
          ))}
        </div>
        <div className="flex flex-1">
          {staff.map((s) => (
            <div key={s.name} className="flex-1 border-r border-white/[0.03] relative">
              <div className="text-center py-1.5 text-[8px] font-semibold shrink-0" style={{ color: s.hex }}>{s.name}</div>
              <div className="relative" style={{ height: '204px' }}>
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="absolute left-0 right-0 border-t border-white/[0.03]" style={{ top: `${i * 34}px` }} />
                ))}
                {s.appts.map((a, i) => (
                  <div
                    key={i}
                    className="absolute left-0.5 right-0.5 rounded-md px-1 py-0.5 overflow-hidden"
                    style={{ top: `${a.top}px`, height: `${a.h}px`, backgroundColor: `${s.hex}18`, borderLeft: `2px solid ${s.hex}` }}
                  >
                    <p className="text-[8px] leading-tight font-medium" style={{ color: s.hex }}>{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
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
        <span className="text-[9px] text-emerald-400 font-semibold">↑ +18% vs abril</span>
      </div>
      <div className="grid grid-cols-3 border-b border-white/[0.04] shrink-0">
        {[
          { label: 'Ingresos', val: '$48.500', color: '#34d399' },
          { label: 'Turnos', val: '23', color: '#a78bfa' },
          { label: 'Valoración', val: '4.8 ★', color: '#fbbf24' },
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
                    background: i === 5 ? 'linear-gradient(to top, #059669, #34d399)' : 'rgba(52,211,153,0.18)',
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
              <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${s.pct}%` }} />
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

  // MotionValue for raw progress — set directly in Lenis RAF, no re-renders
  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // scrollYProgress drives 3D tilt + exit fade
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Soft spring — drives 3D tilt with a trailing, elastic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 42,
    damping: 14,
    restDelta: 0.001,
  });

  // Separate spring for the progress bar so it eases in/out instead of jumping
  const smoothBarProgress = useSpring(scrollProgress, {
    stiffness: 55,
    damping: 20,
    restDelta: 0.001,
  });
  const progressBarScaleX = useTransform(smoothBarProgress, [0, 1], [0, 1]);

  // 3D Tilt
  const rotateX = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [15, 5]);
  const rotateY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-12, -4]);
  const scale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [0.95, 1.02]);
  const glareOpacity = useTransform(smoothProgress, [0, 1], [0.25, 0.1]);
  const glareY = useTransform(smoothProgress, [0, 1], ['-20%', '80%']);

  // Exit: section gently fades + shrinks as scroll leaves it
  const exitOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0.82]);
  const exitScale = useTransform(scrollYProgress, [0.85, 1], [1, 0.97]);

  // Step tracking via Lenis RAF — more reliable than useScroll with Lenis active
  useLenis(({ scroll }) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = rect.top + scroll;
    const scrollable = containerRef.current.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const p = Math.max(0, Math.min(1, (scroll - containerTop) / scrollable));

    scrollProgress.set(p);

    // Each step gets a generous share of the scroll budget
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

  const STEP_HEX = ['#c084fc', '#fbbf24', '#34d399'];

  return (
    // 400vh gives each step ~100vh of scroll budget (scrollable = 300vh)
    <div
      ref={containerRef}
      className={`relative z-10 ${isMobile ? '' : 'h-[400vh]'}`}
    >
      <section
        className={`bg-[#09090b] border-b border-white/[0.04]
          ${isMobile ? 'py-20' : 'sticky top-0 h-screen overflow-hidden'}`}
      >
        <div className={`max-w-6xl mx-auto px-6 ${isMobile ? 'block' : 'h-full flex items-center'}`}>

          {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
          {!isMobile ? (
            // Exit animation wraps the entire grid
            <motion.div
              style={{ opacity: exitOpacity, scale: exitScale }}
              className="grid grid-cols-12 gap-12 w-full items-center"
            >

              {/* LEFT — Monitor: stays fixed while scroll budget drains */}
              <div className="col-span-6 flex flex-col justify-center relative">
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 transition-all duration-700 blur-[80px]"
                  style={{ background: `radial-gradient(circle, ${solutions[activeStep].glow} 0%, transparent 70%)` }}
                />

                <div className="mb-8 max-w-md relative z-10">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
                    Potencia y Simplicidad
                  </p>
                  <h2 className="font-playfair text-[clamp(2.2rem,4vw,3rem)] text-white italic leading-tight">
                    Tu salón bajo control,{' '}
                    <span className="text-purple-400">capa por capa.</span>
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
                        "inset 0 1px 1px rgba(255,255,255,0.15), 0 24px 48px -12px rgba(0,0,0,0.5), 0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026",
                    }}
                    className="w-full max-w-xl h-[280px] sm:h-[330px] border border-[#444] p-2 bg-[#222222] rounded-[24px] shadow-2xl relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 pointer-events-none z-50 rounded-[24px]"
                      style={{
                        opacity: glareOpacity,
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                        translateY: glareY,
                      }}
                    />
                    <div className="h-full w-full overflow-hidden rounded-[16px] bg-[#050504] relative z-10">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-black/40 border-b border-white/[0.04] absolute top-0 inset-x-0 z-30">
                        <div className="w-2 h-2 rounded-full bg-red-400/50" />
                        <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                        <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                        <div className="h-3 w-28 rounded-full bg-white/[0.04] border border-white/[0.06] mx-auto" />
                      </div>
                      {/* Mockup swaps with y-slide + blur */}
                      <div className="w-full h-full pt-7 relative">
                        <AnimatePresence mode="wait">
                          {(() => {
                            const MockupComponent = MOCKUPS[activeStep];
                            return (
                              <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, y: 14, filter: prefersReducedMotion ? 'none' : 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -8, filter: prefersReducedMotion ? 'none' : 'blur(4px)' }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0"
                              >
                                <MockupComponent />
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* RIGHT — Features */}
              <div className="col-span-6 flex flex-col justify-center gap-2">

                {/* Step counter + animated progress bar */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-zinc-500 font-mono tabular-nums">
                    <span className="text-white font-semibold">{activeStep + 1}</span>
                    <span className="text-zinc-600"> / 3</span>
                  </span>
                  <div className="flex-1 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full origin-left rounded-full"
                      style={{
                        scaleX: progressBarScaleX,
                        backgroundColor: STEP_HEX[activeStep],
                      }}
                      transition={{ backgroundColor: { duration: 0.4 } }}
                    />
                  </div>
                </div>

                {solutions.map((sol, index) => {
                  const Icon = sol.icon;
                  const isActive = activeStep === index;

                  return (
                    <motion.div
                      key={sol.id}
                      animate={{ opacity: isActive ? 1 : 0.2 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: [0.4, 0, 0.2, 1] }}
                      className={`rounded-2xl border transition-colors duration-500 overflow-hidden ${
                        isActive
                          ? 'border-white/[0.1] bg-white/[0.03]'
                          : 'border-white/[0.04] bg-transparent'
                      }`}
                    >
                      {/* Header — always visible */}
                      <div className="flex gap-4 items-center p-5">
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isActive
                            ? 'bg-white/[0.06] border-white/20 scale-105'
                            : 'bg-white/[0.02] border-white/[0.06]'
                        }`}>
                          <Icon className={`w-5 h-5 ${sol.color}`} />
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

                      {/* Bullets — staggered entrance when active */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.ul
                            key="bullets"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-3 px-5 pb-5 overflow-hidden"
                          >
                            {sol.bullets.map((bullet, bIdx) => (
                              <motion.li
                                key={bIdx}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: prefersReducedMotion ? 0 : 0.45,
                                  delay: prefersReducedMotion ? 0 : 0.12 + bIdx * 0.1,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className="flex gap-3 items-start text-sm text-zinc-400"
                              >
                                <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${sol.color}`} />
                                <span>{bullet}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Progress dots */}
                <div className="flex gap-2 justify-center pt-3">
                  {solutions.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-500"
                      style={{
                        width: i === activeStep ? '16px' : '6px',
                        height: '6px',
                        backgroundColor: i === activeStep ? STEP_HEX[i] : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>

                {/* Completion nudge — appears when all steps are done */}
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
                  <span className="text-purple-400">capa por capa.</span>
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
                          <div className="w-10 h-10 rounded-xl border flex items-center justify-center bg-white/[0.03] border-white/[0.08]">
                            <Icon className={`w-4 h-4 ${sol.color}`} />
                          </div>
                          <div>
                            <h3 className="font-playfair text-xl font-bold text-white">{sol.title}</h3>
                            <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">{sol.subtitle}</p>
                          </div>
                        </div>
                        <ul className="space-y-2.5 pl-1">
                          {sol.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex gap-2.5 items-start text-xs text-zinc-400">
                              <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${sol.color}`} />
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
