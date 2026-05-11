# PLAN — Dashboard Admin → Firestore Real

> Generado: 2026-05-11  
> Branch activo: `database-config`  
> Autor del plan: Claude Code + Pedro Vila Mitjana

---

## AUDITORÍA EJECUTADA — Resultados

| Componente | Estado |
|---|---|
| Dashboard principal | `src/app/[tenantSlug]/dashboard/page.tsx` — 1 archivo `'use client'` monolítico, ~1200 líneas, 100% hardcoded |
| PerformanceTabView | ✅ Ya conectado a Firestore (Firebase SDK, onSnapshot) |
| CheckoutDrawer + closeAppointment | ✅ Ya existen y funcionan |
| Google Calendar | ✅ Ya implementado (createCalendarEvent, deleteCalendarEvent, syncAppointmentToCalendar) |
| Tech debt crítico | Todas las actions usan Firebase Client SDK, NO REST API. Documentado como P1 en `tenant.actions.ts`. No se toca para mantener consistencia. |

---

## 1. INVENTARIO DE DATOS HARDCODED

| Sección | Dato ficticio actual | Colección Firestore | Action | Complejidad |
|---|---|---|---|---|
| **Dashboard — Greeting** | Nombre "Valentina" hardcoded | JWT session | `getServerSession` | Bajo |
| **Dashboard — Turnos hoy** | "7 turnos agendados para hoy" | `tenants/{tId}/appointments` | `getAppointmentsToday` | Bajo |
| **Dashboard — Ingresos** | $128,450 + desglose por método | `tenants/{tId}/appointments` | `getDailyMetrics` | Medio |
| **Dashboard — Tendencia** | "+12.5% vs ayer" | `tenants/{tId}/appointments` | `getDailyMetrics` (2 días) | Medio |
| **Dashboard — Desglose MP/Tarjeta/Efectivo** | $65k / $40k / $23k | `tenants/{tId}/appointments` | `getDailyMetrics` | Medio |
| **Dashboard — Próximo turno** | No existe aún en UI | `tenants/{tId}/appointments` | `getNextAppointment` | Bajo |
| **Agenda — PROS** | Valentina, Ana, Julián (array estático) | `tenants/{tId}/staff` | `getStaffForBranch` | Bajo |
| **Agenda — APPTS** | 8 turnos ficticios del día | `tenants/{tId}/appointments` | `getAppointmentsForDay` | Medio |
| **Agenda — CLIENTS_DB** | 6 clientes para el buscador de nuevo turno | `tenants/{tId}/customers` | `searchCustomers` | Bajo |
| **Agenda — SERVICES** | 9 servicios con duración/precio | `tenants/{tId}/services` | `getServices` | Bajo |
| **Agenda — Resumen sidebar** | Confirmados 5 / Pendientes 2 / Sin cobrar 1 / $131k | `tenants/{tId}/appointments` | `getDailyMetrics` | Bajo |
| **Agenda — Lista de espera** | 3 personas hardcoded | `tenants/{tId}/appointments` (status=pending) | `getWaitlist` | Alto |
| **Agenda — Checkout inline** | UI existe, no persiste a Firestore | `tenants/{tId}/appointments` | `closeAppointment` (ya existe) | Bajo |
| **Agenda — Crear turno** | Solo actualiza estado local (useState) | `tenants/{tId}/appointments` | `createAppointment` | Alto |
| **Clientes — Lista** | CLIENTS_DB: 6 clientes estáticos | `tenants/{tId}/customers` | `getCustomers` | Bajo |
| **Clientes — Conteo** | "6 clientes registrados" | `tenants/{tId}/customers` | Derivado de query | Bajo |
| **Clientes — Historial** | Hardcoded en cada cliente | `tenants/{tId}/appointments` | `getCustomerAppointments` | Medio |
| **Clientes — Notas técnicas** | Campo hardcoded por cliente | `tenants/{tId}/customers` (campo `notes`) | `updateCustomer` | Bajo |
| **Servicios — Lista** | SERVICES_DB: 6+ servicios estáticos | `tenants/{tId}/services` | `getServices` | Bajo |
| **Servicios — Profesionales asignados** | `["Valentina", "Ana"]` hardcoded | `tenants/{tId}/staff` | Join staff.services[] | Medio |
| **Config — Nombre / Teléfono / Dirección** | Datos ficticios en inputs | `tenants/{tId}` | `getTenantSettings` (ya existe) | Bajo |
| **Config — Horarios** | No conectado | `tenants/{tId}.businessHours` | `updateTenantSettings` | Bajo |
| **Config — Galería** | URLs de Unsplash hardcoded | `tenants/{tId}.logoUrl / coverImageUrl` | `updateTenantSettings` | Medio |
| **Rendimiento** | ✅ Ya conectado a Firestore real | — | — | Completo |

### Acciones que dispara el admin

