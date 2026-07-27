# Sprint 2A — Rediseño completo de /business

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reemplazar /business con una landing B2B de 7 secciones que convence a una dueña de salón de registrarse en Ouleeh — usando ScrollVideoHero como hero principal con 96 frames pregrabados.

**Architecture:** Cada sección en su propio componente en `src/components/business/`. `business/page.tsx` orquesta. Hero wrappea `ScrollVideoHero` existente con texto como children. Design system: `bg-[#09090b]`, `font-playfair`, emerald-400 accent, lucide-react icons.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v3, shadcn/ui, lucide-react, framer-motion (ya instalado).

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| Reemplazar | `src/components/business/BusinessHero.tsx` |
| Crear | `src/components/business/DolorSection.tsx` |
| Crear | `src/components/business/ComoFuncionaSection.tsx` |
| Crear | `src/components/business/FeaturesSection.tsx` |
| Crear | `src/components/business/PricingSection.tsx` |
| Crear | `src/components/business/SocialProofSection.tsx` |
| Crear | `src/components/business/CTAFinalSection.tsx` |
| Reemplazar | `src/app/business/page.tsx` |

Los archivos viejos `BusinessFeatures.tsx` y `BusinessCTA.tsx` quedan en disco pero no se importan en page.tsx.

---

## Task 1: BusinessHero — ScrollVideoHero con texto como children

**Archivo:** Reemplazar `src/components/business/BusinessHero.tsx`

El `ScrollVideoHero` renderiza children en la parte inferior de la pantalla sticky (`justify-end pb-16`). El contenedor padre es `pointer-events-none` — los CTAs necesitan `pointer-events-auto`.

- [ ] **Step 1: Escribir el nuevo BusinessHero.tsx**

```tsx
'use client';

import Link from 'next/link';
import ScrollVideoHero from './ScrollVideoHero';

export default function BusinessHero() {
  return (
    <ScrollVideoHero
      totalFrames={96}
      framesPath="/frames/studio-display"
    >
      <div className="w-full text-center px-6 pb-4 pointer-events-auto">
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <p className="text-[10px] text-emerald-400 uppercase tracking-[0.5em] font-bold">
            Ouleeh para Negocios
          </p>
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        </div>

        <h1 className="font-playfair text-5xl md:text-7xl text-white leading-tight tracking-tight mb-5 max-w-4xl mx-auto drop-shadow-2xl">
          Tu salón,{' '}
          <span className="italic text-emerald-400">sin el caos.</span>
        </h1>

        <p className="text-zinc-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8 drop-shadow-lg">
          Agenda inteligente, clientes fidelizados y cobros simples —
          todo en una plataforma diseñada para salones de Argentina.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/business/register"
            className="px-8 py-4 bg-white text-zinc-950 font-black text-[12px]
              uppercase tracking-widest rounded-full hover:bg-zinc-100
              active:scale-[0.98] transition-all"
          >
            Empezar gratis →
          </Link>
          <a
            href="#como-funciona"
            className="px-8 py-4 border border-white/[0.20] text-zinc-300
              font-semibold text-[12px] uppercase tracking-widest rounded-full
              hover:border-white/[0.40] hover:text-white transition-all backdrop-blur-sm"
          >
            Ver cómo funciona
          </a>
        </div>

        <p className="text-zinc-500 text-xs mt-6 tracking-wide">
          Gratis para siempre en el plan base · Sin tarjeta de crédito
        </p>
      </div>
    </ScrollVideoHero>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/business/BusinessHero.tsx
git commit -m "feat(business): replace BusinessHero with ScrollVideoHero (96 frames) + hero text overlay"
```

---

## Task 2: DolorSection — 6 pain points

**Archivo:** Crear `src/components/business/DolorSection.tsx`

- [ ] **Step 1: Crear DolorSection.tsx**

