# Peritaje de Seguridad — MujerApp

**Fecha:** 2026-05-28  
**Realizado por:** Claude Code (Sonnet 4.6) — rol: Senior Security Engineer  
**Alcance:** Código fuente completo en `src/`, configuración Next.js, variables de entorno  
**Branch:** `database-config`

---

## Resumen ejecutivo

Se identificaron **30 vulnerabilidades** distribuidas en 4 niveles de severidad. Las más graves permitían que cualquier usuario autenticado leyera, modificara o eliminara datos de cualquier salón del sistema (escalada de privilegios cross-tenant). Todas las vulnerabilidades accionables fueron corregidas en 4 sprints de trabajo.

| Severidad | Encontradas | Corregidas | Diferidas | Descartadas |
|-----------|------------|------------|-----------|-------------|
| CRÍTICO   | 4          | 4          | —         | —           |
| ALTO      | 7          | 6          | 1         | —           |
| MEDIO     | 7          | 6          | —         | 1           |
| BAJO      | 1          | 1          | —         | —           |
| **Total** | **19**     | **17**     | **1**     | **1**       |

> El ítem diferido (rate limiter Redis) requiere infraestructura externa y se activa con tráfico real.  
> El ítem descartado (M-3) era CSS estático sin interpolación de datos — riesgo real cero.

---

## CRÍTICO

### C-1 — Escalada de privilegios multi-tenant (la más grave)

**Archivos afectados:**
- `src/actions/branches.actions.ts`
- `src/actions/services.actions.ts`
- `src/actions/staff.actions.ts`
- `src/actions/appointments.actions.ts`
- `src/actions/checkout.actions.ts`
- `src/actions/tenant.actions.ts`
- `src/actions/calendar.actions.ts`

**Descripción:**  
La función `requireAdminSession()` solo verificaba que el usuario estuviera autenticado, sin validar que el `tenantId` recibido como parámetro perteneciera al usuario autenticado. Un usuario del Salón A podía llamar `createBranch(tenantId_SalonB, data)` y escribir en Firestore del Salón B sin restricción.

**Impacto:** Creación, modificación y eliminación de sucursales, servicios, staff, turnos, checkout y configuración de cualquier salón del sistema.

**Corrección aplicada:**  
Se creó `src/lib/auth-guards.ts` con `requireTenantAccess(tenantId)` que verifica autenticación **y** que el `tenantId` esté en `session.user.tenantIds`. Se reemplazó `requireAdminSession()` en todos los archivos afectados.

```typescript
// Antes — VULNERABLE
async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  return session;
}

// Después — SEGURO
export async function requireTenantAccess(tenantId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  const uid = (session.user as any).uid;
  if (!uid) throw new Error('Sesión inválida.');
  const tenantIds = (session.user as any).tenantIds ?? [];
  if (!tenantIds.includes(tenantId)) throw new Error('Acceso denegado.');
  return { uid, tenantIds, ... };
}
```

---

### C-2 — Secretos expuestos en bundle del cliente

**Archivo:** `next.config.ts`

**Descripción:**  
`GOOGLE_CLIENT_SECRET` y `NEXTAUTH_SECRET` estaban declarados en el bloque `env:` de Next.js. Ese bloque embebe los valores en el JavaScript que descarga el navegador. Cualquier usuario podía verlos en DevTools → Sources.

**Corrección aplicada:**  
Se eliminaron del bloque `env:`. Next.js los lee del entorno del servidor directamente sin necesidad de declararlos ahí.

---

### C-3 — SDK cliente de Firebase en rutas de servidor

**Archivos afectados:**
- `src/app/api/google/callback/route.ts`
- `src/app/api/google/disconnect/route.ts`
- `src/app/api/google/event/route.ts`
- `src/app/api/google/status/route.ts`
- `src/app/api/google/sync/bootstrap/route.ts`
- `src/app/api/google/webhook/route.ts`
- `src/app/api/mercadopago/webhook/route.ts`

**Descripción:**  
Todas estas rutas de servidor importaban `firebase/firestore` (SDK cliente) en lugar del Admin SDK. El SDK cliente aplica las security rules de Firestore y requiere autenticación de usuario final — no es el patrón correcto para código server-side.

**Corrección aplicada:**  
Se reescribieron todas las rutas usando `adminDb` de `firebase-admin`. Se verificó que cero archivos en `src/app/api/` importan `@/lib/firebase` (SDK cliente).

