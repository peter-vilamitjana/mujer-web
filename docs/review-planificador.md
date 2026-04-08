# Review del Plan de Proyecto MujerApp

**Fecha**: 2026-04-03 | **Reviewer**: Agente Planificador
**Última actualización**: 2026-04-08 | **Estado**: Fase 0 ✅ + Fase 1 ✅ completadas

> Los hallazgos marcados con ✅ han sido resueltos. Los marcados con ⏳ están pendientes para Fase 2+.

---

## 1. Priorización de Fase 0 -- Ajustes recomendados ✅ RESUELTO

### 1.1 Reordenar tareas por criticidad y desbloqueo

El plan actual ordena las tareas de Fase 0 en un orden que no refleja las dependencias reales ni el impacto de desbloqueo. Propuesta revisada:

| Prioridad | Tarea original | Justificación del reorden |
|-----------|---------------|---------------------------|
| **1a (Hora 1)** | 0.2 -- Eliminar credenciales hardcodeadas | Riesgo de seguridad activo. Si el repo es publico o se filtra, hay acceso inmediato. No tiene dependencias, se hace en minutos. |
| **1b (Hora 1)** | 0.6 -- Proteger `/admin/seed` y `/admin/migrate` | Mismo motivo: endpoint destructivo expuesto. Trivial de cerrar. |
| **2** | 0.3 -- Crear `.env.example` | Prerequisito implicito de 0.2 (las credenciales eliminadas necesitan un lugar documentado). Tambien desbloquea onboarding de cualquier nuevo dev. |
| **3** | 0.1 -- Eliminar `ignoreBuildErrors` + fix TS errors | El plan lo pone primero, pero es la tarea mas larga (3 dias). No deberia bloquear los fixes de seguridad. Sin embargo, es prerequisito real de CI (0.8), porque un CI que no puede hacer typecheck no sirve. |
| **4** | 0.4 -- Corregir `userRole` hardcodeado | Necesita que el build pase limpio primero (o al menos que los archivos afectados compilen). |
| **5** | 0.5 -- Desacoplar `branchId` | La tarea mas compleja de Fase 0 (2 dias). Depende de que TenantContext funcione correctamente y de que el build este limpio. |
| **6** | 0.7 -- Middleware marketplace | Depende de 0.4 (los roles deben ser reales para que el middleware tenga sentido). |
| **7** | 0.8 -- CI/CD | Depende de 0.1 (build limpio). Configurar CI antes de que el build pase es trabajo desperdiciado. |
| **8** | 0.9 -- Sentry | Independiente, pero su valor se maximiza cuando CI ya existe (errores en staging se rastrean). |
| **9** | 0.10 -- Staging environment | Ultima porque requiere CI funcional (0.8) y Sentry (0.9) para tener valor real. |

### 1.2 Estimacion de 0.1 es optimista

"Eliminar `ignoreBuildErrors` + corregir todos los errores TS" estimada en 3 dias es arriesgada. Razones:

- No se conoce la magnitud real de errores TS. Si hay 200+ errores (comun en proyectos con `ignoreBuildErrors` activado desde el inicio), 3 dias es insuficiente.
- Algunos errores pueden requerir refactors (ej: la mezcla `types.ts` / `schema.ts` mencionada como deuda media).
- **Mitigacion**: Agregar una tarea previa de 0.5 dias: "Auditar `tsc --noEmit 2>&1 | wc -l` y clasificar errores por severidad". Esto permite decidir si se arregla todo o se usa `// @ts-expect-error` temporalmente en errores no criticos.

### 1.3 Tarea 0.5 (branchId) subestimada

2 dias para desacoplar `branchId` es optimista si implica:

- Modificar TenantContext para exponer branch activo
- Agregar selector de branch en UI (o al menos un default inteligente)
- Actualizar `booking.actions.ts`, `turnos/page.tsx`, y "3+ archivos" mas
- Testear que el booking flow sigue funcionando end-to-end

Estimacion mas realista: **3-4 dias**, especialmente si hay que resolver como persistir la seleccion de branch en sesion.

---

## 2. Dependencias no expresadas en el plan ✅ PARCIALMENTE RESUELTO

El plan declara dependencias vagas ("Depende de Fase 0") pero no las hace explicitas. Dependencias criticas faltantes:

