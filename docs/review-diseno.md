# Review de Diseno Arquitectonico — MujerApp

**Fecha**: 2026-04-03 | **Rama**: `database-config` | **Evaluador**: Agente de Diseno

---

## 1. Puntos Fuertes del Diseno

### 1.1 Arquitectura Multi-Tenant Bien Modelada en Firestore

El schema de Firestore sigue un patron `tenants/{tenantId}/*` con aislamiento real por tenant. Las reglas de seguridad implementan RBAC mediante `hasRole()` e `isTenantMember()` que leen de `users/{uid}/memberships/{tenantId}`. Esto es correcto para B2B2C:

- **Catalogo publico** (services, staff, promotions) con `allow read: if true` — correcto para marketplace.
- **Datos privados** (customers, appointments, branches) protegidos por rol — correcto para CRM del salon.
- **Collection group query** en appointments con filtro `clientId == auth.uid` — permite la vista B2C cross-tenant sin romper aislamiento.
- **Memberships bloqueadas a write: false** — los roles no son auto-asignables, lo cual es seguro.

### 1.2 Separacion Server/Client Components

La separacion esta bien aplicada en los casos donde existe:

- `marketplace.service.ts` usa Firestore REST API directamente, evitando el Firebase Client SDK en Server Components. Esto es un patron correcto para SSR en Next.js 15.
- `booking.actions.ts` usa Server Actions con `getServerSession()` para validar autenticacion antes de mutaciones. Correcto.
- Los layouts de `(admin)` y `(marketplace)` mantienen la logica de contexto del lado cliente en proveedores separados.

### 1.3 Schema de Datos Razonable

- `Appointment` incluye denormalizacion intencional (`clientName`, `staffName`, `serviceNames`) — correcto para listas sin JOINs en Firestore.
- `Customer` tiene `metrics` embebido — evita queries de agregacion costosas para KPIs basicos.
- `Staff.assignedBranchIds` permite multi-branch a nivel de datos.
- Separacion entre `UserProfile` (global) y `Customer` (por tenant) es correcta para el modelo B2B2C: el usuario global reserva, y el salon tiene su vista CRM local.

### 1.4 El Plan (PLAN.md) es Coherente con la Realidad

El PLAN.md refleja con precision el estado actual del codigo. Los porcentajes de avance, la deuda tecnica identificada, y las dependencias entre fases son realistas. No hay promesas infladas ni modulos fantasma. El roadmap de 4 fases con criterios de "done" concretos es ejecutable.

---

## 2. Debilidades Arquitectonicas

### 2.1 CRITICA: Autenticacion con Doble Identidad sin Reconciliar

El sistema tiene un problema de diseno fundamental: **dos sistemas de identidad coexisten sin un flujo de reconciliacion claro**.

- **Google OAuth** genera un UID de NextAuth (no de Firebase Auth).
- **Credentials provider** usa `signInWithEmailAndPassword` de Firebase Auth, que si genera un UID de Firebase.
- El `jwt` callback asume que `user.id` es un UID de Firebase para buscar memberships en `users/{uid}/memberships/`, pero para Google OAuth el `user.id` es el ID de NextAuth, no un UID de Firebase Auth.

**Impacto**: Un usuario que inicia sesion con Google no tendra memberships en Firestore a menos que exista un flujo manual de creacion del documento `users/{googleId}`. Las reglas de Firestore usan `request.auth.uid` que proviene de Firebase Auth, pero las llamadas desde Server Actions usan el Firebase Client SDK con el contexto de NextAuth, no de Firebase Auth. Esto crea una desconexion potencial entre quien NextAuth cree que es el usuario y quien Firestore cree que es.

