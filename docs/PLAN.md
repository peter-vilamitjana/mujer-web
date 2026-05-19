# MujerApp — Análisis Técnico y Plan de Proyecto

**Rama analizada**: `database-config` | **Fecha**: 2026-04-03 | **Pivot LATAM**: 2026-04-08 | **Última actualización**: 2026-05-15 (sesión 2)

---

## RESUMEN EJECUTIVO

MujerApp es una plataforma SaaS B2B2C multi-tenant para la gestión de salones de belleza. El stack es sólido y moderno (Next.js 15, TypeScript, Firestore, NextAuth v4), con una arquitectura multi-tenant bien diseñada a nivel de schema y reglas Firestore.

**Estado actual (2026-05-19 sesión 4–5)**: ✅ Fase 0 + ✅ Fase 1 + ✅ Fase 2 + ✅ Fase 3 (3.0–3.4 completas) + ✅ Fase 3.5 completadas. ✅ **Reviews** (4.1). ✅ **E2E completo** (4.5): 6 specs — `onboarding.spec.ts` (8 tests) + `cancellation-flow.spec.ts` (5 tests) añadidos. `playwright.config.ts` actualizado con proyectos public/customer para los nuevos specs. **Pendiente Fase 4**: performance (4.3), a11y (4.4), docs (4.6). **Próximo hito**: activar `MERCADOPAGO_ACCESS_TOKEN` en producción + `WHATSAPP_TOKEN` en prod.

La hoja de ruta para un MVP launchable es de **10–14 semanas** para un equipo de 2–3 devs (~8 semanas completadas).

---

## FASE 1 — ANÁLISIS DEL CÓDIGO

### 1.1 Estructura y Arquitectura General

```
src/
├── app/
│   ├── [tenantSlug]/
│   │   ├── layout.tsx              → guard: redirect a /login si no hay sesión admin
│   │   └── dashboard/
│   │       ├── page.tsx            → SPA admin con sidebar + 7 tabs
│   │       ├── DashboardTabView.tsx → métricas del día, caja resumida, turnos próximos
│   │       ├── AgendaTabView.tsx   → agenda visual por slots, checkout inline
│   │       ├── ClientesTabView.tsx → lista + búsqueda de clientes
│   │       ├── ServiciosTabView.tsx → CRUD de servicios
│   │       ├── CajaTabView.tsx     → cierre de caja, revenue semanal por método
│   │       ├── PerformanceTabView.tsx → analytics / rendimiento
│   │       └── ConfigTabView.tsx   → horarios, comisiones de equipo, ajustes del local
│   ├── (marketplace)/
│   │   ├── layout.tsx
│   │   ├── (public)/
│   │   │   ├── page.tsx            → landing B2C (homepage)
│   │   │   ├── explore/page.tsx    → explorar salones con filtros
│   │   │   ├── registro/page.tsx   → registro B2C
│   │   │   └── salones/[tenantSlug]/
│   │   │       ├── page.tsx        → perfil público del salón
│   │   │       ├── login/page.tsx  → login contextual del salón
│   │   │       ├── book/
│   │   │       │   ├── page.tsx                          → booking flow multi-step
│   │   │       │   ├── confirmation/[appointmentId]/page.tsx → confirmación de reserva
│   │   │       │   └── payment/{success,failure,pending}/page.tsx → retorno MercadoPago
│   │   │       └── dashboard/
│   │   │           ├── layout.tsx
│   │   │           ├── page.tsx        → portal de cliente (citas activas)
│   │   │           └── mis-turnos/page.tsx → historial de turnos
│   │   └── perfil/
│   │       ├── page.tsx            → perfil B2C (overview)
│   │       ├── cuenta/page.tsx     → datos de cuenta (wired a Firestore)
│   │       ├── historial/page.tsx  → historial de reservas
│   │       └── favoritos/page.tsx  → salones favoritos
│   ├── business/
│   │   ├── page.tsx                → landing B2B (7 secciones, ScrollVideoHero)
│   │   └── register/page.tsx       → onboarding wizard 5 pasos
│   ├── login/page.tsx              → login unificado (tab B2B/B2C)
│   ├── perfil/layout.tsx           → layout standalone (force light theme)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── google/{callback,connect,disconnect,event,status,sync/bootstrap,webhook}/route.ts
│   │   ├── mercadopago/webhook/route.ts
│   │   └── notifications/route.ts
│   └── admin/
│       ├── seed/page.tsx           → utilidad dev (→ notFound() en prod)
│       └── migrate/page.tsx        → utilidad dev (→ notFound() en prod)
├── components/
│   ├── ui/               → 44 componentes shadcn/Radix
│   ├── landing/          → 14 componentes de landing global
│   ├── salon/            → 5 componentes de página de salón
│   ├── marketplace/      → BookingFlow, SalonMap, ExploreSidebar, etc.
│   ├── business/         → 11 componentes B2B (ScrollVideoHero, etc.)
│   ├── charts/           → MonthlyVolumeChart, PopularServicesChart, WeeklyTurnosChart
│   └── admin/            → CheckoutDrawer, CierreCajaDiario
├── lib/
│   ├── auth.ts           → NextAuth config (Credentials + Google OAuth)
│   ├── firebase.ts       → Firebase init (SDK — también usado en cliente para listeners)
│   ├── schema.ts         → tipos Firestore canónicos (source of truth)
│   ├── types.ts          → schema legacy (78 líneas — pendiente de archivar)
│   ├── mercadopago.ts    → helper REST Checkout Pro
│   ├── whatsapp.ts       → WhatsApp Business API helper
│   ├── whatsapp-templates.ts
│   ├── google-calendar.server.ts → helper GCal con token refresh
│   ├── shim-storage.ts   → workaround SSR (pendiente de evaluar si sigue siendo necesario)
│   └── services/         → marketplace, auth, user, catalog, customer, notification
├── contexts/             → TenantContext, UserContext
├── hooks/                → useBranches, useCatalog, useMetrics, useOcupacionEnVivo, useRole, useStaff, use-toast
├── actions/              → 15 Server Actions (booking, checkout, calendar, staff, services, etc.)
└── [src/ai/ ELIMINADO]   → Genkit removido del código y de package.json ✅
```

**Patrón arquitectónico**: El admin es una **Single-Page App** en `[tenantSlug]/dashboard/page.tsx` con navegación por tabs (no rutas separadas). Los tabs son Client Components con llamadas a Server Actions. El marketplace usa Server Components para fetching + Client Components para interacción. Multi-tenancy via `tenants/{tenantId}/*` en Firestore con RBAC en reglas.