```tsx
import { MessageCircle, Calendar, DollarSign, UserX, Clock, Phone } from 'lucide-react';

const pains = [
  {
    icon: MessageCircle,
    pain: '"Seño, ¿me das turno para el viernes?"',
    description: 'Confirmaciones por WhatsApp que se pierden entre mensajes.',
  },
  {
    icon: Calendar,
    pain: 'Doble turno a la misma hora',
    description: 'Sin sistema, los errores de agenda son inevitables y te hacen quedar mal.',
  },
  {
    icon: DollarSign,
    pain: '¿Cuánto gané este mes?',
    description: 'Sin registros claros, no sabés si tu negocio crece o se estanca.',
  },
  {
    icon: UserX,
    pain: 'Clientas que no vuelven',
    description: 'Sin seguimiento, perdés clientas que simplemente se olvidaron de volver.',
  },
  {
    icon: Clock,
    pain: 'Horas perdidas en admin',
    description: 'Tiempo que podrías dedicar a tu trabajo lo gastás organizando.',
  },
  {
    icon: Phone,
    pain: 'Tu teléfono nunca para',
    description: 'Llamadas para reservar en medio de un servicio. Interrupciones constantes.',
  },
];

export default function DolorSection() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-3">
          El problema
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          ¿Te suena familiar?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pains.map(({ icon: Icon, pain, description }) => (
          <div
            key={pain}
            className="rounded-2xl bg-[#141414] border border-white/[0.06] p-6
              hover:border-white/[0.10] transition-all duration-300"
          >
            <div className="w-9 h-9 rounded-xl bg-red-400/[0.08] border border-red-400/[0.15]
              flex items-center justify-center mb-4">
              <Icon className="w-4 h-4 text-red-400" />
            </div>
            <p className="font-playfair text-base text-white italic mb-2">"{pain}"</p>
            <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/business/DolorSection.tsx
git commit -m "feat(business): add DolorSection with 6 pain point cards"
```

---

## Task 3: ComoFuncionaSection — 3 pasos

**Archivo:** Crear `src/components/business/ComoFuncionaSection.tsx`

- [ ] **Step 1: Crear ComoFuncionaSection.tsx**

```tsx
import { Store, Share2, LayoutDashboard } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Creá tu perfil',
    description: 'Registrá tu salón en 5 minutos. Cargá tus servicios, tu equipo y tus horarios.',
    icon: Store,
  },
  {
    step: '02',
    title: 'Compartí tu link',
    description: 'Cada salón tiene su página propia. Compartila por WhatsApp e Instagram.',
    icon: Share2,
  },
  {
    step: '03',
    title: 'Gestioná todo acá',
    description: 'Tu agenda, tus clientes y tus cobros — en un solo lugar, desde cualquier dispositivo.',
    icon: LayoutDashboard,
  },
];

export default function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-3">
          Simple por diseño
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          En 3 pasos, tu salón online
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Línea conectora — solo desktop */}
        <div className="hidden md:block absolute top-10 left-[calc(16.6%+1rem)]
          right-[calc(16.6%+1rem)] h-px bg-gradient-to-r
          from-transparent via-white/[0.08] to-transparent" />

        {steps.map(({ step, title, description, icon: Icon }) => (
          <div key={step} className="flex flex-col items-center text-center relative">
            <div className="w-20 h-20 rounded-2xl bg-[#141414] border border-white/[0.06]
              flex flex-col items-center justify-center mb-5 relative z-10">
              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-bold">
                Paso
              </p>
              <p className="font-playfair text-3xl text-white italic">{step}</p>
            </div>
            <Icon className="w-5 h-5 text-emerald-400 mb-3" />
            <h3 className="font-playfair text-xl text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/business/ComoFuncionaSection.tsx
git commit -m "feat(business): add ComoFuncionaSection with 3-step visual flow"
```

---

## Task 4: FeaturesSection — 8 features con badges Gratis/Premium

**Archivo:** Crear `src/components/business/FeaturesSection.tsx`

- [ ] **Step 1: Crear FeaturesSection.tsx**