**Recomendacion**: Definir explicitamente si Firebase Auth es la fuente de verdad de identidad o si NextAuth lo es. Si es Firebase Auth, el flujo de Google OAuth deberia crear/vincular un usuario de Firebase Auth con Custom Tokens. Si es NextAuth, las reglas de Firestore deberian relajarse para las escrituras desde Server Actions (que ya validan sesion) y las lecturas cliente deberian usar Firebase Auth anonymous o custom tokens mapeados al UID de NextAuth.

### 2.2 CRITICA: Hardcoding de `admin@mujer.com` como Superuser Implícito

El email `admin@mujer.com` aparece en 4 ubicaciones como backdoor de acceso:

1. `auth.ts:127` — Solo guarda tokens de Calendar si el email es `admin@mujer.com`.
2. `UserContext.tsx:42` — Asigna rol `admin` si no hay membership pero el email coincide.
3. `user.service.ts:40` — Crea perfil hardcodeado para este email.
4. `firestore.rules` (lineas 97, 109, 114, 128) — Acceso a colecciones legacy por email match.

Esto no es solo deuda tecnica (credenciales de test); es un **defecto de diseno de autorizacion**. No existe un concepto de "superadmin de plataforma" en el schema ni en las reglas. El plan lo lista como tarea 0.2 pero subestima la complejidad: eliminar este email requiere un flujo de creacion de superadmin y una migracion de reglas de Firestore.

### 2.3 ALTA: Server Actions Usan Firebase Client SDK (No Admin SDK)

`booking.actions.ts` importa `db` de `@/lib/firebase` (Client SDK) y ejecuta `setDoc` directamente. Esto tiene dos problemas:

1. **No bypasea las reglas de Firestore**: El Client SDK se ejecuta con las credenciales del browser (o sin credenciales en el server). En el server, el Client SDK no tiene `request.auth`, por lo que las reglas de seguridad que dependen de `request.auth.uid` fallaran o se evaluaran como no autenticado.
2. **La sesion se valida con NextAuth pero la escritura no hereda esa identidad**: `getServerSession()` verifica que hay un JWT valido, pero Firestore no sabe nada sobre ese JWT.

**Impacto**: Las escrituras desde Server Actions probablemente funcionan solo porque las reglas de Firestore son lo suficientemente permisivas (el `allow create` de appointments permite `request.auth != null && request.resource.data.clientId == request.auth.uid`, pero si el Client SDK no autentica contra Firebase Auth, este check falla). Es probable que en produccion esto solo funcione si el Client SDK tiene auth inicializado, lo cual no esta garantizado en el server.

**Recomendacion**: Las Server Actions deberian usar el Firebase Admin SDK (`firebase-admin`), que bypasea las reglas de seguridad. La validacion de autorizacion se hace en el codigo del Server Action (ya existe con `getServerSession`), no en las reglas de Firestore. Este es el patron estandar para Next.js + Firebase.

### 2.4 ALTA: TenantContext no Persiste branchId ni Valida Memberships

`TenantContext.tsx` selecciona automaticamente `ids[0]` como tenant activo, pero:

- No persiste la seleccion en localStorage ni en la URL — un refresh pierde el contexto.
- No valida que el usuario realmente tenga la membership que dice tener (confía ciegamente en el JWT).
- `branchId` empieza en `null` y "cada vista lo setea segun necesidad", pero en la practica muchas vistas hardcodean `sucursal_centro` en lugar de usar el contexto.

**Recomendacion**: El `branchId` deberia resolverse automaticamente al branch default del tenant (o al unico branch si solo hay uno). El TenantContext deberia persistir en la URL (path param o query) para que sea bookmarkeable y shareable.

### 2.5 MEDIA: Duplicacion de Schema (types.ts vs schema.ts)

Existen dos archivos de tipos que modelan las mismas entidades con nombres diferentes:

