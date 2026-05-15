# MujerApp — Review de Implementación Técnica

**Rama**: `database-config` | **Última actualización**: 2026-05-15

---

## ESTADO GENERAL

Este documento mapea el código real del proyecto a su estado de implementación, incluyendo rutas, acciones, servicios y deuda técnica vigente. Sirve como fuente de verdad para entender dónde estamos parados hoy.

---

## ARQUITECTURA DE RUTAS (estado 2026-05-15)

### Admin — SPA con tabs

El admin NO usa un route group `(admin)` con páginas separadas. Es una **Single-Page App** en:

```
src/app/[tenantSlug]/
├── layout.tsx                  → guard: redirect /login si !session || role === 'customer'
└── dashboard/
    ├── page.tsx                → SPA con sidebar flotante + 7 tabs
    ├── DashboardTabView.tsx    → métricas del día (ingresos, turnos, caja)
    ├── AgendaTabView.tsx       → agenda visual por slots 30min, checkout inline, crear turno
    ├── ClientesTabView.tsx     → búsqueda y lista de clientes
    ├── ServiciosTabView.tsx    → CRUD de servicios
    ├── CajaTabView.tsx         → cierre de caja diario, revenue semanal por método
    ├── PerformanceTabView.tsx  → analytics / rendimiento
    └── ConfigTabView.tsx       → horarios semanales, comisiones del equipo, ajustes del local
```

**Acceso**: `/{tenantSlug}/dashboard` (ej: `/mi-salon/dashboard`)

**Guard**: `src/app/[tenantSlug]/layout.tsx` — `getServerSession()` en el layout. Si no hay sesión o `role === 'customer'`, redirige a `/login`.

**Middleware**: `src/middleware.ts` protege con `withAuth`:
```typescript
matcher: [
  '/:slug/dashboard/:path*',
  '/admin/:path*',
  '/perfil/:path*',
]
```

---

### Marketplace — Rutas públicas B2C

```
src/app/(marketplace)/
├── layout.tsx
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx                        → / (landing B2C)
│   ├── explore/page.tsx                → /explore
│   ├── registro/page.tsx               → /registro
│   └── salones/[tenantSlug]/
│       ├── page.tsx                    → /salones/{slug} (perfil público)
│       ├── login/page.tsx              → /salones/{slug}/login
│       ├── book/
│       │   ├── page.tsx                → /salones/{slug}/book (booking flow)
│       │   ├── confirmation/[appointmentId]/page.tsx
│       │   └── payment/
│       │       ├── success/page.tsx
│       │       ├── pending/page.tsx
│       │       └── failure/page.tsx
│       └── dashboard/
│           ├── layout.tsx
│           ├── page.tsx                → /salones/{slug}/dashboard (portal cliente)
│           └── mis-turnos/page.tsx
└── perfil/
    ├── page.tsx                        → /perfil (overview B2C)
    ├── cuenta/page.tsx                 → /perfil/cuenta (wired a Firestore)
    ├── historial/page.tsx              → /perfil/historial (mock data aún)
    └── favoritos/page.tsx
```

**Nota**: `src/app/perfil/layout.tsx` es un layout standalone (fuera del grupo marketplace) que fuerza `light` como colorScheme. Probablemente es un artefacto — revisar si es necesario o colisiona con el layout de `(marketplace)/perfil/`.

---

### B2B / Business

```
src/app/
├── business/
│   ├── page.tsx                → /business (landing B2B, 7 secciones, ScrollVideoHero)
│   └── register/page.tsx       → /business/register (onboarding wizard 5 pasos)
└── login/page.tsx              → /login (unificado, tab B2B/B2C)
```

---

### API Routes

```
src/app/api/
├── auth/[...nextauth]/route.ts
├── google/
│   ├── callback/route.ts
│   ├── connect/route.ts
│   ├── disconnect/route.ts
│   ├── event/route.ts
│   ├── status/route.ts
│   ├── sync/bootstrap/route.ts
│   └── webhook/route.ts
├── mercadopago/webhook/route.ts
└── notifications/route.ts
```

---

### Dev Utilities (protegidas en prod)

