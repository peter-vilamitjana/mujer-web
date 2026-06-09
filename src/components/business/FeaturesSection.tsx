'use client';

import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
import {
  Calendar, MessageSquare, CreditCard, Users,
  BarChart3, Globe, CheckCircle2, Sparkles, Check,
} from 'lucide-react';
import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatedHeadline } from '@/components/ui/AnimatedHeadline';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── Tags ─────────────────────────────────────────────────────────────────────

function FreeTag() {
  return (
    <span className="inline-flex items-center text-[9px] font-medium px-2.5 py-[3px] rounded-full
      uppercase tracking-wider border border-white/[0.10] text-zinc-400 shrink-0 select-none">
      Gratis
    </span>
  );
}

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

type BentoItem = {
  id: string;
  gridClass: string;
  icon: React.ElementType;
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
              <Check className="w-2.5 h-2.5 text-violet-400" aria-hidden="true" />
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
          <p className="text-[8px] text-zinc-600 mb-0.5">Ouleeh · hace 2 min</p>
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

// ─── Shared styles ────────────────────────────────────────────────────────────

const CARD_BASE = 'group relative rounded-2xl p-4 overflow-hidden cursor-default';

const PREMIUM_BORDER_STYLE = {
  border: '1px solid transparent',
  background: [
    'linear-gradient(rgba(12,10,18,0.88), rgba(12,10,18,0.88)) padding-box',
    'linear-gradient(145deg, rgba(139,92,246,0.45), rgba(88,28,135,0.20), rgba(139,92,246,0.10)) border-box',
  ].join(', '),
};

// Spring config — low stiffness, high damping = fluid, non-mechanical
const SPRING = { stiffness: 80, damping: 20, mass: 1 };

// ─── BentoCard ────────────────────────────────────────────────────────────────
// Framer Motion handles hover physics (tilt + glare).
// GSAP (on outer wrapper) handles the entrance from a unique direction.

function BentoCard({ item }: { item: BentoItem }) {
  const isPremium    = item.tier === 'premium';
  const shouldReduce = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const hoverProgress = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), SPRING);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), SPRING);
  const contentX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), SPRING);
  const contentY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-5, 5]), SPRING);

  const glareX   = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY   = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useSpring(hoverProgress, { stiffness: 200, damping: 30 });
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 35%, transparent 65%)`;

  const glowProgress  = useSpring(hoverProgress, { stiffness: 180, damping: 22 });
  const glowBorder    = useTransform(glowProgress, [0, 1], [0.28, 0.68]);
  const glowAmbient   = useTransform(glowProgress, [0, 1], [0.12, 0.32]);
  const glowDepth     = useTransform(glowProgress, [0, 1], [0.40, 0.68]);
  const premiumShadow = useMotionTemplate`0 0 0 1px rgba(167,139,250,${glowBorder}), 0 0 52px rgba(109,40,217,${glowAmbient}), 0 12px 40px rgba(0,0,0,${glowDepth})`;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  }, [mouseX, mouseY, shouldReduce]);

  const handleMouseEnter = useCallback(() => {
    if (!shouldReduce) hoverProgress.set(1);
  }, [hoverProgress, shouldReduce]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    hoverProgress.set(0);
  }, [mouseX, mouseY, hoverProgress]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        CARD_BASE,
        'backdrop-blur-md h-full',
        isPremium
          ? 'transition-colors duration-500'
          : [
              'bg-zinc-900/40 border border-white/[0.05]',
              'transition-colors duration-300',
              'hover:border-white/[0.10]',
            ].join(' '),
      ].join(' ')}
      style={{
        rotateX: shouldReduce ? undefined : rotateX,
        rotateY: shouldReduce ? undefined : rotateY,
        ...(isPremium ? { ...PREMIUM_BORDER_STYLE, boxShadow: premiumShadow } : {}),
      }}
    >
      {isPremium && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(139,92,246,0.16) 0%, transparent 62%)' }}
          aria-hidden="true"
        />
      )}

      <div
        className={[
          'absolute top-0 inset-x-0 h-px pointer-events-none transition-opacity duration-500',
          isPremium ? 'opacity-50 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100',
        ].join(' ')}
        style={{
          background: isPremium
            ? 'linear-gradient(to right, transparent, rgba(167,139,250,0.65), transparent)'
            : 'linear-gradient(to right, transparent, rgba(167,139,250,0.35), transparent)',
        }}
        aria-hidden="true"
      />

      {!isPremium && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
          style={{ background: 'radial-gradient(ellipse at 35% -10%, rgba(167,139,250,0.07) 0%, transparent 65%)' }}
          aria-hidden="true"
        />
      )}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl overflow-hidden"
        style={{
          background: glareBackground,
          opacity: glareOpacity,
          mixBlendMode: 'screen',
        }}
      />

      <motion.div
        className="relative z-20 h-full flex flex-col"
        style={{
          translateX: shouldReduce ? undefined : contentX,
          translateY: shouldReduce ? undefined : contentY,
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className={[
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
            isPremium
              ? 'bg-gradient-to-br from-violet-500/[0.18] to-purple-700/[0.08] border border-violet-400/[0.30] group-hover:border-violet-400/[0.55] group-hover:from-violet-500/[0.25]'
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
      </motion.div>
    </motion.div>
  );
}

// ─── Directional enter vectors — each card arrives from a unique angle ────────
const ENTER_DIRS = [
  { x: -40, y:   0 }, // agenda    — from left
  { x:   0, y:  40 }, // whatsapp  — from below
  { x:  40, y:   0 }, // perfil    — from right
  { x:   0, y:  40 }, // mp        — from below
  { x: -24, y:  32 }, // crm       — diagonal TL
  { x:  24, y:  32 }, // reportes  — diagonal TR
];

// ─── Section ──────────────────────────────────────────────────────────────────

export default function FeaturesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  useGSAP(() => {
    if (shouldReduce) return;

    const cards = gsap.utils.toArray<HTMLElement>('.bento-card');

    cards.forEach((card, i) => {
      const dir = ENTER_DIRS[i % ENTER_DIRS.length];

      gsap.fromTo(
        card,
        {
          opacity: 0,
          x: dir.x,
          y: dir.y,
          scale: 0.95,
          filter: 'blur(6px)',
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
        },
      );
    });
  }, { scope: containerRef, dependencies: [shouldReduce] });

  return (
    <section
      ref={containerRef}
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

      <div className="py-24 px-6 max-w-5xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-14">
          <AnimatedHeadline
            tag="h2"
            className="font-playfair text-[clamp(2.8rem,5vw,4.5rem)] font-normal text-white leading-[1.05] tracking-[-0.02em]"
          >
            Herramientas que tu salón necesita
          </AnimatedHeadline>
          <p className="text-zinc-500 text-[0.9rem] mt-4 max-w-md mx-auto leading-relaxed">
            El plan base cubre lo esencial. El premium lo lleva al siguiente nivel.
          </p>
        </div>

        {/* Bento grid — perspective on the wrapper lets tilt work correctly */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-auto"
          style={{ perspective: '900px' }}
        >
          {bentoItems.map((item) => (
            <div
              key={item.id}
              className={`bento-card ${item.gridClass} min-h-0`}
            >
              <BentoCard item={item} />
            </div>
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