---

### 1.2 Tabla de Módulos — Estado y Complejidad

| Módulo | Estado | Complejidad | Notas |
|--------|--------|-------------|-------|
| **NextAuth** | 🟡 Funcional con deuda | Alta | Google OAuth + Credentials. Token refresh OK. Memberships no reactivas. |
| **Firestore SDK (cliente)** | ✅ Funcional | Baja | Firebase SDK usado en AgendaTabView para listeners real-time. REST en Server Components. |
| **Middleware** | ✅ Actualizado | Baja | Cubre `/:slug/dashboard/:path*`, `/admin/:path*`, `/perfil/:path*`. |
| **UI / shadcn** | ✅ Completo | Baja | 44 componentes, Tailwind dark/light con tokens `brand-*` |
| **Framer Motion** | ✅ Activo | Baja | Landing y /business con animaciones premium |
| **next-themes** | ✅ Funcional | Baja | defaultTheme="dark", toggle funcional |
| **Landing Global** | ✅ ~95% | Baja | 14 componentes. 0 imágenes externas no controladas. |
| **Landing /business** | ✅ 100% | Baja | 7 secciones, `ScrollVideoHero` (96 frames), tema violeta premium. |
| **Dashboard Admin (SPA)** | ✅ ~95% | Alta | Single-page en `[tenantSlug]/dashboard`. 7 tabs. Server actions con try/catch graceful — dashboard no devuelve 500 si Firestore deniega (retorna datos vacíos). |
| **Agenda / Turnos** | ✅ ~80% | Alta | `AgendaTabView`: agenda visual por slots de 30min, checkout inline, búsqueda de clientes, crear turno. |
| **Clientes** | 🟡 ~65% | Media | `ClientesTabView`: lista y búsqueda. Falta detalle completo de cliente / ficha técnica. |
| **Servicios** | ✅ ~90% | Media | `ServiciosTabView`: CRUD completo inline. |
| **Staff** | ✅ ~75% | Media | Gestión de equipo en `ConfigTabView`: edición de comisiones inline. Falta CRUD completo (agregar/eliminar staff). |
| **Caja** | ✅ ~85% | Media | `CajaTabView`: cierre de caja diario, revenue semanal por método de pago. |
| **Rendimiento / Analytics** | ✅ ~70% | Media | `PerformanceTabView`: métricas de rendimiento. |
| **Configuración salón** | ✅ ~85% | Media | `ConfigTabView`: horarios semanales, comisiones del equipo, ajustes del local. |
| **Onboarding wizard** | ✅ ~95% | Alta | 5 pasos en `/business/register`, localStorage, batch atómico. |
| **Booking Flow** | ✅ ~85% | Alta | Multi-step + captura teléfono + Guest Booking. Falta disponibilidad real de staff. |
| **Google Calendar** | ✅ ~80% | Alta | Bidireccional: App→GCal + GCal→App webhook. Token refresh. |
| ~~**Email (Resend)**~~ | ⚠️ **Paquete activo, flujo eliminado** | — | `resend` sigue en package.json pero sin uso. Pendiente `npm uninstall resend`. |
| **Portal Cliente** | ✅ ~75% | Media | Dashboard real (citas, historial), cancelación, vista guest por teléfono. `/perfil/historial` aún con mock data. |
| **Checkout / Caja** | ✅ ~85% | Media | `CheckoutDrawer` + `closeAppointment()` + `CajaTabView` con real-time. |
| **Auth B2C** | ✅ ~85% | Media | `UserRole` = `'customer'`, JWT con `role`, `registerCustomer()`, `/perfil/cuenta` wired a Firestore. |
| **Guest Booking** | ✅ ~90% | Media | Reservas sin auth wall, `/book/confirmation/[appointmentId]`. Necesita `WHATSAPP_TOKEN` en prod. |
| **MercadoPago** | ✅ ~90% | Alta | Checkout Pro + webhook IPN. Pendiente activar token de producción. |
| ~~**AI (Genkit)**~~ | ✅ **Eliminado** | — | `src/ai/` borrado. No figura en package.json. |
| **Tests** | 🟡 ~40% | Media | 3 specs e2e en `e2e/`. `npx playwright install` NO está en CI. |
| **CI/CD** | ✅ Configurado | Media | GitHub Actions: typecheck + lint + build. Sin e2e aún. |

---

### 1.3 Deuda Técnica Identificada

#### Crítica (bloquea producción)

1. ~~`ignoreBuildErrors: true` y `ignoreDuringBuilds: true` en `next.config.ts`~~ ✅ Resuelto.
2. ~~Credenciales de test hardcodeadas en login.~~ ✅ Resuelto.
3. ~~`branchId: 'sucursal_centro'` hardcodeado~~ ✅ Resuelto — propaga desde TenantContext.
4. ~~`const userRole = 'admin'` hardcodeado~~ ✅ Resuelto — rol real leído de sesión.
5. ~~Rutas `/admin/seed` y `/admin/migrate` sin protección~~ ✅ Resuelto — `notFound()` en producción.
6. **`MERCADOPAGO_ACCESS_TOKEN` de sandbox en producción** — activar clave real antes del launch.
7. **`WHATSAPP_TOKEN` no configurado en prod** — WhatsApp en modo dry-run.

#### Alta

8. ~~Imágenes de landing con dominios externos~~ ✅ Resuelto — gradientes locales, 0 dominios externos.
9. ~~`tenantIds` en JWT no reactivos~~ ✅ JWT callback maneja `trigger === 'update'`. `session.update()` re-fetches memberships de Firestore sin re-login.
10. **`resend` en package.json sin uso** — `npm uninstall resend`. El paquete ocupa espacio y confunde sobre la intención (WhatsApp es el canal, no email).
11. ~~Mezcla de schema legacy (`src/lib/types.ts`)~~ ✅ Renombrado a `_types_archive.ts`, 9 referencias actualizadas, `types.ts` eliminado.

#### Media

12. 4 TODOs de imágenes pendientes (`ColeccionCurada.tsx` ×3, `ElevaTuVision.tsx` ×1).
13. ~~Genkit configurado sin uso — dependencia activa muerta.~~ ✅ Resuelto — `src/ai/` eliminado, genkit no en package.json.
14. ~~`patch-package` en devDependencies~~ ✅ Eliminado — no había directorio `patches/` ni hook `postinstall`. Dead weight.
15. ~~`shim-storage.ts` importado en `firebase.ts` — workaround SSR pendiente de evaluar~~ ✅ Evaluado y saneado: shim necesario (Firebase SDK lo requiere en SSR), pero `protect()` reescrita para no leer `global.localStorage` antes de definirlo — elimina `ExperimentalWarning: localStorage is not available` en Node.js 22+ por worker.
16. ~~**Staff CRUD incompleto en admin**~~ ✅ `ConfigTabView`: crear profesional (formulario inline) + archivar/reactivar por card.

