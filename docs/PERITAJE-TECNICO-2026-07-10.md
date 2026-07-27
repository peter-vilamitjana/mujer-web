# Peritaje técnico — Ouleeh / MujerApp

**Due diligence técnico · Confidencial**

| | |
|---|---|
| **Fecha** | 2026-07-10 |
| **Rama auditada** | `ui-polish` |
| **Alcance** | Repositorio completo (`mujer-web`) |
| **Método** | Inspección directa de código: `package.json`, `schema.ts`, `actions/`, `middleware.ts`, `auth.ts`, `firestore.rules`, componentes de agenda y checkout. No incluye pruebas de penetración activas. |

---

## Veredicto general

**Ouleeh no es un prototipo — pero tampoco es un SaaS listo para cobrar.** Hay un producto real debajo de la superficie: multi-tenancy correcto por subcolecciones, motor de reservas con detección de conflictos, integración de MercadoPago funcional con verificación de firma, y un pipeline de CI que corre typecheck/lint/build/e2e en cada push. Eso es más solidez de la que suele tener un proyecto en esta etapa.

Pero la capa de autorización tiene un agujero real y explotable **hoy** (no teórico), el canal de WhatsApp es un stub que miente silenciosamente sobre su éxito, no existe ni un solo cron job, y el despliegue está fijado a `maxInstances: 1` — es decir, el sistema no puede escalar horizontalmente aunque todo lo demás estuviera resuelto. La brecha entre "se ve terminado" y "está terminado" es exactamente donde está parado este proyecto.

**Resumen de hallazgos:** 1 crítico · 5 altos · 7 medios · 3 fortalezas reales confirmadas.

---

## I. Peritaje técnico y estado actual

Lo que hay hoy en el repositorio, contrastado con lo que `CLAUDE.md` y `docs/PLAN.md` declaran.

### Arquitectura general
*Next.js 15.3.3 · React 18.3.1 · TypeScript 5*

El patrón declarado (Server Components para lectura, Server Actions para mutación, Firestore vía REST/Admin SDK en servidor) se cumple en la gran mayoría del código: 18 archivos de Server Actions, 19 archivos con `'use server'`. La separación es real, no aspiracional.

Hay dos fugas concretas de esa disciplina:
- `src/app/(marketplace)/(public)/salones/[tenantSlug]/dashboard/mis-turnos/page.tsx` es un componente cliente que escribe directo a Firestore con el SDK (`updateDoc`), saltándose Server Actions en un flujo de usuario **real** — no una utilidad de desarrollo.
- `src/app/api/google/event/route.ts` es una ruta API que muta datos (crea eventos de calendario), cuando la convención del proyecto reserva las rutas API para webhooks y las mutaciones para Server Actions.

El stack de animación acumula tres librerías con superposición de responsabilidad — `framer-motion`, `motion` y `gsap` conviviendo — lo cual no rompe nada pero es peso muerto y una fuente de inconsistencia de patrones entre secciones.

Dato de higiene: no hay carpeta `src/ai/` ni referencias a Genkit — la deuda declarada como eliminada en `CLAUDE.md` efectivamente lo está.

### Base de datos
*Firestore · sin ORM*

`src/lib/schema.ts` define un modelo maduro para lo esencial de un SaaS: `Tenant`, `Subscription` y `AuditLog` existen y el segundo se usa de verdad en `superadmin.actions.ts` (altas/bajas de plan, suspensión, cambios de rol quedan registrados). El aislamiento multi-tenant es real: colecciones de negocio viven como subcolecciones de `tenants/{tenantId}/…`, y las entidades top-level (`Appointment`, `Membership`, `Subscription`) llevan `tenantId` explícito.

