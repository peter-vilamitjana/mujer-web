# MujerApp — Análisis Técnico y Plan de Proyecto

**Rama analizada**: `database-config` | **Fecha**: 2026-04-03 | **Pivot LATAM**: 2026-04-08 | **Última actualización**: 2026-04-28

---

## RESUMEN EJECUTIVO

MujerApp es una plataforma SaaS B2B2C multi-tenant para la gestión de salones de belleza. El stack es sólido y moderno (Next.js 15, TypeScript, Firestore, NextAuth v4), con una arquitectura multi-tenant bien diseñada a nivel de schema y reglas Firestore.

**Estado actual (2026-04-28)**: ✅ Fase 0 + ✅ Fase 1 + ✅ Fase 2 + ✅ Fase 3 + ✅ Fase 3.5 + ✅ Fase 4 (parcial) completadas. `/perfil` wired a Firestore, CierreCajaDiario en dashboard, MercadoPago Checkout Pro integrado en BookingFlow, SEO + sitemap + robots.txt, tests e2e con Playwright. Build y TypeScript limpios. **Próximo hito**: activar credenciales MERCADOPAGO_ACCESS_TOKEN en producción + correr `npx playwright install` para habilitar tests.

La hoja de ruta para un MVP launchable es de **10–14 semanas** para un equipo de 2–3 devs (~6 semanas completadas).

---

## FASE 1 — ANÁLISIS DEL CÓDIGO

### 1.1 Estructura y Arquitectura General

```
src/
├── app/
│   ├── (admin)/          → rutas protegidas: dashboard, agenda, clientes, servicios, turnos
│   ├── (marketplace)/    → rutas públicas B2C: landing, /salones/[slug], /book
│   ├── business/         → landing B2B (marketing)
│   ├── api/              → NextAuth, Google Calendar, notificaciones
│   └── admin/            → seed/migrate utilities (dev only)
├── components/
│   ├── ui/               → 35 componentes shadcn/Radix
│   ├── landing/          → 12 componentes de landing global
│   ├── salon/            → 5 componentes de página de salón
│   ├── marketplace/      → BookingFlow y variantes
│   └── business/         → mock dashboard + features B2B
├── lib/
│   ├── auth.ts           → NextAuth config (Credentials + Google OAuth)
│   ├── firebase.ts       → Firebase init
│   ├── schema.ts         → tipos Firestore canónicos
│   └── services/         → marketplace, auth, user, catalog, notification
├── contexts/             → Tenant, User, UI
├── hooks/                → useRole, useTenant, useCatalog, useMetrics, useOcupacionEnVivo
├── actions/              → booking.actions.ts (Server Actions)
└── ai/                   → Genkit + Gemini 2.0 Flash (configurado, no usado)
```

**Patrón arquitectónico**: Server Components para fetching (Firestore REST), Client Components para interacción, Server Actions para mutaciones autenticadas. Multi-tenancy via `tenants/{tenantId}/*` en Firestore con RBAC en reglas.

---

### 1.2 Tabla de Módulos — Estado y Complejidad