| Evento | Lee de Firestore | Escribe en Firestore | Validación |
|---|---|---|---|
| Crear turno | customers (search), services (lista), staff (disponibilidad) | `appointments/{id}` nuevo doc | slot libre, cliente válido |
| Cobrar turno | `appointments/{id}` (monto estimado) | `appointments/{id}` status + paymentMethods + commissionCalculated | amountPaid === total, no cobrado ya |
| Cancelar turno | `appointments/{id}` | `appointments/{id}` status=cancelled | no cancelar cobrados |
| Editar turno | `appointments/{id}` | `appointments/{id}` fecha/staff/servicio | slot libre con nuevo staff |
| Crear/editar cliente | — | `customers/{id}` | email único o phone único |
| Crear/editar servicio | — | `services/{id}` | precio > 0, duración > 0 |
| Guardar config | `tenants/{id}` | `tenants/{id}` | slug disponible |

---

## 2. SCHEMA EXTENDIDO PROPUESTO

Todos los campos nuevos son **opcionales** para compatibilidad con documentos existentes.

```typescript
// En schema.ts — EXTENSIONES (sin breaking changes)

// Customer: agregar ficha técnica + notas
export interface Customer {
  // ... campos existentes sin cambios ...
  notes?: string;                    // NUEVO: notas del profesional (p.ej. fórmula recurrente)
  hairProfile?: {                    // NUEVO: ficha técnica capilar
    type?: string;                   // liso | ondulado | rizado | afro
    thickness?: string;              // fino | normal | grueso
    condition?: string;              // sano | dañado | procesado | muy-dañado
    allergies?: string[];            // ["parafenilendiamina", "amoniaco"]
    goal?: string;                   // texto libre
  };
}

// Appointment: soporte para pago mixto (vs paymentMethod single)
export interface PaymentSplit {      // NUEVO
  efectivo?: number;
  mercadopago?: number;
  tarjeta?: number;
  transferencia?: number;
}
export interface Appointment {
  // ... campos existentes sin cambios ...
  paymentMethods?: PaymentSplit;     // NUEVO: split de métodos (suma === priceFinal)
  staffCommissionAmount?: number;    // NUEVO: comisión en $ calculada al cobrar
}

// Tenant: plan SaaS + configuración de slot
export interface Tenant {
  // ... campos existentes sin cambios ...
  plan?: 'free' | 'basic' | 'premium';            // NUEVO
  slotDurationMinutes?: number;                    // NUEVO: default 30
  cancellationPolicy?: {                           // NUEVO
    hoursInAdvance: number;
  };
}
```

> **Regla de validación:** `efectivo + mercadopago + tarjeta === priceFinal` la hace `closeAppointment` en el servidor. El campo `paymentMethod` (string) existente se mantiene para retrocompatibilidad.

---

## 3. ESTRUCTURA DE FIRESTORE

```
firestore
├── tenants/{tenantId}                       [doc raíz del salón]
│   ├── appointments/{appointmentId}
│   │   Campos: id, tenantId, branchId, clientId, clientName, staffId, staffName,
│   │           serviceIds[], serviceNames, date (Timestamp), durationMinutes,
│   │           status, priceEstimated, priceFinal?, depositAmount?, depositPaid,
│   │           notes?, createdAt, createdBy, googleEventId?, source?,
│   │           amountPaid?, paymentMethod?, paymentMethods?, commissionCalculated?,
│   │           staffCommissionAmount?, checkoutAt?, checkoutBy?,
│   │           isGuestBooking?, guestEmail?, guestPhone?
│   │   Índices compuestos:
│   │     - (date ASC, branchId)            → agenda del día por sucursal
│   │     - (staffId, date ASC)             → disponibilidad del profesional
│   │     - (clientId, date DESC)           → historial de cliente
│   │     - (status, date ASC)              → filtros por estado
│   │     - (date ASC, status)              → métricas diarias
│   │
│   ├── customers/{customerId}
│   │   Campos: id, userId?, fullName, email?, phone?, createdAt,
│   │           metrics: { totalVisits, totalSpent, firstVisit?, lastVisit? },
│   │           hairProfile?, notes?
│   │   Índices:
│   │     - (fullName ASC)                  → search por nombre
│   │     - (metrics.totalSpent DESC)       → ranking VIP
│   │     - (metrics.lastVisit DESC)        → clientes recientes
│   │
│   ├── services/{serviceId}
│   │   Campos: id, name, description?, categoryId?, durationMinutes,
│   │           price (number | ServicePriceByLength), requiresLengthSelection,
│   │           variablePrice, active, image?
│   │   Índices:
│   │     - (active, categoryId)            → catálogo filtrado
│   │
│   ├── staff/{staffId}
│   │   Campos: id, userId?, name, avatarUrl?, role, assignedBranchIds[],
│   │           active, email?, phone?, services[], schedule, commissions
│   │   Índices:
│   │     - (active)                        → staff activo
│   │
│   └── branches/{branchId}
│       Campos: id, name, address, phone?, active, schedule
│
└── users/{uid}                              [perfil global del usuario]
    ├── memberships/{tenantId}
    │   Campos: tenantId, role, joinedAt
    └── integrations/google
        Campos: accessToken, refreshToken, expiryDate, scope
```

