'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  Calendar, MessageSquare, CreditCard, Users,
  BarChart3, Globe, CheckCircle2, Sparkles,
} from 'lucide-react';
import { useRef } from 'react';

// ─── Tags ─────────────────────────────────────────────────────────────────────

/** Gratis: súper minimalista — sin fondo, borde casi invisible */
function FreeTag() {
  return (
    <span className="inline-flex items-center text-[9px] font-medium px-2.5 py-[3px] rounded-full
      uppercase tracking-wider border border-white/[0.05] text-zinc-600 shrink-0 select-none">
      Gratis
    </span>
  );
}

/**
 * Premium: gradiente vibrante + Sparkles — captura la mirada de inmediato.
 * La sombra verde/violeta añade profundidad sin sobrecargarlo.
 */
function PremiumTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-[3px] rounded-full
      uppercase tracking-wider bg-gradient-to-r from-violet-500 to-purple-600
      text-white shrink-0 select-none
      shadow-[0_0_14px_rgba(139,92,246,0.50)]">
      <Sparkles className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
      Premium
    </span>
  );
}

// ─── Bento data ───────────────────────────────────────────────────────────────
/*
  Layout lg: 4 columnas

  ┌────────────────┬────────────────────┐
  │                │   WhatsApp (×2)    │
  │  Agenda (×2)  ├─────────┬──────────┤
  │  row-span-2   │  Perfil │ MercPago  │
  ├────────────────┴─────────┼──────────┤
  │       CRM (×2)           │Reportes  │
  │                          │  (×2)    │
  └──────────────────────────┴──────────┘
*/

type BentoItem = {
  id: string;
  gridClass: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: string | boolean }>;
  tier: 'free' | 'premium';
  title: string;
  description: string;
  preview?: React.ReactNode;
};

const APPOINTMENTS = [
  { time: '09:00', client: 'Valentina G.', service: 'Corte + color' },
  { time: '11:30', client: 'Martina R.',   service: 'Keratina'      },
  { time: '14:00', client: 'Carolina S.',  service: 'Peinado'       },
];