| Módulo | Estado | Complejidad | Notas |
|--------|--------|-------------|-------|
| **NextAuth** | 🟡 Funcional con deuda | Alta | Google OAuth + Credentials. Token refresh OK. Memberships no reactivas. |
| **Firestore REST (SSR)** | ✅ Funcional | Baja | Usado correctamente en Server Components |
| **Middleware** | ✅ Completo | Baja | Protege rutas admin + `/salones/*/dashboard`. `/admin/seed` + `/admin/migrate` → 404 en prod. |
| **UI / shadcn** | ✅ Completo | Baja | 35 componentes, Tailwind dark/light con MD3 colors |
| **Framer Motion** | ✅ Activo | Baja | Landing y /business con animaciones premium |
| **next-themes** | ✅ Funcional | Baja | defaultTheme="dark", toggle funcional |
| **Landing Global** | ✅ ~95% | Baja | 12 secciones. Todas las imágenes externas reemplazadas por gradientes locales |
| **Landing /business** | 🟡 ~70% | Baja | Bug en Safari conocido |
| **Dashboard Admin** | ✅ ~90% | Alta | Métricas reales (ingresos mes, ocupación, próximos turnos) |
| **Agenda / Turnos** | 🟡 ~60% | Alta | UI existe, branchId dinámico resuelto |
| **Clientes** | 🟡 ~55% | Media | Lista y detalle. Role real de sesión |
| **Servicios** | ✅ ~95% | Media | CRUD completo: crear, editar, archivar, loading states |
| **Staff** | ✅ ~90% | Media | CRUD completo con horarios multi-step, schedules |
| **Sucursales** | ✅ ~90% | Alta | CRUD + selector en header + localStorage |
| **Configuración salón** | ✅ ~90% | Media | 4 tabs, slug validation, horarios de atención |
| **Onboarding wizard** | ✅ ~95% | Alta | 5 pasos, localStorage, batch atómico |
| **Booking Flow** | ✅ ~85% | Alta | Multi-step con captura de teléfono (WhatsApp), WhatsApp on booking. Falta disponibilidad real de staff. |
| **Google Calendar** | ✅ ~80% | Alta | Bidireccional: App→GCal + GCal→App webhook. Token refresh |
| ~~**Email (Resend)**~~ | ❌ **Eliminado** | — | **Pivot**: reemplazado por WhatsApp nativo. Sin emails en el flujo de notificaciones. |
| **Portal Cliente** | ✅ ~75% | Media | Dashboard real (citas, historial, filtros), cancelación, vista guest por teléfono. Perfil: shell con mock data. |
| **Checkout / Caja** | ✅ ~70% | Media | `CheckoutDrawer` en agenda, `closeAppointment()`, métricas CRM incrementadas. Falta cierre de caja diario. |
| **Auth B2C** | ✅ ~60% | Media | `UserRole` incluye `'customer'`, JWT lleva `role`, `registerCustomer()`, páginas `/registro` + `/perfil`. Perfil no wired a Firestore. |
| **Analytics / Métricas** | ✅ ~80% | Alta | Datos reales: ingresos mes, ocupación, top servicios, próximos turnos |
| **Loading states** | ✅ 100% | Baja | 8 skeletons + error boundary global |
| ~~**AI (Genkit)**~~ | ❌ **Eliminado** | — | **Pivot**: removido del roadmap. Dependencia muerta a desinstalar. |
| **Tests** | 🔴 0% | Media | Cero cobertura |
| **CI/CD** | ✅ Configurado | Media | GitHub Actions: lint + typecheck + build en verde |

---

### 1.3 Deuda Técnica Identificada

#### Crítica (bloquea producción)

1. `ignoreBuildErrors: true` y `ignoreDuringBuilds: true` en `next.config.ts` — errores de TypeScript y ESLint silenciados.
2. Credenciales de test hardcodeadas en login: `admin@mujer.com / password123`, `clienta@mujer.com / password123`.
3. `branchId: 'sucursal_centro'` hardcodeado en 3+ archivos (`booking.actions.ts`, `turnos/page.tsx`…).
4. `const userRole = 'admin'` hardcodeado en `clientes/page.tsx` y `clientes/[id]/page.tsx`.
5. ~~Rutas `/admin/seed` y `/admin/migrate` sin protección en middleware.~~ ✅ Resuelto — devuelven 404 en producción vía `notFound()`.

#### Alta

6. ~~Imágenes de landing usando dominios externos no controlados (placehold.co, Unsplash, Instagram CDN).~~ ✅ Resuelto — reemplazadas por gradientes locales. `remotePatterns` reducido a 2 dominios.
7. Middleware no cubre rutas de marketplace autenticadas.
8. Sin error boundaries ni estados de loading consistentes.
9. Mezcla de schema legacy (`types.ts`) / nuevo (`schema.ts`) sin capa de abstracción clara.
10. `tenantIds` en JWT no reactivos — cambio de rol requiere re-login.

#### Media

11. 4 TODOs de imágenes pendientes (`ColeccionCurada.tsx` ×3, `ElevaTuVision.tsx` ×1).
12. ~~Genkit configurado sin uso — dependencia activa muerta.~~ → **Acción**: `npm uninstall @genkit-ai/googleai genkit` + borrar `src/ai/`
13. `patch-package` en devDependencies — verificar qué parche aplica.
14. `shim-storage.ts` importado en `next.config.ts` — workaround que debería ser innecesario.

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
| Genkit | 1.13.0 | Bajo (no en uso activo) |
| **patch-package** | **8.0.0** | **Medio** — ¿qué se está parchando? |