---

### 1.4 Dependencias Críticas

| Paquete | Versión | Riesgo |
|---------|---------|--------|
| Next.js | 15.3.3 | Bajo — última stable |
| React | 18.3.1 | Bajo |
| TypeScript | 5.x | Bajo |
| **next-auth** | **4.24.7** | **Medio** — v4 en mantenimiento, Auth.js v5 es el futuro |
| Firebase SDK | 11.9.1 | Bajo |
| Framer Motion | 12.34.0 | Bajo |
| **Tailwind CSS** | **3.4.1** | **Bajo-Medio** — v4 disponible, migración no trivial |
| googleapis | 140.0.1 | Bajo |
| ~~Genkit~~ | ~~1.13.0~~ | ~~Eliminado de package.json~~ ✅ |
| **patch-package** | **8.0.0** | **Medio** — ¿qué se está parchando? |

---

## FASE 2 — ALCANCE Y FUNCIONALIDADES

### 2.1 MVP Actual (funciona end-to-end hoy)

| Flujo | Estado |
|-------|--------|
| Login admin (email/password + Google OAuth) | ✅ |
| Landing B2C — visual y navegación | ✅ |
| Landing B2B `/business` — visual | ✅ (bug Safari resuelto, rediseño completo) |
| Página de salón público `/salones/[slug]` | ✅ |
| Dashboard básico con métricas parciales | 🟡 |
| Agenda diaria/semanal (datos reales parciales) | 🟡 |
| Listado de clientes y ficha técnica | 🟡 |
| Booking flow multi-step (servicio → staff → fecha) | 🟡 |
| Email de confirmación de reserva | 🟡 |
| Google Calendar webhook → Firestore | 🟡 |

### 2.2 Funcionalidades Pendientes por Capa

**Frontend**
- [x] ~~Fix bug Safari en `/business`~~ → resuelto con rediseño completo
- [x] ~~Reemplazar imágenes placeholder con assets reales~~ → gradientes locales, 0 dominios externos no controlados
- [x] ~~Multi-branch: selector de sucursal en admin y booking~~ → `BranchSelector.tsx` con localStorage
- [x] ~~Portal cliente completo (`/salones/[slug]/dashboard`)~~ → datos reales, vista guest por teléfono
- [x] ~~CRUD completo de servicios y staff en admin~~ → create, edit, toggle active
- [x] ~~Onboarding wizard para nuevos salones~~ → 5 pasos con localStorage, batch atómico
- [x] ~~`/explore` con filtros y búsqueda~~ → `getPublicSalons()` real, filtros básicos
- [x] ~~Perfil editable de usuario/cliente~~ → `/perfil/cuenta` wired a Firestore con `profile.actions.ts`
- [x] ~~Error boundaries + loading states consistentes~~ → 8 skeletons + error boundary global
- [ ] Guest booking: disponibilidad real de staff (cálculo por duración + agenda del día)
- [ ] `/perfil/historial` y `/perfil` principal con datos reales (aún con mock data parcial)
- [ ] Planes SaaS: UI de selección de plan + billing

**Backend / API**
- [x] ~~Eliminar hardcoding de `branchId` y `userRole`~~ → propagan desde contexto/sesión
- [x] ~~Proteger `/admin/seed` y `/admin/migrate`~~ → `notFound()` en producción
- [x] ~~Sync bidireccional completo con Google Calendar~~ → App→GCal + GCal→App webhook
- [x] ~~CRUD de staff con disponibilidad y horarios~~ → multi-step wizard, schedules
- [x] ~~Integración de pagos (MercadoPago)~~ → Checkout Pro + webhook IPN
- [x] ~~Webhooks de pagos~~ → `/api/mercadopago/webhook` handler completo
- [x] ~~Cancellation flow con reglas de negocio~~ → `cancelAppointment()` + WhatsApp
- [ ] Cálculo real de disponibilidad (staff + duración + branch) — pendiente
- [ ] Rate limiting en API routes
- [ ] Planes SaaS en schema (Fase 3.5)
- [ ] Feature flags por plan (Fase 3.6)

**Infra / DevOps**
- [x] ~~Eliminar `ignoreBuildErrors: true`~~ → ambas flags en `false`, CI limpio
- [x] ~~Pipeline CI/CD~~ → GitHub Actions: lint + typecheck + build en verde
- [x] ~~`.env.example` documentado~~ → todas las variables con comentarios
- [ ] `npx playwright install` en CI/CD (e2e tests no corren en CI aún)
- [ ] Monitoreo de errores (Sentry)
- [ ] Analytics de producto (PostHog o Mixpanel)
- [ ] Staging environment separado

### 2.3 Integraciones Faltantes Críticas

| Integración | Prioridad | Complejidad | Impacto |
|-------------|-----------|-------------|---------|
| **Módulo Financiero Local** (efectivo / transferencia / MercadoPago nativo) | **🔴 P0 URGENTE** | Alta | Core diferencial vs Fresha/Wonoma en LATAM. Sin pasarelas internacionales forzadas. |
| **WhatsApp Business API** (Twilio WABA o Meta Cloud API) | **🔴 P0 URGENTE** | Media | Mata el No-Show. Reemplaza 100% el flujo de email (Resend eliminado). |
| **Google Calendar** (completar bidireccional) | P0 | Alta | Core feature para B2B |
| **Error Tracking** (Sentry) | P1 | Baja | Sin alertas en producción = ciego |
| **Analytics** (PostHog / Mixpanel) | P1 | Baja | Sin datos → no hay iteración informada |
| **CDN / Media** (Firebase Storage) | P1 | Baja | Performance e imágenes de salones |
| **Mapas** (Google Maps API) | P2 | Media | UX de exploración de salones |
| **Stripe** (para salones con terminal internacional) | P2 | Alta | Solo para el segmento premium/internacional. No es el core de LATAM. |
| ~~**AI features** (Genkit)~~ | ✅ **Eliminado** | — | `src/ai/` borrado. Genkit removido de package.json. |

### 2.4 Riesgos Técnicos Priorizados