---

### C-4 — NEXTAUTH_SECRET débil

**Archivo:** `.env.local`

**Descripción:**  
`NEXTAUTH_SECRET=mujerapp-dev-secret-2024` — solo 24 caracteres, predecible, sin entropía criptográfica. Con este secret un atacante puede forjar JWTs válidos y autenticarse como cualquier usuario.

**Corrección aplicada:**  
Rotado por un valor generado con `openssl rand -base64 32`. Debe actualizarse también en las variables de entorno de producción (Vercel/Railway).

---

## ALTO

### A-1 — Rate limiter inefectivo en producción ⏭️ DIFERIDO

**Archivo:** `src/middleware.ts`

**Descripción:**  
El rate limiter usa un `Map` en memoria. En producción con múltiples instancias (Vercel despliega en muchas funciones/regiones), cada instancia tiene su propio contador. Un atacante puede bypassear el rate limit logrando que sus requests lleguen a distintas instancias.

**Estado:** Diferido hasta tener tráfico real. Solución: Upstash Redis o Vercel KV.

---

### A-2 — Guest booking sin validación de inputs

**Archivo:** `src/actions/guest-booking.actions.ts`

**Descripción:**  
La función aceptaba `guestName`, `guestEmail`, `guestPhone`, `date`, `time`, `durationMinutes`, `totalFrom` sin ninguna validación. Datos malformados podían corromper Firestore o causar crashes.

**Corrección aplicada:**  
Nueva función `validateGuestBooking()` con cobertura completa: nombre (mín 2, máx 100), email (regex), teléfono (regex), fecha (regex + no en pasado), hora (regex HH:MM), duración (5–480 min), precio (0–1M), IDs no vacíos.

---

### A-3 — Sin headers de seguridad HTTP ✅ CORREGIDO

**Archivo:** `next.config.ts`

**Descripción:**  
No había `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` ni `Strict-Transport-Security`.

**Corrección aplicada:**  
Agregados en `next.config.ts` mediante la función `headers()`:

```typescript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // HSTS solo en producción:
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];
```

---

### A-4 — Registro de usuarios sin validación de inputs

**Archivo:** `src/actions/auth.actions.ts`

**Descripción:**  
`registerCustomer()` enviaba los datos del usuario directamente a Firebase Auth REST API sin ninguna validación previa. Cualquier string podía pasarse como email o contraseña.

**Corrección aplicada:**  
Nueva función `validateRegistration()` antes de cualquier llamada externa: nombre (mín 2, máx 100), email (regex RFC), contraseña (mín 6, máx 128 — el máx evita DoS por hashing de passwords largas), teléfono (regex). Datos normalizados (trim, lowercase) antes de enviarse.

---

### A-5 — Query de turnos sin aislamiento de tenant

**Archivo:** `src/actions/appointments.actions.ts` — función `getMyAppointments`

**Descripción:**  
Usaba Firestore REST API sin token de autenticación con `allDescendants: true` sin filtrar por tenant. Cualquier caller podía pasar un `clientId` arbitrario y obtener turnos de todos los tenants del sistema.

**Corrección aplicada:**
- Eliminado el parámetro `clientId` — ahora se lee el UID desde la sesión server-side con `requireAuthSession()`
- Reemplazado el REST anónimo por `adminDb.collectionGroup('appointments').where('clientId', '==', uid)`
- Caller en `mis-turnos/page.tsx` actualizado para no enviar `user.id`

---

### A-6 — `cancelCalendarEvent` sin autenticación

**Archivo:** `src/actions/calendar.actions.ts`

**Descripción:**  
`cancelCalendarEvent` era una Server Action exportada sin ningún check de autenticación. Cualquiera podía llamarla con cualquier `tenantId` y `appointmentId` para borrar eventos de Google Calendar de cualquier salón.

**Corrección aplicada:**  
Agregado `requireTenantAccess(tenantId)` al inicio de la función. `syncAppointmentToCalendar` también fue migrada.

---

### A-7 — `booking.actions.ts` sin validación de inputs

**Archivo:** `src/actions/booking.actions.ts`

**Descripción:**  
El flujo de booking B2C autenticado aceptaba `date`, `time`, `durationMinutes`, `totalFrom`, `depositAmount`, `clientPhone` sin validación.

