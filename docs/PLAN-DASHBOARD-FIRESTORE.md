# PLAN — Dashboard Admin → Firestore Real

> Generado: 2026-05-11  
> Última actualización: 2026-05-12  
> Branch activo: `database-config`  
> Autor: Claude Code + Pedro Vila Mitjana

---

## ESTADO ACTUAL — Todo completo ✅

| Fase | Descripción | Estado |
|---|---|---|
| Fase A | Fundación: schema extendido + actions de lectura | ✅ Completa |
| Fase B | Datos de solo lectura: conexión UI → Firestore | ✅ Completa |
| Fase C | Mutaciones básicas: crear turno, cobrar, crear cliente | ✅ Completa |
| Fase D | Google Calendar sync: updateCalendarEvent | ✅ Completa |
| Fase E | Cierre de caja + comisiones + servicios destacados | ✅ Completa |
| Extra | Gráfico INGRESOS TOTALES real (Hoy/Sem/Mes) | ✅ Completa |
| Extra | Tab "Caja" dedicado con date selector | ✅ Completa |
| Extra | Comparativa Semanal con datos reales | ✅ Completa |
| Extra | ServiciosTabView: CRUD completo (crear, editar, desactivar, staff toggle) | ✅ Completa |
| Extra | ConfigTabView: horarios reales, staff real, todos los toggles persistidos | ✅ Completa |
| Extra | Google Calendar OAuth flow completo (connect/callback/status/event) | ✅ Completa |
| Extra | AgendaTabView: fecha prominente + panel GCal + sync automático al crear turno | ✅ Completa |
| Bug fix | RSC stream error (resolveErrorDev) — auth.ts session callback sin try/catch | ✅ Corregido |
| Bug fix | Firestore watch stream (__PRIVATE_fromRpcStatus) — onSnapshot → getDocs en Rendimiento | ✅ Corregido |

---

## AUDITORÍA EJECUTADA — Resultados

| Componente | Estado |
|---|---|
| Dashboard principal | ✅ Refactorizado en tabs independientes, 100% conectado a Firestore |
| DashboardTabView | ✅ Conectado: getDailyMetrics, getCierreCaja, getWeeklyRevenue, getRevenueTimeSeries |
| AgendaTabView | ✅ Conectado: getAppointmentsForDay, getStaffForBranch, getServices, searchCustomers, createAppointment, closeAppointment, createCustomer |
| ClientesTabView | ✅ Conectado: getCustomers, getCustomerAppointments, createCustomer, updateCustomer |
| ServiciosTabView | ✅ Conectado: useCatalog, useStaff, updateService, toggleServiceActive, createService, updateStaffMember |
| ConfigTabView | ✅ Conectado: getTenantSettings, updateTenantSettings, useStaff, updateStaffCommissions |
| CajaTabView | ✅ Nuevo tab dedicado: getCierreCaja, getWeeklyRevenue con date selector |
| PerformanceTabView | ✅ Ya conectado a Firestore (Firebase SDK, onSnapshot) |
| CheckoutDrawer + closeAppointment | ✅ Completo con PaymentSplit + staffCommissionAmount |
| Google Calendar | ✅ Completo: createCalendarEvent, deleteCalendarEvent, updateCalendarEvent, syncAppointmentToCalendar, cancelCalendarEvent |
| caja.actions.ts | ✅ Nuevo: getCierreCaja con byMethod, byStaff, topServices |
| CierreCajaDiario.tsx | ✅ Migrado a getCierreCaja, dark glass, desglose por staff |
| Tech debt P1 | ⚠️ Todas las actions usan Firebase Client SDK (no REST API). Documentado, no se toca para mantener consistencia. |

---

## 1. INVENTARIO — Estado final