| ID | Riesgo | Prioridad | Mitigación |
|----|--------|-----------|------------|
| ~~R1~~ | ~~Credenciales de test hardcodeadas~~ | ~~P0~~ | ✅ Eliminadas del código fuente |
| ~~R2~~ | ~~Build errors silenciados~~ | ~~P0~~ | ✅ `ignoreBuildErrors: false`, TypeScript strict activo |
| ~~R3~~ | ~~`/admin/seed` y `/admin/migrate` sin protección~~ | ~~P0~~ | ✅ `notFound()` en producción — devuelven 404 |
| ~~R4~~ | ~~`branchId` hardcodeado~~ | ~~P0~~ | ✅ Propaga desde TenantContext |
| ~~R5~~ | ~~Sin integración de pagos~~ | ~~P0~~ | ✅ MercadoPago Checkout Pro + webhook IPN |
| R6 | NextAuth v4 en mantenimiento | **P1** | Planear migración a Auth.js v5 post-MVP |
| R7 | Tokens Google Calendar en Firestore — verificar rules | **P1** | Auditar reglas para `integrations/*` |
| R8 | JWT no reactivo para roles | **P1** | Implementar `session.update()` en cambios de rol |
| R9 | Tests no corren en CI — regressions invisibles | **P1** | `npx playwright install` en `.github/workflows/ci.yml`. Estructura e2e lista. |
| R10 | Schema legacy `types.ts` (78 líneas) sin deprecation plan | **P2** | Marcar como `_archive`, migrar referencias a `schema.ts` |
| ~~R11~~ | ~~Genkit muerto en `package.json` + `src/ai/`~~ | ~~P2~~ | ✅ `src/ai/` borrado. Genkit removido de package.json. |
| R12 | `MERCADOPAGO_ACCESS_TOKEN` de sandbox en producción | **P1** | Activar clave real de producción antes del launch |

---

## FASE 3 — PLAN DE IMPLEMENTACIÓN

### Roadmap Visual

```
SEMANA   1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
         ├─────────┤
FASE 0   │Cimientos│
         │ (2 sem) │
                   ├───────────────────┤
FASE 1             │  Core Admin       │
                   │  Funcional        │
                   │  (4 sem)          │
                                       ├─────────────┤
FASE 2                                 │  Marketplace│
                                       │  MVP        │
                                       │  (3 sem)    │
                                                     ├─────────────┤
FASE 3                                               │Monetización │
                                                     │  (3 sem)    │
                                                                   ├─────────────────┤
FASE 4                                                             │ Growth & Scale  │
                                                                   │   (4 sem)       │

                   ←─── MVP Launchable ───────────────────────────→
                   (Fase 0+1+2 = ~9 semanas con 2 devs)

                   ←──────────── v1.0 con Revenue ────────────────────────────────→
                   (Fases 0–3 = ~12 semanas con 3 devs)
```

---

### ✅ FASE 0 — Cimientos Estables (Semanas 1–2) — COMPLETADA

> **Estado**: ✅ COMPLETADA — 2026-04-04
> CI configurado y en verde (exit code 0). Código limpio de credenciales hardcodeadas y errores TypeScript silenciados. Base production-ready lista para Fase 1.

**Objetivo**: Código production-ready. Cero errores silenciados, cero credenciales hardcodeadas, CI funcionando.

| # | Tarea | Días | Done cuando... | Estado |
|---|-------|------|----------------|--------|
| ~~0.1~~ | ~~Eliminar `ignoreBuildErrors` + corregir todos los errores TS~~ | ~~3~~ | ~~`tsc --noEmit` pasa limpio~~ | ✅ |
| ~~0.2~~ | ~~Eliminar credenciales de test del código fuente~~ | ~~0.5~~ | ~~No hay emails/passwords hardcodeados~~ | ✅ |
| ~~0.3~~ | ~~Crear `.env.example` documentado~~ | ~~0.5~~ | ~~Archivo existe con todas las variables~~ | ✅ |
| ~~0.4~~ | ~~Corregir `userRole = 'admin'` → leer de sesión~~ | ~~1~~ | ~~Clientes/turnos usan rol real del usuario~~ | ✅ |
| ~~0.5~~ | ~~Desacoplar `branchId` hardcodeado → leer de TenantContext~~ | ~~2~~ | ~~0 ocurrencias de `'sucursal_centro'` literal~~ | ✅ |
| ~~0.6~~ | ~~Proteger `/admin/seed` y `/admin/migrate` en middleware~~ | ~~0.5~~ | ~~Rutas devuelven 401 sin sesión admin~~ | ✅ |
| ~~0.7~~ | ~~Cubrir rutas marketplace autenticadas en middleware~~ | ~~0.5~~ | ~~`/salones/*/dashboard` protegido~~ | ✅ |
| ~~0.8~~ | ~~Setup CI/CD (GitHub Actions: lint + typecheck + build)~~ | ~~1~~ | ~~PR no mergeable si CI falla~~ | ✅ |
| 0.9 | Configurar Sentry para error tracking | 0.5 | Errores llegan al dashboard de Sentry | ⏳ Fase 1 |
| 0.10 | Configurar staging environment | 1 | URL staging funcional con datos de prueba | ⏳ Fase 1 |

**Total**: ~10 días → **2 semanas**

**Criterios de done**: ✅ CI verde en cada PR, ✅ cero credenciales hardcodeadas, ✅ branchId dinámico, ✅ roles reales leídos de sesión.

---

### ✅ FASE 1 — Core Admin Funcional (Semanas 3–6) — COMPLETADA

> **Estado**: ✅ COMPLETADA — 2026-04-08
> Todas las tareas del core admin implementadas. CRUD de servicios, staff, sucursales, configuración del salón, onboarding wizard, Google Calendar sync bidireccional, dashboard con métricas reales y loading states en todas las rutas. `npm run build` y `npx tsc --noEmit` limpios.

**Objetivo**: Un salón puede gestionar 100% su operación diaria desde el dashboard.

