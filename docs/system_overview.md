# System Overview & Architecture Document
**Proyecto:** MujerApp
**Tipo de Documento:** Master Technical Architecture & Onboarding
**Objetivo:** Mapa estructural exhaustivo preparado para asimilación de Agentes IA (0% filler).

---

## 1. Estructura de Carpetas (Project Tree)

El directorio `src/` está estructurado bajo **Next.js App Router**, aplicando separación lógica por dominios (B2B Admin vs B2C Marketplace/Micrositios).

```text
src/
├── actions/                  # Server Actions (Mutaciones a BD: booking, etc.)
├── app/
│   ├── (admin)/              # Entorno Operativo Salones (Dashboard, Agenda)
│   ├── (marketplace)/        # Entorno Global Público (Explore, Landing)
│   │   ├── salones/
│   │   │   └── [tenantSlug]/ # Micrositios Dinámicos por Salón (Vistas B2C)
│   │   ├── explore/          # Vitrina global de búsqueda cruzada
│   │   ├── layout.tsx        # Inyecta LandingHeader global
│   │   └── page.tsx          # Home Page del Marketplace
│   ├── api/auth/             # Endpoints NextAuth
│   ├── globals.css           # Tokens CSS, Tailwind base
│   └── layout.tsx            # Root Layout (Providers de Estado Global y UI)
├── components/
│   ├── charts/               # Gráficos (Recharts) para Dashboard
│   ├── landing/              # UI Global del Marketplace Home
│   ├── marketplace/          # Tarjetas y flujos transversales
│   ├── salon/                # UI Específica del Tenant (SalonHero, Sidebar)
│   └── ui/                   # Design System base (Shadcn UI)
├── contexts/                 # Estados Globales (TenantContext, UserContext, UI)
├── hooks/                    # Lógica de Clientes Analíticas y Seguridad
├── lib/                      # Configuraciones Core (Auth, Firebase, TS Schema)
└── middleware.ts             # Edge Firewall de Vistas Protegidas
```

### Separación de Responsabilidades:
- **Global / Marketplace (`(marketplace)`):** Las vistas principales cargan un shell visual público (`LandingHeader`, `Footer`). Su objetivo es SEO, descubrimiento y routing a micro-espacios.
- **Micrositios (`salones/[tenantSlug]`):** Operan de forma autocontenida pero consumiendo componentes de negocio reactivos. Inyectan un `SalonSidebar` y proveen portales B2C como su propio login y listado de turnos (`dashboard/mis-turnos`).
- **Componentes Compartidos:** Divididos por dominio. Elementos genéricos (`ui/`), lógicas cerradas de despliegue (`salon/`) y elementos mixtos (`marketplace/`). Toda la estilización parte de `globals.css` (Tailwind) preservando consistencia.

---

## 2. Modelo de Datos (Firestore Schema)

El proyecto emplea una arquitectura **Multitenant (SaaS Base)** con aislamiento a nivel de documento raíz y relaciones planas.

### A. Global Data (Fuente de Verdad de Identidades)
- `users/{uid}`: Perfil global. Todo usuario (dueño, empleado o cliente) reside aquí.
- `users/{uid}/memberships/{tenantId}`: Subcolección vital para **RBAC**. Declara el `role` (`'admin' | 'employee' | 'client'`) que el usuario tiene sobre un Tenant particular.
- `users/{uid}/integrations/google`: Guardado persistente cifrado de tokens Refresh y Access de Google API.

### B. Tenant Data (Aislamiento B2B y Catálogos)
Ruta principal: `tenants/{tenantId}`. El doc raíz contiene parámetros de marca (`slug`, `name`, variables visuales) y un flag maestro `isActivePublicly`.

*Lectura Pública (Marketplace / B2C):*
- `tenants/{tenantId}/services/{serviceId}`: Entidades del catálogo. Contiene flags estructurales (`variablePrice`, `requiresLengthSelection`, `active`).
- `tenants/{tenantId}/staff/{staffId}`
- `tenants/{tenantId}/promotions/{promoId}`

*Lectura Restringida (Operativa / Interna):*
- `tenants/{tenantId}/customers/{customerId}`: Libreta CRM autocontenida del Tenant. (El ID de este cliente *es* el UID del usuario global).
- `tenants/{tenantId}/branches/{branchId}`: Infraestructura multi-sucursal local.
- `tenants/{tenantId}/appointments/{appointmentId}`: La transacción core. Almacena metadatos del cliente, IDs de servicios denormalizados (para queries veloces sin JOINS en listados B2B) y status (`pending`, `confirmed`, `completed`).

---

## 3. Reglas de Seguridad (firestore.rules)

Las reglas aplican el marco **Zero Trust** complementado por helpers declarativos (`hasRole(tenantId, role)` y `isTenantMember(tenantId)`).