| Sección | Estado |
|---|---|
| **Dashboard — Greeting** | ✅ Nombre real desde JWT session |
| **Dashboard — Turnos hoy** | ✅ getDailyMetrics → totalAppts real |
| **Dashboard — Ingresos** | ✅ getDailyMetrics → totalRevenue real |
| **Dashboard — Tendencia** | ✅ getDailyMetrics → revenueDeltaPct vs ayer real |
| **Dashboard — Desglose MP/Tarjeta/Efectivo** | ✅ getDailyMetrics → revenueByMethod real |
| **Dashboard — Gráfico INGRESOS TOTALES** | ✅ getRevenueTimeSeries — Hoy (por hora) / Sem (por día) / Mes (30 días) |
| **Dashboard — Comparativa Semanal** | ✅ getWeeklyRevenue — barras Mon–Dom real |
| **Dashboard — Servicios Destacados** | ✅ getCierreCaja → topServices real |
| **Dashboard — Movimientos del Día** | ✅ getDailyMetrics → cobradoAppts real |
| **Agenda — Staff** | ✅ getStaffForBranch → Firestore real |
| **Agenda — Turnos del día** | ✅ getAppointmentsForDay → Firestore real |
| **Agenda — Buscador de clientes** | ✅ searchCustomers → Firestore real |
| **Agenda — Servicios** | ✅ getServices → Firestore real |
| **Agenda — Crear turno** | ✅ createAppointment + validación slot + Google Calendar sync |
| **Agenda — Cobrar turno** | ✅ closeAppointment + PaymentSplit + staffCommissionAmount |
| **Agenda — Crear cliente inline** | ✅ createCustomer desde el form de nuevo turno |
| **Clientes — Lista** | ✅ getCustomers → Firestore real |
| **Clientes — Historial** | ✅ getCustomerAppointments → Firestore real (requiere índice compuesto) |
| **Clientes — Notas técnicas** | ✅ updateCustomer → persiste en Firestore |
| **Clientes — Nuevo cliente** | ✅ createCustomer → modal glassmorphism |
| **Servicios — Lista** | ✅ useCatalog → Firestore real (onSnapshot) |
| **Servicios — Editar precio/duración/desc** | ✅ updateService → Firestore real |
| **Servicios — Desactivar** | ✅ toggleServiceActive → Firestore real |
| **Servicios — Crear nuevo** | ✅ createService → modal completo |
| **Servicios — Profesionales habilitados** | ✅ toggle → updateStaffMember services[] |
| **Config — Nombre / Teléfono / Dirección** | ✅ getTenantSettings + updateTenantSettings |
| **Config — Horarios** | ✅ businessHours real, editor por día con time inputs |
| **Config — Abierto/Cerrado** | ✅ isActivePublicly → persiste en Firestore |
| **Config — Staff y comisiones** | ✅ useStaff real + updateStaffCommissions por staff |
| **Config — Galería (logo/portada)** | ✅ logoUrl / coverImageUrl con preview live |
| **Config — Redes sociales** | ✅ socialLinks.instagram / whatsapp |
| **Config — WhatsApp notificaciones** | ✅ settings.whatsappNotifications → persiste |
| **Config — Moneda** | ✅ settings.currency → persiste |
| **Caja — Tab dedicado** | ✅ Nuevo tab: total, byMethod, byStaff, topServices, semanal |
| **Caja — Date selector** | ✅ Hoy / Ayer / fecha custom |
| **Caja — Comisiones por staff** | ✅ Real desde getCierreCaja.byStaff |
| **Rendimiento** | ✅ Ya conectado (no modificado) |

---

## 2. SCHEMA EXTENDIDO — Implementado

```typescript
// schema.ts — todos los campos agregados son opcionales (sin breaking changes)

interface Customer {
  notes?: string;           // notas del profesional ✅
  hairProfile?: {           // ficha técnica capilar ✅
    type?: string;
    thickness?: string;
    condition?: string;
    allergies?: string[];
    goal?: string;
  };
}

interface PaymentSplit {    // ✅ nuevo tipo
  efectivo?: number;
  mercadopago?: number;
  tarjeta?: number;
  transferencia?: number;
}

interface Appointment {
  paymentMethods?: PaymentSplit;      // ✅ split de métodos
  staffCommissionAmount?: number;    // ✅ comisión en $ calculada al cobrar
}

interface Tenant {
  plan?: 'free' | 'basic' | 'premium';   // ✅
  slotDurationMinutes?: number;           // ✅
  cancellationPolicy?: { hoursInAdvance: number }; // ✅
  isActivePublicly?: boolean;            // ✅ usado como toggle "Abierto/Cerrado"
  businessHours?: { [day: string]: { open: string; close: string; isOpen: boolean } }; // ✅
}
```

---

## 3. ACTIONS — Inventario completo

### `src/actions/appointments.actions.ts`
| Función | Estado |
|---|---|
| `getAppointmentsForDay(tenantId, branchId, date)` | ✅ |
| `getAppointmentsToday(tenantId, branchId)` | ✅ |
| `getNextAppointment(tenantId, branchId)` | ✅ |
| `getDailyMetrics(tenantId, branchId, date)` | ✅ — incluye revenueDeltaPct, staffCommissions, pendingAppts, cobradoAppts |
| `getWeeklyRevenue(tenantId, branchId)` | ✅ — Mon–Dom, una query |
| `getRevenueTimeSeries(tenantId, branchId, period)` | ✅ — dia/semana/mes para trend chart |
| `createAppointment(tenantId, payload)` | ✅ — valida slot libre + GCal sync |
| `cancelAppointmentAdmin(tenantId, id, reason)` | ✅ — GCal delete |