| # | Tarea | Días | Depende de | Done cuando... | Estado |
|---|-------|------|-----------|----------------|--------|
| ~~1.1~~ | ~~CRUD completo de Servicios (crear, editar, archivar)~~ | ~~3~~ | ~~Fase 0~~ | ~~Admin gestiona catálogo sin tocar Firestore~~ | ✅ |
| ~~1.2~~ | ~~CRUD completo de Staff (crear, editar, disponibilidad)~~ | ~~4~~ | ~~Fase 0~~ | ~~Admin gestiona equipo~~ | ✅ |
| ~~1.3~~ | ~~Gestión de Sucursales (crear, editar horarios)~~ | ~~3~~ | ~~0.5~~ | ~~Multi-branch funcional end-to-end~~ | ✅ |
| ~~1.4~~ | ~~Selector de sucursal activa en dashboard~~ | ~~1~~ | ~~1.3~~ | ~~Admin ve datos de su sucursal activa~~ | ✅ |
| ~~1.5~~ | ~~Configuración del salón (nombre, logo, horarios, slug)~~ | ~~3~~ | ~~Fase 0~~ | ~~Salón puede personalizarse desde UI~~ | ✅ |
| ~~1.6~~ | ~~Onboarding wizard post-registro (nombre → servicios → horarios)~~ | ~~3~~ | ~~1.1, 1.3~~ | ~~Nuevo salón se autoregistra en <10 min~~ | ✅ |
| ~~1.7~~ | ~~Google Calendar sync bidireccional completo~~ | ~~5~~ | ~~Fase 0~~ | ~~Cambio en app → GCal y GCal → app~~ | ✅ |
| ~~1.8~~ | ~~Dashboard con métricas reales (ingresos, ocupación, top servicios)~~ | ~~3~~ | ~~Firestore real~~ | ~~KPIs muestran datos reales, no mocks~~ | ✅ |
| ~~1.9~~ | ~~Loading skeletons + error boundaries en todas las rutas~~ | ~~2~~ | ~~Fase 0~~ | ~~Ninguna ruta carga en blanco con error~~ | ✅ |

**Total**: ~27 días → ejecutado en ~4 sesiones paralelas

**Criterios de done**: ✅ Un salón nuevo puede registrarse y gestionar su operación diaria sin asistencia técnica.

**Archivos clave entregados**:
- `src/actions/services.actions.ts` — createService, updateService, toggleServiceActive
- `src/actions/staff.actions.ts` — createStaffMember, updateStaffMember, toggleStaffActive
- `src/actions/branches.actions.ts` — createBranch, updateBranch, toggleBranchActive
- `src/actions/tenant.actions.ts` — updateTenantSettings, checkSlugAvailability
- `src/actions/calendar.actions.ts` — syncAppointmentToCalendar, cancelCalendarEvent
- `src/actions/onboarding.actions.ts` — createTenantWithAdmin (batch atómico)
- `src/lib/google-calendar.server.ts` — helper con token refresh automático
- `src/app/(admin)/servicios/page.tsx` — CRUD admin con Sheet + toggle activo
- `src/app/(admin)/staff/page.tsx` — CRUD con formulario multi-step 3 pasos
- `src/app/(admin)/configuracion/page.tsx` — 4 tabs + slug validation en tiempo real
- `src/app/(admin)/configuracion/sucursales/page.tsx` — CRUD con horarios
- `src/app/business/register/page.tsx` — Wizard 5 pasos con localStorage
- `src/components/BranchSelector.tsx` — Selector en header con localStorage
- `src/hooks/useStaff.ts`, `src/hooks/useBranches.ts` — hooks de datos
- `src/app/(admin)/**/loading.tsx` — 8 skeletons contextuales
- `src/lib/schema.ts` — Staff, Branch, Tenant extendidos

---

### ✅ FASE 2 — Marketplace MVP + WhatsApp First (Semanas 7–9) — COMPLETADA

> **Estado**: ✅ COMPLETADA — 2026-04-09
> Portal B2C operativo con datos reales. Google Maps integrado con fallback elegante. Todas las imágenes externas eliminadas. Booking flow captura teléfono. WhatsApp estructural activo (necesita API key para producción).

> **🔴 Pivot LATAM (2026-04-08):** El email queda eliminado del flujo de notificaciones. El diferencial es WhatsApp nativo: cero No-Shows, cero fricción. La tarea 2.7 original (Resend) se reemplaza íntegramente por WhatsApp Business API.

**Objetivo**: Una clienta puede descubrir salones, reservar y recibir confirmación por WhatsApp. Cero emails.

| # | Tarea | Días | Depende de | Done cuando... | Estado |
|---|-------|------|-----------|----------------|--------|
| ~~2.1~~ | ~~Página `/explore` con filtros (categoría, zona, precio)~~ | ~~4~~ | ~~Datos reales~~ | ~~Clientas pueden buscar salones~~ | ✅ (`getPublicSalons()` real, filtros básicos) |
| ~~2.2~~ | ~~Integrar Google Maps en `/explore` y página de salón~~ | ~~2~~ | ~~API key Maps~~ | ~~Mapa funcional~~ | ✅ (`SalonMap.tsx` con dark theme, fallback sin API key) |
| ~~2.3~~ | ~~Reemplazar todas las imágenes placeholder con assets reales~~ | ~~2~~ | ~~Assets de diseño~~ | ~~0 requests a dominios externos no controlados~~ | ✅ (gradientes locales, `remotePatterns` → 2 dominios) |
| ~~2.4~~ | ~~Portal cliente completo (`/salones/[slug]/dashboard`)~~ | ~~3~~ | ~~Auth marketplace~~ | ~~Clienta ve sus citas activas~~ | ✅ (datos reales, vista guest por teléfono) |
| ~~2.5~~ | ~~Historial de citas del cliente~~ | ~~2~~ | ~~2.4~~ | ~~Clienta ve historial completo~~ | ✅ (filtros semana/mes/3 meses/todo) |
| ~~2.6~~ | ~~Cancellation flow (clienta cancela cita)~~ | ~~2~~ | ~~Reglas definidas~~ | ~~Clienta puede cancelar con confirmación~~ | ✅ (`cancelAppointment` + WhatsApp notification) |
| **2.7** | **🔴 Notificaciones nativas por WhatsApp** (confirmación + recordatorio 24h) | **4** | **WhatsApp Business API key** | **Clienta recibe WhatsApp al reservar y 24h antes** | ⚠️ Estructural listo (`whatsapp.ts` + templates). Necesita `WHATSAPP_TOKEN` en prod. |
| 2.8 | Analytics de producto (PostHog) | 1 | — | Funnel de booking trackeado | ⏳ Pendiente |

**Total**: ~20 días → ejecutado en ~4 sesiones paralelas

**Criterios de done**: ✅ Clienta puede descubrir, reservar y recibir confirmación. ⚠️ WhatsApp real pendiente de API key.