### Bloqueos y Permisos Restrictivos:
- **Lectura Pública Selectiva:** Se asume `allow read: if true;` EN LA CAPA DE MARCA: `tenants/{tenantId}` y catálogos dependientes (`services`, `promotions`, `staff`). Sólo un `hasRole(tenantId, 'admin')` puede escribirlos.
- **Operaciones Privadas B2B:** `customers` (CRM) y `appointments` sólo se exponen al staff o admin del tenant en curso. La gran validación en cascada impide espionaje de competidores.
- **Collection Group para B2C:** Se declara `match /{path=**}/appointments/{apptId}` que filtra por `resource.data.clientId == request.auth.uid`. Este hack es fundamental para lograr una vista "Mis Turnos" cruzando diferentes peluquerías.
- **Memberships Lockdown:** `users/{userId}/memberships/{tenantId}` está fijado con `allow write: if false;`. Previene severas vulnerabilidades de Privilege Escalation. Ningún cliente in-app puede promover sus roles, sólo el backend.
- **Fase Legacy Archive:** Colecciones como raíz (`/usuarios/`, `/turnos/`, `/servicios/`) operan en un *Legacy Phase 4 Lockdown* estrictamente `allow write: if false`.

---

## 4. Estrategia de Resolución del Tenant (Tenant Resolution)

La app debe determinar el contexto (en qué salón iteramos). Lo hace por dos vías complementarias:

### Vía 1: URL Matching Dinámico (Server Context)
- Componentes bajo `app/(marketplace)/salones/[tenantSlug]/` dependen directamente de `params.tenantSlug`.
- El servicio en SSR dispara `getSalonBySlug(slug)`, el cual consulta Firestore para convertir el Vanity Name URL (slug amigable) hacia el `tenantId` absoluto. Se asume como entorno 100% público.

### Vía 2: Array de Memberships Inyectado (Client Context / Dashboard)
- Interviene `TenantContext.tsx` y consume los `tenantIds` que viven en payload JWT de la Sesión provisto por `NextAuth`.
- En el layout de Admin, la app asigna automáticamente `tenantId = ids[0]` disponible en la sesión y propaga ese ID globalmente hacia Hooks (como `useMetrics` o las peticiones Firestore B2B).
- *Fallback:* Si entra a un dashboard cliente, la sesión detecta vacíos en los array de tenants, reaccionando como un entorno Cliente puro con `tenantId` en estado `null`.

---

## 5. Ecosistema de Auth y Roles (NextAuth + Firebase)

Este pilar realiza una hibridación para saltarnos los problemas del Auth SDK cliente de Firebase en App Router.

- **Puente NextAuth (Server) - Firestore:** En `auth.ts`, el `jwt callback` dispara transacciones. Ante el primer login válido (`account && user`), se busca en Firestore los IDs pertenecientes en `users/{uid}/memberships`. Este array de `tenantIds` se inyecta permanentemente dentro del `token.tenantIds` en JWT sin requerir volver a la BD en cada validación de ruta.
- **Sync con Google Calendar:** El callback interactúa silenciosamente con los subprocesos de acceso para capturar `refreshToken` de la API de Google, inyectarlo en `users/{uid}/integrations/google` y mantener vivos los permisos de agenda del tenant (actualmente validado a un superadmin en desarrollo `admin@mujer.com`).
- **Ciclo Analítico (Cliente):** `UserContext` inicializa `onSnapshot` directamente sobre `users/{uid}`. Luego intersecta ese UID con el `tenantId` arrojando un Estado Global tipado: `{ id, nombre, rol, salonId }`. Es utilizado por `useRole` para renderizaciones condicionales fluidas: `isAdmin`, `isStaff`.

---

## 6. Archivos Clave y Flujos Core

### Edge Firewall
- `middleware.ts`: Controla zonas duras. Redirige anónimos que intentan ingresar a `/(admin)/*` hacia `/login` en el edge layer, evitando filtrados o carga de payloads excesivas en componentes perezosos.

### Server Actions Transactions
- `src/actions/booking.actions.ts`: Interacciones robustas ejecutadas por Node.js Puro. 
  - `getAvailableSlots`: Interpela Firestore filtrando datos sensibles — recibe horas/fechas para evitar inyectar JSONs enteros del staff en payloads públicos.
  - `createBooking`: Ejecuta lógica transaccional. Doble impacto: Reserva en `appointments` y crea o sobreescribe (Merge) un registro Customer encapsulado en el ecosistema del tenant particular. 

### Data APIs y Hooks de Carga Pesada
- `src/lib/services/marketplace.service.ts`: Interactúa via **Firestore REST API (fetch contra runQuery)** . Bypass voluntario al SDK Client de Firestore para habilitar resoluciones de servidor inmediatas contra Slugs en Next.js App Router (evita bugs de inicialización de Contextos Firebase en el servidor Next.js).
- `src/hooks/useMetrics.ts`: Motor Analítico principal. Absorbe todas las matemáticas de ingresos calculando "Hora Pico", tendencias, sumatorias directas y conteos estáticos filtrados bajo `date-fns` por locaciones (`es`). Centralizado para alimentar todo el cluster gráfico B2B.
