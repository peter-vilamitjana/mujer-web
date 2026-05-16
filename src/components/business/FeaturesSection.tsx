'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  Calendar, MessageSquare, CreditCard, Users,
  BarChart3, Globe, CheckCircle2,
} from 'lucide-react';
import { useRef } from 'react';

const bentoItems = [
  {
    id: 'agenda',
    span: 'md:col-span-2 md:row-span-2',
    icon: Calendar,
    tag: 'Gratis',
    tagStyle: 'bg-white/[0.07] text-zinc-400',
    title: 'Agenda online 24/7',
    description: 'Tus clientas reservan solas, cualquier día, a cualquier hora. Vos solo te enterás y aparecés.',
    color: 'text-purple-400',
    glow: 'rgba(168,85,247,0.12)',
    border: 'border-purple-400/[0.12]',
    preview: (
      <div className="mt-5 space-y-2" aria-hidden="true">
        {['09:00 · Valentina G. — Corte + color', '11:30 · Martina R. — Keratina', '14:00 · Carolina S. — Peinado'].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
            <span className="text-[11px] text-zinc-400 truncate">{item}</span>
            <span className="ml-auto text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0">✓</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'whatsapp',
    span: 'md:col-span-2',
    icon: MessageSquare,
    tag: 'Gratis',
    tagStyle: 'bg-white/[0.07] text-zinc-400',
    title: 'Notificaciones por WhatsApp',
    description: 'Confirmaciones y recordatorios automáticos. Sin escribir un solo mensaje.',
    color: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.10)',
    border: 'border-emerald-400/[0.12]',
    preview: null,
  },
  {
    id: 'perfil',
    span: '',
    icon: Globe,
    tag: 'Gratis',
    tagStyle: 'bg-white/[0.07] text-zinc-400',
    title: 'Perfil público',
    description: 'Tu página propia con servicios, fotos y equipo.',
    color: 'text-sky-400',
    glow: 'rgba(56,189,248,0.10)',
    border: 'border-sky-400/[0.12]',
    preview: null,
  },
  {
    id: 'mercadopago',
    span: '',
    icon: CreditCard,
    tag: 'Premium',
    tagStyle: 'bg-amber-400/[0.10] text-amber-400 border border-amber-400/[0.20]',
    title: 'Cobro con MercadoPago',
    description: 'Señas y pagos completos desde la app.',
    color: 'text-amber-400',
    glow: 'rgba(234,179,8,0.10)',
    border: 'border-amber-400/[0.12]',
    preview: null,
  },
  {
    id: 'crm',
    span: '',
    icon: Users,
    tag: 'Premium',
    tagStyle: 'bg-emerald-400/[0.10] text-emerald-400 border border-emerald-400/[0.20]',
    title: 'CRM de clientas',
    description: 'Historial técnico, preferencias y métricas por clienta.',
    color: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.10)',
    border: 'border-emerald-400/[0.12]',
    preview: null,
  },
  {
    id: 'reportes',
    span: '',
    icon: BarChart3,
    tag: 'Premium',
    tagStyle: 'bg-emerald-400/[0.10] text-emerald-400 border border-emerald-400/[0.20]',
    title: 'Reportes y métricas',
    description: 'Ingresos, servicios más pedidos, retención de clientas.',
    color: 'text-rose-400',
    glow: 'rgba(251,113,133,0.10)',
    border: 'border-rose-400/[0.12]',
    preview: null,
  },
];

function BentoCard({
  item,
  index,
}: {
  item: (typeof bentoItems)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 32, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-3xl p-6 overflow-hidden cursor-default
        backdrop-blur-xl bg-white/[0.03] border ${item.border}
        hover:bg-white/[0.05] transition-all duration-300 ${item.span}`}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 30% 0%, ${item.glow} 0%, transparent 60%)` }}
        aria-hidden="true"
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.09]
            flex items-center justify-center shrink-0 group-hover:border-white/[0.15] transition-colors duration-300`}>
            <item.icon className={`w-5 h-5 ${item.color}`} aria-hidden="true" />
          </div>
          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${item.tagStyle}`}>
            {item.tag}
          </span>
        </div>

        <h3 className="font-playfair text-[1.1rem] text-white leading-snug mb-2">{item.title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>

        {item.preview && <div className="mt-auto">{item.preview}</div>}
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative z-10 bg-[#09090b] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" aria-hidden="true" />

      <div className="py-28 px-6 max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-4">
            Todo lo que incluye
          </p>
          <h2 className="font-playfair text-[clamp(2.2rem,5vw,3.5rem)] text-white italic leading-tight">
            Herramientas que tu salón{' '}
            <span className="text-purple-400">necesita</span>
          </h2>
          <p className="text-zinc-500 text-[0.95rem] mt-4 max-w-md mx-auto leading-relaxed">
            El plan base cubre lo esencial. El premium lo lleva al siguiente nivel.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]">
          {bentoItems.map((item, i) => (
            <BentoCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Trust note */}
        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12 flex items-center justify-center gap-2 text-zinc-600 text-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400/70 shrink-0" aria-hidden="true" />
          <span>Plan base gratis para siempre · Sin tarjeta de crédito · Configurable en 5 minutos</span>
        </motion.div>
      </div>
    </section>
  );
}