**Archivos clave entregados**:
- `src/lib/services/customer.service.ts` — `getAppointmentsByClientId`, `getCustomerByPhone`, `getAppointmentsByPhone`
- `src/actions/customer.actions.ts` — `getMyAppointments`, `searchAppointmentsByPhone`, `cancelAppointment`
- `src/app/(marketplace)/salones/[tenantSlug]/dashboard/CustomerDashboardView.tsx` — historia + cancelación
- `src/app/(marketplace)/salones/[tenantSlug]/dashboard/PhoneSearchView.tsx` — vista guest
- `src/components/marketplace/SalonMap.tsx` — Google Maps con dark zinc + fallback
- `src/lib/whatsapp.ts` + `src/lib/whatsapp-templates.ts` — estructura WhatsApp Business API

---

### 🟡 FASE 3 — Monetización Local + CRM (Semanas 10–12) — EN CURSO

> **Estado**: 🟡 EN CURSO — 3.0–3.4 completados (2026-04-29). Pendiente: Planes SaaS (3.5–3.6).

> **🔴 Pivot LATAM (2026-04-08):** El Módulo Financiero Local es P0 urgente. Los salones en LATAM cobran en efectivo, con transferencias bancarias y QR de MercadoPago — no con Stripe. Soportar esto de forma nativa es el diferencial de "Cierre de Caja" vs Fresha/Wonoma.

**Objetivo**: Modelo de ingresos funcional con la realidad del mercado local. Salones cierran caja en efectivo/transferencia. Planes SaaS.

| # | Tarea | Días | Depende de | Done cuando... | Estado |
|---|-------|------|-----------|----------------|--------|
| ~~**3.0**~~ | ~~Módulo Financiero Local: schema + cierre de caja~~ (`amountPaid`, `paymentMethod`, status `cobrado`) | ~~3~~ | ~~schema.ts~~ | ~~Admin puede cerrar un turno como "cobrado"~~ | ✅ |
| ~~**3.1**~~ | ~~UI de Checkout en pantalla de turno~~ | ~~3~~ | ~~3.0~~ | ~~Admin cobra → status `cobrado`~~ | ✅ (`CheckoutDrawer` + `closeAppointment()` + CRM metrics) |
| ~~**3.2**~~ | ~~MercadoPago Checkout Pro (seña online al reservar)~~ | ~~4~~ | ~~Cuenta MP activada~~ | ~~Clienta paga seña al reservar — pago redirige a MP~~ | ✅ (`src/lib/mercadopago.ts` REST helper + `createDepositPreference()` + páginas success/failure/pending) |
| ~~**3.3**~~ | ~~Webhook MercadoPago → Firestore (status de cita automático)~~ | ~~2~~ | ~~3.2~~ | ~~Pago aprobado actualiza turno a `confirmed + paid_partially`~~ | ✅ (`src/app/api/mercadopago/webhook/route.ts` — IPN handler completo) |
| ~~**3.4**~~ | ~~Dashboard de cierre de caja diario (efectivo + transferencias + MP)~~ | ~~3~~ | ~~3.0~~ | ~~Admin ve resumen de caja del día desglosado por método~~ | ✅ (`CierreCajaDiario` real-time con Firestore listener, integrado en dashboard) |
| 3.5 | Planes SaaS para salones (Free / Pro / Enterprise) | 3 | — | Salones tienen plan asignado en schema + Firestore | ⏳ |
| 3.6 | Feature flags por plan de suscripción | 2 | 3.5 | Features desbloqueadas según plan | ⏳ |

**Total**: ~20 días → **~3–4 semanas**

**Criterios de done**: Salón cierra caja diaria en efectivo, transferencia y MercadoPago sin depender de pasarelas internacionales. MujerApp cobra suscripción a salones.

**Archivos clave entregados (3.0–3.4)**:
- `src/components/admin/CheckoutDrawer.tsx` — Sheet de cobro (efectivo/MP/tarjeta/transferencia)
- `src/actions/checkout.actions.ts` — `closeAppointment()` con incremento de CRM metrics
- `src/lib/schema.ts` — `PaymentMethod`, status `cobrado`, `Customer.metrics` con `firstVisit`
- `src/lib/mercadopago.ts` — Helper REST Checkout Pro sin SDK (createCheckoutPreference, getPaymentStatus)
- `src/actions/mercadopago.actions.ts` — `createDepositPreference()` server action
- `src/app/api/mercadopago/webhook/route.ts` — IPN handler: approved → `confirmed + paid_partially`, rejected → reset
- `src/app/(marketplace)/(public)/salones/[slug]/book/payment/{success,failure,pending}/page.tsx` — 3 páginas de retorno de pago
- `src/components/admin/CierreCajaDiario.tsx` — Resumen de caja real-time por método de pago

---

### ✅ FASE 3.5 — Consolidación y Auth B2C (2026-04-09) — COMPLETADA

> Fase intercalada para cerrar deuda crítica antes de continuar con 3.2+. No estaba en el roadmap original.

| # | Tarea | Done cuando... | Estado |
|---|-------|----------------|--------|
| ~~3.5-A~~ | ~~Proteger `/admin/seed` + `/admin/migrate` en producción~~ | ~~Rutas devuelven 404 en prod~~ | ✅ (`notFound()` guard, build limpio) |
| ~~3.5-B~~ | ~~CRM metrics: `firstVisit`, `totalVisits`, `totalSpent`~~ | ~~Métricas escritas en booking + checkout~~ | ✅ (booking: init metrics; checkout: `increment()`) |
| ~~3.5-C~~ | ~~Auth B2C: `UserRole` + JWT `role` + `registerCustomer()`~~ | ~~Clientas B2C tienen rol `customer` en JWT~~ | ✅ (`/registro` + `/perfil` + `auth.actions.ts`) |
| ~~3.5-D~~ | ~~Eliminar `ExploreClient.tsx` (dead code)~~ | ~~0 referencias en codebase~~ | ✅ (92 líneas eliminadas) |

**Branches**: `feat/fase3.5-security-fix`, `feat/fase3.5-crm-metrics`, `feat/fase3.5-b2c-auth`, `feat/fase3.5-cleanup`

---

### ✅ SPRINT POST-PLAN (2026-04-29 → 2026-05-07) — COMPLETADO

> Features entregadas fuera del roadmap original, detectadas en análisis del 2026-05-07.