### Dentro de Fase 0
- **0.8 (CI) depende estrictamente de 0.1 (TS errors)**: Si el build no pasa, CI no puede validar nada.
- **0.7 (middleware marketplace) depende de 0.4 (roles reales)**: Proteger rutas con roles hardcodeados es teatro de seguridad.
- **0.10 (staging) depende de 0.8 (CI)**: Un staging sin CI es un entorno que se rompe silenciosamente.

### Entre Fases
- **1.3 (Gestion Sucursales) depende de 0.5 (branchId dinamico)**, correctamente marcado, pero **1.4 (Selector sucursal) tambien depende de 0.5** y no lo declara.
- **1.8 (Metricas reales) dice "Depende de Firestore real"**, lo cual es vago. Depende de 0.5 (branch dinamico) + 1.1 (servicios reales) + datos de appointments reales en Firestore. Sin datos, las metricas son ceros.
- **2.4 (Portal cliente) dice "Auth marketplace"**, pero eso no es una tarea del plan. Deberia decir "depende de 0.7 (middleware marketplace)" y de un flujo de registro de cliente que no esta listado en ninguna fase.
- **2.1 (Explore) dice "Datos reales"** -- depende de que al menos 2-3 salones tengan datos completos (servicios, staff, horarios). Esto a su vez depende de 1.1, 1.2, y 1.3.
- **3.1 (Stripe) dice "Cuenta activada"** -- esto es un bloqueante externo (registro en Stripe/MercadoPago, verificacion KYC) que puede tomar 1-4 semanas. Debe iniciarse en Fase 1, no en Fase 3. ⏳ **PENDIENTE** — iniciar gestiones en paralelo con Fase 2.

### Dependencia critica no mencionada: Registro de salones ✅ RESUELTO
El plan asume que los salones existen en Firestore. La tarea 1.6 (Onboarding wizard) crea el flujo de registro, pero depende de 1.1 (servicios) y 1.3 (sucursales), que estan en la misma fase. Esto crea un problema circular: necesitas el onboarding para tener datos, pero necesitas los CRUDs para que el onboarding funcione. **Solucion**: priorizar 1.1 y 1.3 antes de 1.6, y tener un script de seed actualizado como puente.
> ✅ Ejecutado en orden correcto: 1.1 (Semana 1) → 1.3 (Semana 2) → 1.6 (Semana 4). `createTenantWithAdmin` es batch atómico que crea tenant + branch + primer servicio + membership en una sola operación.

---

## 3. Riesgos adicionales no contemplados

### R11 -- Autenticacion de clientes B2C no disenada ⏳ PENDIENTE — Fase 2
El plan menciona "Auth marketplace" como dependencia pero nunca define como se autentican las clientas. Actualmente solo hay auth para admins. Preguntas sin responder:
- Se usa el mismo NextAuth con un rol diferente?
- Registro por email, Google, o ambos?
- Como se vincula una clienta con sus citas en multiples salones?

**Impacto**: Bloquea Fase 2 completa. Deberia ser tarea explicita en Fase 1.

### R12 -- Migracion de datos legacy ✅ PARCIALMENTE RESUELTO
El plan menciona mezcla de `types.ts` / `schema.ts` como deuda media (item 9), pero no hay tarea para resolverlo. Si Fase 1 construye CRUDs sobre un schema ambiguo, se duplica la deuda.

**Impacto**: Medio. Cada CRUD necesita saber cual es el schema canonico.
> ✅ Decisión ejecutada: todos los CRUDs de Fase 1 usan `schema.ts` como schema canónico (Service, Staff, Branch, Tenant). Los actions y hooks nuevos importan solo de `@/lib/schema`. `types.ts` queda como legacy para el booking flow B2C existente hasta que se migre en Fase 2.

### R13 -- Rate limiting ausente ⏳ PENDIENTE — Fase 2
Listado como pendiente en 2.2 (Backend/API) pero no aparece en ninguna tarea de ninguna fase. Sin rate limiting, un booking flow publico es vulnerable a abuso.

**Impacto**: Bloquea lanzamiento publico. Deberia estar en Fase 2 como tarea explicita.

### R14 -- Ausencia de backups de Firestore ⏳ PENDIENTE — Configurar antes de Fase 2 launch
No se menciona en ningun lugar. Firestore tiene backups automaticos solo en plan Blaze con configuracion explicita.