```
src/app/admin/
├── seed/page.tsx       → guard notFound() en producción
└── migrate/page.tsx    → guard notFound() en producción
```

---

## SERVER ACTIONS (src/actions/)

| Archivo | Propósito |
|---------|-----------|
| `appointments.actions.ts` | getDailyMetrics, getWeeklyRevenue, getRevenueTimeSeries, createAppointment |
| `auth.actions.ts` | registerCustomer, login helpers |
| `booking.actions.ts` | createBooking (marketplace, con guest support) |
| `branches.actions.ts` | createBranch, updateBranch, toggleBranchActive |
| `caja.actions.ts` | getCierreCaja |
| `calendar.actions.ts` | syncAppointmentToCalendar, cancelCalendarEvent |
| `checkout.actions.ts` | closeAppointment (marca cobrado + incrementa CRM metrics) |
| `customer.actions.ts` | getMyAppointments, searchCustomers, createCustomer, cancelAppointment |
| `guest-booking.actions.ts` | createGuestBooking (sin sesión NextAuth) |
| `mercadopago.actions.ts` | createDepositPreference |
| `onboarding.actions.ts` | createTenantWithAdmin (batch atómico Firestore) |
| `profile.actions.ts` | getMyProfile, updateMyProfile, getMyHistorial, getMyUpcomingAppointments |
| `reviews.actions.ts` | getSalonReviews, getSalonRatingStats, submitReview |
| `services.actions.ts` | createService, updateService, toggleServiceActive |
| `staff.actions.ts` | createStaffMember, updateStaffMember, toggleStaffActive, updateStaffCommissions |
| `tenant.actions.ts` | getTenantSettings, updateTenantSettings, checkSlugAvailability |

---

## SERVICIOS (src/lib/services/)

| Archivo | Propósito |
|---------|-----------|
| `auth.service.ts` | helpers de autenticación Firebase |
| `catalog.service.ts` | getServices, getPromotions por tenant |
| `customer.service.ts` | getAppointmentsByClientId, getCustomerByPhone, getAppointmentsByPhone |
| `marketplace.service.ts` | getPublicSalons, getSalonBySlug |
| `notification.service.ts` | notificaciones internas |
| `user.service.ts` | getUserProfile, updateUserProfile |

---

## HOOKS (src/hooks/)

| Hook | Propósito |
|------|-----------|
| `useBranches` | lista de sucursales del tenant activo |
| `useCatalog` | servicios del catálogo del tenant |
| `useMetrics` | métricas del dashboard |
| `useOcupacionEnVivo` | ocupación en tiempo real (Firestore listener) |
| `useRole` | rol del usuario de la sesión |
| `useStaff` | lista de staff del tenant |
| `use-toast` | sistema de toasts (shadcn) |

---

## CONTEXTOS (src/contexts/)

| Contexto | Propósito |
|----------|-----------|
| `TenantContext` | tenantId, branchId, datos básicos del tenant activo |
| `UserContext` | datos del usuario autenticado |

---

## SCHEMA (src/lib/schema.ts) — Source of Truth

Tipos principales exportados:
- `UserProfile`, `UserRole` (`'admin' | 'employee' | 'client' | 'customer'`), `Membership`
- `Tenant` (con `plan?: 'free' | 'basic' | 'premium'`)
- `Branch`, `Service`, `ServicePrice`, `ServicePriceByLength`, `Promotion`
- `Staff`, `StaffCommissions`
- `Appointment`, `AppointmentStatus`, `PaymentMethod`, `PaymentSplit`
- `Customer`, `TechnicalRecord`

**Nota de alineación pendiente**: `Tenant.plan` tiene valores `'free' | 'basic' | 'premium'` pero el plan de Planes SaaS (3.5) usa `'free' | 'pro' | 'enterprise'`. Alinear antes de implementar Planes SaaS.

**`src/lib/types.ts`**: Schema legacy (78 líneas). Todavía existe. Pendiente renombrar a `_types_archive.ts` y migrar referencias.

---

## COMPONENTES — INVENTARIO REAL

### admin/
- `CheckoutDrawer.tsx` — Sheet de cobro (efectivo/MP/tarjeta/transferencia)
- `CierreCajaDiario.tsx` — Resumen de caja real-time