const BAR_HEIGHTS = [40, 55, 35, 72, 48, 88, 62];
const BAR_DAYS    = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const bentoItems: BentoItem[] = [
  {
    id: 'agenda',
    gridClass: 'lg:col-span-2 lg:row-span-2',
    icon: Calendar,
    tier: 'free',
    title: 'Agenda online 24/7',
    description: 'Tus clientas reservan solas, cualquier día, a cualquier hora. Vos solo te enterás y aparecés.',
    preview: (
      <div className="mt-3 flex flex-col gap-1.5" aria-hidden="true">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">Hoy · Mayo 2026</span>
          <span className="text-[9px] text-violet-400 font-semibold">3 turnos</span>
        </div>
        {APPOINTMENTS.map((appt, i) => (
          <div key={i}
            className="flex items-center gap-2.5 rounded-lg bg-black/40 border border-white/[0.07]
              px-2.5 py-1.5 backdrop-blur-sm">
            <span className="text-[9px] text-violet-400 font-mono font-semibold w-9 shrink-0 tabular-nums">
              {appt.time}
            </span>
            <div className="w-px h-3 bg-violet-400/20 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-200 font-medium leading-none truncate">{appt.client}</p>
              <p className="text-[9px] text-zinc-600 mt-0.5 truncate">{appt.service}</p>
            </div>
            <div className="shrink-0 w-4 h-4 rounded-full bg-violet-400/10 border border-violet-400/20
              flex items-center justify-center">
              <span className="text-[7px] text-violet-400 leading-none">✓</span>
            </div>
          </div>
        ))}
        <div className="pt-1.5 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[9px] text-zinc-600">Próximo disponible</span>
          <span className="text-[9px] text-violet-400 font-semibold">15:30 hs</span>
        </div>
      </div>
    ),
  },
  {
    id: 'whatsapp',
    gridClass: 'lg:col-span-2',
    icon: MessageSquare,
    tier: 'free',
    title: 'Notificaciones por WhatsApp',
    description: 'Confirmaciones y recordatorios automáticos. Sin escribir un solo mensaje.',
    preview: (
      <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-black/40 border border-white/[0.06]"
        aria-hidden="true">
        <div className="w-5 h-5 rounded-full bg-violet-400/10 border border-violet-400/15
          flex items-center justify-center shrink-0 mt-px">
          <MessageSquare className="w-2.5 h-2.5 text-violet-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[8px] text-zinc-600 mb-0.5">MujerApp · hace 2 min</p>
          <p className="text-[10px] text-zinc-300 leading-snug">
            ✅ Valentina, tu turno del mar 14/05 a las 10:00h está confirmado.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'perfil',
    gridClass: '',
    icon: Globe,
    tier: 'free',
    title: 'Perfil público',
    description: 'Tu página propia con servicios, fotos y equipo. Lista para compartir.',
  },
  {
    id: 'mercadopago',
    gridClass: '',
    icon: CreditCard,
    tier: 'premium',
    title: 'Cobro con MercadoPago',
    description: 'Señas y pagos completos, directamente desde la app.',
  },
  {
    id: 'crm',
    gridClass: 'lg:col-span-2',
    icon: Users,
    tier: 'premium',
    title: 'CRM de clientas',
    description: 'Historial técnico, preferencias y métricas por clienta.',
    preview: (
      <div className="mt-2 flex items-center gap-4" aria-hidden="true">
        {[
          { label: 'Clientas',    val: '124'    },
          { label: 'Retención',   val: '91%'    },
          { label: 'Valor prom.', val: '$2.800' },
        ].map(s => (
          <div key={s.label}>
            <p className="text-[8px] text-zinc-600 mb-0.5">{s.label}</p>
            <p className="text-xs font-semibold text-violet-200 tabular-nums">{s.val}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'reportes',
    gridClass: 'lg:col-span-2',
    icon: BarChart3,
    tier: 'premium',
    title: 'Reportes y métricas',
    description: 'Ingresos, servicios más pedidos y retención de clientas.',
    preview: (
      <div className="mt-2" aria-hidden="true">
        <p className="text-[8px] text-zinc-600 mb-1.5">Ingresos · última semana</p>
        <div className="flex items-end gap-1 h-7">
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1 h-full">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    /*
                      ④ Barras con gradiente Pro: todas visibles con violeta medio,
                         la barra destacada (S) lleva un gradiente de 3 pasos muy vibrante.
                    */
                    background: i === 5
                      ? 'linear-gradient(to top, #4c1d95, #7c3aed, #c4b5fd)'
                      : 'linear-gradient(to top, rgba(109,40,217,0.45), rgba(139,92,246,0.60))',
                  }}
                />
              </div>
              <span className="text-[7px] text-zinc-700 shrink-0">{BAR_DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

// ─── Estilos base compartidos ─────────────────────────────────────────────────

const CARD_BASE = 'group relative rounded-2xl p-4 overflow-hidden cursor-default';

/*
  Técnica: background-clip padding-box / border-box
  —————————————————————————————————————————————————
  El borde con gradiente se logra sin wrapper extra ni pseudo-elemento.
  Declaramos `border: 1px solid transparent` y dos "capas" en `background`:
    1. Capa interior  → usa `padding-box` (solo dentro del borde)
    2. Capa exterior  → usa `border-box`  (pinta el borde con el gradiente)

  En hover, el box-shadow añade el anillo de glow violet que SÍ puede transicionar
  con CSS (los gradientes no son animables, el box-shadow sí).
*/
const PREMIUM_BORDER_STYLE = {
  border: '1px solid transparent',
  background: [
    // Capa 1 — fondo del card (padding-box = solo el interior)
    'linear-gradient(rgba(12,10,18,0.88), rgba(12,10,18,0.88)) padding-box',
    // Capa 2 — gradiente del borde (border-box = rellena el 1px transparente)
    'linear-gradient(145deg, rgba(139,92,246,0.45), rgba(88,28,135,0.20), rgba(139,92,246,0.10)) border-box',
  ].join(', '),
};

// ─── BentoCard ────────────────────────────────────────────────────────────────

function BentoCard({ item, index }: { item: BentoItem; index: number }) {
  const ref          = useRef<HTMLDivElement>(null);
  const inView       = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduce = useReducedMotion();
  const isPremium    = item.tier === 'premium';

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={[
        CARD_BASE,
        'backdrop-blur-md',
        isPremium
          // ① Premium: transición más larga, elevación mayor, glow de box-shadow
          ? [
              'transition-all duration-500 ease-out',
              'hover:-translate-y-1',
              // Hover: anillo violeta brillante + glow ambiental + sombra de profundidad
              'hover:shadow-[0_0_0_1px_rgba(167,139,250,0.55),0_0_52px_rgba(109,40,217,0.22),0_12px_40px_rgba(0,0,0,0.65)]',
            ].join(' ')
          // ① Free: glassmorphism estándar, hover sutil
          : [
              'bg-zinc-900/40 border border-white/[0.05]',
              'transition-all duration-300',
              'hover:-translate-y-0.5 hover:border-white/[0.10]',
              'hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
            ].join(' '),
        item.gridClass,
      ].join(' ')}
      style={isPremium ? PREMIUM_BORDER_STYLE : {}}
    >

      {/* ── Capa de luz interna — solo premium ──────────────────────────── */}
      {isPremium && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% -20%, rgba(139,92,246,0.16) 0%, transparent 62%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Top shimmer: tenue en reposo, brillante en hover ─────────────── */}
      <div
        className={[
          'absolute top-0 inset-x-0 h-px pointer-events-none transition-opacity duration-500',
          isPremium
            ? 'opacity-50 group-hover:opacity-100'   // siempre visible, se intensifica
            : 'opacity-0 group-hover:opacity-100',   // aparece solo en hover
        ].join(' ')}
        style={{
          background: isPremium
            ? 'linear-gradient(to right, transparent, rgba(167,139,250,0.65), transparent)'
            : 'linear-gradient(to right, transparent, rgba(167,139,250,0.35), transparent)',
        }}
        aria-hidden="true"
      />

      {/* ── Hover glow radial — solo free ──────────────────────────────── */}
      {!isPremium && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none
            transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(ellipse at 35% -10%, rgba(167,139,250,0.07) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Contenido ─────────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className={[
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
            isPremium
              // ③ Premium icon: gradiente bg leve, borde más visible, se intensifica en hover
              ? 'bg-gradient-to-br from-violet-500/18 to-purple-700/8 border border-violet-400/[0.30] group-hover:border-violet-400/[0.55] group-hover:from-violet-500/25'
              : 'bg-violet-400/[0.08] border border-violet-400/[0.14] group-hover:bg-violet-400/[0.13] group-hover:border-violet-400/[0.26]',
          ].join(' ')}>
            <item.icon className="w-4 h-4 text-violet-400" aria-hidden="true" />
          </div>

          {isPremium ? <PremiumTag /> : <FreeTag />}
        </div>

        <h3 className="text-[0.88rem] text-zinc-100 font-semibold leading-snug mb-1">
          {item.title}
        </h3>
        <p className="text-[0.78rem] text-zinc-400 leading-relaxed">{item.description}</p>

        {item.preview && <div className="mt-auto">{item.preview}</div>}
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function FeaturesSection() {
  const headingRef   = useRef<HTMLDivElement>(null);
  const inView       = useInView(headingRef, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="relative z-10 overflow-hidden"
      style={{
        background: [
          'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(139,92,246,0.05) 0%, transparent 55%)',
          '#09090b',
        ].join(', '),
      }}
    >
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }}
        aria-hidden="true"
      />

      <div className="py-10 px-6 max-w-5xl mx-auto">

        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-7"
        >
          <p className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-2.5">
            Todo lo que incluye
          </p>
          <h2 className="font-playfair text-[clamp(1.7rem,3.2vw,2.6rem)] font-normal text-white leading-tight tracking-tight">
            Herramientas que tu salón{' '}
            <span className="text-violet-400">necesita</span>
          </h2>
          <p className="text-zinc-500 text-[0.82rem] mt-2.5 max-w-sm mx-auto leading-relaxed">
            El plan base cubre lo esencial. El premium lo lleva al siguiente nivel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bentoItems.map((item, i) => (
            <BentoCard key={item.id} item={item} index={i} />
          ))}
        </div>

        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 flex items-center justify-center gap-2 text-zinc-600 text-[0.78rem]"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400/60 shrink-0" aria-hidden="true" />
          <span>Plan base gratis para siempre · Sin tarjeta de crédito · Configurable en 5 minutos</span>
        </motion.div>

      </div>
    </section>
  );
}