**Impacto**: Alto. Perdida de datos en produccion sin recuperacion posible.

### R15 -- Localizacion e internacionalizacion
El plan no menciona i18n. Si el target es LATAM, hay que decidir: solo espanol? Espanol + portugues (Brasil)? Esto afecta la estructura de componentes desde Fase 0.

**Impacto**: Bajo si se decide solo espanol; alto si se necesita multi-idioma post-launch.

### R16 -- GDPR / Proteccion de datos personales
Salones almacenan datos de clientes (nombre, telefono, historial de servicios). No hay mencion de:
- Politica de privacidad
- Flujo de eliminacion de datos (derecho al olvido)
- Consentimiento explicito para comunicaciones

**Impacto**: Legal. Puede bloquear lanzamiento en mercados con regulacion de datos.

### R17 -- Dependencia de dominios de imagenes externos
El plan lo lista como deuda alta (item 6) y tiene tarea 2.3, pero mientras tanto, si placehold.co o Unsplash cambian URLs, la landing se rompe visualmente. Deberia haber un fix temporal en Fase 0 (imagenes locales en `/public`).

---

## 4. Ajustes de estimacion

| Tarea | Estimacion plan | Estimacion ajustada | Real ejecutado | Razon |
|-------|----------------|--------------------|----------------|-------|
| 0.1 (Fix TS errors) | 3 dias | 4-5 dias | ✅ ~3 dias | Magnitud acotada. Schema mezcla mitigada con decision de canonical |
| 0.5 (branchId dinamico) | 2 dias | 3-4 dias | ✅ ~2 dias | TenantContext ya tenia infraestructura. Cambio quirúrgico |
| 1.6 (Onboarding wizard) | 3 dias | 5 dias | ✅ ~1 sesion | Batch atómico. Wizard 5 pasos con localStorage |
| 1.7 (Google Calendar sync) | 5 dias | 7 dias | ✅ ~1 sesion | App→GCal implementado. Helper con token refresh. Best-effort para no romper booking flow |
| 2.1 (Explore con filtros) | 4 dias | 5-6 dias | ⏳ Pendiente | Queries compuestos en Firestore requieren indices. Filtros por zona necesitan geopoints no mencionados en schema |
| 3.1 (Stripe) | 5 dias | 7 dias | ⏳ Pendiente | Incluye manejo de errores, retries, idempotencia, testing con webhooks locales |
| 4.6 (Test suite) | 5 dias | 8-10 dias | ⏳ Pendiente | Configurar Playwright + Vitest desde cero en un proyecto sin tests, mas escribir tests de flujos criticos, es al menos 2 semanas |

### Impacto en timeline total

Con las estimaciones ajustadas:
- **Fase 0**: 2.5-3 semanas (no 2)
- **Fase 1**: 5 semanas (no 4), especialmente por Google Calendar
- **Fase 2**: 3-4 semanas (depende de si auth B2C se resuelve en Fase 1)
- **MVP Launchable**: 11-14 semanas con 2 devs (no 10-12)
- **v1.0 con Revenue**: 15-18 semanas con 2 devs (no 14-16)

---

## 5. Orden de ataque recomendado para Acciones Inmediatas (Semana 1)

El plan lista 6 acciones inmediatas. Orden revisado con justificacion:

### Dia 1 (Lunes)

1. **Remover credenciales hardcodeadas** (item 2 del plan)
   - Razon: Unica accion con riesgo de seguridad activo. Se hace en <1 hora.
   - Incluir: buscar en todo el repo con `grep -r "password123"` y `grep -r "admin@mujer"`.

2. **Proteger `/admin/*` en middleware** (item 3 del plan)
   - Razon: Segunda accion de seguridad. Complementa la anterior. <1 hora.

3. **Crear `.env.example`** (item 5 del plan)
   - Razon: Necesario para que las credenciales removidas tengan documentacion. <1 hora.

### Dia 2 (Martes)

4. **Auditar magnitud de errores TS** (item 1 del plan, parcial)
   - Razon: Antes de activar `ignoreBuildErrors: false`, medir cuantos errores hay. Ejecutar `npx tsc --noEmit 2>&1 | tail -1` para ver el conteo. Si son <50, se pueden resolver en 2 dias. Si son >100, planificar por modulo.
   - NO activar `ignoreBuildErrors: false` hasta que los errores esten resueltos o acotados.