### business/ (11 componentes)
- `ScrollVideoHero.tsx`, `BusinessHero.tsx`, `BusinessCTA.tsx`, `BusinessFeatures.tsx`
- `CTAFinalSection.tsx`, `ComoFuncionaSection.tsx`, `DolorSection.tsx`
- `FeaturesSection.tsx`, `PricingSection.tsx`, `SocialProofSection.tsx`
- `BusinessDashboardMock.tsx`

### charts/ (3 componentes)
- `MonthlyVolumeChart.tsx`, `PopularServicesChart.tsx`, `WeeklyTurnosChart.tsx`

### landing/ (14 componentes)
- `Hero.tsx`, `LandingHeader.tsx`, `LandingFooter.tsx`, `Footer.tsx`
- `Categorias.tsx`, `ColeccionCurada.tsx`, `ElevaTuVision.tsx`
- `FeaturedServices.tsx`, `SalonesDestacados.tsx`, `Testimonials.tsx`
- `MapAndReviews.tsx`, `PromoSection.tsx`, `CTABusiness.tsx`, `InfoBar.tsx`
- `ScrollReveal.tsx`

### marketplace/ (10 componentes)
- `BookingFlow.tsx`, `CancelAppointmentDialog.tsx`, `ExploreSidebar.tsx`
- `PublicHeader.tsx`, `PublicSalonCard.tsx`, `PublicSalonHero.tsx`
- `PublicServiceCard.tsx`, `PublicStaffCard.tsx`, `SalonCard.tsx`, `SalonMap.tsx`

### salon/ (5 componentes)
- `SalonFeaturedServices.tsx`, `SalonHeader.tsx`, `SalonHero.tsx`
- `SalonSidebar.tsx`, `ScrollReveal.tsx`

### ui/ (44 componentes shadcn/Radix)
Incluyendo: `accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `button`, `calendar`,
`card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `dialog`,
`dropdown-menu`, `form`, `input`, `label`, `menubar`, `popover`, `progress`,
`radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`,
`slider`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `tooltip`
+ componentes premium: `background-paths`, `container-scroll-animation`, `hero-1`,
`pricing-section-4`, `sparkles`, `timeline-animation`, `vertical-cut-reveal`

---

## TESTS (e2e/)

Playwright configurado. 3 specs en `e2e/`:
- `booking-flow.spec.ts`
- `checkout.spec.ts`
- `registro.spec.ts`
- `fixtures/` + `global-setup.ts` con storageState para auth

**Estado**: ⚠️ `npx playwright install` NO está en `.github/workflows/ci.yml`. Los e2e no corren en CI.

**CI actual** (`.github/workflows/ci.yml`): 3 jobs — TypeScript, ESLint, Build. Sin e2e.

---

## DEUDA TÉCNICA VIGENTE (2026-05-15)

### 🔴 P0 — Bloquea producción

| # | Deuda | Acción |
|---|-------|--------|
| D1 | `MERCADOPAGO_ACCESS_TOKEN` de sandbox activo | Activar clave de producción |
| D2 | `WHATSAPP_TOKEN` no configurado en prod | Activar en variables de entorno de producción |
| ~~D3~~ | ~~e2e no corren en CI~~ | ✅ Job `e2e` añadido a `ci.yml` con `playwright install --with-deps chromium` |

### 🟡 P1

| # | Deuda | Acción |
|---|-------|--------|
| ~~D4~~ | ~~`resend` en package.json sin uso~~ | ✅ `npm uninstall resend`. API route eliminada. `notification.service.ts` → stub no-op. |
| ~~D5~~ | ~~Staff CRUD incompleto en admin SPA~~ | ✅ `ConfigTabView`: crear profesional (form inline) + archivar/reactivar por card. |
| ~~D6~~ | ~~`tenantIds` JWT no reactivos~~ | ✅ JWT callback ahora maneja `trigger === 'update'`: re-fetches memberships de Firestore. Llamar `update()` de `useSession()` después de cambios de rol/tenant. |
| ~~D7~~ | ~~`Tenant.plan` valores desalineados con roadmap~~ | ✅ Alineado a `'free' \| 'pro' \| 'enterprise'` en `schema.ts`. `usePlan()` hook creado. |