| # | Feature | Archivos clave | Estado |
|---|---------|----------------|--------|
| S1 | **Guest Booking** — reservas sin auth wall | `src/actions/guest-booking.actions.ts`, `/book/confirmation/[appointmentId]/page.tsx` | ✅ |
| S2 | **Confirmación de reserva** — página post-booking | `src/app/(marketplace)/(public)/salones/[tenantSlug]/book/confirmation/[appointmentId]/page.tsx` | ✅ |
| S3 | **`/business` redesign** — 7 secciones, ScrollVideoHero (96 frames), tema violeta premium | `src/components/business/ScrollVideoHero.tsx`, `BusinessHero.tsx`, `DolorSection.tsx`, `FeaturesSection.tsx`, `CTAFinalSection.tsx`, etc. | ✅ |
| S4 | **Bug Chrome `backdrop-filter`** — animación header corregida (transform → top) | `src/components/landing/LandingHeader.tsx` | ✅ |
| S5 | **`profile.actions.ts`** — `getMyProfile()` / `updateMyProfile()` server actions | `src/actions/profile.actions.ts` | ✅ |
| S6 | **Login con tab B2C/B2B** — copy contextual por rol | `src/app/login/page.tsx` | ✅ |
| S7 | **`Appointment` schema ampliado** — campos `isGuestBooking`, `guestEmail`, `guestPhone` | `src/lib/schema.ts` | ✅ |
| S8 | **44 componentes shadcn/ui** — 9 nuevos vs. 35 del plan original | `src/components/ui/` | ✅ |

**Deuda generada**:
- ~~`src/ai/` + dependencias Genkit siguen vivos~~ ✅ Eliminados.
- `src/lib/types.ts` (legacy schema, 78 líneas) — pendiente de archivar como `_types_archive.ts`.
- `resend` sigue en package.json sin uso — `npm uninstall resend`.

---

### 🟡 FASE 4 — Growth & Scale (Semanas 13–16) — EN CURSO

> **🔴 Pivot LATAM (2026-04-08):** IA (Genkit) eliminada del roadmap activo. El foco es SEO, performance móvil, reviews y test suite para escalar con confianza.

> **Estado**: 🟡 EN CURSO — 4.2 (SEO) completada. 4.5 (Playwright) estructura lista (3 specs + fixtures), falta integración CI. Resto pendiente.

**Objetivo**: Plataforma lista para adquirir usuarios masivamente y escalar.

| # | Tarea | Días | Done cuando... | Estado |
|---|-------|------|----------------|--------|
| ~~4.1~~ | ~~Sistema de reviews y valoraciones~~ | ~~3~~ | ~~Clienta valora turno completado~~ | ✅ `Review` en schema.ts + `reviews.actions.ts` (submit + fetch + stats) + `SalonReviews` component con carrusel horizontal, form inline, rating stars. Wired en `/salones/[slug]`. Regla Firestore añadida (read público, write autenticado). |
| ~~4.2~~ | ~~SEO: sitemap dinámico, robots.txt~~ | ~~2~~ | ~~Google indexa páginas de salón~~ | ✅ (`src/app/sitemap.ts` + `src/app/robots.ts` — rutas estáticas + páginas de salón dinámicas) |
| 4.3 | Performance: imágenes, code splitting, ISR | 3 | Lighthouse > 80 en móvil | 🟡 ISR: landing (`revalidate=3600`) + salon page (`revalidate=1800`). Dynamic import: `BookingFlow` con `ssr:false` + skeleton. next/image: 3 hero images en `SalonHero.tsx`. Pendiente: Lighthouse audit real. |
| 4.4 | Accesibilidad (a11y) audit y correcciones | 3 | 0 errores críticos en axe-core | ⏳ |
| 4.5 | Test suite Playwright e2e (flujos críticos en CI) | 5 | Flujos críticos cubiertos + `playwright install` en CI | ✅ 6 specs: `booking-flow.spec.ts` (7 tests), `checkout.spec.ts`, `registro.spec.ts`, `guest-booking.spec.ts` (6 tests), `onboarding.spec.ts` (8 tests), `cancellation-flow.spec.ts` (5 tests). `playwright install` en CI ✅. |
| 4.6 | Documentación técnica (ADRs, README actualizado) | 2 | Nuevo dev onboardea en < 1 día | ⏳ |
| ~~4.x~~ | ~~AI: recomendaciones personalizadas (Genkit)~~ | ~~5~~ | ~~**Eliminado del roadmap.** Genkit queda como dependencia muerta a remover (`npm uninstall @genkit-ai/googleai genkit` + borrar `src/ai/`).~~ | ❌ |

**Total**: ~18 días → **~3 semanas** con equipo completo

**Criterios de done**: Plataforma con SEO, performance, tests y documentación lista para escalar con marketing. Sin deuda de IA activa.

---

### Estimación Total

| Fase | Semanas | Equipo | Resultado |
|------|---------|--------|-----------|
| Fase 0 — Cimientos | 2 | 1–2 devs | Repo profesional, CI verde |
| Fase 1 — Core Admin | 4 | 2 devs | Salones operan 100% |
| Fase 2 — Marketplace | 3 | 2–3 devs | **MVP Launchable** |
| Fase 3 — Monetización | 3 | 2 devs | **v1.0 con Revenue** |
| Fase 4 — Growth | 4 | 3–4 devs | Escala y growth |

| Milestone | Semanas totales (2 devs) | Semanas (3 devs) |
|-----------|--------------------------|------------------|
| **MVP Launchable** (Fases 0–2) | ~10–12 sem | ~8–9 sem |
| **v1.0 con Revenue** (Fases 0–3) | ~14–16 sem | ~11–12 sem |
| **Plataforma completa** (Fases 0–4) | ~18–22 sem | ~14–16 sem |

---

## FASE 4 — ESTRATEGIA DE EQUIPO

### Modelo Recomendado: Feature Ownership

Para un equipo de 2–4 personas, Feature Ownership (cada dev dueño de un módulo completo) es superior a separación por capa (Frontend/Backend). Razones:

- El stack es full-stack homogéneo — el mismo dev puede escribir Server Component, Server Action, query Firestore y UI.
- Paralelismo natural por dominio: Booking, Pagos, Dashboard y Portal Cliente son módulos con poca intersección de archivos.
- Menos hand-offs, más velocidad de entrega.

**Excepción**: El Tech Lead mantiene ownership transversal de auth, schema de Firestore, middleware, y decisiones de arquitectura.

### Perfiles Ideales del Equipo

| Rol | Seniority | Especialidad clave |
|-----|-----------|-------------------|
| **Dev 1 — Tech Lead / Full-Stack** | Senior (5+ años) | Next.js 15 App Router, TypeScript strict, Firestore multi-tenant, NextAuth, CI/CD, seguridad |
| **Dev 2 — Frontend / Producto** | Mid-Senior (3+ años) | React, Tailwind, shadcn/ui, Framer Motion, UX-driven, booking flows, customer-facing |
| **Dev 3 — Full-Stack / Integraciones** | Mid-Senior (3+ años) | APIs de terceros (Stripe, Twilio), webhooks, Firestore queries avanzadas, testing |
| **Dev 4 — Frontend Junior / QA** | Mid (2+ años) | React, Playwright/Cypress, accesibilidad, SEO técnico, documentación |