```tsx
import { Check } from 'lucide-react';

const features = [
  { title: 'Agenda online 24/7', description: 'Tus clientas reservan solas, vos no movés un dedo.', free: true },
  { title: 'Perfil público de tu salón', description: 'Tu página propia con servicios, fotos y equipo.', free: true },
  { title: 'Notificaciones por WhatsApp', description: 'Confirmaciones y recordatorios automáticos.', free: true },
  { title: 'Hasta 3 profesionales', description: 'Gestioná el equipo de tu salón.', free: true },
  { title: 'Profesionales ilimitados', description: 'Escalá sin límites a medida que crece tu equipo.', free: false },
  { title: 'Reportes y métricas', description: 'Ingresos, servicios más pedidos, retención de clientas.', free: false },
  { title: 'Cobro online con MercadoPago', description: 'Señas y pagos completos desde la app.', free: false },
  { title: 'CRM de clientas', description: 'Historial técnico, preferencias y métricas por clienta.', free: false },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-3">
          Todo lo que incluye
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          Herramientas que tu salón necesita
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map(({ title, description, free }) => (
          <div
            key={title}
            className={`rounded-2xl p-5 flex items-start gap-4 transition-all duration-300
              ${free
                ? 'bg-[#141414] border border-white/[0.06] hover:border-white/[0.10]'
                : 'bg-emerald-400/[0.04] border border-emerald-400/[0.12] hover:border-emerald-400/[0.20]'
              }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
              ${free ? 'bg-white/[0.06]' : 'bg-emerald-400/[0.10]'}`}>
              <Check className={`w-3.5 h-3.5 ${free ? 'text-zinc-400' : 'text-emerald-400'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white">{title}</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                  ${free
                    ? 'bg-white/[0.06] text-zinc-500'
                    : 'bg-emerald-400/[0.10] text-emerald-400 border border-emerald-400/[0.20]'
                  }`}>
                  {free ? 'Gratis' : 'Premium'}
                </span>
              </div>
              <p className="text-sm text-zinc-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/business/FeaturesSection.tsx
git commit -m "feat(business): add FeaturesSection with Gratis/Premium badges"
```

---

## Task 5: PricingSection — 2 cards (base + premium)

**Archivo:** Crear `src/components/business/PricingSection.tsx`

- [ ] **Step 1: Crear PricingSection.tsx**

```tsx
import Link from 'next/link';
import { Check } from 'lucide-react';

const freeFeatures = ['Agenda online', 'Perfil público', 'WhatsApp automático', 'Hasta 3 profesionales'];

const premiumFeatures = [
  'Todo lo del plan base',
  'Profesionales ilimitados',
  'Reportes y métricas',
  'Cobro online con MercadoPago',
  'CRM completo de clientas',
  'Soporte prioritario',
];

export default function PricingSection() {
  return (
    <section className="py-24 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-3">
          Precios
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          Empezá gratis, crecé sin límites
        </h2>
        <p className="text-zinc-500 text-sm mt-3">
          Sin permanencia. Sin tarjeta de crédito para el plan gratuito.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Plan Base */}
        <div className="rounded-2xl bg-[#141414] border border-white/[0.06] p-8">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-4">
            Plan Base
          </p>
          <div className="mb-6">
            <span className="font-playfair text-5xl text-white italic">Gratis</span>
            <p className="text-zinc-500 text-sm mt-1">Para siempre</p>
          </div>
          <ul className="space-y-3 mb-8">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-zinc-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/business/register"
            className="block text-center py-3.5 rounded-full border border-white/[0.12]
              text-zinc-400 font-bold text-[11px] uppercase tracking-widest
              hover:border-white/[0.25] hover:text-white transition-all"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Plan Premium */}
        <div className="rounded-2xl bg-emerald-400/[0.04] border border-emerald-400/[0.20] p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/[0.10]
              border border-emerald-400/[0.20] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Más popular
            </span>
          </div>

          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-4">
            Plan Premium
          </p>
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              {/* NOTA PARA PEDRO: reemplazar con precio real cuando esté definido */}
              <span className="font-playfair text-5xl text-white italic">$X.XXX</span>
              <span className="text-zinc-500 text-sm">/ mes</span>
            </div>
            <p className="text-zinc-500 text-sm mt-1">En pesos argentinos</p>
          </div>
          <ul className="space-y-3 mb-8">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/business/register"
            className="block text-center py-3.5 rounded-full bg-white text-zinc-950
              font-black text-[11px] uppercase tracking-widest
              hover:bg-zinc-100 active:scale-[0.98] transition-all"
          >
            Empezar gratis →
          </Link>
        </div>

      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/business/PricingSection.tsx
git commit -m "feat(business): add PricingSection with free + premium cards"
```

---

## Task 6: SocialProofSection — 3 testimonials placeholder

**Archivo:** Crear `src/components/business/SocialProofSection.tsx`

- [ ] **Step 1: Crear SocialProofSection.tsx**

