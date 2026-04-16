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
      className="bg-white/[0.03] border border-white/10 rounded-[1.25rem] p-4 backdrop-blur-md
        hover:bg-white/[0.06] hover:border-[#f1c97d]/30 transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#f1c97d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="flex items-start justify-between mb-2 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center
          group-hover:bg-[#f1c97d]/10 transition-colors duration-300 border border-white/5 group-hover:border-[#f1c97d]/20">
          <Icon className="w-4 h-4 text-[#99907c] group-hover:text-[#f1c97d] transition-colors duration-300" strokeWidth={1.5} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#f1c97d]/60 mt-1 shadow-[0_0_8px_rgba(241,201,125,0.4)] animate-pulse" />
      </div>
      <div className="font-body font-light text-3xl md:text-4xl text-[#f1c97d] leading-none mb-1.5 tracking-tight relative z-10 drop-shadow-[0_0_15px_rgba(241,201,125,0.2)]">
        <span className="text-[#f1c97d]/80">{prefix}</span>{count}<span className="text-[#f1c97d]/80">{suffix}</span>
      </div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#99907c] font-body leading-tight relative z-10 group-hover:text-[#e5e2e1] transition-colors">
        {label}
        {sublabel && <span className="block text-[#f1c97d]/40 mt-1 lowercase italic tracking-normal font-headline text-[11px]">{sublabel}</span>}
      </div></div>
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
    <div ref={ref} className="space-y-1.5 group/progress">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#99907c] font-body group-hover:text-[#f1c97d] transition-colors">{label}</span>
        <span className="text-[10px] font-medium text-[#f1c97d] font-body tracking-[0.1em]">{value}%</span>
      </div>
      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#f1c97d]/40 to-[#f1c97d] rounded-full transition-all duration-[2500ms] ease-out shadow-[0_0_8px_rgba(241,201,125,0.1)]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function CTABusiness() {
  return (
    <section className="py-2 lg:py-4 relative overflow-hidden bg-[#080808]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(241,201,125,0.03),transparent_70%)] pointer-events-none"></div>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 relative z-10 transition-all duration-500 hover:scale-[1.01]">
        <ScrollReveal>
          <div className="bg-[#0c0c0e] rounded-[2rem] p-5 md:p-8 relative overflow-hidden border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] specular-highlight scale-[0.98] lg:scale-100 origin-center">
            <div className="absolute inset-0 liquid-glass-rich opacity-50 pointer-events-none -z-10"></div>

            {/* Glows decorativos */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#f1c97d]/[0.05] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#f1c97d]/[0.03] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12">

              {/* ── Columna izquierda: copy + features ── */}
              <div className="flex-1 space-y-6">

                {/* Header */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#f1c97d]/60 block font-body">
                    Para dueños de salones
                  </span>
                  <h2 className="font-body font-light text-4xl md:text-5xl text-[#e5e2e1] leading-[0.9] tracking-tighter">
                    Tu salón,<br/>
                    <span className="italic font-headline text-[#f1c97d]/80">redefinido.</span>
                  </h2>
                  <p className="text-[#99907c] text-sm font-light leading-relaxed max-w-sm font-body">
                    Sumá tu peluquería a la plataforma. Gestioná turnos, mostrá tus servicios 
                    y conectá con nuevas clientas — <span className="text-[#f1c97d]/40 italic font-headline text-xs px-1">todo desde un solo lugar.</span>
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { icon: Calendar, text: 'Agenda online 24/7 — tus clientas reservan' },
                    { icon: Users, text: 'CRM integrado — historial de cada clienta' },
                    { icon: BarChart3, text: 'Reportes en tiempo real — ingresos y métricas' },
                    { icon: Zap, text: 'Onboarding en 10 min — sin técnicos' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-2.5 group/feat">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/feat:border-[#f1c97d]/30 group-hover/feat:bg-[#f1c97d]/5 transition-all">
                        <Icon className="w-3.5 h-3.5 text-[#99907c] group-hover/feat:text-[#f1c97d] transition-colors" strokeWidth={1.5} />
                      </div>
                      <p className="text-[#99907c] text-xs font-light leading-tight font-body group-hover/feat:text-[#e5e2e1] transition-colors">{text}</p>
                    </div>
                  ))}
                </div>

                {/* Barras de adopción */}
                <div className="space-y-3 pt-1">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-inter block mb-3">
                    Adopción por tipo de salón
                  </span>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <ProgressBar label="Hair & Color" value={87} delay={0} />
                    <ProgressBar label="Skin & Spa" value={72} delay={200} />
                    <ProgressBar label="Uñas & Estética" value={64} delay={400} />
                    <ProgressBar label="Maquillaje" value={51} delay={600} />
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    href="/business/register"
                    className="group relative overflow-hidden px-8 h-11 rounded-full font-body transition-all duration-500 flex items-center justify-center bg-gradient-to-r from-[#f1c97d] to-[#d4af37] shadow-[0_10px_30px_rgba(241,201,125,0.2)] hover:shadow-[0_15px_40px_rgba(241,201,125,0.4)] hover:-translate-y-0.5"
                  >
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-[#080808]">
                      Sumá tu salón
                    </span>
                  </Link>
                  <Link
                    href="/explore"
                    className="border border-white/5 text-[#99907c] px-8 h-11 flex items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-[#f1c97d]/30 hover:text-[#f1c97d] hover:bg-[#f1c97d]/5 transition-all duration-300 font-body"
                  >
                    Ver la plataforma
                  </Link>
                </div>
              </div>

              {/* ── Columna derecha: stats animados ── */}
              <div className="lg:w-80 flex-shrink-0 space-y-3">

                {/* Stat grande destacado */}
                 <div className="bg-white/[0.03] border border-white/10 rounded-[1.25rem] p-4 backdrop-blur-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f1c97d]/5 to-transparent pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#99907c] font-body">
                      Reservas este mes
                    </span>
                    <TrendingUp className="w-4 h-4 text-[#f1c97d]" strokeWidth={1.5} />
                  </div>
                  {/* Mini gráfico de barras decorativo */}
                  <div className="flex items-end gap-1.5 h-8 mb-3">
                    {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-white/10 transition-all duration-[2000ms] ease-out"
                        style={{
                          height: `${h}%`,
                          transitionDelay: `${i * 120}ms`,
                          background: i >= 10
                            ? 'rgba(241,201,125,0.6)'
                            : i >= 8
                            ? 'rgba(241,201,125,0.3)'
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
                    sublabel="+18% este mes"
                    icon={Calendar}
                  />
                </div>

                {/* Grid 2x2 de stats */}
                <div className="grid grid-cols-2 gap-3">
                  <AnimatedStat
                    value={98}
                    suffix="%"
                    label="Satisfacción"
                    icon={Star}
                    delay={200}
                  />
                  <AnimatedStat
                    value={5}
                    suffix=".0"
                    label="Calificación"
                    icon={TrendingUp}
                    delay={400}
                  />
                  <AnimatedStat
                    value={340}
                    suffix="+"
                    label="Salones"
                    icon={Users}
                    delay={600}
                  />
                  <div className="bg-white/[0.03] border border-white/10 rounded-[1.25rem] p-4 backdrop-blur-md
                    flex flex-col justify-between group/free relative overflow-hidden min-h-[90px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#f1c97d]/10 to-transparent opacity-0 group-hover/free:opacity-100 transition-opacity"></div>
                    <Zap className="w-5 h-5 text-[#f1c97d]/60 relative z-10" strokeWidth={1.5} />
                    <div className="relative z-10 mt-2">
                      <div className="font-body font-light text-3xl text-[#f1c97d] mb-0.5 transition-colors leading-none drop-shadow-[0_0_15px_rgba(241,201,125,0.1)]">Free</div>
                      <div className="text-[10px] uppercase tracking-[0.25em] text-[#99907c] font-body leading-none">
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