---

## FASE 2 — ALCANCE Y FUNCIONALIDADES

### 2.1 MVP Actual (funciona end-to-end hoy)

| Flujo | Estado |
|-------|--------|
| Login admin (email/password + Google OAuth) | ✅ |
| Landing B2C — visual y navegación | ✅ |
| Landing B2B `/business` — visual | ✅ (bug Safari) |
| Página de salón público `/salones/[slug]` | ✅ |
| Dashboard básico con métricas parciales | 🟡 |
| Agenda diaria/semanal (datos reales parciales) | 🟡 |
| Listado de clientes y ficha técnica | 🟡 |
| Booking flow multi-step (servicio → staff → fecha) | 🟡 |
| Email de confirmación de reserva | 🟡 |
| Google Calendar webhook → Firestore | 🟡 |

### 2.2 Funcionalidades Pendientes por Capa

**Frontend**
- [ ] Fix bug Safari en `/business`
- [ ] Reemplazar imágenes placeholder con assets reales
- [ ] Multi-branch: selector de sucursal en admin y booking
- [ ] Portal cliente completo (`/salones/[slug]/dashboard`)
- [ ] CRUD completo de servicios y staff en admin
- [ ] Onboarding wizard para nuevos salones
- [ ] `/explore` con filtros y búsqueda
- [ ] Perfil editable de usuario/cliente
- [ ] Error boundaries + loading states consistentes

**Backend / API**
- [ ] Eliminar hardcoding de `branchId` y `userRole`
- [ ] Proteger `/admin/seed` y `/admin/migrate`
- [ ] Sync bidireccional completo con Google Calendar
- [ ] CRUD de staff con disponibilidad y horarios
- [ ] Cálculo real de disponibilidad (staff + duración + branch)
- [ ] Integración de pagos (Stripe / MercadoPago)
- [ ] Webhooks de pagos
- [ ] Cancellation flow con reglas de negocio
- [ ] Rate limiting en API routes

**Infra / DevOps**
- [ ] Eliminar `ignoreBuildErrors: true` y corregir todos los errores TS
- [ ] Pipeline CI/CD (GitHub Actions: lint + typecheck + build + deploy)
- [ ] `.env.example` documentado
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
| ~~**AI features** (Genkit)~~ | ❌ **Pospuesto** | — | Eliminado del roadmap activo. Sin uso en producción, dependencia muerta. |

### 2.4 Riesgos Técnicos Priorizados

| ID | Riesgo | Prioridad | Mitigación |
|----|--------|-----------|------------|
| R1 | Credenciales de test hardcodeadas en código | **P0** | Eliminar en Día 1, mover a `.env.local` |
| R2 | Build errors silenciados — bugs latentes en producción | **P0** | Activar `ignoreBuildErrors: false`, resolver todos |
| ~~R3~~ | ~~`/admin/seed` y `/admin/migrate` sin protección~~ | ~~P0~~ | ✅ `notFound()` en producción — devuelven 404 si `NODE_ENV !== 'development'` |
| R4 | `branchId` hardcodeado — rompe multi-tenant real | **P0** | Propagar desde TenantContext |
| R5 | Sin integración de pagos | **P0** | Integrar Stripe/MercadoPago en Fase 3 |
| R6 | NextAuth v4 en mantenimiento | **P1** | Planear migración a Auth.js v5 post-MVP |
| R7 | Tokens Google Calendar en Firestore — verificar rules | **P1** | Auditar reglas para `integrations/*` |
| R8 | JWT no reactivo para roles | **P1** | Implementar `session.update()` en cambios de rol |
| R9 | Sin tests — regressions invisibles en cada release | **P1** | Suite Playwright para flujos críticos en Fase 4 |
| R10 | Mezcla schema legacy/nuevo sin deprecation plan | **P2** | Documentar y marcar `types.ts` como `_archive` |

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

> **Estado**: 🟡 EN CURSO — 3.0 y 3.1 completados (2026-04-09). Pendiente: MercadoPago, cierre de caja diario, planes SaaS.

> **🔴 Pivot LATAM (2026-04-08):** El Módulo Financiero Local es P0 urgente. Los salones en LATAM cobran en efectivo, con transferencias bancarias y QR de MercadoPago — no con Stripe. Soportar esto de forma nativa es el diferencial de "Cierre de Caja" vs Fresha/Wonoma.

