# BACKEND AUDIT — Cuenta del Cliente (Ouleeh B2C)

> **Generado:** 2026-05-27 · **Última verificación:** 2026-05-28  
> **Rama:** `database-config`  
> **Alcance:** Peritaje completo del backend B2C + estado de migración Admin SDK en todo el proyecto.

---

## PASO 1 — Mapa de Rutas y Endpoints

### API Routes (`src/app/api/`) — SDK verificado

| Ruta | Método | Auth | SDK | Estado |
|------|--------|------|-----|--------|
| `/api/auth/[...nextauth]` | GET, POST | — | Admin SDK (auth.ts) | ✅ |
| `/api/google/connect` | GET | Session + RL | Client SDK | 🔴 |
| `/api/google/disconnect` | POST | Session + RL | Client SDK | 🔴 |
| `/api/google/event` | POST | Session + RL | Client SDK | 🔴 |
| `/api/google/status` | GET | Session + RL | Client SDK | 🔴 |
| `/api/google/callback` | GET | — | Client SDK | 🔴 |
| `/api/google/sync/bootstrap` | POST | Session + RL | Client SDK | 🔴 |
| `/api/google/webhook` | POST | RL only | Client SDK + `_types_archive` | 🔴 |
| `/api/mercadopago/webhook` | POST | RL only | Client SDK | 🔴 |

### Server Actions — cliente B2C (`src/actions/profile.actions.ts`) ✅

| Función | Colección Firestore | SDK |
|---------|---------------------|-----|
| `getMyProfile()` | `users/{uid}` | Admin SDK |
| `updateMyProfile()` | `users/{uid}` | Admin SDK |
| `getMyHistorial()` | `tenants/{id}/appointments` (cross-tenant) | Admin SDK |
| `getMyUpcomingAppointments()` | `tenants/{id}/appointments` (cross-tenant) | Admin SDK |
| `getMyHairProfile()` | `tenants/{id}/customers/{uid}.hairProfile` | Admin SDK |
| `updateMyHairProfile()` | `tenants/{id}/customers/{uid}.hairProfile` | Admin SDK |
| `getMyPreferences()` | `users/{uid}/preferences/default` | Admin SDK |
| `updateMyPreferences()` | `users/{uid}/preferences/default` | Admin SDK |
| `getMyFavorites()` | `users/{uid}/favorites` + join `tenants/{id}` | Admin SDK |
| `toggleFavorite(tenantId)` | `users/{uid}/favorites/{tenantId}` | Admin SDK |
| `cancelMyAppointment(id, tenantId)` | `tenants/{id}/appointments/{id}` | Admin SDK |

### Server Actions — admin/booking (Fase 5 completada) ✅

Todos los archivos de `src/actions/` usan `adminDb`. Verificado:

| Archivo | Líneas | SDK | Estado |
|---------|--------|-----|--------|
| `appointments.actions.ts` | 639 | Admin SDK | ✅ |
| `profile.actions.ts` | 436 | Admin SDK | ✅ |
| `customer.actions.ts` | 300 | Admin SDK | ✅ |
| `booking.actions.ts` | 231 | Admin SDK | ✅ |
| `onboarding.actions.ts` | 150 | Admin SDK | ✅ |
| `reviews.actions.ts` | 117 | Admin SDK | ✅ |
| `guest-booking.actions.ts` | 108 | Admin SDK | ✅ |
| `caja.actions.ts` | 94 | Sin Firestore directo (delega a actions) | ✅ |
| `calendar.actions.ts` | 93 | Admin SDK | ✅ |
| `staff.actions.ts` | 91 | Admin SDK | ✅ |
| `services.actions.ts` | 87 | Admin SDK | ✅ |
| `auth.actions.ts` | 79 | Sin Firestore directo | ✅ |
| `checkout.actions.ts` | 77 | Admin SDK | ✅ |
| `tenant.actions.ts` | 76 | Admin SDK | ✅ |
| `branches.actions.ts` | — | Admin SDK | ✅ |

### Utilities (`src/lib/`)