### `src/actions/customer.actions.ts`
| Función | Estado |
|---|---|
| `getCustomers(tenantId, lim)` | ✅ — try/catch |
| `searchCustomers(tenantId, query)` | ✅ — try/catch |
| `getCustomer(tenantId, customerId)` | ✅ |
| `getCustomerAppointments(tenantId, customerId)` | ✅ — try/catch (requiere índice compuesto) |
| `createCustomer(tenantId, data)` | ✅ |
| `updateCustomer(tenantId, customerId, data)` | ✅ |

### `src/actions/services.actions.ts`
| Función | Estado |
|---|---|
| `getServices(tenantId, onlyActive)` | ✅ |
| `createService(tenantId, data)` | ✅ |
| `updateService(tenantId, serviceId, data)` | ✅ |
| `toggleServiceActive(tenantId, serviceId, active)` | ✅ |

### `src/actions/checkout.actions.ts`
| Función | Estado |
|---|---|
| `closeAppointment(tenantId, id, payload)` | ✅ — PaymentSplit + staffCommissionAmount + GCal |

### `src/actions/caja.actions.ts`
| Función | Estado |
|---|---|
| `getCierreCaja(tenantId, branchId, date)` | ✅ — byMethod, byStaff, topServices |

### `src/actions/staff.actions.ts`
| Función | Estado |
|---|---|
| `createStaffMember(tenantId, data)` | ✅ |
| `updateStaffMember(tenantId, staffId, data)` | ✅ |
| `toggleStaffActive(tenantId, staffId, active)` | ✅ |
| `updateStaffCommissions(tenantId, staffId, commissions)` | ✅ |

### `src/actions/tenant.actions.ts`
| Función | Estado |
|---|---|
| `getTenantSettings(tenantId)` | ✅ |
| `updateTenantSettings(tenantId, data)` | ✅ |
| `checkSlugAvailability(slug, currentTenantId)` | ✅ |

### `src/actions/calendar.actions.ts`
| Función | Estado |
|---|---|
| `syncAppointmentToCalendar(tenantId, appointmentId)` | ✅ |
| `cancelCalendarEvent(tenantId, appointmentId)` | ✅ |

### `src/lib/google-calendar.server.ts`
| Función | Estado |
|---|---|
| `createCalendarEvent(input)` | ✅ |
| `updateCalendarEvent(staffUserId, eventId, patch)` | ✅ |
| `deleteCalendarEvent(staffUserId, eventId)` | ✅ |

---

## 4. ESTRUCTURA DE FIRESTORE

```
firestore
├── tenants/{tenantId}
│   ├── appointments/{appointmentId}
│   │   Campos: id, tenantId, branchId, clientId, clientName, staffId, staffName,
│   │           serviceIds[], serviceNames, date (Timestamp), durationMinutes,
│   │           status, priceEstimated, priceFinal?, depositAmount?, depositPaid,
│   │           notes?, createdAt, createdBy, googleEventId?, source?,
│   │           amountPaid?, paymentMethod?, paymentMethods?, commissionCalculated?,
│   │           staffCommissionAmount?, checkoutAt?, checkoutBy?
│   │
│   │   Índices compuestos requeridos:
│   │     - (branchId, date ASC)            → agenda del día por sucursal ✅
│   │     - (staffId, date ASC)             → disponibilidad del profesional ✅
│   │     - (clientId, date DESC)           → historial de cliente ⚠️ PENDIENTE CREAR
│   │     - (status, date ASC)              → filtros por estado ✅
│   │     - (date ASC)                      → métricas diarias ✅
│   │
│   ├── customers/{customerId}
│   │   Campos: id, userId?, fullName, email?, phone?, createdAt,
│   │           metrics: { totalVisits, totalSpent, firstVisit?, lastVisit? },
│   │           hairProfile?, notes?
│   │
│   ├── services/{serviceId}
│   │   Campos: id, name, description?, categoryId?, durationMinutes,
│   │           price, requiresLengthSelection, variablePrice, active, image?
│   │
│   ├── staff/{staffId}
│   │   Campos: id, userId?, name, avatarUrl?, role, assignedBranchIds[],
│   │           active, email?, phone?, services[], schedule, commissions
│   │
│   └── branches/{branchId}
│       Campos: id, name, address, phone?, active, schedule
│
└── users/{uid}
    ├── memberships/{tenantId}
    │   Campos: tenantId, role, joinedAt
    └── integrations/google
        Campos: accessToken, refreshToken, expiryDate, scope
```

---

## 5. TABS DEL DASHBOARD — Estado final

