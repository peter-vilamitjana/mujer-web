'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ScrollReveal } from './ScrollReveal';
import { TrendingUp, Users, Star, Zap, BarChart3, Calendar } from 'lucide-react';

// Hook para animar números al entrar en viewport
function useCountUp(end: number, duration: number = 3000, suffix: string = '') {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quart (más suave al final)
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return { count, ref };
}

// Componente de stat con animación
function AnimatedStat({
  prefix = '',
  value,
  suffix = '',
  label,
  sublabel,
  icon: Icon,
  delay = 0,
}: {
  prefix?: string;
  value: number;
  suffix?: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const { count, ref } = useCountUp(value, 3000 + delay);

  return (
    <div
      ref={ref}
      className="bg-white/5 border border-white/8 rounded-[1.75rem] p-6 backdrop-blur-sm
        hover:bg-white/8 hover:border-white/15 transition-all duration-500 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center
          group-hover:bg-white/12 transition-colors duration-300">
          <Icon className="w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors duration-300" strokeWidth={1.5} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-green-400/60 mt-1" />
      </div>
      <div className="font-vogue text-3xl md:text-4xl text-white leading-none mb-2">
        {prefix}{count}{suffix}
      </div>
      <div className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-inter leading-relaxed">
        {label}
        {sublabel && <span className="block text-white/20 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}

// Barra de progreso animada
function ProgressBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(value), delay);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, delay]);

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-inter">{label}</span>
        <span className="text-[10px] font-bold text-white/60 font-inter">{value}%</span>
      </div>
      <div className="h-1 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-white/40 to-white/70 rounded-full transition-all duration-[2500ms] ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function CTABusiness() {
  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <ScrollReveal>
          <div className="bg-[#0A0A0A] rounded-[3rem] p-10 md:p-16 relative overflow-hidden">

            {/* Glows decorativos */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-20">

              {/* ── Columna izquierda: copy + features ── */}
              <div className="flex-1 space-y-10">

                {/* Header */}
                <div>
                  <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/25 block mb-6 font-inter">
                    Para dueños de salones
                  </span>
                  <h2 className="font-vogue text-5xl md:text-6xl lg:text-7xl text-white leading-[0.9] mb-6">
                    Tu salón,<br/>
                    <span className="italic text-white/50">redefinido.</span>
                  </h2>
                  <p className="text-white/40 text-base font-light leading-relaxed max-w-md font-inter">
                    Sumá tu peluquería a la plataforma. Gestioná turnos, mostrá tus servicios 
                    y conectá con nuevas clientas — todo desde un solo lugar.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {[
                    { icon: Calendar, text: 'Agenda online 24/7 — tus clientas reservan sin llamar' },
                    { icon: Users, text: 'CRM integrado — historial completo de cada clienta' },
                    { icon: BarChart3, text: 'Reportes en tiempo real — ingresos, turnos y métricas' },
                    { icon: Zap, text: 'Onboarding en menos de 10 minutos — sin técnicos' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                      </div>
                      <p className="text-white/40 text-sm font-light leading-relaxed font-inter">{text}</p>
                    </div>
                  ))}
                </div>

                {/* Barras de adopción */}
                <div className="space-y-4 pt-2">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-inter block mb-5">
                    Adopción por tipo de salón
                  </span>
                  <ProgressBar label="Hair & Color" value={87} delay={0} />
                  <ProgressBar label="Skin & Spa" value={72} delay={200} />
                  <ProgressBar label="Uñas & Estética" value={64} delay={400} />
                  <ProgressBar label="Maquillaje" value={51} delay={600} />
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/business/register"
                    className="group relative overflow-hidden px-10 h-14 rounded-full font-inter transition-all duration-[800ms] ease-in-out hover:px-14 flex items-center justify-center hover:bg-[#0a1a0a] bg-white hover:shadow-[0_0_40px_rgba(34,197,94,0.35)]"
                  >
                    {/* Borde traceado exacto del contenedor calculando el radio matemáticamente (h-14 -> 56px, rx -> 28px) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <rect
                        width="100%" height="100%"
                        rx="28"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="4"
                        pathLength="1"
                        strokeDasharray="1"
                        strokeDashoffset="-1"
                        className="transition-none group-hover:[transition:stroke-dashoffset_0.5s_linear] group-hover:![stroke-dashoffset:0]"
                      />
                    </svg>

                    <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-black group-hover:text-green-400 transition-colors duration-[800ms] whitespace-nowrap">
                      <span className="inline-block group-hover:hidden">Sumá tu salón</span>
                      <span className="hidden group-hover:inline-block">Potenciando tu negocio</span>
                    </span>
                  </Link>
                  <Link
                    href="/explore"
                    className="border border-white/15 text-white/60 px-10 h-14 flex items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-white/30 hover:text-white transition-all duration-300 font-inter"
                  >
                    Ver la plataforma
                  </Link>
                </div>
              </div>

              {/* ── Columna derecha: stats animados ── */}
              <div className="lg:w-96 flex-shrink-0 space-y-4">

                {/* Stat grande destacado */}
                <div className="bg-white/5 border border-white/8 rounded-[1.75rem] p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-inter">
                      Reservas este mes
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-400/60" strokeWidth={1.5} />
                  </div>
                  {/* Mini gráfico de barras decorativo */}
                  <div className="flex items-end gap-1.5 h-14 mb-6">
                    {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-white/10 transition-all duration-[2000ms] ease-out"
                        style={{
                          height: `${h}%`,
                          transitionDelay: `${i * 120}ms`,
                          background: i >= 10
                            ? 'rgba(255,255,255,0.5)'
                            : i >= 8
                            ? 'rgba(255,255,255,0.2)'
                            : 'rgba(255,255,255,0.07)'
                        }}
                      />
                    ))}
                  </div>
                  <AnimatedStat
                    prefix="+"
                    value={42}
                    suffix="k"
                    label="Reservas gestionadas"
                    sublabel="+18% vs mes anterior"
                    icon={Calendar}
                  />
                </div>

                {/* Grid 2x2 de stats */}
                <div className="grid grid-cols-2 gap-4">
                  <AnimatedStat
                    value={98}
                    suffix="%"
                    label="Satisfacción"
                    sublabel="De clientas"
                    icon={Star}
                    delay={200}
                  />
                  <AnimatedStat
                    value={5}
                    suffix=".0"
                    label="Calificación"
                    sublabel="Promedio"
                    icon={TrendingUp}
                    delay={400}
                  />
                  <AnimatedStat
                    value={340}
                    suffix="+"
                    label="Salones activos"
                    icon={Users}
                    delay={600}
                  />
                  <div className="bg-white/5 border border-white/8 rounded-[1.75rem] p-6 backdrop-blur-sm
                    flex flex-col justify-between">
                    <Zap className="w-5 h-5 text-white/30" strokeWidth={1.5} />
                    <div>
                      <div className="font-vogue text-3xl text-white mb-1">Free</div>
                      <div className="text-[9px] uppercase tracking-[0.25em] text-white/30 font-inter">
                        Para empezar
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
