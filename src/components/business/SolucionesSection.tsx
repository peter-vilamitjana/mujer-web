'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, useMotionValueEvent, useSpring, motion, AnimatePresence } from 'framer-motion';
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

export default function SolucionesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check mobile state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Framer Motion Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  // 3D Tilt values animated with scroll progress
  const rotateX = useTransform(smoothProgress, [0, 1], [15, 5]);
  const rotateY = useTransform(smoothProgress, [0, 1], [-12, -4]);
  const scale = useTransform(smoothProgress, [0, 1], [0.95, 1.02]);
  const glareOpacity = useTransform(smoothProgress, [0, 1], [0.25, 0.1]);
  const glareY = useTransform(smoothProgress, [0, 1], ['-20%', '80%']);

  // Change active slide index depending on scroll progress
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest < 0.35) {
      setActiveStep(0);
    } else if (latest < 0.7) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  });

  return (
    <section 
      ref={containerRef} 
      className={`relative z-10 bg-[#09090b] border-b border-white/[0.04] 
        ${isMobile ? 'py-20' : 'h-[300vh]'}`}
    >
      {/* Background radial glow synced with active slide */}
      {!isMobile && (
        <div 
          className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-35 transition-all duration-700 blur-[90px] fixed"
          style={{
            background: `radial-gradient(circle, ${solutions[activeStep].glow} 0%, transparent 70%)`
          }}
        />
      )}

      {/* Main Container */}
      <div className={`max-w-6xl mx-auto px-6 h-full ${isMobile ? 'block' : 'relative'}`}>
        
        {/* Desktop Sticky Layout */}
        {!isMobile ? (
          <div className="grid grid-cols-12 gap-8 h-full">
            
            {/* Left Column: Sticky 3D Monitor container */}
            <div className="col-span-6 h-screen sticky top-0 flex flex-col justify-center">
              <div className="mb-8 max-w-md">
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
                  Potencia y Simplicidad
                </p>
                <h2 className="font-playfair text-[clamp(2.2rem,4vw,3rem)] text-white italic leading-tight">
                  Tu salón bajo control,{' '}
                  <span className="text-purple-400">capa por capa.</span>
                </h2>
              </div>

              {/* 3D Monitor mockup frame (smaller scale, styled like container-scroll-animation) */}
              <div 
                className="w-full flex justify-center"
                style={{
                  perspective: '1200px',
                  transformStyle: 'preserve-3d',
                }}
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
                  {/* Glare effect */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none z-50 rounded-[24px]"
                    style={{
                      opacity: glareOpacity,
                      background: "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                      translateY: glareY,
                    }}
                  />

                  {/* Window Screen Area */}
                  <div className="h-full w-full overflow-hidden rounded-[16px] bg-[#050504] relative z-10">
                    {/* Window Chrome Controls */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-black/40 border-b border-white/[0.04] absolute top-0 inset-x-0 z-30">
                      <div className="w-2 h-2 rounded-full bg-red-400/50" />
                      <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                      <div className="h-3 w-28 rounded-full bg-white/[0.04] border border-white/[0.06] mx-auto" />
                    </div>

                    {/* Content Display: Fade between active images */}
                    <div className="w-full h-full pt-7 relative">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeStep}
                          src={solutions[activeStep].image}
                          alt={solutions[activeStep].title}
                          initial={{ opacity: 0, filter: 'blur(6px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, filter: 'blur(6px)' }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className="w-full h-full object-cover object-top"
                        />
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Column: Scrollable text blocks */}
            <div className="col-span-6 space-y-[20vh] py-[10vh]">
              {solutions.map((sol, index) => {
                const Icon = sol.icon;
                const isActive = activeStep === index;

                return (
                  <div 
                    key={sol.id} 
                    className="h-[60vh] flex flex-col justify-center"
                  >
                    <motion.div
                      animate={{
                        opacity: isActive ? 1 : 0.25,
                        x: isActive ? 0 : -10,
                      }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0
                          bg-white/[0.03] border-white/[0.08] ${isActive ? 'scale-105 border-white/20' : ''}`}
                        >
                          <Icon className={`w-5 h-5 ${sol.color}`} />
                        </div>
                        <div>
                          <h3 className="font-playfair text-2xl font-medium text-white">
                            {sol.title}
                          </h3>
                          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-1">
                            {sol.subtitle}
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-3.5 pl-2">
                        {sol.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex gap-3 items-start text-sm text-zinc-400">
                            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${sol.color}`} />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            
          </div>
        ) : (
          /* Mobile Flat Layout: Stacked inline content */
          <div className="space-y-16">
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
                Potencia y Simplicidad
              </p>
              <h2 className="font-playfair text-3xl text-white italic leading-tight">
                Tu salón bajo control,<br/>
                <span className="text-purple-400">capa por capa.</span>
              </h2>
            </div>

            <div className="space-y-24">
              {solutions.map((sol) => {
                const Icon = sol.icon;

                return (
                  <div key={sol.id} className="space-y-8">
                    {/* 3D Monitor Mockup */}
                    <div className="w-full max-w-sm mx-auto border border-[#444] p-1.5 bg-[#222222] rounded-[20px] shadow-xl relative overflow-hidden">
                      <div className="h-full w-full overflow-hidden rounded-[14px] bg-[#050504] relative">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-black/40 border-b border-white/[0.04]">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                        </div>
                        <img
                          src={sol.image}
                          alt={sol.title}
                          className="w-full h-48 object-cover object-top"
                        />
                      </div>
                    </div>

                    {/* Text description */}
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-xl border flex items-center justify-center bg-white/[0.03] border-white/[0.08]">
                          <Icon className={`w-4 h-4 ${sol.color}`} />
                        </div>
                        <div>
                          <h3 className="font-playfair text-xl font-bold text-white">
                            {sol.title}
                          </h3>
                          <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                            {sol.subtitle}
                          </p>
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
  );
}