Lo que falta es una entidad `Payment`/`Invoice` propia: los pagos hoy son campos sueltos dentro de `Appointment` (`amountPaid`, `depositPaid`, `paymentMethods`). Consecuencia directa: el webhook de MercadoPago (`src/app/api/mercadopago/webhook/route.ts`) escribe `depositPaid` como un número donde el schema lo declara `boolean` — un bug de tipos real, que pasa desapercibido porque **`zod` está en `package.json` pero no se usa en ningún lugar de `src/`**. Toda la validación de entrada del sistema es manual (regex de email/teléfono/fecha en `booking.actions.ts`), sin una sola capa de runtime-validation pese a tener la librería instalada para eso.

### Backend & APIs
*18 Server Actions · 9 rutas API*

El motor de reservas tiene lógica real de prevención de solapamiento (`hasSlotConflict` en `src/lib/booking-utils.ts`), pero es un patrón *check-then-write* sin transacción de Firestore (`runTransaction`): bajo concurrencia real, dos reservas simultáneas sobre el mismo horario pueden pasar ambas la verificación antes de que la primera se persista. Es una condición de carrera de producción, no un edge case exótico — va a ocurrir en cuanto haya dos clientes reservando el mismo turno a la vez.

MercadoPago está implementado en serio: preferencia de pago, consulta de estado, y verificación HMAC de firma en el webhook. WhatsApp, en cambio, es explícitamente un stub (`src/lib/whatsapp.ts`, comentado como "skeleton" por su propio autor): si faltan las env vars, hace `console.warn` y devuelve `success: true` igual, sin bloquear el flujo — el sistema miente sobre si el recordatorio salió. El payload que arma tampoco corresponde al formato real de Meta Cloud API ni Twilio, así que ni siquiera está listo para conectarse a un proveedor real cuando se active la env var.

### Frontend
*102 componentes · sin librería de estado global*

No hay Zustand, Redux, TanStack Query ni SWR en el proyecto — todo el fetching es manual, componente por componente, con `useState` + `useEffect` + `try/catch`. El caso límite es `AgendaTabView.tsx` (1.521 líneas), la vista más compleja del producto, sostenida por unos 15 `useState` independientes sin cache ni deduplicación de requests — cada remount vuelve a pedir todo.

No existe un solo `error.tsx`, `loading.tsx` ni Error Boundary en toda la app. El manejo de error/carga es ad-hoc, banderas booleanas por componente. El patrón de `Sheet` (action sheets mobile) que `CLAUDE.md` fija como convención del proyecto se usa en apenas dos lugares fuera de la carpeta de UI — la convención existe en el documento, no en la práctica. `react-hook-form` y `zod` están instalados pero `zodResolver` tiene cero usos: los formularios (creación de turno, wizard de onboarding B2B) son inputs controlados a mano.

### Infraestructura & seguridad
*Firebase App Hosting*

> ### 🔴 Crítico · IDOR
> **Cualquiera puede leer los turnos, ingresos y comisiones de cualquier salón sin autenticarse.** Las Server Actions `getAppointmentsForDay`, `getAppointmentsForPeriod`, `getAppointmentsToday`, `getNextAppointment`, `getDailyMetrics` y `getWeeklyRevenue` en `src/actions/appointments.actions.ts` reciben `tenantId` como parámetro sin invocar `requireTenantAccess` ni verificar sesión — a diferencia de `createAppointment`, que sí lo hace. Como son Server Actions exportadas, son invocables directamente conociendo (o adivinando secuencialmente) el `tenantId` de otro salón. `caja.actions.ts` hereda el mismo problema al reutilizar `getAppointmentsForDay`.
>
> Esto no es teórico ni requiere ingeniería social: es una llamada HTTP directa a un endpoint de Next.js que ya existe y está desplegado.

Las reglas de Firestore (`firestore.rules`) están razonablemente bien escritas — aíslan por tenant y bloquean escalada de rol — pero son casi decorativas para el flujo principal: casi toda la app opera vía Admin SDK dentro de Server Actions, que **bypasa las reglas por completo**. La seguridad real depende al 100% de los guards de aplicación, y ahí es exactamente donde está el agujero de arriba.