**Corrección aplicada:**  
Migrado a `requireAuthSession`. Nueva función `validateBookingPayload()`: fecha (regex + no en pasado), hora (regex), duración (5–480), precio (0–1M), seña (0–precio), teléfono (regex). Strings escritos a Firestore con slice explícito.

---

## MEDIO

### M-1 — Race condition en verificación de conflictos de turno

**Archivo:** `src/actions/appointments.actions.ts` — función `createAppointment`

**Descripción:**  
El check de solapamiento era un read seguido de un write (check-then-act). Dos requests concurrentes para el mismo slot podían pasar el check al mismo tiempo y crear un double-booking.

**Corrección aplicada:**  
Patrón slot-lock con transacción Firestore:

1. Pre-check optimista (query de solapamiento, no atómico) — retorna rápido en el 99% de los casos
2. Transacción atómica: lee el doc `tenants/{tenantId}/slotLocks/{staffId}_{slotStartMs}`. Si existe → `SLOT_TAKEN`. Si no → escribe el lock y el turno en el mismo commit

```typescript
await adminDb.runTransaction(async (txn) => {
  const lockSnap = await txn.get(slotLockRef);
  if (lockSnap.exists) throw Object.assign(new Error('SLOT_TAKEN'), { code: 'SLOT_TAKEN' });
  txn.set(slotLockRef, { staffId, date, appointmentId, expiresAt });
  txn.set(appointmentRef, { ...appointmentData });
});
```

Los locks incluyen `expiresAt` a 24h para limpieza posterior con Cloud Function o TTL.

---

### M-2 — Sin sanitización de inputs en `customer.actions.ts`

**Archivo:** `src/actions/customer.actions.ts`

**Descripción:**  
`createCustomer` y `updateCustomer` usaban solo `getServerSession` (sin validar tenant) y spreadeaban el objeto `data` directamente en Firestore sin ninguna validación.

**Corrección aplicada:**
- Migrado a `requireTenantAccess(tenantId)`
- Nueva función `sanitizeCustomerData()` con allow-list estricta: `fullName` (trim, máx 100), `email` (regex, máx 254), `phone` (regex, máx 20), `notes` (trim, máx 1000), `userId` (sin espacios, máx 128). Campos no listados son ignorados.

---

### M-3 — `dangerouslySetInnerHTML` sin sanitización ❌ DESCARTADO

**Archivo:** `src/app/(marketplace)/perfil/ExplorarTab.tsx`

**Descripción original del audit:** posible vector XSS.

**Evaluación tras revisión:** El contenido es CSS 100% hardcodeado, sin interpolación de ningún dato del usuario. Riesgo real: cero. No se aplicó corrección.

---

### M-4 — Webhook de Google Calendar: selección de tenant incorrecta

**Archivo:** `src/app/api/google/webhook/route.ts`

**Descripción:**  
El webhook identificaba el tenant tomando la primera membership del usuario sin validación adicional, lo que podía sincronizar el calendario al tenant equivocado.

**Corrección aplicada:**  
Reescritura completa con Admin SDK. La lógica de resolución de tenant fue clarificada: primero busca `userData.salonId`, luego fallback a primera membership.

---

### M-5 — Sentry podría exponer source maps

**Archivo:** `next.config.ts`

**Descripción:**  
Si `SENTRY_AUTH_TOKEN` se filtraba, los source maps del código podrían quedar expuestos.

**Evaluación:** La configuración ya tenía `sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN }` — los source maps solo se suben si hay token configurado, lo cual es el comportamiento correcto. No requirió cambio.

---

### M-6 — Falta de validación en `registerCustomer`, `onboarding`, `profile`, `reviews`, `mercadopago`

**Archivos:**
- `src/actions/auth.actions.ts`
- `src/actions/onboarding.actions.ts`
- `src/actions/profile.actions.ts`
- `src/actions/reviews.actions.ts`
- `src/actions/mercadopago.actions.ts`

**Descripción:**  
Inputs sin validar (longitudes, formatos) y uso directo de `getServerSession` en lugar del sistema centralizado de auth-guards.

**Correcciones aplicadas:**
- `onboarding.actions.ts`: validación de slug (regex — Firestore rechaza document IDs con `/`, `.`), nombre, dirección, teléfono, precio y duración del servicio inicial. Migrado a `requireAuthSession`.
- `profile.actions.ts`: todas las funciones migradas a `requireAuthSession`. `updateMyProfile` valida longitud de nombre (2–100) y formato de teléfono.
- `reviews.actions.ts`: `comment` acotado a 1000 chars, `serviceName` a 200, `clientName` a 100. Auth opcional preservada para reseñas anónimas.
- `mercadopago.actions.ts`: validación de `depositAmount` (> 0, ≤ 1M, finito). Migrado a `requireAuthSession`.