**Objetivo**: Modelo de ingresos funcional con la realidad del mercado local. Salones cierran caja en efectivo/transferencia. Planes SaaS.

| # | Tarea | Días | Depende de | Done cuando... | Estado |
|---|-------|------|-----------|----------------|--------|
| ~~**3.0**~~ | ~~Módulo Financiero Local: schema + cierre de caja~~ (`amountPaid`, `paymentMethod`, status `cobrado`) | ~~3~~ | ~~schema.ts~~ | ~~Admin puede cerrar un turno como "cobrado"~~ | ✅ |
| ~~**3.1**~~ | ~~UI de Checkout en pantalla de turno~~ | ~~3~~ | ~~3.0~~ | ~~Admin cobra → status `cobrado`~~ | ✅ (`CheckoutDrawer` + `closeAppointment()` + CRM metrics) |
| 3.2 | MercadoPago QR nativo (Checkout Pro para cobros presenciales) | 4 | Cuenta MP activada | Clienta escanea QR en mostrador, pago confirmado en app | ⏳ |
| 3.3 | Webhook MercadoPago → Firestore (status de cita automático) | 2 | 3.2 | Pago confirmado actualiza turno automáticamente | ⏳ |
| 3.4 | Dashboard de cierre de caja diario (efectivo + transferencias + MP) | 3 | 3.0 | Admin ve resumen de caja del día desglosado por método | ⏳ |
| 3.5 | Planes SaaS para salones (Free / Pro / Enterprise) | 3 | — | Salones tienen plan asignado | ⏳ |
| 3.6 | Feature flags por plan de suscripción | 2 | 3.5 | Features desbloqueadas según plan | ⏳ |

**Total**: ~20 días → **~3–4 semanas**

**Criterios de done**: Salón cierra caja diaria en efectivo, transferencia y MercadoPago sin depender de pasarelas internacionales. MujerApp cobra suscripción a salones.

**Archivos clave entregados (3.0–3.1)**:
- `src/components/admin/CheckoutDrawer.tsx` — Sheet de cobro (efectivo/MP/tarjeta/transferencia)
- `src/actions/checkout.actions.ts` — `closeAppointment()` con incremento de CRM metrics
- `src/lib/schema.ts` — `PaymentMethod`, status `cobrado`, `Customer.metrics` con `firstVisit`

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

### FASE 4 — Growth & Scale (Semanas 13–16)

> **🔴 Pivot LATAM (2026-04-08):** IA (Genkit) eliminada del roadmap activo. El foco es SEO, performance móvil, reviews y test suite para escalar con confianza.

**Objetivo**: Plataforma lista para adquirir usuarios masivamente y escalar.

| # | Tarea | Días | Done cuando... |
|---|-------|------|----------------|
| 4.1 | Sistema de reviews y valoraciones | 3 | Clienta valora turno completado |
| 4.2 | SEO: metadata dinámica, OG tags, sitemap, robots.txt | 2 | Google indexa páginas de salón |
| 4.3 | Performance: imágenes, code splitting, ISR | 3 | Lighthouse > 80 en móvil |
| 4.4 | Accesibilidad (a11y) audit y correcciones | 3 | 0 errores críticos en axe-core |
| 4.5 | Test suite (Vitest unit + Playwright e2e) | 5 | Flujos críticos cubiertos en CI |
| 4.6 | Documentación técnica (ADRs, README actualizado) | 2 | Nuevo dev onboardea en < 1 día |
| ~~4.x~~ | ~~AI: recomendaciones personalizadas (Genkit)~~ | ~~5~~ | ~~**Eliminado del roadmap.** Genkit queda como dependencia muerta a remover.~~ |

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

## ACCIONES INMEDIATAS (Semana 1)

En orden de prioridad, antes de cualquier feature nueva:

1. Activar `ignoreBuildErrors: false` en `next.config.ts` y auditar la magnitud real de errores TypeScript
2. Remover `admin@mujer.com` / `clienta@mujer.com` de cualquier archivo de código (no solo de login)
3. Añadir `/admin/*` al matcher del `middleware.ts`
4. Investigar el bug Safari en `/business` con DevTools Safari (iOS + macOS)
5. Crear `.env.example` con todas las variables documentadas
6. Crear primer GitHub Actions workflow (lint + typecheck + build)