### Áreas Paralelizables sin Conflictos de Merge

| Stream A | Stream B | Stream C |
|----------|----------|----------|
| Auth + Google Calendar | Dashboard Admin + Analytics | Customer Portal + Explore |
| Stripe / Pagos | CRUD Servicios/Staff | Notificaciones + Email |
| AI features (Genkit) | Reviews + SEO | Test suite |

**Archivos de alto riesgo de conflicto** (coordinar siempre vía PR):
- `src/lib/schema.ts`
- `src/lib/auth.ts`
- `src/middleware.ts`
- `src/contexts/TenantContext.tsx`
- `src/app/layout.tsx`

### Estructura de Branches y Convenciones

```
main                     → producción (Firebase App Hosting)
└── staging              → pre-producción (entorno staging separado)
    ├── feat/fase0-typescript-strict
    ├── feat/fase0-branch-context
    ├── fix/safari-business-page
    ├── feat/fase1-crud-servicios
    ├── feat/fase1-google-calendar-sync
    ├── feat/fase2-explore-page
    └── feat/fase3-stripe-payments
```

**Convenciones:**
- Branches desde `staging`, PR hacia `staging`
- CI obligatorio: lint + typecheck + build deben pasar antes de merge
- 1 reviewer obligatorio (no auto-merge)
- PRs de máximo 400 líneas (dividir si se excede)
- Naming: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`)
- Merge a `main` solo desde `staging`, tras QA en staging env

**Ritmo:**
- Standup async diario (Slack/Discord)
- Review de PRs en < 24h
- Sync semanal de 30 min (planning + demos)
- Sprints de 1 semana

### Tabla de Distribución por Desarrollador

*(Para un equipo de 3 devs, semanas 1–12)*

| Semana | Dev 1 (Tech Lead) | Dev 2 (Frontend) | Dev 3 (Full-Stack) |
|--------|------------------|------------------|--------------------|
| 1 | Fix TS errors + CI setup | Fix roles hardcodeados | Sentry + `.env.example` |
| 2 | Branch dinámico + middleware | Loading states / error boundaries | Staging environment |
| 3 | Google Calendar bidireccional | CRUD Servicios UI | CRUD Servicios API |
| 4 | Google Calendar webhooks | CRUD Staff UI | CRUD Staff API |
| 5 | Multi-branch schema + queries | Branches UI + selector | Configuración del salón |
| 6 | Onboarding wizard backend | Onboarding wizard UI | Métricas reales dashboard |
| 7 | Auth marketplace + portal | `/explore` UI + filtros | Google Maps |
| 8 | Portal cliente backend | Portal cliente UI | Cancellation flow |
| 9 | Recordatorios email (cron) | Assets reales + `next/image` | Analytics PostHog |
| 10 | Stripe API + webhooks | Stripe UI (checkout) | Feature flags por plan |
| 11 | Planes SaaS | Dashboard ingresos salón | Facturación / receipts |
| 12 | SEO + sitemap | Reviews UI | Test suite (Playwright) |

---

## TABLA DE ESTIMACIÓN TOTAL

| Fase | Semanas | Horas estimadas (3 devs × 40h) |
|------|---------|-------------------------------|
| Fase 0 — Cimientos | 2 | ~240h |
| Fase 1 — Core Admin | 4 | ~480h |
| Fase 2 — Marketplace | 3 | ~360h |
| Fase 3 — Monetización | 3 | ~360h |
| Fase 4 — Growth | 4 | ~480h |
| **Total v1.0** (Fases 0–3) | **12 semanas** | **~1440h** |
| **Total completo** (Fases 0–4) | **16 semanas** | **~1920h** |

---

## ACCIONES INMEDIATAS (estado 2026-05-15)

### 🔴 P0 — Antes de ir a producción

1. **Activar `MERCADOPAGO_ACCESS_TOKEN` real** — sandbox todavía activo. Sin esto no hay cobros reales.
2. ~~**`npx playwright install` en `.github/workflows/ci.yml`**~~ ✅ Añadido job `e2e` con `playwright install --with-deps chromium`.
3. **Activar `WHATSAPP_TOKEN` en producción** — la estructura WhatsApp está lista. Sin token solo funciona en modo dry-run.
4. ~~**`npm uninstall resend`**~~ ✅ Removido. API route `/api/notifications` eliminada. `notification.service.ts` convertido a stub no-op.

### 🟡 P1 — Próximo sprint (Fase 3.5–3.6)

5. ~~**Staff CRUD completo en SPA admin**~~ ✅ `ConfigTabView` ahora permite crear profesionales (formulario inline) y archivar/reactivar por staff.
6. ~~**Schema Planes SaaS**~~ ✅ `Tenant.plan` alineado a `'free' | 'pro' | 'enterprise'` en `schema.ts`.
7. ~~**Feature flags por plan**~~ ✅ `usePlan()` hook creado en `src/hooks/usePlan.ts` con matriz de features por plan. Beta default = `'pro'`.
8. ~~**UI de selección de plan**~~ ✅ `PricingSection4` (3 planes ARS, copy español) ya integrada en `/business`. Plan display en `ConfigTabView` con `usePlan()` hook.

### 🟢 P2 — Fase 4 (quality & scale)

9. **Performance audit** — Lighthouse mobile en `/`, `/explore`, `/salones/[slug]`. Target > 80.
10. **a11y audit** — `axe-core` scan en rutas críticas (booking flow, dashboard, perfil).
11. ~~**Sistema de reviews**~~ ✅ schema `Review` + `reviews.actions.ts` + `SalonReviews` carrusel + regla Firestore. Wired en `/salones/[slug]`.
12. ~~**Archivar `types.ts`**~~ ✅ Renombrado a `_types_archive.ts`, las 9 referencias actualizadas, `types.ts` eliminado.
13. ~~**`shim-storage.ts`**~~ ✅ Evaluado: shim retenido (necesario para Firebase SDK en SSR), `ExperimentalWarning` eliminado reescribiendo `protect()`.
14. **Documentación** — README actualizado, ADR-003 para guest booking, ADR-004 para ScrollVideoHero, ADR-005 para arquitectura admin SPA-tabs.