### 🟢 P2

| # | Deuda | Acción |
|---|-------|--------|
| ~~D8~~ | ~~`src/lib/types.ts` legacy (78 líneas)~~ | ✅ Renombrado a `_types_archive.ts`, las 9 referencias actualizadas, `types.ts` eliminado. |
| ~~D9~~ | ~~`shim-storage.ts` en `next.config.ts`~~ | ✅ Conservado como shim silencioso. Diagnósticos eliminados (eran spam en prod logs). |
| ~~D10~~ | ~~`patch-package` en devDependencies~~ | ✅ Eliminado — no tenía directorio `patches/` ni `postinstall` hook. Era dead weight. |
| ~~D11~~ | ~~`src/app/perfil/layout.tsx` standalone~~ | ✅ Eliminado — era dead code sin `page.tsx` sibling. No wrapeaba nada. |
| D12 | 4 TODOs de imágenes (`ColeccionCurada.tsx` ×3, `ElevaTuVision.tsx` ×1) | Reemplazar con assets reales |
| ~~D13~~ | ~~`/perfil/historial` con mock data~~ | ✅ `getMyHistorial` + `getMyUpcomingAppointments` wired cross-tenant. `/perfil/page.tsx` usa datos reales para próximos turnos. |

---

## CHECKLIST DE INTEGRACIONES

| Integración | Estado | Notas |
|-------------|--------|-------|
| **Firebase Auth** | ✅ Activo | `signInWithEmailAndPassword` vía Credentials provider |
| **Firestore** | ✅ Activo | REST en Server Components, SDK en Client para listeners |
| **Google OAuth** | ✅ Activo | Con scopes de Calendar |
| **Google Calendar** | ✅ ~80% | Bidireccional. Token refresh OK. |
| **MercadoPago** | ✅ ~90% | Checkout Pro + webhook IPN. Sandbox activo. |
| **WhatsApp Business** | ⚠️ Estructural | `whatsapp.ts` + templates listos. Sin token real. |
| **Resend / Email** | ✅ Eliminado | Paquete desinstalado. API route borrada. Service → no-op stub. |
| **Sentry** | ❌ No configurado | P1 post-launch |
| **PostHog / Analytics** | ❌ No configurado | P2 |
| **Google Maps** | ✅ Activo | `SalonMap.tsx` con dark theme + fallback sin API key |

---

## HISTORIAL DE CAMBIOS ARQUITECTÓNICOS RELEVANTES

| Fecha | Cambio |
|-------|--------|
| 2026-04-08 | **Pivot LATAM**: eliminado Resend/email. WhatsApp como canal principal. |
| 2026-04-08 | **Pivot LATAM**: eliminada IA/Genkit del roadmap. |
| 2026-04-09 | Guest Booking implementado (reservas sin auth wall). |
| 2026-04-09 | `ScrollVideoHero` (96 frames) + rediseño completo `/business`. |
| 2026-04-29 | MercadoPago Checkout Pro + webhook IPN. |
| 2026-04-29 | `CierreCajaDiario` real-time en dashboard. |
| 2026-05-07 | `src/ai/` eliminado. Genkit removido de package.json. |
| 2026-05-07 | Admin reestructurado como SPA con 7 tabs en `[tenantSlug]/dashboard`. |
| 2026-05-07 | `CajaTabView` y `PerformanceTabView` añadidos como tabs del admin. |
| 2026-05-15 | `resend` desinstalado. `/api/notifications` eliminado. `notification.service.ts` → stub. |
| 2026-05-15 | Playwright añadido a CI (job `e2e` con `chromium`). |
| 2026-05-15 | `Tenant.plan` alineado a `'free' \| 'pro' \| 'enterprise'`. `usePlan()` hook creado. |
| 2026-05-15 | Staff CRUD completo en `ConfigTabView`: crear + archivar/reactivar profesionales. |
| 2026-05-15 | `getMyHistorial` + `getMyUpcomingAppointments` wired cross-tenant en `profile.actions.ts`. `/perfil/page.tsx` y `/perfil/historial` usan datos reales. |