El sistema de roles (`admin`/`employee`/`client`/`customer`) está definido en el schema pero no hay un helper central que verifique rol-dentro-del-tenant — solo pertenencia al tenant. Hoy el riesgo es latente porque el onboarding únicamente crea memberships `admin`, pero el código ya está preparado para "empleados" sin que exista ningún control que los diferencie de un dueño.

El rate limiter (`src/lib/rate-limit.ts`) vive en memoria de proceso — no cubre login por Credentials ni reservas de invitados, y de todos modos dejaría de funcionar en cuanto el despliegue deje de ser una sola instancia. Y ahí está el otro techo estructural: `apphosting.yaml` fija `maxInstances: 1`. Hoy el sistema corre en un único proceso — sin redundancia, sin horizontal scaling, con un punto único de falla. No es un detalle de configuración menor: es la razón por la que "listo para producción" todavía no aplica, independientemente de cuánto se arregle el resto.

**Nota aparte:** `CLAUDE.md` declara la rama activa como `database-config` y el despliegue target como "Vercel/AWS"; el repositorio real está en `ui-polish` y despliega a Firebase App Hosting. La documentación de contexto está desactualizada respecto al código — vale la pena corregirla para que no desoriente a la próxima persona (o agente) que la lea antes de trabajar.

---

## II. Gap analysis

Lo que falta construir, sin maquillaje, para que el sistema pueda cobrarle a un salón real y sostenerse solo.

| Área | Estado actual | Qué falta | Severidad |
|---|---|---|---|
| **Pasarela de pagos** | MercadoPago real: preferencias, consulta de estado, webhook con firma HMAC verificada. | Entidad `Payment`/`Invoice` propia; reconciliación de cobros recurrentes de suscripción; facturación electrónica AFIP (obligatoria para cobrar B2B en Argentina de forma legal). | 🟠 Alta |
| **Cron jobs** | No existe ninguno. Ni Vercel Cron, ni Cloud Scheduler, ni `node-cron`. | Disparador de recordatorios (el campo `reminderHoursBefore` ya existe en `UserPreferences` y no lo consume nadie); job de vencimiento/renovación de suscripciones; limpieza de reservas `pending` expiradas. | 🔴 Crítica |
| **Webhooks** | MercadoPago y Google Calendar implementados y protegidos con rate limit. | No hay webhook entrante de WhatsApp (imposible sin proveedor real conectado); no hay verificación de idempotencia explícita en los handlers existentes. | 🟡 Media |
| **RBAC** | Roles definidos en schema; guard de pertenencia a tenant (`requireTenantAccess`) aplicado de forma parcial. | Guard de rol-dentro-de-tenant (`admin` vs `employee`); aplicar el guard existente a las 6 Server Actions de lectura desprotegidas (ver hallazgo crítico). | 🔴 Crítica |
| **WhatsApp** | Stub que simula éxito sin enviar nada; solo hay un link `wa.me/` de compartir manual en el frontend. | Integración real con Meta Cloud API o Twilio WABA; el payload actual ni siquiera tiene la forma correcta para conectarse. | 🟠 Alta |
| **Escalabilidad de infra** | Firebase App Hosting con `maxInstances: 1`; rate limiter en memoria de proceso. | Multi-instancia real + store de rate-limit distribuido (Redis/Upstash o Firestore); de lo contrario cualquier pico de tráfico tumba el único proceso. | 🟠 Alta |
| **Testing** | Playwright e2e real (6 specs funcionales) y CI con typecheck/lint/build/e2e en cada push. | Cero tests unitarios — ni Jest ni Vitest en el repo. La lógica más sensible (`hasSlotConflict`, validaciones manuales, guards de auth) no tiene ni una prueba aislada. | 🟡 Media |

---

## III. División táctica

Tres equipos, épicas concretas con archivos de entrada ya identificados — pensado para asignar en sesiones paralelas sin que se pisen entre sí.

### Team Infra & DB
*Cierra los agujeros de seguridad y de datos. Nadie más debería tocar autorización, schema de pagos o capacidad de despliegue mientras este equipo trabaja ahí.*