### Dias 3-5 (Miercoles-Viernes)

5. **Resolver errores TS y activar `ignoreBuildErrors: false`** (item 1, continuacion)
   - Razon: Bloquea CI. Atacar por carpeta: primero `lib/`, luego `actions/`, luego `components/`, luego `app/`.

6. **Setup CI (GitHub Actions)** (item 6 del plan)
   - Razon: Solo tiene valor cuando el build pasa. Configurar al final de la semana cuando 0.1 este resuelto.

### Item deprioritizado

- **Bug Safari en `/business`** (item 4 del plan): No es accion inmediata. `/business` es landing B2B de marketing, no bloquea ningun flujo funcional. Mover a Fase 1 o Fase 2. Investigar solo si hay demostracion a stakeholders programada.

---

## 6. Observaciones adicionales

### 6.1 Falta un "Definition of Done" para el MVP ⏳ PENDIENTE

El plan dice "MVP Launchable" al final de Fase 2, pero no define que significa "launchable":
- Cuantos salones deben estar onboarded?
- Hay un salon piloto para beta testing?
- Que metricas de calidad se exigen (uptime, latencia, errores/dia)?

Sin esto, el MVP se convierte en un target movil.

### 6.2 Testing demasiado tarde ⏳ PENDIENTE — agregar tests básicos en Fase 2

Tests estan en Fase 4 (semana 13+). Para entonces habra 12 semanas de codigo sin cobertura. El costo de escribir tests retroactivamente es 3-4x mayor que escribirlos junto al feature. Recomendacion: agregar tests de integracion basicos para cada CRUD en Fase 1, y tests e2e del booking flow en Fase 2. No esperar a Fase 4.

### 6.3 Falta estrategia de datos de prueba ⏳ PENDIENTE

El plan no menciona como se populan datos para desarrollo y staging. El script de seed existe (`/admin/seed`) pero:
- Esta desprotegido (se arregla en 0.6)
- No se sabe si genera datos realistas
- Staging necesita datos representativos para QA

Recomendacion: incluir en Fase 0 una tarea de "revisar y mejorar seed script" (~0.5 dias).

### 6.4 La Fase 4 mezcla prioridades ⏳ PENDIENTE — aplicar en planificación de Fase 2

SEO (4.2) y Performance (4.3) deberian estar en Fase 2 o inicio de Fase 3 -- son prerequisitos para que el marketplace tenga traccion organica. Dejarlos para Fase 4 significa lanzar un marketplace sin discoverability. En cambio, AI (4.5) y Push Notifications (4.7) si son correctamente Fase 4.

---

## Resumen de hallazgos clave

| # | Hallazgo | Estado |
|---|----------|--------|
| 1 | **Seguridad primero**: Las acciones inmediatas deben empezar por credenciales y endpoints expuestos, no por errores TS. | ✅ Resuelto en Fase 0 |
| 2 | **Dependencias ocultas**: Auth B2C, cuenta Stripe, y datos de seed son bloqueantes no planificados. | ⚠️ Stripe + Auth B2C pendientes — iniciar en paralelo con Fase 2 |
| 3 | **Estimaciones optimistas**: Google Calendar sync, test suite, fix TS errors subestimados. | ✅ GCal resuelto. TS limpio. Tests: ⏳ Fase 4 |
| 4 | **Testing demasiado tarde**: Esperar a Fase 4 para tests multiplica costo y riesgo de regresiones. | ⏳ Agregar tests básicos de CRUD en Fase 2 |
| 5 | **MVP sin definicion clara**: "Launchable" necesita criterios medibles. | ⏳ Definir antes de iniciar Fase 2 |
| 6 | **SEO/Performance fuera de lugar**: Deberian estar antes del launch del marketplace. | ⏳ Incorporar en planificacion de Fase 2 |
| 7 | **Dependencia circular 1.1/1.3 → 1.6**: Onboarding depende de CRUDs de la misma fase. | ✅ Resuelto: orden de ejecución 1.1 → 1.3 → 1.6 |
| 8 | **Schema canonical ambiguo**: `types.ts` vs `schema.ts`. | ✅ Decision: `schema.ts` es canónico para Fase 1+. `types.ts` es legacy B2C |