---

## 4. REGLAS DE SEGURIDAD DE FIRESTORE PROPUESTAS

```javascript
// Extensión al firestore.rules existente

match /tenants/{tenantId} {
  allow read: if true;  // perfil público
  allow write: if hasRole(tenantId, 'admin');

  match /appointments/{doc} {
    allow read: if hasRole(tenantId, 'admin') || hasRole(tenantId, 'employee');
    allow create: if hasRole(tenantId, 'admin') || hasRole(tenantId, 'employee');
    allow update: if hasRole(tenantId, 'admin') || hasRole(tenantId, 'employee');
    allow delete: if hasRole(tenantId, 'admin');
    // Clientas leen SÓLO sus propios turnos
    allow read: if request.auth != null &&
                   resource.data.clientId == request.auth.uid;
  }

  match /customers/{doc} {
    allow read, write: if hasRole(tenantId, 'admin') || hasRole(tenantId, 'employee');
  }

  match /services/{doc} {
    allow read: if true;  // catálogo público (marketplace)
    allow write: if hasRole(tenantId, 'admin');
  }

  match /staff/{doc} {
    allow read: if true;  // vitrina pública
    allow write: if hasRole(tenantId, 'admin');
  }

  match /branches/{doc} {
    allow read: if true;
    allow write: if hasRole(tenantId, 'admin');
  }
}
```

---

## 5. FASES A–E CON DETALLE

### FASE A — Fundación _(prerequisito de todas las demás)_

**Objetivo:** tipos extendidos + actions de lectura, sin tocar UI

| Archivo | Operación |
|---|---|
| `src/lib/schema.ts` | Agregar `PaymentSplit`, extender `Customer`, `Appointment`, `Tenant` |
| `src/actions/appointments.actions.ts` | **Nuevo** — `getAppointmentsForDay`, `getAppointmentsToday`, `getNextAppointment`, `getDailyMetrics`, `createAppointment`, `cancelAppointment` |
| `src/actions/customer.actions.ts` | Agregar `getCustomers`, `getCustomer`, `getCustomerAppointments`, `updateCustomer` |
| `src/actions/services.actions.ts` | Agregar `getServices` si no existe |

**Estimación: 1 día**

---

### FASE B — Datos de solo lectura _(conexión UI → Firestore)_

**Depende de:** Fase A

| Archivo | Operación |
|---|---|
| `src/app/[tenantSlug]/dashboard/page.tsx` | Extraer `AgendaTabView` y `DashboardTabView` a archivos separados; pasar `tenantId` desde sesión |
| `src/app/[tenantSlug]/dashboard/AgendaTabView.tsx` | **Nuevo** — conectar a `getAppointmentsForDay`, `getStaffForBranch`, `getServices`, `searchCustomers` |
| `src/app/[tenantSlug]/dashboard/DashboardTabView.tsx` | **Nuevo** — conectar a `getDailyMetrics`, `getAppointmentsToday` |
| `src/app/[tenantSlug]/dashboard/ClientesTabView.tsx` | Reemplazar `CLIENTS_DB` por `getCustomers` + `getCustomerAppointments` |
| `src/app/[tenantSlug]/dashboard/ServiciosTabView.tsx` | Reemplazar `SERVICES_DB` por `getServices` |
| `src/app/[tenantSlug]/dashboard/ConfigTabView.tsx` | Cargar con `getTenantSettings`, guardar con `updateTenantSettings` |

**Estimación: 2 días**

---

### FASE C — Mutaciones básicas

**Depende de:** Fase B

| Archivo | Operación |
|---|---|
| `src/actions/appointments.actions.ts` | `createAppointment` completa con validación de slot libre + call a `syncAppointmentToCalendar` |
| `src/actions/checkout.actions.ts` | Extender `closeAppointment` para soportar `PaymentSplit` + validación `efectivo+MP+tarjeta===priceFinal` + calcular `staffCommissionAmount` |
| `src/app/[tenantSlug]/dashboard/AgendaTabView.tsx` | Conectar formulario "Nuevo Turno" a `createAppointment`; conectar "Procesar Cobro" a `closeAppointment` real |
| `src/app/[tenantSlug]/dashboard/ClientesTabView.tsx` | Conectar "Nuevo Cliente", "Editar", notas técnicas a `createCustomer` / `updateCustomer` |

**Estimación: 2 días**

---

### FASE D — Google Calendar sync

**Depende de:** Fase C

**Estado actual:** `syncAppointmentToCalendar` y `cancelCalendarEvent` YA existen. `createCalendarEvent` y `deleteCalendarEvent` YA existen. Solo falta una pieza.

| Archivo | Operación |
|---|---|
| `src/lib/google-calendar.server.ts` | Agregar `updateCalendarEvent` (para reprogramaciones) |
| `src/actions/appointments.actions.ts` | Integrar sync calls en `createAppointment` y `cancelAppointment` (best-effort, nunca bloquean) |