```tsx
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: 'Antes perdía 2 horas por semana en WhatsApp. Ahora mis clientas reservan solas y yo me entero por la app.',
    name: 'Valentina G.',
    salon: 'Maison de Beauté · Palermo',
    initials: 'V',
  },
  {
    quote: 'El dashboard me muestra en 5 segundos cómo está el negocio. Nunca tuve eso antes.',
    name: 'Martina R.',
    salon: 'Studio Lumière · Recoleta',
    initials: 'M',
  },
  {
    quote: 'Cero cancelaciones sorpresa desde que uso los recordatorios automáticos de WhatsApp.',
    name: 'Carolina S.',
    salon: 'Aura Wellness · Belgrano',
    initials: 'C',
  },
];

export default function SocialProofSection() {
  return (
    <section className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-3">
          Lo que dicen
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          Salones que ya lo usan
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map(({ quote, name, salon, initials }) => (
          <div
            key={name}
            className="rounded-2xl bg-[#141414] border border-white/[0.06] p-6
              hover:border-white/[0.10] transition-all duration-300"
          >
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="font-playfair text-base text-white italic leading-relaxed mb-5">
              &ldquo;{quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
              <div className="w-8 h-8 rounded-full bg-emerald-400/[0.10] border border-emerald-400/[0.20]
                flex items-center justify-center shrink-0">
                <span className="font-playfair text-sm text-emerald-400">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{name}</p>
                <p className="text-[11px] text-zinc-600">{salon}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/business/SocialProofSection.tsx
git commit -m "feat(business): add SocialProofSection with 3 placeholder testimonials"
```

---

## Task 7: CTAFinalSection — cierre con glow

**Archivo:** Crear `src/components/business/CTAFinalSection.tsx`

- [ ] **Step 1: Crear CTAFinalSection.tsx**

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTAFinalSection() {
  return (
    <section className="py-32 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08), transparent)' }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-4">
          Empezá hoy
        </p>
        <h2 className="font-playfair text-5xl text-white italic leading-tight mb-6">
          Tu salón merece<br />una herramienta mejor.
        </h2>
        <p className="text-zinc-400 text-lg mb-10">
          Gratis para siempre en el plan base.
          Sin permanencia, sin letra chica.
        </p>
        <Link
          href="/business/register"
          className="inline-flex items-center gap-3 px-10 py-5 bg-white text-zinc-950
            font-black text-[12px] uppercase tracking-widest rounded-full
            hover:bg-zinc-100 active:scale-[0.98] transition-all"
        >
          Registrá tu salón gratis
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-zinc-600 text-xs mt-6">
          Sin tarjeta de crédito · Configuración en 5 minutos
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/business/CTAFinalSection.tsx
git commit -m "feat(business): add CTAFinalSection with emerald glow"
```

---

## Task 8: business/page.tsx — orquestar las 7 secciones

**Archivo:** Reemplazar `src/app/business/page.tsx`

- [ ] **Step 1: Escribir el nuevo page.tsx**

```tsx
import LandingHeader from '@/components/landing/LandingHeader';
import BusinessHero from '@/components/business/BusinessHero';
import DolorSection from '@/components/business/DolorSection';
import ComoFuncionaSection from '@/components/business/ComoFuncionaSection';
import FeaturesSection from '@/components/business/FeaturesSection';
import PricingSection from '@/components/business/PricingSection';
import SocialProofSection from '@/components/business/SocialProofSection';
import CTAFinalSection from '@/components/business/CTAFinalSection';

export const metadata = {
  title: 'Para Salones | Ouleeh',
  description: 'Agenda inteligente, clientes fidelizados y cobros simples para salones de Argentina.',
};

export default function BusinessPage() {
  return (
    <div className="bg-[#09090b] min-h-screen">
      <LandingHeader />
      <BusinessHero />
      <DolorSection />
      <ComoFuncionaSection />
      <FeaturesSection />
      <PricingSection />
      <SocialProofSection />
      <CTAFinalSection />
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript completo**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1
```

Esperado: exit code 0, sin errores.

- [ ] **Step 3: Build completo**

```bash
npm run build 2>&1 | tail -30
```

Esperado: ruta `/business` aparece en la tabla, exit code 0.

- [ ] **Step 4: Commit final**

```bash
git add src/app/business/page.tsx
git commit -m "feat(business): wire up 7-section business landing page"
```