| `types.ts` (legacy) | `schema.ts` (nuevo) |
|---|---|
| `UserRole = 'admin' \| 'empleada' \| 'clienta'` | `UserRole = 'admin' \| 'employee' \| 'client'` |
| `Turno` con `estado: 'pendiente'` | `Appointment` con `status: 'pending'` |
| `Servicio` con `nombre`, `duracion` | `Service` con `name`, `durationMinutes` |
| `Cliente` con `nombre`, `apellido` | `Customer` con `fullName` |

El `UserContext.tsx` importa `UserRole` de `types.ts`, no de `schema.ts`. Esto significa que la UI trabaja con roles en espanol (`'admin' | 'empleada' | 'clienta'`) mientras que Firestore tiene roles en ingles (`'admin' | 'employee' | 'client'`). Si bien `admin` coincide, `empleada` != `employee` y `clienta` != `client`.

**Impacto**: Bugs silenciosos de matching de roles. El `useRole` hook devuelve `role` de Firestore (ingles), pero el `UserContext` asigna `rol` de tipo `UserRole` de `types.ts` (espanol). La comparacion `userRole === 'admin'` funciona por coincidencia, pero cualquier check de `empleada` vs `employee` fallaria.

**Recomendacion**: Deprecar `types.ts` formalmente. Hacer que todo el codigo use `schema.ts`. Esto es prerequisito para la Fase 0.

### 2.6 MEDIA: Middleware Incompleto

El matcher del middleware solo cubre rutas admin (`/agenda`, `/clientes`, `/dashboard`, `/servicios`, `/turnos`, `/mis-turnos`). No protege:

- `/admin/seed` y `/admin/migrate` — rutas de utilidad que permiten modificar datos.
- `/salones/[slug]/dashboard` — portal del cliente que deberia requerir autenticacion.

Ademas, el middleware solo verifica que el token existe (`!!token`), no verifica roles ni membership al tenant. Cualquier usuario autenticado puede acceder a cualquier ruta admin de cualquier salon.

---

## 3. Decisiones de Diseno Pendientes (Bloquean Implementacion)

### 3.1 Firebase Auth vs NextAuth como Fuente de Verdad de Identidad

**Status**: No decidido. Actualmente ambos coexisten de forma ambigua.

**Opciones**:
- A) Firebase Auth es master, NextAuth es solo session manager -> Usar Custom Tokens para Google OAuth, Firebase Admin SDK en server.
- B) NextAuth es master, Firebase solo es la base de datos -> Usar Admin SDK en todas las operaciones server-side, reglas de Firestore relajadas para backend.

**Recomendacion**: Opcion B es mas pragmatica dado el estado actual. NextAuth ya gestiona la sesion, y las Server Actions ya validan con `getServerSession`. Adoptar Firebase Admin SDK en el server elimina la dependencia de Firebase Auth client-side para operaciones de escritura.

### 3.2 Estrategia de Pagos

**Status**: No iniciado. El plan menciona Stripe y MercadoPago como opciones.

**Decision pendiente**: Mercado unico (LATAM con MercadoPago) o multi-region (Stripe). Esto afecta el schema (`Appointment.depositAmount` ya existe, pero falta `paymentIntentId`, `paymentProvider`, `paymentStatus`).

### 3.3 Modelo de Multi-Branch

**Status**: Schema listo, implementacion 0%.

**Decision pendiente**: Como se resuelve el branch activo. Opciones:
- A) URL path-based: `/salon/[slug]/branch/[branchSlug]/dashboard`
- B) Selector en UI con persistencia en contexto/localStorage
- C) Default branch por tenant con override manual

**Recomendacion**: Opcion C para MVP. Un tenant nuevo tiene 1 branch. El selector aparece solo cuando hay 2+.

### 3.4 Estrategia de Migracion de `types.ts` a `schema.ts`

**Status**: No planificada formalmente.

**Decision pendiente**: Migrar de golpe (breaking change) o mantener un mapper. Dado que no hay tests, una migracion gradual con adaptadores es mas segura pero introduce complejidad. Una migracion de golpe es mas limpia pero arriesgada sin cobertura de tests.

