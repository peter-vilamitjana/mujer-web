# MujerApp — Plan de Frontend UX

> Generado: 2026-04-29
> Autor: Pedro Vila Mitjana + Claude Code
> Estado: Draft v1

---

## Índice

1. [Radiografía de páginas](#1-radiografía-de-páginas)
2. [Flujos críticos y gaps](#2-flujos-críticos-y-gaps)
3. [Páginas nuevas que hay que crear](#3-páginas-nuevas-que-hay-que-crear)
4. [Plan de acción por prioridad](#4-plan-de-acción-por-prioridad)
5. [Quick wins](#5-quick-wins-cambios-en-menos-de-1-día)
6. [Análisis crítico del plan](#6-análisis-crítico-del-plan)
7. [Sprints recomendados](#7-sprints-recomendados)

---

## 1. Radiografía de páginas

### `/` — Landing global

**Misión única:** En 10 segundos, que tanto una clienta como una dueña de salón entiendan qué es MujerApp y sepan hacia dónde ir.

**Qué debería mostrar que hoy no muestra:**
- Una split-identity visual: dos propuestas de valor simultáneas (clienta / dueña), no una sola narrativa ambigua
- El producto en acción: una animación o screenshot del flujo de reserva y del dashboard admin
- Social proof: número de salones activos, número de turnos procesados, un testimonio real de una dueña

**Fricción actual:**
- El hero es estático — describe, pero no muestra
- No hay jerarquía de CTAs: ¿una clienta busca salones o una dueña registra su negocio?
- La propuesta de valor es genérica — podría ser cualquier plataforma de turnos

**Elemento que elevaría esta página:**
Un hero con dos caminos visuales diferenciados: lado izquierdo "Reservá tu turno" (clienta) + lado derecho "Sumá tu salón" (dueña), con un demo animado del producto de fondo.

**Conexiones:**
- Entrada desde: Google, redes sociales, boca en boca
- Salida hacia: `/explore` (clientas) y `/business` (dueñas) — ambas deben tener CTAs prominentes y diferenciados en el hero

---

### `/business` — Landing B2B para dueñas de salón

**Misión única:** Convencer a una dueña de salón que no conoce MujerApp de que vale la pena registrarse hoy.

**Qué debería mostrar que hoy no muestra:**
- Screenshots reales del dashboard admin — la dueña tiene que ver lo que va a usar antes de comprometerse
- Un "día típico con MujerApp": narrativa secuencial de cómo la plataforma transforma su jornada
- Testimonials específicos con nombre del salón, ciudad, y un número concreto ("Pasé de 3 turnos cancelados por semana a 0")
- Comparativa implícita con el caos actual (WhatsApp, papel, olvidos)
- El precio y el modelo SaaS explicados claramente — sin letra chica

**Fricción actual:**
- El hero no muestra el producto — promete sin evidencia
- No hay calculadora de valor ("¿cuánto perdés hoy por no tener esto?")
- El CTA de registro aparece demasiado tarde en el scroll

**Elemento que elevaría esta página:**
Una sección "Mirá cómo funciona" con screenshots o un video de 60 segundos del flujo completo: cliente reserva → dueña recibe notificación → dashboard se actualiza → cobro procesado.

**Conexiones:**
- Entrada desde: `/` (CTA B2B), campañas pagas, redes sociales
- Salida hacia: `/business/register` (único objetivo de conversión)

---

### `/explore` — Buscador de salones

**Misión única:** Una clienta que no sabe qué salón quiere debe poder encontrar uno que le guste en menos de 30 segundos.

**Qué debería mostrar que hoy no muestra:**
- Filtros por tipo de servicio (tinte, corte, uñas, cejas), zona, precio y disponibilidad hoy
- Vista mapa + lista side-by-side en desktop, tabs en mobile
- Indicadores de disponibilidad inmediata ("Turnos hoy disponibles")
- Cards de salones con foto de portada, rating, servicios destacados y precio desde

**Fricción actual:**
- Si no hay salones en la zona, la página queda vacía sin guía — dead end que destruye confianza
- Sin geolocalización activa el resultado es genérico e irrelevante
- La densidad de salones en etapa MVP es baja — la percepción de "plataforma vacía" es un riesgo crítico

**Elemento que elevaría esta página:**
Un estado vacío inteligente: si no hay salones en la búsqueda, mostrar "Salones cerca de vos" con los más cercanos aunque no sean exactos, más un CTA "¿Tenés un salón? Sumalo gratis."

**Conexiones:**
- Entrada desde: `/` (CTA "Reservá un turno"), búsquedas orgánicas
- Salida hacia: `/salones/[slug]` (card de salón seleccionado)

---

### `/salones/[slug]` — Perfil público del salón

**Misión única:** Convencer a la clienta de que este salón es para ella y que reserve ahora.

**Qué debería mostrar que hoy no muestra:**
- Galería de trabajos reales del salón (el producto principal de un salón de belleza es visual)
- Equipo con fotos individuales, especialidades y disponibilidad de cada profesional
- Reviews verificadas con avatar, nombre y fecha
- Servicios con precios claros y duración estimada
- Próximos slots disponibles visibles sin hacer click en "Reservar"

**Fricción actual:**
- Sin fotos de trabajos, la diferenciación entre salones es cero
- No hay indicación de disponibilidad próxima en el perfil — la clienta tiene que entrar al flujo de reserva para descubrirlo
- Sin reviews, la confianza depende 100% de las fotos de perfil

**Elemento que elevaría esta página:**
Una sección "Próximos turnos disponibles" con 3–4 horarios visibles directamente en el perfil, con un CTA por slot. Esto reduce el click a cero fricción.

**Conexiones:**
- Entrada desde: `/explore`, links directos compartidos por las dueñas (WhatsApp, Instagram)
- Salida hacia: `/salones/[slug]/book` (único objetivo)

---

### `/salones/[slug]/book` — Flujo de reserva

**Misión única:** Que la clienta complete su reserva en el menor número de decisiones posibles.

**Qué debería mostrar que hoy no muestra:**
- Progress indicator de 3 pasos: Elegí servicio → Elegí horario → Confirmá
- Resumen lateral permanente en desktop (qué reservo, con quién, cuándo, cuánto)
- Opción de continuar como invitada o registrarse después de confirmar
- Confirmación instantánea con todos los datos + opción "Agregar a Google Calendar"

**Fricción actual:**
- Obligar a crear cuenta antes de reservar es el mayor killer de conversión en esta industria
- Sin progress indicator, la clienta no sabe cuánto falta — el abandono aumenta
- Sin resumen siempre visible, la clienta pierde contexto en cada paso

**Elemento que elevaría esta página:**
Guest checkout: que la clienta pueda reservar con solo email y nombre, y que la creación de cuenta sea un paso opcional post-confirmación ("Creá tu cuenta para gestionar tus turnos").

**Conexiones:**
- Entrada desde: `/salones/[slug]`
- Salida hacia: `/book/[id]/confirmation` → `/perfil` (si tiene cuenta) o CTA de registro

---

### `/perfil` — Dashboard de la clienta B2C

**Misión única:** Ser el centro de control de la clienta — historial, próximos turnos, y motivación para volver.

**Qué debería mostrar que hoy no muestra:**
- Hero del próximo turno: fecha, hora, salón, profesional, con botón de cancelar/reprogramar
- Historial ordenado por fecha con opción de "Reservar de nuevo" en cada turno pasado
- Salones favoritos / guardados
- Notificaciones de recordatorio y confirmación

**Fricción actual:**
- Para una usuaria nueva, el perfil está completamente vacío — el empty state probablemente no guía a ninguna acción
- Sin loop de retención (recordatorios, favoritos, historial visible), la plataforma no fideliza

**Elemento que elevaría esta página:**
Empty state de alta conversión: "Todavía no tenés turnos — Explorá salones cerca tuyo" con un mosaico de 3 salones sugeridos. Que la página vacía sea el comienzo de un journey, no un callejón.

**Conexiones:**
- Entrada desde: Post-reserva confirmada, `/login` (clienta)
- Salida hacia: `/explore`, `/salones/[slug]/book` (re-reserva)

---

### `/(admin)/dashboard` — Dashboard de la dueña

**Misión única:** Darle a la dueña la fotografía instantánea de su negocio hoy y las acciones más urgentes.

**Qué debería mostrar que hoy no muestra:**
- **Bloque 1 (above the fold):** Agenda de hoy — próximos 3–5 turnos con cliente, servicio, hora y profesional
- **Bloque 2:** 4 métricas clave de la semana: turnos confirmados, ingresos, nuevas clientas, tasa de cancelación
- **Bloque 3:** Acciones rápidas — "Agregar turno manual", "Ver agenda completa", "Ver clientas"
- **Bloque 4:** Actividad reciente — últimas reservas, cancelaciones, pagos
- Un banner de onboarding para salones nuevos con checklist de configuración

**Fricción actual:**
- Sin jerarquía clara, la dueña ve todo a la vez y no sabe dónde mirar
- Una dueña nueva llega a un dashboard vacío sin guía
- Las métricas y la agenda probablemente compiten visualmente

**Elemento que elevaría esta página:**
Un "Checklist de lanzamiento" para salones nuevos, persistente hasta completarse: [ ] Agregá tus servicios → [ ] Cargá a tu equipo → [ ] Subí fotos del salón → [ ] Compartí tu link público.

**Conexiones:**
- Entrada desde: `/login` (admin), `/business/onboarding` (post-onboarding)
- Hub central hacia: `/agenda`, `/clientes`, `/servicios`, `/staff`, `/configuracion`

---

### `/login` — Auth page

**Misión única:** Identificar quién es el usuario y llevarlo al lugar correcto en el menor tiempo posible.

**Qué debería mostrar que hoy no muestra:**
- Diferenciación explícita: "¿Sos clienta?" vs "¿Sos dueña de un salón?"
- Google OAuth como opción principal (reduce fricción a 1 click)
- Link a `/business/register` para dueñas que aún no tienen cuenta
- Link a registro de clienta para nuevas usuarias B2C

**Fricción actual:**
- Un formulario único para dos tipos de usuarios con necesidades y destinos completamente distintos
- Una dueña que llega al login no sabe si está en el lugar correcto
- Sin diferenciación visual, el login parece el de cualquier app genérica

**Elemento que elevaría esta página:**
Dos panels o tabs: "Soy clienta" / "Soy dueña de salón", con copy diferente y redirect distinto post-login.

**Conexiones:**
- Entrada desde: CTAs de `/`, `/business`, `/explore`, header global
- Salida hacia: `/perfil` (clientas) o `/(admin)/dashboard` (admins)

---

## 2. Flujos críticos y gaps

### Flujo A — Clienta nueva

```
[1] Llega a MujerApp por primera vez
[2] Entiende qué es la plataforma
[3] Descubre salones relevantes
[4] Elige un salón y un profesional
[5] Reserva su turno
[6] Recibe confirmación
[7] Vuelve a usar la app
```

| Paso | Estado actual | Gap | Solución |
|------|--------------|-----|----------|
| 1 → 2 | Hero estático, copy genérico | La clienta no entiende el valor en 10 segundos | Hero con demo animada + social proof |
| 2 → 3 | CTA existe pero no diferenciado | Puede llegar a /business por error | CTA "Reservá un turno" prominente y separado del B2B |
| 3 → 4 | /explore funciona | Falta geolocalización y filtros por servicio | Filtros en /explore + mapa |
| 4 → 5 | /salones/[slug] existe | Sin disponibilidad visible antes de hacer click | Mostrar próximos slots en el perfil |
| 5 → 6 | Flujo de reserva existe | Requiere cuenta antes de reservar — killer de conversión | Guest checkout |
| 6 → 7 | **No existe página de confirmación** | Sin cierre emocional, sin propuesta de crear cuenta | Crear `/book/[id]/confirmation` |
| 7 → loop | /perfil existe | Empty state vacío sin guía | Empty state con salones sugeridos |

**Dónde se pierde la clienta hoy:** Paso 5→6 (si le piden crear cuenta) y 6→7 (sin confirmación clara).

**Prioridad para cerrar este flujo:** Guest checkout primero, página de confirmación segundo — construirlos juntos como una sola iniciativa.

---

### Flujo B — Dueña de salón nueva

```
[1] Llega a /business
[2] Se convence del valor
[3] Se registra
[4] Configura su salón (servicios, equipo, fotos)
[5] Publica su perfil
[6] Comparte su link con sus clientas actuales
[7] Recibe su primera reserva
[8] Gestiona su negocio desde el dashboard
```

| Paso | Estado actual | Gap | Solución |
|------|--------------|-----|----------|
| 1 → 2 | /business existe con hero | No hay screenshots del producto, sin testimonials, sin precio | Rediseño con demo visual + social proof + pricing |
| 2 → 3 | CTA a /business/register existe | El convencimiento es débil — muchas no llegan al registro | Hero con demo antes del CTA |
| 3 → 4 | Probablemente formulario plano | Sin wizard — la dueña no sabe qué configurar primero | Wizard de 4 pasos con progress |
| 4 → 5 | Configuración en /admin/configuracion | Sin checklist, no sabe si su salón ya es visible | Checklist de lanzamiento en el dashboard |
| 5 → **6** | **Este paso no existe** | No hay momento de "publicación exitosa" ni CTA de share | Pantalla `/business/success` + "Compartí tu link" |
| 6 → 7 | Link del salón existe | Primera reserva orgánica puede tardar semanas | El link lleva a clientas actuales — es el canal real de adquisición |
| 7 → 8 | Dashboard existe | Sin notificación especial de "primera reserva" | Evento destacado en dashboard |
| 8 → loop | Secciones admin existen | Sin métricas claras, la dueña no ve el valor | Dashboard con métricas de la semana |

**Dónde se pierde la dueña hoy:** Paso 3→4 (onboarding sin estructura) y 4→5 (no sabe que su salón no está publicado hasta completar configuración).

**Gap crítico no diagnosticado originalmente:** El paso 6 (compartir link) es el mecanismo real de adquisición de las primeras clientas. La primera reserva no va a venir del marketplace orgánico — va a venir de las clientas actuales de la dueña. Sin un momento explícito de "compartí tu link", ese canal no se activa.

---

## 3. Páginas nuevas que hay que crear

| Prioridad | Página | Por qué es crítica |
|-----------|--------|-------------------|
| P0 | `/book/[id]/confirmation` | Sin confirmación explícita el flujo de reserva no cierra. Impacto directo en confianza y conversión a cuenta. |
| P0 | `/business/onboarding` (wizard 4 pasos) | Sin onboarding estructurado las dueñas no completan configuración. Gap crítico en flujo B. |
| P1 | Login diferenciado B2C/B2B (rediseño `/login`) | El login actual no distingue audiencias — genera confusión y redirects incorrectos. |
| P1 | `/business/success` — "Tu salón está publicado" | Momento de celebración post-onboarding con CTA de share link. |
| P2 | Vista mapa en `/explore` | La búsqueda sin mapa es incompleta para una app de salones con geolocalización. |
| P2 | Empty state de `/explore` con waitlist | Si no hay salones en la zona, capturar demanda latente en lugar de mostrar una página vacía. |

---

## 4. Plan de acción por prioridad

---

### PRIORIDAD 1 — Login diferenciado B2C vs B2B

**Página:** `/login`

**Problema que resuelve:** Dueñas y clientas llegan al mismo formulario sin diferenciación — confusión, redirects incorrectos, pérdida de contexto.

**Qué hay que hacer:**
- Agregar dos panels o tabs: "Soy clienta" / "Soy dueña de salón"
- Verificar que el callback de NextAuth redirige por rol: `/perfil` para clientas, `/(admin)/dashboard` para admins
- Google OAuth como opción principal en ambos panels
- Link a `/business/register` en el panel de dueñas
- Copy diferenciado: aspiracional para dueñas ("Gestioná tu salón"), funcional para clientas ("Tus turnos en un lugar")

**Dependencias técnicas a verificar antes de estimar:**
- ¿El `role` ya está en el JWT callback de NextAuth?
- ¿El redirect post-login está implementado o hardcodeado?

**Impacto:** Cada tipo de usuario llega al lugar correcto sin fricción, sin pasos extra.

**Estimación:** 1 día (verificar dependencias antes)

---

### PRIORIDAD 2 — Guest checkout + Página de confirmación

> Estas dos iniciativas son una sola — construirlas juntas o no construirlas.

**Páginas:** `/salones/[slug]/book` + `/book/[id]/confirmation` (nueva)

**Problema que resuelve:** Obligar a crear cuenta antes de reservar es el mayor killer de conversión. Sin confirmación explícita, el flujo no tiene cierre.

**Qué hay que hacer en `/book`:**
- Permitir reserva con solo nombre + email + teléfono (sin contraseña)
- Marcar la reserva como `guestBooking: true` en Firestore — verificar que `schema.ts` tiene este campo
- Progress indicator de 3 pasos visible durante todo el flujo
- Resumen lateral permanente en desktop

**Qué hay que hacer en `/book/[id]/confirmation`:**
- Resumen completo: salón, servicio, profesional, fecha, hora, precio
- Botón "Agregar a Google Calendar"
- Dirección del salón con link a Google Maps
- CTA de creación de cuenta para usuarias guest (datos pre-llenados)
- Opción de compartir turno por WhatsApp

**Impacto:** Una clienta puede reservar su primer turno en 3 pasos sin fricción.

**Estimación:** 3 días

---

### PRIORIDAD 3 — Wizard de onboarding + Checklist en dashboard

> Estas dos iniciativas son una sola — el wizard alimenta el checklist.

**Páginas:** `/business/onboarding` (nueva) + `/(admin)/dashboard` (mejora)

**Problema que resuelve:** Sin onboarding estructurado las dueñas no completan la configuración del salón. Sin checklist en el dashboard, no hay guía post-onboarding.

**Wizard de 4 pasos:**
- Paso 1 — Datos del salón: nombre, dirección, teléfono, descripción
- Paso 2 — Servicios: mínimo 3 servicios con precio y duración (con templates predefinidos)
- Paso 3 — Equipo: mínimo 1 profesional con nombre y especialidad
- Paso 4 — Foto de portada: upload con crop, o saltar y hacerlo después
- Progress indicator en el header, botón "Completar después" por paso
- Al finalizar: redirect a `/business/success`

**Checklist en dashboard:**
- Banner para salones con setup incompleto
- 5 ítems verificables desde Firestore: [ ] Servicios [ ] Equipo [ ] Foto [ ] Horarios [ ] Perfil activo
- Cada ítem con link directo a la sección correspondiente
- Banner se oculta cuando todos los ítems están completos

**Nota sobre estimación:** Este ítem es el más complejo del plan. Implica multi-step form con estado persistido, 4+ endpoints Firestore, validación por paso, upload de imagen, templates de servicios predefinidos, y lógica de completitud. Estimación realista: 6–8 días, no 3.

**Impacto:** Una dueña nueva puede tener su salón configurado y publicado en menos de 15 minutos.

**Estimación:** 6–8 días

---

### PRIORIDAD 4 — Pantalla "Tu salón está publicado" + Share link

**Página:** `/business/success` (nueva)

**Problema que resuelve:** Sin un momento explícito de publicación, la dueña no sabe si su salón ya es visible. Sin CTA de share, el canal principal de las primeras reservas (clientas actuales) no se activa.

**Qué hay que hacer:**
- Pantalla de celebración post-onboarding con el nombre del salón
- URL del perfil público listo para copiar con un click
- Botón "Compartir por WhatsApp" con mensaje prediseñado: "¡Ya puedo recibir turnos online! Reservá en [link]"
- Link para ver el perfil público propio
- Botón "Ir al dashboard"

**Impacto:** La primera reserva llega de clientas actuales de la dueña, no del marketplace. Este paso activa ese canal.

**Estimación:** 0.5 días

---

### PRIORIDAD 5 — Jerarquía del dashboard admin (mobile-first)

**Página:** `/(admin)/dashboard`

**Problema que resuelve:** Sin jerarquía, la dueña no sabe qué mirar primero. La experiencia mobile — donde van a vivir la mayoría de sus interacciones — no está garantizada.

**Qué hay que hacer:**
- Reordenar bloques: agenda del día (hero) → métricas semana → acciones rápidas → actividad reciente
- 4 métricas en cards: turnos hoy, ingresos semana, nuevas clientas mes, tasa cancelación
- Evento especial para "primera reserva recibida" — notificación destacada
- **Criterio de aceptación obligatorio:** todo funciona igual en iPhone que en desktop

**Impacto:** La dueña entiende el estado de su negocio en 5 segundos sin navegar.

**Estimación:** 2 días (con QA mobile explícito)

---

### PRIORIDAD 6 — Rediseño hero de `/business`

**Página:** `/business`

**Problema que resuelve:** El hero no convence — promete sin evidencia, no muestra el producto.

**Nota importante:** Este ítem es 60% un problema de contenido y 40% de frontend. Antes de implementar se necesita:
- Screenshots reales del dashboard admin
- Al menos 2 testimonials reales de dueñas con nombre, ciudad, y métrica concreta
- Precio definitivo en ARS para publicar

**Qué hay que hacer:**
- Hero con screenshot o mockup animado del dashboard admin
- Sección "Cómo funciona" con 3 pasos visuales
- Sección de testimonials con foto, nombre, ciudad, número concreto
- Sección de pricing: precio mensual en ARS, sin comisiones, sin letra chica
- CTA repetido al inicio y al final del scroll

**Impacto:** Una dueña que llega por primera vez entiende el valor y confía para registrarse.

**Estimación:** 2 días de frontend (el contenido es trabajo previo independiente)

---

### PRIORIDAD 7 — Mejoras a `/salones/[slug]`

**Página:** `/salones/[slug]`

**Problema que resuelve:** Sin disponibilidad visible en el perfil, la clienta tiene que entrar al flujo de reserva para saber si hay turnos — fricción innecesaria.

**Qué hay que hacer:**
- Sección "Próximos turnos disponibles" con 4–5 slots clickeables directamente en el perfil
- Cada slot lleva al flujo de reserva con horario pre-seleccionado
- Galería de trabajos: grid de hasta 9 fotos
- Reviews con rating, nombre y fecha

**Impacto:** La clienta puede reservar desde el perfil con un solo click.

**Estimación:** 2 días

---

### PRIORIDAD 8 — Empty state de `/explore` con waitlist

**Página:** `/explore`

**Problema que resuelve:** En etapa de cold start, cuando no hay salones en la zona, la página vacía destruye la confianza. Es el punto de falla más crítico del marketplace en sus primeras semanas.

**Qué hay que hacer:**
- Si no hay resultados: "No encontramos salones en tu zona todavía"
- Formulario simple: "Avisanos dónde estás y lo priorizamos" (email + barrio/ciudad)
- CTA secundario: "¿Tenés un salón? Sumalo gratis" → `/business`
- Guardar leads en Firestore para informar dónde hacer onboarding de nuevos salones

**Impacto:** El fracaso de búsqueda se convierte en señal de demanda, no en abandono.

**Estimación:** 0.5 días

---

## 5. Quick wins (cambios en menos de 1 día)

**1. CTAs diferenciados en el header global (2h)**
Dos CTAs en el header: "Reservar turno" (→ /explore) y "Sumá tu salón" (→ /business). Resuelve la orientación desde cualquier página del sitio.

**2. Redirect post-login por rol (1–4h según estado actual)**
Verificar primero si el `role` ya está en el JWT callback de NextAuth. Si está, el fix es 1h. Si no está, revisar schema.ts y auth.ts antes de estimar. No asumir.

**3. Progress indicator en `/book` (2–3h)**
Stepper de 3 pasos en el top del flujo de reserva. No cambia la lógica, solo da contexto. Reduce el abandono por incertidumbre.

**4. Empty state de `/perfil` con sugerencias (3h)**
Cuando la clienta no tiene turnos: "¿Qué querés hacerte?" con 3–4 cards de servicios populares que llevan a `/explore?service=...`. Convierte un callejón en una invitación.

**5. Meta title y description dinámicos por página (2–4h)**
Cada página con su propio `<title>` y `<meta description>` via Next.js metadata export. Crítico para `/salones/[slug]` — el nombre real del salón debe aparecer en el tab del browser y en los links compartidos.

**6. Link "¿Tenés un salón?" en el footer de `/explore` (30min)**
Una clienta que llega a /explore puede ser también dueña de un salón. Un link discreto hacia /business captura ese caso.

**7. Tooltips de primer uso en el dashboard admin (3h)**
Para salones con menos de 7 días: tooltips contextuales la primera vez que visitan el dashboard. Se deshabilitan con un click. Reduce la curva de aprendizaje sin onboarding separado.

**8. Open Graph image y favicon (1h)**
Si no están configurados, el link compartido de MujerApp se ve genérico en WhatsApp y redes. Una OG image con logo y tagline mejora el CTR de links compartidos.

---

## 6. Análisis crítico del plan

### Lo que el plan acierta

**Guest checkout es el insight más importante.** Sin ella, el flujo A no existe en la práctica — no importa cuánto mejoremos la landing, si el último metro requiere crear una cuenta, la mayoría abandona.

**El checklist de lanzamiento dentro del dashboard** es la pieza que cierra el gap de activación para dueñas. Es el mecanismo por el cual una dueña pasa de "registrada" a "activa con perfil publicado".

### Problemas identificados en el plan

**Problema 1 — La estimación de P3 es optimista.**
El wizard de onboarding tiene más complejidad real de lo que parece: multi-step form con estado persistido, 4+ endpoints Firestore, validación por paso, upload de imagen con crop, templates predefinidos, lógica de completitud. Estimación realista: 6–8 días.

**Problema 2 — El plan no tiene grafo de dependencias.**
- P3 (confirmación) depende de P2 (guest checkout): construirlos separados es construir la mitad
- P5 (checklist) depende de P4 (onboarding wizard): el checklist verifica lo que el wizard ayuda a completar
- P6 (hero /business) depende de contenido que no existe: screenshots, testimonials, pricing definido

**Problema 3 — No hay norte estrella.**
Sin saber cuál es el cuello de botella real (adquisición vs activación vs conversión), el orden de prioridades es una apuesta. La pregunta que hay que responder antes de empezar:

- Si el problema es **adquisición** (pocas dueñas llegan a /business) → P6 primero
- Si el problema es **activación** (dueñas se registran pero no terminan de configurar) → P3+P4 primero
- Si el problema es **conversión de clientas** (llegan a /book pero no terminan) → P2+P3 primero

**Problema 4 — El paso 6 del flujo B no estaba en el plan original.**
El momento "compartí tu link" post-publicación es el mecanismo de adquisición de las primeras clientas. La primera reserva no viene del marketplace orgánico — viene de las clientas actuales de la dueña. Sin este paso, ese canal no se activa.

**Problema 5 — Mobile del admin no tiene criterio explícito.**
Las dueñas van a revisar su agenda desde el celular entre clientes. Si el dashboard admin no funciona bien en iPhone, el valor percibido es bajo. Debe ser un criterio de aceptación en P5, no una suposición.

**Problema 6 — Los flujos de cancelación y reprogramación no están planificados.**
No son edge cases — ocurren cada semana. ¿Cómo cancela una clienta? ¿Cómo reprograma una dueña? No planificarlos ahora significa construirlos a las apuradas ante el primer reclamo.

**Problema 7 — El cold start del marketplace no tiene respuesta de producto.**
Cuando no hay salones en la zona, el problema no es de UX — es de supply. La respuesta de UX es un empty state con waitlist que captura demanda latente (P8 de este plan). Sin eso, el fracaso de búsqueda destruye la confianza irreversiblemente.

---

## 7. Sprints recomendados

> Agrupados por dependencia técnica, no por número de prioridad.

### Sprint 1 — Cerrar el flujo A de la clienta (semana 1–2)

| Ítem | Estimación |
|------|-----------|
| Login diferenciado B2C/B2B | 1 día |
| Guest checkout + página de confirmación (juntos) | 3 días |
| Quick wins: CTAs header, redirect por rol, progress indicator | 1 día |

**Resultado:** Una clienta puede llegar, encontrar un salón, reservar y recibir confirmación sin crear cuenta.

---

### Sprint 2 — Activar el flujo B de la dueña (semana 3–5)

| Ítem | Estimación |
|------|-----------|
| Wizard de onboarding + checklist en dashboard (juntos) | 6–8 días |
| Pantalla "Tu salón está publicado" + share link | 0.5 días |

**Resultado:** Una dueña nueva puede tener su salón configurado, publicado, y su link compartido en menos de 15 minutos.

---

### Sprint 3 — Elevar el core del producto (semana 6–7)

| Ítem | Estimación |
|------|-----------|
| Dashboard admin con jerarquía + mobile (P5) | 2 días |
| Empty state de /explore con waitlist (P8) | 0.5 días |
| Quick wins restantes: empty state /perfil, OG image, tooltips | 1 día |

**Resultado:** La experiencia diaria de la dueña mejora. El cold start del marketplace tiene respuesta.

---

### Sprint 4 — Conversión y contenido (semana 8–9)

> Este sprint depende de que el contenido (screenshots, testimonials, pricing) esté listo.

| Ítem | Estimación |
|------|-----------|
| Rediseño hero /business con contenido real (P6) | 2 días |
| Mejoras a /salones/[slug]: slots, galería, reviews (P7) | 2 días |
| Meta titles dinámicos por página | 0.5 días |

**Resultado:** La landing de /business convierte. El perfil del salón convierte. El SEO mejora.

---

### Backlog — No planificado aún

Estos ítems están identificados pero no tienen sprint asignado:

- Flujos de cancelación y reprogramación (clienta + dueña)
- Vista mapa en `/explore`
- Sistema de reviews verificadas
- Notificaciones WhatsApp (recordatorio de turno)
- Dashboard /perfil con historial y favoritos completo

---

*Este documento debe vivir en `docs/frontend-ux-plan.md` y actualizarse al cierre de cada sprint.*