**Estimación: 0.5 días** (la base ya está)

---

### FASE E — Cierre de caja y comisiones

**Depende de:** Fase C

| Archivo | Operación |
|---|---|
| `src/actions/caja.actions.ts` | **Nuevo** — `getCierreCaja(tenantId, date)`: agrupa appointments cobrados, calcula totales por método de pago y comisiones por staff |
| `src/components/admin/CierreCajaDiario.tsx` | Conectar a `getCierreCaja` real; mostrar desglose por profesional |
| `src/app/[tenantSlug]/dashboard/DashboardTabView.tsx` | Integrar componente de cierre de caja |

**Estimación: 1 día**

---

## 6. SCRIPT DE SEED COMPLETO

Archivo: `scripts/seed-dashboard.ts`  
Ejecutar: `npx ts-node scripts/seed-dashboard.ts`

```typescript
// scripts/seed-dashboard.ts
// Idempotente: usa IDs determinísticos para no duplicar en múltiples ejecuciones

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = 'mujer-app';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCcU9HP6ELT0SKyhVXyxMPebE4c5KqTi7g';

// ─── Helpers REST ──────────────────────────────────────────────────────────────

async function firestoreSet(collectionPath: string, docId: string, data: Record<string, any>) {
  const fields = toFirestoreFields(data);
  const url = `${BASE_URL}/${collectionPath}/${docId}?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Error writing ${collectionPath}/${docId}:`, err);
    throw new Error(err);
  }
  console.log(`  ✓ ${collectionPath}/${docId}`);
  return res.json();
}

function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

function toFirestoreValue(v: any): any {
  if (typeof v === 'string')  return { stringValue: v };
  if (typeof v === 'number')  return { integerValue: String(Math.round(v)) };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (v instanceof Date)      return { timestampValue: v.toISOString() };
  if (Array.isArray(v))       return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === 'object')  return { mapValue: { fields: toFirestoreFields(v) } };
  return { nullValue: null };
}

// ─── IDs determinísticos ───────────────────────────────────────────────────────

const TENANT_ID  = 'maison-de-beaute-tenant';
const BRANCH_ID  = 'branch-palermo-001';

const STAFF_IDS = {
  valentina: 'staff-valentina-greco',
  ana:       'staff-ana-lopez',
  marcos:    'staff-marcos-ruiz',
};

const SERVICE_IDS = {
  corte:    'svc-corte-autor',
  balayage: 'svc-balayage-premium',
  manicure: 'svc-manicure-gel',
  keratina: 'svc-keratina',
  mechas:   'svc-mechas-californianas',
};

const CUSTOMER_IDS = [
  'cust-maria-garcia',
  'cust-ana-martinez',
  'cust-laura-rodriguez',
  'cust-sofia-lopez',
  'cust-carolina-silva',
];

// ─── Seed functions ────────────────────────────────────────────────────────────

async function seedTenant() {
  await firestoreSet('tenants', TENANT_ID, {
    id: TENANT_ID,
    name: 'Maison de Beauté',
    slug: 'maison-de-beaute',
    description: 'Salón premium en Palermo, Buenos Aires. Especialistas en técnicas de coloración y tratamientos capilares.',
    address: 'Av. Santa Fe 2850, Palermo, Buenos Aires',
    phone: '+54 11 4832-1234',
    isActivePublicly: true,
    plan: 'premium',
    slotDurationMinutes: 30,
    cancellationPolicy: { hoursInAdvance: 120 },
    createdAt: new Date('2024-01-15'),
    businessHours: {
      monday:    { open: '09:00', close: '19:00', isOpen: true },
      tuesday:   { open: '09:00', close: '19:00', isOpen: true },
      wednesday: { open: '09:00', close: '19:00', isOpen: true },
      thursday:  { open: '09:00', close: '19:00', isOpen: true },
      friday:    { open: '09:00', close: '19:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '00:00', close: '00:00', isOpen: false },
    },
    settings: {
      primaryColor: '#a78bfa',
      currency: 'ARS',
      timezone: 'America/Argentina/Buenos_Aires',
    },
    socialLinks: {
      instagram: 'https://instagram.com/maisondbeaute_ba',
      whatsapp: 'https://wa.me/5491148321234',
    },
  });
}

async function seedBranch() {
  await firestoreSet(`tenants/${TENANT_ID}/branches`, BRANCH_ID, {
    id: BRANCH_ID,
    name: 'Palermo Principal',
    address: 'Av. Santa Fe 2850, Palermo, Buenos Aires',
    phone: '+54 11 4832-1234',
    active: true,
    schedule: {
      monday:    { open: '09:00', close: '19:00', isOpen: true },
      tuesday:   { open: '09:00', close: '19:00', isOpen: true },
      wednesday: { open: '09:00', close: '19:00', isOpen: true },
      thursday:  { open: '09:00', close: '19:00', isOpen: true },
      friday:    { open: '09:00', close: '19:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '00:00', close: '00:00', isOpen: false },
    },
  });
}

async function seedStaff() {
  const staffData = [
    {
      id: STAFF_IDS.valentina,
      name: 'Valentina Greco',
      role: 'Colorista Senior',
      assignedBranchIds: [BRANCH_ID],
      active: true,
      email: 'valentina.greco@maisondbeaute.com',
      phone: '+54 11 4832-1235',
      services: [SERVICE_IDS.balayage, SERVICE_IDS.mechas, SERVICE_IDS.corte, SERVICE_IDS.keratina],
      schedule: {
        monday:    { start: '09:00', end: '19:00', available: true },
        tuesday:   { start: '09:00', end: '19:00', available: true },
        wednesday: { start: '09:00', end: '19:00', available: true },
        thursday:  { start: '09:00', end: '19:00', available: true },
        friday:    { start: '09:00', end: '19:00', available: true },
        saturday:  { start: '09:00', end: '17:00', available: true },
        sunday:    { start: '00:00', end: '00:00', available: false },
      },
      commissions: { default: 40 },
    },
    {
      id: STAFF_IDS.ana,
      name: 'Ana López',
      role: 'Estilista',
      assignedBranchIds: [BRANCH_ID],
      active: true,
      email: 'ana.lopez@maisondbeaute.com',
      phone: '+54 11 4832-1236',
      services: [SERVICE_IDS.corte, SERVICE_IDS.manicure, SERVICE_IDS.keratina],
      schedule: {
        monday:    { start: '09:00', end: '18:00', available: true },
        tuesday:   { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday:  { start: '09:00', end: '18:00', available: true },
        friday:    { start: '09:00', end: '18:00', available: true },
        saturday:  { start: '10:00', end: '16:00', available: true },
        sunday:    { start: '00:00', end: '00:00', available: false },
      },
      commissions: { default: 35 },
    },
    {
      id: STAFF_IDS.marcos,
      name: 'Marcos Ruiz',
      role: 'Barbero',
      assignedBranchIds: [BRANCH_ID],
      active: true,
      email: 'marcos.ruiz@maisondbeaute.com',
      phone: '+54 11 4832-1237',
      services: [SERVICE_IDS.corte],
      schedule: {
        monday:    { start: '10:00', end: '19:00', available: true },
        tuesday:   { start: '10:00', end: '19:00', available: true },
        wednesday: { start: '10:00', end: '19:00', available: true },
        thursday:  { start: '10:00', end: '19:00', available: true },
        friday:    { start: '10:00', end: '19:00', available: true },
        saturday:  { start: '09:00', end: '17:00', available: true },
        sunday:    { start: '00:00', end: '00:00', available: false },
      },
      commissions: { default: 30 },
    },
  ];

  for (const s of staffData) {
    await firestoreSet(`tenants/${TENANT_ID}/staff`, s.id, s);
  }
}

async function seedServices() {
  const services = [
    {
      id: SERVICE_IDS.corte,
      name: 'Corte de Autor',
      description: 'Corte personalizado según morfología facial. Incluye lavado y secado premium.',
      categoryId: 'corte-y-estilo',
      durationMinutes: 60,
      price: 4500,
      requiresLengthSelection: false,
      variablePrice: false,
      active: true,
    },
    {
      id: SERVICE_IDS.balayage,
      name: 'Balayage Premium',
      description: 'Técnica de degradado natural con iluminación personalizada. Tonalización incluida.',
      categoryId: 'color-y-mechas',
      durationMinutes: 180,
      price: 12000,
      requiresLengthSelection: false,
      variablePrice: false,
      active: true,
    },
    {
      id: SERVICE_IDS.manicure,
      name: 'Manicure Gel',
      description: 'Manicura completa con esmalte semipermanente de larga duración.',
      categoryId: 'manos',
      durationMinutes: 60,
      price: 3200,
      requiresLengthSelection: false,
      variablePrice: false,
      active: true,
    },
    {
      id: SERVICE_IDS.keratina,
      name: 'Keratina',
      description: 'Alisado y sellado capilar con keratina brasileña libre de formol.',
      categoryId: 'tratamientos',
      durationMinutes: 120,
      price: 9500,
      requiresLengthSelection: false,
      variablePrice: false,
      active: true,
    },
    {
      id: SERVICE_IDS.mechas,
      name: 'Mechas Californianas',
      description: 'Mechas degradadas de efecto natural con técnica californiana. Tonalización incluida.',
      categoryId: 'color-y-mechas',
      durationMinutes: 180,
      price: 14000,
      requiresLengthSelection: false,
      variablePrice: false,
      active: true,
    },
  ];

  for (const s of services) {
    await firestoreSet(`tenants/${TENANT_ID}/services`, s.id, s);
  }
}

async function seedCustomers() {
  const customers = [
    {
      id: CUSTOMER_IDS[0],
      fullName: 'María García',
      email: 'maria.garcia@gmail.com',
      phone: '+54 9 11 2345-6789',
      createdAt: new Date('2023-03-10'),
      notes: 'Sensibilidad alta en cuero cabelludo. Prefiere tonos fríos sin amoniaco. Fórmula: 9.1 + 8.2 (1:1.5) 20vol.',
      hairProfile: {
        type: 'liso',
        thickness: 'fino',
        condition: 'procesado',
        allergies: ['parafenilendiamina'],
        goal: 'mantener rubio ceniza, sin brillo amarillo',
      },
      metrics: {
        totalVisits: 12,
        totalSpent: 245000,
        firstVisit: new Date('2023-03-10'),
        lastVisit: new Date('2026-05-08'),
      },
    },
    {
      id: CUSTOMER_IDS[1],
      fullName: 'Ana Martínez',
      email: 'ana.martinez@yahoo.com.ar',
      phone: '+54 9 11 5555-1234',
      createdAt: new Date('2023-01-20'),
      notes: 'Cliente de hace 3 años. Siempre toma café solo. Keratina: dejar actuar 15 mins extra por cabello grueso.',
      hairProfile: {
        type: 'ondulado',
        thickness: 'grueso',
        condition: 'sano',
        allergies: [],
        goal: 'volumen controlado, brillo máximo',
      },
      metrics: {
        totalVisits: 23,
        totalSpent: 530000,
        firstVisit: new Date('2023-01-20'),
        lastVisit: new Date('2026-05-10'),
      },
    },
    {
      id: CUSTOMER_IDS[2],
      fullName: 'Laura Rodríguez',
      email: 'laura.rod@hotmail.com',
      phone: '+54 9 11 8765-4321',
      createdAt: new Date('2024-02-05'),
      metrics: {
        totalVisits: 8,
        totalSpent: 120000,
        firstVisit: new Date('2024-02-05'),
        lastVisit: new Date('2026-04-05'),
      },
    },
    {
      id: CUSTOMER_IDS[3],
      fullName: 'Sofía López',
      email: 'sofilopez99@gmail.com',
      phone: '+54 9 11 9876-5432',
      createdAt: new Date('2025-10-01'),
      hairProfile: {
        type: 'rizado',
        thickness: 'normal',
        condition: 'dañado',
        allergies: ['amoniaco'],
        goal: 'recuperar hidratación y definir rizos',
      },
      metrics: {
        totalVisits: 3,
        totalSpent: 45000,
        firstVisit: new Date('2025-10-01'),
        lastVisit: new Date('2026-03-15'),
      },
    },
    {
      id: CUSTOMER_IDS[4],
      fullName: 'Carolina Silva',
      email: 'caro.silva@empresa.com',
      phone: '+54 9 11 4567-8901',
      createdAt: new Date('2023-08-15'),
      metrics: {
        totalVisits: 17,
        totalSpent: 380000,
        firstVisit: new Date('2023-08-15'),
        lastVisit: new Date('2026-04-20'),
      },
    },
  ];

  for (const c of customers) {
    await firestoreSet(`tenants/${TENANT_ID}/customers`, c.id, c);
  }
}

async function seedAppointments() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  monday.setHours(0, 0, 0, 0);

  const dayDate = (offsetDays: number, hour: number, min: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offsetDays);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  const appointments = [
    // Lunes — COBRADO (MercadoPago)
    {
      id: 'appt-001',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[0], clientName: 'María García',
      staffId: STAFF_IDS.valentina, staffName: 'Valentina Greco',
      serviceIds: [SERVICE_IDS.balayage], serviceNames: 'Balayage Premium',
      date: dayDate(0, 9, 0), durationMinutes: 180,
      status: 'cobrado', priceEstimated: 12000, priceFinal: 12000,
      amountPaid: 12000, paymentMethod: 'mercadopago',
      paymentMethods: { mercadopago: 12000 },
      commissionCalculated: 40, staffCommissionAmount: 4800,
      depositAmount: 0, depositPaid: false,
      createdAt: dayDate(0, 9, 0), createdBy: 'admin-seed',
      checkoutAt: dayDate(0, 12, 10), checkoutBy: 'admin-seed',
      source: 'admin',
    },
    // Lunes — COBRADO (Efectivo)
    {
      id: 'appt-002',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[2], clientName: 'Laura Rodríguez',
      staffId: STAFF_IDS.ana, staffName: 'Ana López',
      serviceIds: [SERVICE_IDS.corte], serviceNames: 'Corte de Autor',
      date: dayDate(0, 10, 0), durationMinutes: 60,
      status: 'cobrado', priceEstimated: 4500, priceFinal: 4500,
      amountPaid: 4500, paymentMethod: 'efectivo',
      paymentMethods: { efectivo: 4500 },
      commissionCalculated: 35, staffCommissionAmount: 1575,
      depositAmount: 0, depositPaid: false,
      createdAt: dayDate(0, 10, 0), createdBy: 'admin-seed',
      checkoutAt: dayDate(0, 11, 5), checkoutBy: 'admin-seed',
      source: 'admin',
    },
    // Martes — CONFIRMED
    {
      id: 'appt-003',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[1], clientName: 'Ana Martínez',
      staffId: STAFF_IDS.valentina, staffName: 'Valentina Greco',
      serviceIds: [SERVICE_IDS.mechas], serviceNames: 'Mechas Californianas',
      date: dayDate(1, 9, 0), durationMinutes: 180,
      status: 'confirmed', priceEstimated: 14000,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Martes — CONFIRMED
    {
      id: 'appt-004',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[3], clientName: 'Sofía López',
      staffId: STAFF_IDS.marcos, staffName: 'Marcos Ruiz',
      serviceIds: [SERVICE_IDS.corte], serviceNames: 'Corte de Autor',
      date: dayDate(1, 11, 0), durationMinutes: 60,
      status: 'confirmed', priceEstimated: 4500,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Miércoles — PENDING (desde marketplace)
    {
      id: 'appt-005',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[4], clientName: 'Carolina Silva',
      staffId: STAFF_IDS.ana, staffName: 'Ana López',
      serviceIds: [SERVICE_IDS.manicure], serviceNames: 'Manicure Gel',
      date: dayDate(2, 10, 0), durationMinutes: 60,
      status: 'pending', priceEstimated: 3200,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'marketplace',
    },
    // Miércoles — CONFIRMED
    {
      id: 'appt-006',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[0], clientName: 'María García',
      staffId: STAFF_IDS.valentina, staffName: 'Valentina Greco',
      serviceIds: [SERVICE_IDS.keratina], serviceNames: 'Keratina',
      date: dayDate(2, 14, 0), durationMinutes: 120,
      status: 'confirmed', priceEstimated: 9500,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Jueves — CANCELLED
    {
      id: 'appt-007',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[1], clientName: 'Ana Martínez',
      staffId: STAFF_IDS.ana, staffName: 'Ana López',
      serviceIds: [SERVICE_IDS.corte], serviceNames: 'Corte de Autor',
      date: dayDate(3, 9, 30), durationMinutes: 60,
      status: 'cancelled', priceEstimated: 4500,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Jueves — CONFIRMED
    {
      id: 'appt-008',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[2], clientName: 'Laura Rodríguez',
      staffId: STAFF_IDS.marcos, staffName: 'Marcos Ruiz',
      serviceIds: [SERVICE_IDS.corte], serviceNames: 'Corte de Autor',
      date: dayDate(3, 15, 0), durationMinutes: 60,
      status: 'confirmed', priceEstimated: 4500,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
    // Viernes — COBRADO (split: tarjeta + efectivo)
    {
      id: 'appt-009',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[3], clientName: 'Sofía López',
      staffId: STAFF_IDS.valentina, staffName: 'Valentina Greco',
      serviceIds: [SERVICE_IDS.balayage], serviceNames: 'Balayage Premium',
      date: dayDate(4, 9, 0), durationMinutes: 180,
      status: 'cobrado', priceEstimated: 12000, priceFinal: 12000,
      amountPaid: 12000, paymentMethod: 'tarjeta',
      paymentMethods: { tarjeta: 7000, efectivo: 5000 },
      commissionCalculated: 40, staffCommissionAmount: 4800,
      depositAmount: 0, depositPaid: false,
      createdAt: dayDate(4, 9, 0), createdBy: 'admin-seed',
      checkoutAt: dayDate(4, 12, 0), checkoutBy: 'admin-seed',
      source: 'admin',
    },
    // Viernes — CONFIRMED
    {
      id: 'appt-010',
      tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: CUSTOMER_IDS[4], clientName: 'Carolina Silva',
      staffId: STAFF_IDS.ana, staffName: 'Ana López',
      serviceIds: [SERVICE_IDS.mechas], serviceNames: 'Mechas Californianas',
      date: dayDate(4, 14, 0), durationMinutes: 180,
      status: 'confirmed', priceEstimated: 14000,
      depositAmount: 0, depositPaid: false,
      createdAt: new Date(), createdBy: 'admin-seed', source: 'admin',
    },
  ];

  for (const a of appointments) {
    await firestoreSet(`tenants/${TENANT_ID}/appointments`, a.id, a);
  }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n  Seeding Firestore — Maison de Beaute\n');
  console.log('='.repeat(50));

  try {
    console.log('\n[1/6] Tenant...');
    await seedTenant();

    console.log('\n[2/6] Branch...');
    await seedBranch();

    console.log('\n[3/6] Staff (3)...');
    await seedStaff();

    console.log('\n[4/6] Services (5)...');
    await seedServices();

    console.log('\n[5/6] Customers (5)...');
    await seedCustomers();

    console.log('\n[6/6] Appointments (10, semana actual)...');
    await seedAppointments();

    console.log('\n' + '='.repeat(50));
    console.log('  Seed completo.');
    console.log(`   Tenant ID:  ${TENANT_ID}`);
    console.log(`   Branch ID:  ${BRANCH_ID}`);
    console.log(`   Staff:      3 (Valentina Greco, Ana Lopez, Marcos Ruiz)`);
    console.log(`   Services:   5`);
    console.log(`   Customers:  5`);
    console.log(`   Appts:      10 (semana actual, mix de estados)\n`);
  } catch (err) {
    console.error('\n  Error en seed:', err);
    console.log('\n  Si Firestore rechaza por reglas de seguridad:');
    console.log('   1. Opcion A: bajar temporalmente las reglas en la consola de Firebase → ejecutar seed → restaurar');
    console.log('   2. Opcion B: agregar FIREBASE_SERVICE_ACCOUNT_KEY en .env.local y usar Admin SDK\n');
    process.exit(1);
  }
}

main();
```