| # | Épica | Detalle | Prioridad |
|---|---|---|---|
| 01 | **Cerrar el IDOR de turnos/métricas** | Aplicar `requireTenantAccess` (ya existe, solo falta invocarlo) a las 6 Server Actions desprotegidas de `appointments.actions.ts` y `caja.actions.ts`. | 🔴 P0 |
| 02 | **RBAC real por rol de tenant** | Helper central tipo `requireRole(tenantId, ['admin'])` reutilizando `auth-guards.ts`, aplicado antes de que exista el primer membership `employee` en producción. | 🔴 P0 |
| 03 | **Transacciones en la reserva de turnos** | Reemplazar el check-then-write de `hasSlotConflict` por `runTransaction` de Firestore para eliminar la condición de carrera de doble reserva. | 🟠 P1 |
| 04 | **Entidad Payment/Invoice + Zod en todo el borde de entrada** | Modelar pagos como entidad propia (no campos sueltos en `Appointment`); adoptar los `zod` schemas ya instalados para validar Server Actions y payloads de webhook — corrige el bug de `depositPaid` boolean/number. | 🟠 P1 |
| 05 | **Salir de la instancia única** | Revisar `apphosting.yaml` (`maxInstances: 1`) y migrar el rate limiter en memoria a un store distribuido antes de aceptar tráfico real fuera de un piloto controlado. | 🟠 P1 |

### Team Backend & Lógica Core
*Convierte las promesas del schema en comportamiento automático real: lo que hoy es un campo de configuración sin nadie que lo lea.*

| # | Épica | Detalle | Prioridad |
|---|---|---|---|
| 06 | **Cron de recordatorios automáticos** | Cloud Scheduler + función que lea `reminderHoursBefore` de `UserPreferences` y dispare notificaciones — hoy ese campo no lo consume nada. | 🔴 P0 |
| 07 | **WhatsApp Business API real** | Reemplazar el stub de `src/lib/whatsapp.ts` por una integración real contra Meta Cloud API, incluyendo el formato de payload correcto y manejo de fallos (no `success: true` silencioso). | 🟠 P1 |
| 08 | **Ciclo de vida de suscripciones** | Vencimiento de trial, dunning ante pago recurrente fallido, downgrade automático de plan — apoyado en la entidad `Subscription` que ya existe en `schema.ts`. | 🟠 P1 |
| 09 | **Consolidar la capa de acceso a datos** | Migrar `/api/google/event` a Server Action; eliminar `auth.service.ts` (dead code) y el uso del SDK cliente de Firebase dentro de servicios server-side. | 🟡 P2 |

### Team Frontend & Conexión
*Conecta la interfaz "Vogue x Apple" ya construida con datos reales de forma sostenible, en lugar de fetch manual disperso por 100+ componentes.*

| # | Épica | Detalle | Prioridad |
|---|---|---|---|
| 10 | **Adoptar una capa de data-fetching con cache** | Empezar por `AgendaTabView.tsx` (1.521 líneas, ~15 `useState`): TanStack Query o equivalente para reemplazar el fetch manual y eliminar refetches redundantes en cada remount. | 🟠 P1 |
| 11 | **Estados de carga/error a nivel de framework** | `error.tsx`, `loading.tsx` y Error Boundaries por ruta — hoy no existe ninguno en todo `src/app`. | 🟡 P2 |
| 12 | **Formularios con validación real** | Conectar `react-hook-form` + `zodResolver` (instalados, sin usar) en el formulario de turno y el wizard de onboarding B2B, reemplazando los checks imperativos actuales. | 🟡 P2 |
| 13 | **Aplicar la convención de Action Sheets mobile** | Extender `Sheet` a los flujos que `CLAUDE.md` ya declara como estándar del proyecto pero que hoy solo se usa en dos pantallas. | 🟡 P2 |

---

*Peritaje basado en inspección directa del repositorio — `package.json`, `schema.ts`, `actions/`, `middleware.ts`, `auth.ts`, `firestore.rules`, componentes de agenda y checkout. No incluye pruebas de penetración activas.*