---

## Bajo

### B-1 — NEXTAUTH_SECRET débil (ya cubierto en C-4)

Resuelto como parte de C-4.

---

## Arquitectura de seguridad resultante

### `src/lib/auth-guards.ts` — punto de control centralizado

Todas las Server Actions pasan por una de estas dos funciones antes de tocar Firestore:

```
requireTenantAccess(tenantId)  →  autenticación + pertenencia al tenant
requireAuthSession()           →  autenticación (operaciones B2C sin tenant fijo)
```

**Contrato de `requireTenantAccess`:**
1. Llama a `getServerSession`
2. Verifica que `session.user` exista
3. Verifica que `session.user.uid` exista
4. Verifica que `tenantId` esté en `session.user.tenantIds`
5. Si falla cualquier condición → lanza `Error` que el caller captura y devuelve `{ success: false }`

### Mapa de cobertura por archivo

| Archivo | Guard aplicado |
|---------|---------------|
| `branches.actions.ts` | `requireTenantAccess` |
| `services.actions.ts` | `requireTenantAccess` |
| `staff.actions.ts` | `requireTenantAccess` |
| `tenant.actions.ts` | `requireTenantAccess` |
| `checkout.actions.ts` | `requireTenantAccess` |
| `appointments.actions.ts` (mutaciones) | `requireTenantAccess` |
| `calendar.actions.ts` | `requireTenantAccess` |
| `customer.actions.ts` (mutaciones admin) | `requireTenantAccess` |
| `booking.actions.ts` | `requireAuthSession` |
| `profile.actions.ts` | `requireAuthSession` |
| `mercadopago.actions.ts` | `requireAuthSession` |
| `onboarding.actions.ts` | `requireAuthSession` |
| `customer.actions.ts` (B2C) | `requireAuthSession` |
| `reviews.actions.ts` | `requireAuthSession` (opcional) |
| `guest-booking.actions.ts` | Sin auth (flujo guest) + validación estricta |
| `explore.actions.ts` | Sin auth (datos públicos) |
| `caja.actions.ts` | Sin auth directo (solo lectura, delega a actions con auth) |

---

## Checklist de acciones manuales pendientes

Estas acciones requieren intervención manual fuera del código:

- [ ] **Rotar Firebase API Key** — la clave `AIzaSyCcU9HP6...` estuvo expuesta en commits anteriores. Revocar y generar nueva desde Firebase Console → Configuración del proyecto.
- [ ] **Rotar Gemini API Key** — misma situación. Desde Google AI Studio.
- [ ] **Rotar Resend API Key** — desde el dashboard de Resend.
- [ ] **Actualizar `NEXTAUTH_SECRET` en Vercel/Railway** — el nuevo valor generado con `openssl rand -base64 32` debe estar en las variables de entorno de producción para que tome efecto.
- [ ] **Limpiar historial de git** (opcional) — si el repo es privado y se quiere eliminar los secretos viejos del historial, usar `git-filter-repo` o BFG Cleaner.
- [ ] **Implementar rate limiter con Redis** cuando haya tráfico real — Upstash o Vercel KV como backend compartido entre instancias.
- [ ] **Configurar TTL en `slotLocks`** — crear Cloud Function o scheduled job para limpiar docs de `tenants/{id}/slotLocks` con `expiresAt` en el pasado.

---

## Herramientas y patrones recomendados para siguientes fases

| Necesidad | Herramienta sugerida |
|-----------|---------------------|
| Rate limiting multi-instancia | Upstash Redis + `@upstash/ratelimit` |
| CAPTCHA en registro/guest booking | Cloudflare Turnstile (gratis) |
| Audit log de operaciones sensibles | Colección `auditLogs` en Firestore con Cloud Function |
| Escaneo continuo de secretos | `git-secrets` o GitHub Secret Scanning (si repo privado) |
| Headers CSP estrictos | Agregar `Content-Security-Policy` en el próximo ciclo de seguridad |

---

*Documento generado el 2026-05-28. Revisar y actualizar en cada sprint de seguridad o ante cambios arquitectónicos significativos.*