### 3.5 Notifications Architecture

**Status**: Resend para email parcialmente implementado. Sin push ni SMS.

**Decision pendiente**: Cola de notificaciones centralizada (Cloud Tasks / PubSub) vs llamadas directas. Para recordatorios de 24h se necesita un scheduler (Cloud Scheduler + Cloud Functions o un cron job).

---

## 4. Evaluacion: Coherencia Plan vs Arquitectura

| Aspecto | Coherencia | Notas |
|---|---|---|
| Estructura de rutas | Alta | El plan describe con precision los route groups `(admin)` y `(marketplace)` |
| Estado de modulos | Alta | Los porcentajes de avance son realistas |
| Deuda tecnica | Alta | Todas las issues listadas se verificaron en el codigo |
| Firestore schema | Alta | `schema.ts` coincide con las reglas de Firestore |
| Estimaciones de tiempo | Media | Las estimaciones asumen que la decision auth (3.1) ya esta tomada; sin ella, Fase 0 se extiende |
| Estrategia de equipo | Media | Feature ownership es correcto, pero la lista de "archivos de alto riesgo de conflicto" deberia incluir `types.ts` y `Providers.tsx` |
| Riesgos | Media-Alta | Falta el riesgo de la doble identidad (2.1) que es mas critico que varios P1 listados |

---

## 5. Recomendaciones Priorizadas

### Antes de Fase 0 (Decisiones Arquitectonicas)

1. **Decidir la fuente de verdad de identidad** (Firebase Auth vs NextAuth). Esto afecta Fase 0, 1, 2 y 3.
2. **Adoptar Firebase Admin SDK** para todas las Server Actions. Es un cambio de 1-2 dias pero desbloquea escrituras seguras.
3. **Deprecar `types.ts` oficialmente** y crear un PR unico que migre todas las referencias a `schema.ts`.

### Fase 0 (Agregar al Scope)

4. **Eliminar el backdoor de `admin@mujer.com`** de forma integral (no solo las credenciales de login, sino los checks condicionales en auth.ts, UserContext, y user.service).
5. **Agregar role-check al middleware** — verificar que el usuario tenga membership al tenant de la ruta, no solo que tenga un token valido.
6. **Resolver la ambiguedad de roles espanol/ingles** como parte de la deprecacion de `types.ts`.

### Mejoras de Diseno para Fase 1

7. **TenantContext deberia resolver branchId automaticamente** del branch default del tenant, en lugar de dejarlo en null.
8. **Las rutas admin deberian incluir el tenantId en la URL** (`/[tenantSlug]/dashboard`) para soportar multi-tenant real y evitar depender solo del contexto cliente.
9. **Implementar error boundaries por route group** — el `(admin)/error.tsx` existe pero `(marketplace)` no tiene uno.

---

## 6. Resumen Ejecutivo

El diseno arquitectonico de MujerApp es **solido en su capa de datos** (Firestore schema + reglas de seguridad) pero tiene **debilidades significativas en la capa de autenticacion/autorizacion** que el plan actual subestima. La coexistencia de NextAuth y Firebase Auth sin una estrategia clara de reconciliacion es el riesgo arquitectonico mas grande, y no esta listado en la tabla de riesgos del plan.

El PLAN.md es un documento de alta calidad que refleja fielmente el estado del codigo. Sin embargo, la Fase 0 necesita expandirse para incluir la decision de identidad y la migracion a Firebase Admin SDK antes de que las fases subsiguientes puedan avanzar de forma segura.

La separacion Server/Client Components esta bien aplicada donde existe, pero hay inconsistencias (Server Actions usando Client SDK) que indican que el patron no esta completamente internalizado en el equipo.

**Veredicto**: El plan es ejecutable con las correcciones listadas arriba. La decision de identidad (seccion 3.1) es el unico bloqueante real que debe resolverse antes de iniciar la Fase 0.