> **Nota de permisos:** Las reglas actuales requieren `hasRole(tenantId, 'admin')`. Para ejecutar el seed, bajar temporalmente las reglas a `allow read, write: if true` en la consola de Firebase, ejecutar, y restaurar las reglas originales.

---

## 7. ESTADO DE GOOGLE CALENDAR

| Componente | Archivo | Estado |
|---|---|---|
| OAuth scope `calendar.events` | `src/lib/auth.ts` | ✅ Configurado |
| Token storage `users/{uid}/integrations/google` | `src/lib/auth.ts` callbacks | ✅ Implementado |
| `createCalendarEvent()` | `src/lib/google-calendar.server.ts` | ✅ Existe |
| `deleteCalendarEvent()` | `src/lib/google-calendar.server.ts` | ✅ Existe |
| `updateCalendarEvent()` | `src/lib/google-calendar.server.ts` | ❌ Falta (Fase D) |
| `syncAppointmentToCalendar()` | `src/actions/calendar.actions.ts` | ✅ Existe |
| `cancelCalendarEvent()` | `src/actions/calendar.actions.ts` | ✅ Existe |
| Llamada desde `createAppointment` | `src/actions/appointments.actions.ts` | ❌ Falta (Fase C/D) |
| Llamada desde `cancelAppointment` | `src/actions/appointments.actions.ts` | ❌ Falta (Fase C/D) |
| UI: indicador "sincronizado con GCal" | `AgendaTabView.tsx` | ❌ Falta (Fase D) |