| Archivo | Descripción | SDK |
|---------|-------------|-----|
| `booking-utils.ts` | **Nuevo.** `hasSlotConflict()` y `buildOccupiedSlots()` para validación de horarios | Admin SDK ✅ |
| `google-calendar.server.ts` | Integración Google Calendar (lectura/escritura de tokens) | Client SDK 🔴 |
| `whatsapp.ts` | Skeleton WhatsApp Business API | Sin Firestore |
| `whatsapp-templates.ts` | Builders de mensajes WA | Sin Firestore |

---

## PASO 2 — Auditoría Firestore

### Colecciones activas

| Colección | Tipo TS en `schema.ts` | SDK principal | Estado |
|-----------|------------------------|---------------|--------|
| `users/{uid}` | `UserProfile` | Admin SDK | ✅ |
| `users/{uid}/memberships/{tenantId}` | `Membership` | Admin SDK | ✅ |
| `users/{uid}/integrations/google` | ❌ sin tipo | Admin SDK (auth.ts) / Client SDK (api/google/*) | ⚠️ |
| `users/{uid}/preferences/default` | `UserPreferences` | Admin SDK | ✅ |
| `users/{uid}/favorites/{tenantId}` | `FavoriteSalon` | Admin SDK | ✅ |
| `tenants/{tenantId}` | `Tenant` | Admin SDK | ✅ |
| `tenants/{id}/customers/{uid}` | `Customer` (hairProfile extendido) | Admin SDK | ✅ |
| `tenants/{id}/appointments/{id}` | `Appointment` | Admin SDK | ✅ |
| `tenants/{id}/services/{id}` | `Service` | Admin SDK (actions) / Client SDK (catalog.service) | ⚠️ |
| `tenants/{id}/staff/{id}` | `Staff` | Admin SDK | ✅ |
| `tenants/{id}/branches/{id}` | `Branch` | Admin SDK | ✅ |
| `tenants/{id}/reviews/{id}` | `Review` | Admin SDK | ✅ |
| `calendarTokens/{uid}` | ❌ sin tipo | Admin SDK (auth.ts) / Client SDK (api/google/*) | ⚠️ |

### Colecciones legacy (read-only en Firestore Rules)

| Colección | Estado | Notas |
|-----------|--------|-------|
| `usuarios/{uid}` | 🟡 Legado | `user.service.ts` hace migración read-only. Tipo `LegacyUsuario` inline. |
| `turnos/{id}` | 🔴 Archivado | `_types_archive.Turno` todavía importado en `api/google/webhook` y en `mis-turnos/page.tsx` |
| `clientes/{id}` | 🔴 Archivado | Solo lectura admin |
| `servicios/{id}` | 🔴 Archivado | `_types_archive.Servicio` importado en `FeaturedServices.tsx` |

### Colección pendiente de implementación

| Colección | Tipo TS | Estado |
|-----------|---------|--------|
| `tenants/{id}/customers/{uid}/technicalRecords/{id}` | `TechnicalRecord` (en schema.ts) | ❌ Sin actions ni UI |

---

## PASO 3 — Auditoría de Autenticación

### Providers

- **Google OAuth** — Scope Google Calendar completo. `refreshToken` guardado vía Admin SDK en `calendarTokens/{uid}` e `users/{uid}/integrations/google`.
- **Credentials** — `signInWithEmailAndPassword` del Firebase Auth SDK en `authorize()`. Correcto: única excepción válida al Client SDK.

### JWT Token — verificado

```typescript
{
  uid: string,           // Firebase Auth UID
  role: 'customer' | 'staff' | 'admin',
  tenantIds: string[],   // ✅ leídos via Admin SDK — sin bug de permisos
  salonSlug: string,
  phone?: string,
  accessToken: string,
  refreshToken: string,
  provider: 'google' | 'credentials'
}
```

### Middleware (`src/middleware.ts`) — verificado

```
/[slug]/dashboard/**      → Session + rate-limit → redirect /login  ✅
/admin/**                 → Session + rate-limit → redirect /login  ✅
/perfil/:path*            → Session + rate-limit → redirect /login  ✅ (líneas 23, 81)
/api/google/**            → Session + rate-limit (excepto webhook)  ✅
/api/mercadopago/webhook  → Solo rate-limit                         ✅
```

---

## PASO 4 — Auditoría de Tipos y Contratos

### `src/lib/schema.ts` — inventario completo verificado

```
UserProfile             ✅
UserPreferences         ✅  (preferredZone, preferredTimeSlot, notifications)
FavoriteSalon           ✅  (tenantId, slug, savedAt)
UserRole                ✅  ('admin' | 'employee' | 'client' | 'customer')
Membership              ✅
Tenant                  ✅
Branch                  ✅
Service + prices        ✅
Promotion               ✅
Staff + commissions     ✅
Appointment             ✅
Customer                ✅  (hairProfile extendido: healthScore, lastTreatment, evolution[], stylistName, updatedAt)
TechnicalRecord         ✅  (sin colección real implementada aún)
Review                  ✅
ProfileData             ✅  (movido desde profile.actions.ts)
HistorialEntry          ✅  (incluye tenantId)
HistorialGroup          ✅
HairProfile             ✅  (type alias de Customer['hairProfile'])
SerializedPreferences   ✅
FavoriteSalonData       ✅
DashboardAppointment    ✅  (movido desde customer.service.ts)

GoogleCalendarToken     ❌  pendiente
```

### `src/lib/_types_archive.ts` — importaciones activas (5 archivos)

El archive **no puede eliminarse** aún. Tiene 5 consumidores activos:

| Archivo consumidor | Tipo importado | Migración necesaria |
|-------------------|----------------|---------------------|
| `src/contexts/UserContext.tsx` | `Usuario`, `UserRole` | Reemplazar `UserRole` por `schema.UserRole`; `Usuario` por `UserProfile` |
| `src/app/api/google/webhook/route.ts` | `Turno` | Reemplazar por `Appointment` de schema |
| `src/app/(marketplace)/...mis-turnos/page.tsx` | `Turno` | Reemplazar por `Appointment` de schema |
| `src/components/landing/FeaturedServices.tsx` | `Servicio` | Reemplazar por `Service` de schema |
| `src/components/marketplace/BookingFlow.tsx` | `LargoPelo` | Inline o agregar a schema |

---

## PASO 5 — State y Data Fetching

### Patrones actuales

| Patrón | Archivos | Estado |
|--------|----------|--------|
| Server Component + redirect → props a Client | `perfil/page.tsx` → `PerfilClient.tsx` | ✅ |
| Server Component + redirect → props a Client | `perfil/favoritos/page.tsx` → `FavoritosClient.tsx` | ✅ |
| Server Component directo | `perfil/historial/page.tsx`, `perfil/cuenta/page.tsx` | ✅ |
| Admin SDK en auth callbacks | `auth.ts` | ✅ |
| Admin SDK en todos los Server Actions | `src/actions/*.ts` | ✅ |
| Client SDK en API Routes | `src/app/api/google/*`, `api/mercadopago/webhook` | 🔴 |
| Client SDK en `google-calendar.server.ts` | token reads/writes para Calendar API | 🔴 |
| Client SDK en services públicos | `catalog.service.ts` (lecturas públicas) | ⚠️ aceptable |
| Client SDK en `auth.service.ts` | Firebase Auth SDK (registro) + Firestore writes | ⚠️ Auth OK; Firestore pendiente |
| Client SDK en `user.service.ts` | migración legacy `usuarios/` | ⚠️ solo lectura, bajo impacto |
| Client SDK en componentes | `FeaturedServices.tsx`, `SalonFeaturedServices.tsx` | 🔴 viola regla CLAUDE.md |

---

## PASO 6 — Problemas Activos

### 6.1 Client SDK en API Routes de Google Calendar y MercadoPago

**Archivos:** `api/google/connect`, `api/google/disconnect`, `api/google/event`, `api/google/status`, `api/google/callback`, `api/google/sync/bootstrap`, `api/google/webhook`, `api/mercadopago/webhook`.

**Impacto:** Las API Routes corren en Node.js server-side. El Client SDK en ese contexto es sujeto a las Firestore Security Rules (a diferencia del Admin SDK). Si el token de sesión es inválido o expiró, las operaciones fallan silenciosamente. Además, `api/google/webhook` importa el tipo legacy `Turno` de `_types_archive`.

**Severidad:** Alta para `webhook` y `disconnect` (mutaciones críticas). Media para las demás.

### 6.2 Client SDK en `src/lib/google-calendar.server.ts`

```typescript
// líneas 9-10:
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
```

Lee y escribe tokens de Google Calendar en `users/{uid}/integrations/google`. Debería usar Admin SDK para consistencia y seguridad.

### 6.3 Client SDK en componentes React

- `src/components/landing/FeaturedServices.tsx` — importa `Servicio` de `_types_archive` y usa Client SDK
- `src/components/salon/SalonFeaturedServices.tsx` — usa Client SDK

Viola la regla de CLAUDE.md: "Nunca importar Firebase SDK en componentes cliente".

### 6.4 `_types_archive.ts` con 5 importaciones activas

No es eliminable aún. Los 5 archivos deben migrar a los tipos equivalentes en `schema.ts`.

### 6.5 `technicalRecords` sin implementación

La subcolección `tenants/{id}/customers/{uid}/technicalRecords` tiene su tipo en `schema.ts` pero no hay Server Action, API route ni componente que la use. El widget de evolución capilar en `PerfilClient.tsx` usa `hairProfile.evolution[]` (embebida), que es distinta de las fichas técnicas formales.

### 6.6 `GoogleCalendarToken` sin tipo en `schema.ts`

Los tokens de Google Calendar se escriben y leen en al menos 4 lugares con shapes literales distintas. No hay interfaz centralizada.

---

## PASO 7 — Arquitectura: Estado vs Objetivo

### Colecciones Firestore

```
users/{userId}
├── (doc)                → UserProfile                ✅
├── memberships/         → Membership                 ✅
├── integrations/google  → token Google Calendar      ✅ (sin tipo TS formal)
├── preferences/default  → UserPreferences             ✅
└── favorites/{tenantId} → FavoriteSalon              ✅

tenants/{tenantId}/customers/{uid}
├── (doc)                → Customer (hairProfile extendido) ✅
└── technicalRecords/    → TechnicalRecord             ❌ sin implementación
```

### Server Actions B2C

```
profile.actions.ts — 11/11 funciones implementadas, Admin SDK    ✅
customer.actions.ts — 9/9 funciones, Admin SDK                   ✅
```

### Reglas Firestore — verificadas

```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;         ✅
  match /memberships/{id}   { read ✅; write: false ✅ }
  match /integrations/{id}  { read/write por owner ✅ }
  match /preferences/{id}   { read/write por owner ✅ }
  match /favorites/{id}     { read/write por owner ✅ }
}
match /{path=**}/appointments/{apptId} {
  allow read: if request.auth.uid == resource.data.clientId;  ✅  (cross-tenant B2C)
}
```

---

## PASO 8 — Roadmap Actualizado

### Fase 1 — Fundación ✅ COMPLETA

- [x] `firebase-admin.ts` — Admin SDK con `FIREBASE_SERVICE_ACCOUNT` env
- [x] `auth.ts` — 100% Admin SDK en todos los callbacks JWT
- [x] `middleware.ts` — `/perfil/:path*` en matcher
- [x] `schema.ts` — todos los tipos centralizados
- [x] `auth.service.ts` — `_types_archive` eliminado, `role: 'customer'`, `fullName`
- [x] `user.service.ts` — `LegacyUsuario` inline

### Fase 2 — Server Actions B2C ✅ COMPLETA

- [x] 11 funciones en `profile.actions.ts`, Admin SDK

### Fase 3 — Componentes B2C ✅ COMPLETA

- [x] `perfil/page.tsx` → Server Component con redirect y fetch paralelo
- [x] `PerfilClient.tsx` — datos reales, sin mocks, `signOut()` wired
- [x] `perfil/favoritos/page.tsx` → Server Component
- [x] `FavoritosClient.tsx` — datos reales con optimistic update

### Fase 4 — Consistencia B2C ✅ COMPLETA

- [x] Reglas Firestore para `preferences` y `favorites`
- [x] `DashboardAppointment`, `ProfileData`, `HistorialEntry` en `schema.ts`
- [x] `Customer.hairProfile` extendido en `schema.ts`
- [x] `profile.actions.ts` y `customer.actions.ts` migrados a Admin SDK

### Fase 5 — Admin SDK en acciones admin/booking ✅ COMPLETA

- [x] 13 archivos de `src/actions/` migrados a Admin SDK
- [x] `booking-utils.ts` nuevo, Admin SDK
- [x] `caja.actions.ts` y `auth.actions.ts` sin Firestore directo (correctos)

### Fase 6 — API Routes y utilidades server-side 🔴 PENDIENTE

- [ ] `src/lib/google-calendar.server.ts` — migrar de Client SDK a Admin SDK
- [ ] `src/app/api/google/webhook/route.ts` — migrar a Admin SDK + reemplazar `Turno` por `Appointment`
- [ ] `src/app/api/google/connect/route.ts` — migrar a Admin SDK
- [ ] `src/app/api/google/disconnect/route.ts` — migrar a Admin SDK
- [ ] `src/app/api/google/event/route.ts` — migrar a Admin SDK
- [ ] `src/app/api/google/status/route.ts` — migrar a Admin SDK
- [ ] `src/app/api/google/callback/route.ts` — migrar a Admin SDK
- [ ] `src/app/api/google/sync/bootstrap/route.ts` — migrar a Admin SDK
- [ ] `src/app/api/mercadopago/webhook/route.ts` — migrar a Admin SDK

### Fase 7 — Limpieza de `_types_archive.ts` 🟡 PENDIENTE

- [ ] `src/contexts/UserContext.tsx` — `UserRole` → `schema.UserRole`; `Usuario` → `UserProfile`
- [ ] `src/app/api/google/webhook/route.ts` — `Turno` → `Appointment` (también en Fase 6)
- [ ] `src/app/(marketplace)/.../mis-turnos/page.tsx` — `Turno` → `Appointment`
- [ ] `src/components/landing/FeaturedServices.tsx` — `Servicio` → `Service` + migrar a REST/Admin
- [ ] `src/components/marketplace/BookingFlow.tsx` — `LargoPelo` → inline o en schema
- [ ] Eliminar `src/lib/_types_archive.ts` cuando los 5 consumidores estén migrados

### Fase 8 — Deuda técnica menor 🟡 PENDIENTE (baja prioridad)

- [ ] `GoogleCalendarToken` interface en `schema.ts`
- [ ] `src/components/landing/FeaturedServices.tsx` y `SalonFeaturedServices.tsx` — eliminar Client SDK de componentes
- [ ] `src/lib/services/catalog.service.ts` — evaluar migración a Admin SDK (actualmente solo lecturas públicas, bajo impacto)
- [ ] `src/lib/services/user.service.ts` — migrar migración legacy a Admin SDK
- [ ] **Decisión arquitectónica:** `technicalRecords` subcolección vs `hairProfile.evolution[]` embebida — definir modelo final e implementar si aplica

---

## Checklist del Peritaje — Estado al 2026-05-28

- [x] Todas las rutas API mapeadas con SDK verificado
- [x] Todas las colecciones Firestore identificadas
- [x] Auth documentado — Admin SDK en `auth.ts` y todos los actions
- [x] `schema.ts` inventariado completo
- [x] `_types_archive.ts` — 5 consumidores activos documentados
- [x] Fases 1–5 verificadas como completas
- [x] Fase 6 (API Routes) — nuevos hallazgos documentados
- [x] Fase 7 (limpieza archive) — pendientes exactos listados
- [x] Fase 8 (deuda menor) — documentada
- [x] `booking-utils.ts` nuevo registrado

---

## Resumen Ejecutivo

**Fases 1–5 completas.** Todos los Server Actions (13 archivos, ~2.700 líneas) usan Admin SDK. El flujo B2C completo —perfil, historial, cabello, favoritos, preferencias, cancelaciones— tiene backend real en Firestore con Admin SDK y reglas de seguridad correctas.

**Trabajo pendiente (Fases 6–8):** Las API Routes de Google Calendar y MercadoPago siguen en Client SDK (~8 archivos), `_types_archive.ts` tiene 5 consumidores activos que bloquean su eliminación, y hay deuda técnica menor de tipos y componentes. Nada de esto bloquea el flujo B2C ni el flujo admin principal; es deuda de consistencia arquitectónica.
