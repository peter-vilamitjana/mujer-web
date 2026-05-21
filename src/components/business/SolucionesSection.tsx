'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  useScroll, useTransform, useSpring, useMotionValue,
  motion, AnimatePresence, useReducedMotion,
} from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Calendar, TrendingUp, LayoutDashboard, CheckCircle } from 'lucide-react';

// ── Tokens de color ────────────────────────────────────────────────────────────
const VIOLET_HEX  = '#a78bfa';              // violet-400
const VIOLET_GLOW = 'rgba(167,139,250,0.15)';

// Traffic lights exactos de macOS  (tamaño 12 px, gap 8 px, igual a Safari nativo)
const TRAFFIC = [
  { bg: '#FF5F57', label: 'Cerrar' },
  { bg: '#FFBD2E', label: 'Minimizar' },
  { bg: '#28C840', label: 'Pantalla completa' },
];

// ── Bezier "Apple spring" para la coreografía de imágenes ─────────────────────
// ease-out suave — replica la curva de los macOS spring animations
const APPLE_EASE = [0.25, 0.46, 0.45, 0.94] as const;

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

// ─── Mockups (todos siempre en DOM → las imágenes se pre-cargan) ──────────────

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
          { label: 'Valoración', val: '4.8 ★',  color: '#ddd6fe' },
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
  const containerRef    = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep]   = useState(0);
  const [isComplete, setIsComplete]   = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const activeStepRef   = useRef(0);
  const isCompleteRef   = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const scrollProgress = useMotionValue(0);

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

  const rotateX = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [15, 5]);
  const rotateY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-12, -4]);
  const tiltScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [0.95, 1.02]);

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

  // ── Sombra del monitor flotante — estilo Apple product page ────────────────
  const monitorShadow = [
    'inset 0 1px 0 rgba(255,255,255,0.15)',      // ③ reflejo de cristal biselado (borde superior)
    '0 0 0 1px rgba(255,255,255,0.08)',          // borde de vidrio exterior
    '0 32px 80px -12px rgba(0,0,0,0.80)',        // sombra principal de profundidad
    '0 72px 160px -24px rgba(0,0,0,0.55)',       // sombra difusa amplia
    '0 0 120px rgba(167,139,250,0.07)',           // violet ambient glow
  ].join(', ');

  return (
    <div
      ref={containerRef}
      className={`relative z-10 ${isMobile ? '' : 'h-[400vh]'}`}
    >
      <section
        className={`border-b border-white/[0.04]
          ${isMobile ? 'py-20' : 'sticky top-0 h-screen overflow-hidden'}`}
        // ① Fondo con degradado radial sutil para volumen — reemplaza el negro plano
        style={{
          background: [
            'radial-gradient(ellipse 90% 55% at 50% -8%, rgba(167,139,250,0.07) 0%, transparent 60%)',
            '#09090b',
          ].join(', '),
        }}
      >
        <div className={`max-w-6xl mx-auto px-6 ${isMobile ? 'block' : 'h-full flex items-center pt-20'}`}>

          {/* ── DESKTOP ───────────────────────────────────────────────────── */}
          {!isMobile ? (
            <motion.div
              style={{ opacity: exitOpacity, scale: exitScale }}
              className="grid grid-cols-12 gap-10 w-full items-center"
            >

              {/* LEFT — Ventana macOS flotante */}
              <div className="col-span-7 flex flex-col justify-center relative">

                {/* Glow ambiental violeta detrás de la ventana */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2
                    w-[560px] h-[560px] rounded-full opacity-25 blur-[90px] transition-all duration-700"
                  style={{ background: `radial-gradient(circle, ${solutions[activeStep].glow} 0%, transparent 70%)` }}
                />

                {/* Heading de la sección */}
                <div className="mb-8 max-w-lg relative z-10">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
                    Potencia y Simplicidad
                  </p>
                  {/* ④ Título: más grande, peso fino (font-normal Playfair sin itálica) */}
                  <h2 className="font-playfair text-[clamp(2.5rem,4.5vw,3.6rem)] font-normal text-white leading-[1.1] tracking-tight">
                    Tu salón bajo control,{' '}
                    <span className="text-violet-400">capa por capa.</span>
                  </h2>
                </div>

                {/* ② Ventana macOS Safari con fidelidad nativa */}
                <div
                  className="w-full relative z-10"
                  style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    style={{
                      rotateX,
                      rotateY,
                      scale: tiltScale,
                      boxShadow: monitorShadow,
                    }}
                    // ② Borde translúcido simula el reflejo de vidrio (border-white/10)
                    className="w-full h-[360px] lg:h-[420px] rounded-[12px] overflow-hidden
                      border border-white/[0.10] bg-[#1c1c1e] flex flex-col"
                  >
                    {/* Barra de título macOS Safari */}
                    <div className="h-9 shrink-0 bg-[#2a2a2d] border-b border-white/[0.06]
                      flex items-center px-4 relative select-none">
                      {/* Traffic lights — tamaño y espaciado nativos de macOS (12 px, gap 8 px) */}
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
                      {/* URL bar centrada */}
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

                    {/* Área de contenido — coreografía escala + opacidad (Apple style) */}
                    <div className="flex-1 relative overflow-hidden bg-[#050504]">
                      {/*
                        ③ Coreografía de imágenes:
                        — Todos los mockups están en el DOM (stacked) → imágenes pre-cargadas.
                        — Activo: opacity 1, scale 1 (origen center-top).
                        — Inactivo: opacity 0, scale 0.97 (leve zoom-out al salir).
                        — scale usa spring stiffness/damping tipo Apple; opacity usa bezier APPLE_EASE.
                        — Resultado: el contenido saliente se "encoger y desvanece",
                          el entrante "aparece y crece" de forma suave, sin flash ni vacío.
                      */}
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
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* RIGHT — Acordeón de capas */}
              <div className="col-span-5 flex flex-col justify-center gap-2">

                {solutions.map((sol, index) => {
                  const Icon     = sol.icon;
                  const isActive = activeStep === index;

                  return (
                    <motion.div
                      key={sol.id}
                      animate={{ opacity: isActive ? 1 : 0.5 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: APPLE_EASE }}
                      onClick={() => setActiveStep(index)}
                      // ④ Glow violeta difuso en el ítem activo (box-shadow, sin fondo brusco)
                      style={isActive ? {
                        boxShadow: `0 0 0 1px rgba(167,139,250,0.20), 0 6px 40px rgba(167,139,250,0.07)`,
                      } : {}}
                      className={`rounded-2xl border cursor-pointer overflow-hidden
                        transition-colors duration-300
                        ${isActive
                          // ④ Fondo violeta levísimo en capa activa — la saca del plano inactivo
                          ? 'border-violet-400/[0.18] bg-violet-500/[0.05]'
                          : 'border-white/[0.05] bg-transparent hover:border-white/[0.10]'
                        }`}
                    >
                      {/* Header — siempre visible */}
                      <div className="flex gap-4 items-center p-5">
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0
                          transition-all duration-300
                          ${isActive
                            ? 'bg-violet-400/[0.10] border-violet-400/[0.30] scale-105'
                            : 'bg-white/[0.02] border-white/[0.07]'
                          }`}>
                          <Icon className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-playfair text-[1.15rem] font-normal text-white leading-tight">
                            {sol.title}
                          </h3>
                          {/* ② Subtítulo más sutil — no compite con el título */}
                          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-0.5 truncate">
                            {sol.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Bullets — apertura suavizada con altura + opacidad independientes */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.ul
                            key="bullets"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              height:  { duration: prefersReducedMotion ? 0 : 0.38, ease: APPLE_EASE },
                              opacity: { duration: prefersReducedMotion ? 0 : 0.28, ease: APPLE_EASE },
                            }}
                            // ① Más breathing room entre ítems
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

                {/* Puntos de navegación — único control de paginación */}
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

            /* ── MOBILE — stacked, sin efectos de scroll ──────────────────── */
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
                      {/* Ventana macOS simplificada para mobile */}
                      <div className="w-full max-w-sm mx-auto rounded-[10px] overflow-hidden
                        border border-white/[0.10] bg-[#1c1c1e]"
                        style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 60px rgba(167,139,250,0.05)' }}
                      >
                        <div className="h-7 bg-[#2a2a2d] border-b border-white/[0.06] flex items-center px-3 gap-1.5">
                          {TRAFFIC.map(({ bg, label }) => (
                            <div key={label} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bg }} />
                          ))}
                        </div>
                        <div className="h-48 bg-[#050504]">
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
