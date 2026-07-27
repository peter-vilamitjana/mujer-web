# MujerApp — Plataforma SaaS para Salones de Belleza

Plataforma B2B2C multi-tenant para la gestión de salones de belleza en Argentina y LATAM. Los salones gestionan su operación completa (agenda, caja, staff, clientes) desde un dashboard admin, mientras las clientas descubren salones y reservan turnos online.

**Modelo de negocio**: SaaS puro — suscripción fija en ARS, sin comisión por turno.  
**Diferencial**: MercadoPago nativo, WhatsApp nativo, guest booking sin auth wall.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 App Router + TypeScript strict |
| Auth | NextAuth.js v4 (Credentials + Google OAuth) |
| Base de datos | Firebase Firestore (REST server-side, SDK client para listeners) |
| Estilos | Tailwind CSS v3 + shadcn/ui + Framer Motion |
| Pagos | MercadoPago Checkout Pro (REST, sin SDK) |
| Notificaciones | WhatsApp Business API |
| Calendario | Google Calendar API (bidireccional) |
| CI/CD | GitHub Actions (typecheck + lint + build + Playwright e2e) |
| Hosting | Firebase App Hosting |

---

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/peter-vilamitjana/mujer-web.git
cd mujer-web
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local`. Mínimo para desarrollo local:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<cualquier-string-random>
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Ver `.env.example` para el listado completo con MercadoPago, WhatsApp y Maps.

### 3. Levantar

```bash
npm run dev   # http://localhost:3000
```

---

## Comandos

```bash
npm run dev          # servidor de desarrollo (HMR)
npm run build        # build de producción
npm run start        # servidor de producción (requiere build)
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript check sin emitir
npx playwright test  # e2e tests (requiere build + start activo)
```

---

## Arquitectura

### Multi-tenancy

Cada salón es un **tenant** con su subárbol en Firestore:

```
tenants/{tenantId}/
  branches/{branchId}            → sucursales
  staff/{staffId}                → profesionales
  services/{serviceId}           → catálogo
  appointments/{appointmentId}   → turnos
  customers/{customerId}         → CRM de clientes
  integrations/google            → tokens Google Calendar
```

El `tenantId` siempre proviene del JWT — nunca del cliente.

### Rutas

```
/                              → landing B2C
/explore                       → buscador de salones
/salones/[slug]                → perfil público del salón
/salones/[slug]/book           → booking flow (4 pasos, guest OK)
/salones/[slug]/dashboard      → portal de clienta (citas activas)
/business                      → landing B2B
/business/register             → onboarding wizard (5 pasos)
/login                         → login unificado B2B + B2C
/registro                      → registro B2C
/perfil                        → perfil B2C (overview, historial, favoritos)
/[tenantSlug]/dashboard        → admin SPA (7 tabs)
```

### Patrón de datos

- **Server Components** → fetching inicial (Firestore REST).
- **Client Components** → interacción y estado local.
- **Server Actions** (`src/actions/`) → mutaciones. No hay rutas API para mutaciones.

### Admin — SPA con tabs

El panel admin vive en `[tenantSlug]/dashboard/page.tsx` como una SPA con 7 tabs Client Components. No usa rutas separadas por sección. Ver ADR-005.

---

## Estructura

```
src/
├── app/
│   ├── [tenantSlug]/dashboard/   → admin SPA (7 tabs)
│   ├── (marketplace)/            → B2C: landing, explore, salones, perfil
│   ├── business/                 → landing B2B + onboarding wizard
│   ├── login/  registro/         → auth
│   └── api/                      → NextAuth, Google Calendar, MercadoPago webhook
├── components/
│   ├── ui/           → 44 componentes shadcn/Radix
│   ├── marketplace/  → BookingFlow, SalonMap, ExploreSidebar…
│   ├── admin/        → CheckoutDrawer, CierreCajaDiario
│   ├── business/     → 11 componentes landing B2B
│   └── landing/      → 14 componentes landing B2C
├── lib/
│   ├── schema.ts     → tipos Firestore (source of truth)
│   ├── auth.ts       → NextAuth config
│   ├── firebase.ts   → Firebase init
│   ├── mercadopago.ts / whatsapp.ts
│   └── services/     → marketplace, auth, user, catalog, customer
├── actions/          → 16 Server Actions
├── hooks/            → useBranches, useCatalog, useMetrics, usePlan, useRole…
└── contexts/         → TenantContext, UserContext
```

---

## Tests e2e

```bash
npm run build && npm run start   # en una terminal
npx playwright test              # en otra
npx playwright test e2e/booking-flow.spec.ts  # un spec específico
```

| Spec | Auth | Tests |
|---|---|---|
| `booking-flow.spec.ts` | clienta | 7 |
| `cancellation-flow.spec.ts` | clienta | 5 |
| `guest-booking.spec.ts` | ninguna | 6 |
| `registro.spec.ts` | ninguna | 6 |
| `onboarding.spec.ts` | ninguna | 8 |
| `checkout.spec.ts` | admin | 3 |

---

## ADRs

| ADR | Decisión |
|---|---|
| ADR-001 | Modelo SaaS puro (sin comisión por turno) |
| ADR-002 | Schema cobros locales en Firestore (efectivo + MP + tarjeta) |
| ADR-003 | Guest Booking sin auth wall |
| ADR-004 | ScrollVideoHero diferido (canvas animation) |
| ADR-005 | Admin como SPA con tabs en lugar de rutas separadas |

ADRs completos en `~/Documents/Mujerapp_Obsidian_Brain/decisiones/`.

---

## Estado

Ver [`docs/PLAN.md`](docs/PLAN.md) para roadmap completo y deuda técnica.

**Rama activa**: `database-config`  
**Fase actual**: Fase 4 — Growth & Scale (completada al 95%)
