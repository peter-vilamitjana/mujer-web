'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

const headline = [
  { text: 'Tu salón,', accent: false },
  { text: 'sin el', accent: true },
  { text: 'caos.', accent: true },
];

function DashboardMockup() {
  return (
    <div className="h-full w-full flex flex-col p-1 sm:p-2">
      {/* Window chrome */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
        </div>
        <div className="h-4 w-32 rounded-full bg-white/[0.05] border border-white/[0.07]" aria-hidden="true" />
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <div className="w-3.5 h-3.5 rounded-full bg-white/[0.05]" />
          <div className="w-3.5 h-3.5 rounded-full bg-purple-500/20 border border-purple-400/20" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label: 'Turnos hoy', value: '12', color: 'text-emerald-400', bg: 'bg-emerald-400/[0.06]', border: 'border-emerald-400/[0.10]' },
          { label: 'Ingresos del mes', value: '$84k', color: 'text-purple-400', bg: 'bg-purple-400/[0.06]', border: 'border-purple-400/[0.10]' },
          { label: 'Clientas activas', value: '248', color: 'text-amber-400', bg: 'bg-amber-400/[0.06]', border: 'border-amber-400/[0.10]' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-xl ${bg} border ${border} p-3`}>
            <p className={`font-playfair text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Section label */}
      <p className="text-[9px] text-zinc-600 uppercase tracking-[0.25em] font-bold mb-2 px-1">
        Agenda de hoy
      </p>

      {/* Appointments */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {[
          { time: '09:00', name: 'Valentina G.', service: 'Corte + color', duration: '90 min', confirmed: true },
          { time: '11:00', name: 'Martina R.', service: 'Keratina brasileña', duration: '120 min', confirmed: false },
          { time: '14:30', name: 'Carolina S.', service: 'Peinado de novia', duration: '60 min', confirmed: true },
          { time: '16:00', name: 'Ana P.', service: 'Balayage', duration: '150 min', confirmed: true },
        ].map(({ time, name, service, duration, confirmed }) => (
          <div
            key={name}
            className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5"
          >
            <span className="text-[10px] font-mono text-zinc-500 w-9 shrink-0">{time}</span>
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${confirmed ? 'bg-emerald-400' : 'bg-amber-400'}`}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white truncate">{name}</p>
              <p className="text-[10px] text-zinc-600 truncate">{service} · {duration}</p>
            </div>
            <span className={`hidden sm:block text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0
              ${confirmed ? 'bg-emerald-400/[0.10] text-emerald-400' : 'bg-amber-400/[0.10] text-amber-400'}`}>
              {confirmed ? 'Confirmado' : 'Pendiente'}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          {['Agenda', 'Clientas', 'Reportes'].map((tab, i) => (
            <span
              key={tab}
              className={`text-[10px] font-medium ${i === 0 ? 'text-purple-400' : 'text-zinc-600'}`}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="w-16 h-1 rounded-full bg-white/[0.06]">
          <div className="w-1/3 h-full rounded-full bg-purple-400/60" />
        </div>
      </div>
    </div>
  );
}

export default function BusinessHero() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="relative bg-[#09090b]"
      aria-label="Hero — Ouleeh para negocios"
      suppressHydrationWarning
    >
      {/* Ambient orbs — fixed behind everything */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%)' }}
          animate={shouldReduce ? {} : { scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -left-80 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)' }}
          animate={shouldReduce ? {} : { scale: [1, 1.10, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        />
        <motion.div
          className="absolute top-2/3 -right-60 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.07) 0%, transparent 70%)' }}
          animate={shouldReduce ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ContainerScroll — offsets the fixed navbar */}
      <div className="relative z-10 pt-36 lg:pt-48">
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8"
              >
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                    backdrop-blur-xl bg-white/[0.05] border border-white/[0.12]
                    text-[11px] font-semibold text-zinc-300 tracking-[0.12em] uppercase
                    hover:bg-white/[0.09] hover:border-white/[0.20] transition-all duration-300 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" aria-hidden="true" />
                  Ouleeh para negocios
                  <span className="w-px h-3.5 bg-white/[0.18]" />
                  <span className="text-purple-400 normal-case tracking-normal font-medium">Conocé más →</span>
                </Link>
              </motion.div>

              {/* Headline — word by word */}
              <h1
                className="font-playfair text-[clamp(3rem,8vw,7rem)] leading-[1.02] tracking-[-0.02em] mb-6"
                aria-label="Tu salón, sin el caos."
              >
                {headline.map(({ text, accent }, i) => (
                  <motion.span
                    key={text}
                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`inline-block mr-[0.22em] last:mr-0 ${accent ? 'italic text-purple-400' : 'text-white'}`}
                  >
                    {text}
                  </motion.span>
                ))}
              </h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-zinc-400 text-[clamp(0.95rem,2.5vw,1.15rem)] leading-[1.75] max-w-xl mb-10"
              >
                Agenda inteligente, clientas fidelizadas y cobros simples.{' '}
                <span className="text-zinc-500">
                  Diseñado para salones de Argentina.
                </span>
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link
                  href="/business/register"
                  className="group inline-flex items-center gap-3 px-9 py-4 rounded-full
                    bg-white text-zinc-950 font-bold text-sm tracking-wide min-h-[48px]
                    shadow-[0_8px_30px_rgb(255,255,255,0.12)] hover:shadow-[0_8px_30px_rgb(255,255,255,0.2)]
                    hover:bg-zinc-100 active:scale-[0.97] transition-all duration-200 cursor-pointer
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-label="Empezar gratis en Ouleeh"
                >
                  Empezar gratis
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full min-h-[48px]
                    backdrop-blur-xl bg-white/[0.05] border border-white/[0.12] text-white font-medium text-sm
                    hover:bg-white/[0.09] hover:border-white/[0.22] active:scale-[0.97]
                    transition-all duration-200 cursor-pointer"
                >
                  Ver cómo funciona
                </Link>
              </motion.div>
            </div>
          }
        >
          <DashboardMockup />
        </ContainerScroll>
      </div>
    </section>
  );
}