**Credenciales necesarias:** Solo `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` (ya deben estar en `.env.local` dado que el login con Google funciona).

---

## 8. ORDEN DE EJECUCIÓN RECOMENDADO

```
DIA 1 — Fase A (Fundacion)
  1. Extender schema.ts (Customer, Appointment, Tenant)
  2. Crear src/actions/appointments.actions.ts con lecturas
  3. Completar getCustomers/getCustomerAppointments en customer.actions.ts
  4. Ejecutar seed → npx ts-node scripts/seed-dashboard.ts

DIAS 2-3 — Fase B (Solo lectura, conexion UI)
  5. Extraer AgendaTabView y DashboardTabView a archivos propios
  6. Conectar AgendaTabView → appointments + staff + services reales
  7. Conectar ClientesTabView → customers reales
  8. Conectar ServiciosTabView → services reales
  9. Conectar ConfigTabView → tenant settings reales

DIAS 4-5 — Fase C (Mutaciones)
  10. createAppointment con validacion de slot libre
  11. closeAppointment con split de pagos + comision en $
  12. cancelAppointment
  13. createCustomer / updateCustomer con notas y hairProfile

DIA 5.5 — Fase D (Google Calendar — ya 80% listo)
  14. Agregar updateCalendarEvent
  15. Integrar sync calls en createAppointment y cancelAppointment

DIA 6 — Fase E (Cierre de caja)
  16. Crear caja.actions.ts con getCierreCaja
  17. Conectar CierreCajaDiario.tsx a datos reales

Paralelismo posible:
  - Fase B (Config + Servicios) puede ir en paralelo con Fase B (Agenda + Clientes)
  - Fase E puede ir en paralelo con Fase D
```

---

## RESUMEN EJECUTIVO

| Dato | Valor |
|---|---|
| Tabs hardcodeadas | 5 de 6 (Rendimiento ya conectado) |
| Actions nuevas a crear | ~8 en `appointments.actions.ts` + `caja.actions.ts` |
| Actions existentes a extender | `checkout.actions.ts`, `customer.actions.ts`, `calendar.actions.ts` |
| Archivos UI a refactorizar | 5 (`AgendaTabView`, `DashboardTabView`, `ClientesTabView`, `ServiciosTabView`, `ConfigTabView`) |
| Breaking changes en schema | 0 (todos los campos nuevos son opcionales) |
| Google Calendar | 80% listo, falta solo `updateCalendarEvent` y wiring en nuevas actions |
| Estimación total | 6 días de desarrollo |

### Reglas no negociables (resumen)
- `tenantId` siempre del JWT (`session.user.salonId`), nunca de la URL
- Mutaciones solo en `src/actions/` como Server Actions
- Lectura en componentes via llamadas a actions (no SDK directo en Client Components)
- Validación `efectivo + mercadopago + tarjeta === priceFinal` siempre server-side
- Campos nuevos en schema siempre opcionales

---

_Esperando aprobación del plan antes de ejecutar cualquier fase._