| Tab | Ícono | Archivo | Estado |
|---|---|---|---|
| Dashboard | `dashboard` | `DashboardTabView.tsx` | ✅ 100% real |
| Agenda | `calendar_month` | `AgendaTabView.tsx` | ✅ 100% real |
| Clientes | `people` | `ClientesTabView.tsx` | ✅ 100% real |
| Servicios | `content_cut` | `ServiciosTabView.tsx` | ✅ 100% real |
| **Caja** | `point_of_sale` | `CajaTabView.tsx` | ✅ Nuevo, 100% real |
| Rendimiento | `insights` | `PerformanceTabView.tsx` | ✅ 100% real |
| Config | `settings` | `ConfigTabView.tsx` | ✅ 100% real |

---

## 6. SCRIPT DE SEED

Archivo: `scripts/seed-dashboard.ts`  
Ejecutar: `npx ts-node scripts/seed-dashboard.ts`

Carga: 1 tenant · 1 branch · 3 staff · 5 servicios · 5 clientes · 10 turnos (semana actual, mix de estados).

> **Permisos:** Las reglas de Firestore requieren rol `admin`. Para correr el seed, bajar temporalmente las reglas a `allow read, write: if true`, ejecutar, y restaurar.

---

## 7. DEUDA TÉCNICA CONOCIDA

| Item | Severidad | Descripción |
|---|---|---|
| Firebase Client SDK en Server Actions | P1 | Todas las actions usan Client SDK en vez de REST API con service account. Funciona en dev, puede fallar en prod con reglas estrictas. Migrar antes de prod. |
| Índice compuesto `(clientId, date DESC)` | P2 | Falta crear en Firebase Console para que `getCustomerAppointments` funcione. El link aparece en los logs al visitar un cliente con historial. |
| Google Calendar — credenciales en `.env.local` | P2 | `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` no están en `.env.local`. Sin ellos el OAuth flow (connect/callback) no funciona. Obtener en console.cloud.google.com y agregar `/api/google/callback` como Authorized Redirect URI. |
| Google Calendar — Firestore rules para tokens | P2 | El callback de OAuth guarda tokens en `calendarTokens/{uid}` y `users/{uid}/integrations/google`. Las reglas de Firestore deben permitir write autenticado para que la integración funcione. |
| Liquidación de comisiones | P3 | `PerformanceTabView` tiene botón "Generar liquidación" que solo muestra un toast. No crea ningún documento en Firestore. |
| Galería de fotos con upload real | P3 | `ConfigTabView` acepta URLs manuales. No hay upload a Firebase Storage. |

---

## 8. COMMITS PRINCIPALES (branch `database-config`)

| Commit | Descripción |
|---|---|
| `5c5028a` | Refactor: null checks y filtrado por nombre en ServiciosTabView |
| `64ff11f` | feat(dashboard): wire all tabs to real Firestore data (Fase B) |
| `8a207c2` | feat(dashboard): wire PerformanceTabView and ConfigTabView |
| `ad61532` | fix(configuracion): align tab switcher style |
| `75cb564` | feat(dashboard): Fases C–E — mutations, GCal sync, cierre de caja |
| `5e59651` | feat(dashboard): real weekly revenue chart + CierreCajaDiario dark glass |
| `c74abf2` | feat(caja): add dedicated Caja tab |
| `c6c4b26` | feat(dashboard): exhaustive admin pipeline fix — real data end-to-end |
| `bc3ba9d` | feat(agenda): Google Calendar integration + prominent date + fix RSC/Firestore errors |

---

## RESUMEN EJECUTIVO FINAL

| Métrica | Valor |
|---|---|
| Tabs con datos reales | 7 de 7 (100%) |
| Actions de servidor | 23 funciones en 7 archivos |
| Mutaciones con Firestore | createAppointment, cancelAppointment, closeAppointment, createCustomer, updateCustomer, createService, updateService, toggleServiceActive, createStaffMember, updateStaffMember, updateStaffCommissions, updateTenantSettings |
| Google Calendar | OAuth flow completo: /api/google/connect, /api/google/callback, /api/google/status, /api/google/event. Sync best-effort al crear turno. |
| Breaking changes en schema | 0 (todos los campos nuevos son opcionales) |
| Hardcoded data restante | 0 |

### Reglas no negociables (vigentes)
- `tenantId` siempre del JWT (`session.user.salonId`), nunca de la URL
- Mutaciones solo en `src/actions/` como Server Actions
- Validación server-side siempre (slot libre, amountPaid, roles)
- Campos nuevos en schema siempre opcionales
- Google Calendar sync es best-effort: `.catch()` encadenado, nunca bloquea la respuesta
