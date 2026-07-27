# Sprint 1 — Cerrar el flujo A de la clienta

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Una clienta puede llegar a MujerApp, encontrar un salón, reservar sin crear cuenta y recibir confirmación — en ese orden, sin fricción.

**Architecture:** (1) Login diferenciado con tabs B2C/B2B — el `role` ya está en el JWT, solo hay que agregar UI. (2) Guest checkout — nueva Server Action `createGuestBooking` sin sesión, campo `isGuestBooking` en schema, `BookingFlow` con modo invitado. (3) Página de confirmación en `/salones/[slug]/book/confirmation/[id]`. (4) Quick wins en header y stepper en BookingFlow.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui, framer-motion, Firebase Firestore REST (server-side), NextAuth.js v4.

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| Modify | `src/app/login/page.tsx` |
| Modify | `src/components/landing/LandingHeader.tsx` |
| Modify | `src/lib/schema.ts` (Appointment interface) |
| Modify | `src/app/(marketplace)/(public)/salones/[tenantSlug]/book/page.tsx` |
| Modify | `src/components/marketplace/BookingFlow.tsx` |
| Modify | `src/actions/booking.actions.ts` |
| Create | `src/actions/guest-booking.actions.ts` |
| Create | `src/app/(marketplace)/(public)/salones/[tenantSlug]/book/confirmation/[appointmentId]/page.tsx` |

---

## Task 1: Login diferenciado B2C/B2B

**Archivos:**
- Modify: `src/app/login/page.tsx`

El objetivo es agregar dos tabs en la parte superior del card: "Soy clienta" / "Soy dueña de salón". No cambia la lógica de auth — solo el copy y un link extra en el tab de dueñas.

### Estado actual relevante
- El redirect post-login YA funciona: `session?.user?.role === 'customer' ? '/perfil' : '/dashboard'` (línea 116)
- El formulario actual es solo login + registro para clientas
- No hay diferenciación de audiencia

### Qué cambiar

- [ ] **Step 1: Agregar estado `userType` al componente**

Al inicio del componente (después de las declaraciones de estado existentes), agregar:

```tsx
const [userType, setUserType] = useState<'clienta' | 'duena'>('clienta');
```

- [ ] **Step 2: Agregar el selector de tipo de usuario antes del card**

Dentro del `motion.div` principal, ANTES del div con `rounded-[28px]`, insertar:

```tsx
{/* ── Selector de tipo de usuario ──────────────────────────── */}
<div className="flex gap-2 mb-4">
  <button
    type="button"
    onClick={() => setUserType('clienta')}
    className={cn(
      'flex-1 py-2.5 rounded-xl text-[9px] tracking-[0.35em] uppercase font-bold transition-all duration-200 cursor-pointer',
      userType === 'clienta'
        ? 'bg-white text-black'
        : 'bg-white/[0.07] text-white/40 border border-white/10 hover:bg-white/[0.12] hover:text-white/70'
    )}
  >
    Soy clienta
  </button>
  <button
    type="button"
    onClick={() => setUserType('duena')}
    className={cn(
      'flex-1 py-2.5 rounded-xl text-[9px] tracking-[0.35em] uppercase font-bold transition-all duration-200 cursor-pointer',
      userType === 'duena'
        ? 'bg-white text-black'
        : 'bg-white/[0.07] text-white/40 border border-white/10 hover:bg-white/[0.12] hover:text-white/70'
    )}
  >
    Soy dueña de salón
  </button>
</div>
```

- [ ] **Step 3: Cambiar el copy del heading según `userType`**

En el bloque del heading de modo `login` (línea ~227-239), reemplazar el JSX estático por uno condicional:

```tsx
{mode === 'login' ? (
  <div>
    <p className="text-[8px] tracking-[0.65em] uppercase text-white/35 font-bold mb-2">
      {userType === 'duena' ? 'Panel de Salones' : "L'Art de Vivre"}
    </p>
    <h1 className="font-vogue text-[42px] leading-[1.05] mb-1.5">
      {userType === 'duena' ? (
        <>
          <span className="italic text-white/90">Gestión</span>
          <br />
          <span className="not-italic text-white">de Salones</span>
        </>
      ) : (
        <>
          <span className="italic text-white/90">Membres</span>
          <br />
          <span className="not-italic text-white">Privés</span>
        </>
      )}
    </h1>
    <p className="text-white/35 text-[10px] tracking-[0.25em] uppercase">
      {userType === 'duena' ? 'Gestioná tu salón desde un solo lugar' : 'Ingrese a su santuario de estilo'}
    </p>
  </div>
) : (
  /* ... bloque de registro sin cambios ... */
)}
```

- [ ] **Step 4: Agregar link a `/business/register` en el tab de dueñas**

En la sección de submit del login form (`pt-2 space-y-2.5`), DESPUÉS del botón "CREAR UNA CUENTA", agregar condicionalmente:

```tsx
{userType === 'duena' && (
  <div className="pt-1 text-center">
    <p className="text-[8px] tracking-[0.2em] text-white/25 mb-1.5 uppercase">¿Aún no tenés tu salón?</p>
    <Link
      href="/business/register"
      className="text-[8px] tracking-[0.25em] uppercase font-bold text-white/50 hover:text-white/80 underline underline-offset-2 transition-colors duration-200"
    >
      Registrá tu salón gratis →
    </Link>
  </div>
)}
```

- [ ] **Step 5: Verificar que el build compila sin errores**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores de TypeScript.

- [ ] **Step 6: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat(login): add B2C/B2B tab selector with role-aware copy and dueña registration link"
```

---

## Task 2: CTAs diferenciados en LandingHeader

**Archivos:**
- Modify: `src/components/landing/LandingHeader.tsx`

### Estado actual relevante
- Nav links actuales son placeholders: `L'Atelier`, `Édition`, `Membres` — todos `href="#"`
- Solo hay un CTA al final ("Sign In" / "Mi Perfil")

### Qué cambiar

- [ ] **Step 1: Reemplazar los nav links placeholder por CTAs reales**

En `LandingHeader.tsx`, reemplazar el bloque `<nav className="hidden md:flex gap-12 items-center">` completo por:

```tsx
<nav className="hidden md:flex gap-8 items-center">
  <Link
    href="/explore"
    className={cn(
      "relative px-4 py-2 rounded-full text-[10px] tracking-[0.35em] uppercase font-medium transition-all duration-300",
      "before:absolute before:inset-0 before:rounded-full before:opacity-0 before:transition-all before:duration-300",
      "hover:before:opacity-100",
      textWhite
        ? "text-white/70 hover:text-white before:bg-white/10 before:backdrop-blur-sm before:border before:border-white/20"
        : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] before:bg-black/5 before:backdrop-blur-sm before:border before:border-black/10"
    )}
  >
    <span className="relative z-10">Reservar turno</span>
  </Link>
  <Link
    href="/business"
    className={cn(
      "relative px-4 py-2 rounded-full text-[10px] tracking-[0.35em] uppercase font-medium transition-all duration-300",
      "before:absolute before:inset-0 before:rounded-full before:opacity-0 before:transition-all before:duration-300",
      "hover:before:opacity-100",
      textWhite
        ? "text-white/70 hover:text-white before:bg-white/10 before:backdrop-blur-sm before:border before:border-white/20"
        : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] before:bg-black/5 before:backdrop-blur-sm before:border before:border-black/10"
    )}
  >
    <span className="relative z-10">Sumá tu salón</span>
  </Link>

  {mounted && (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-all duration-300",
        textWhite ? "text-white" : "text-[#1A1A1A]"
      )}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )}

  <Link
    className={cn(
      "relative text-[10px] uppercase tracking-[0.3em] font-bold px-8 py-3 rounded-full font-inter overflow-hidden group",
      "transition-all duration-500 ease-out hover:px-12",
      textWhite
        ? "bg-white/15 backdrop-blur-md border border-white/25 text-white hover:bg-white/25 hover:border-white/40 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)]"
        : "bg-black/10 backdrop-blur-md border border-black/20 text-[#1A1A1A] hover:bg-black/20 hover:border-black/30 hover:shadow-[0_0_24px_rgba(0,0,0,0.1)]"
    )}
    href={status === 'authenticated' ? '/perfil' : '/login'}
  >
    <span className="absolute inset-x-0 top-0 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/50" />
    <span className="relative z-10 group-hover:tracking-[0.45em] transition-all duration-500">
      {status === 'authenticated' ? 'Mi Perfil' : 'Sign In'}
    </span>
  </Link>
</nav>
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingHeader.tsx
git commit -m "feat(header): replace placeholder nav links with Reservar turno + Sumá tu salón CTAs"
```

---

## Task 3: Agregar `isGuestBooking` al schema de Appointment

**Archivos:**
- Modify: `src/lib/schema.ts`

- [ ] **Step 1: Agregar campos guest al interface Appointment**

En `src/lib/schema.ts`, dentro de `export interface Appointment { ... }`, DESPUÉS del campo `source?: string;` (o `createdBy: string;`), agregar:

```ts
source?: string;           // ya existente: 'marketplace' | 'admin'
// ── Guest booking (reservas sin cuenta) ────────────────────
isGuestBooking?: boolean;  // true cuando reserva sin sesión NextAuth
guestEmail?: string;       // email del invitado para confirmación
guestPhone?: string;       // WhatsApp del invitado
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/schema.ts
git commit -m "feat(schema): add isGuestBooking, guestEmail, guestPhone to Appointment"
```

---

## Task 4: Server Action `createGuestBooking`

**Archivos:**
- Create: `src/actions/guest-booking.actions.ts`

Esta action crea una reserva sin sesión NextAuth. No usa `getServerSession`. Escribe el appointment con `isGuestBooking: true` y no crea un customer en el CRM (los guests no son clientes registrados aún).

- [ ] **Step 1: Crear el archivo**

```ts
'use server';

import {
  collection, doc, setDoc, getDoc, serverTimestamp, Timestamp, query, where, limit, getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { buildConfirmationMessage } from '@/lib/whatsapp-templates';

export interface GuestBookingPayload {
  tenantId: string;
  tenantSlug: string;
  staffId: string;
  staffName: string;
  serviceIds: string[];
  serviceNames: string;
  date: string;        // ISO string
  time: string;        // 'HH:MM'
  totalFrom: number;
  durationMinutes: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

async function getDefaultBranchId(tenantId: string): Promise<string> {
  const branchesRef = collection(db, 'tenants', tenantId, 'branches');
  const q = query(branchesRef, where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  const allSnap = await getDocs(query(branchesRef, limit(1)));
  return allSnap.empty ? 'default' : allSnap.docs[0].id;
}

export async function createGuestBooking(
  payload: GuestBookingPayload
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  try {
    const tenantSnap = await getDoc(doc(db, 'tenants', payload.tenantId));
    if (!tenantSnap.exists() || tenantSnap.data().isActivePublicly !== true) {
      return { success: false, error: 'Este salón no está disponible para reservas.' };
    }
    const tenantName: string = tenantSnap.data().name ?? 'tu salón';

    const [hour, minute] = payload.time.split(':').map(Number);
    const appointmentDateTime = new Date(payload.date);
    appointmentDateTime.setHours(hour, minute, 0, 0);

    const appointmentRef = doc(collection(db, 'tenants', payload.tenantId, 'appointments'));
    await setDoc(appointmentRef, {
      id: appointmentRef.id,
      tenantId: payload.tenantId,
      branchId: await getDefaultBranchId(payload.tenantId),
      clientId: null,
      clientName: payload.guestName,
      staffId: payload.staffId,
      staffName: payload.staffName,
      serviceIds: payload.serviceIds,
      serviceNames: payload.serviceNames,
      date: Timestamp.fromDate(appointmentDateTime),
      durationMinutes: payload.durationMinutes,
      status: 'pending',
      priceEstimated: payload.totalFrom,
      depositAmount: 0,
      depositPaid: false,
      createdAt: serverTimestamp(),
      createdBy: 'guest',
      source: 'marketplace',
      isGuestBooking: true,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone,
      notes: '',
    });

    // WhatsApp confirmation — non-blocking
    sendWhatsAppMessage(
      buildConfirmationMessage({
        clientName: payload.guestName,
        salonName: tenantName,
        date: new Date(payload.date).toLocaleDateString('es-AR', {
          weekday: 'long', day: 'numeric', month: 'long',
        }),
        time: payload.time,
        serviceName: payload.serviceNames,
        staffName: payload.staffName,
        clientPhone: payload.guestPhone,
      })
    ).catch((err) => console.error('[createGuestBooking] WhatsApp failed:', err));

    return { success: true, appointmentId: appointmentRef.id };
  } catch (error) {
    console.error('[createGuestBooking] Error:', error);
    return { success: false, error: 'No se pudo crear el turno. Intentá de nuevo.' };
  }
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/actions/guest-booking.actions.ts
git commit -m "feat(booking): add createGuestBooking server action for unauthenticated reservations"
```

---

## Task 5: Página de confirmación de turno

**Archivos:**
- Create: `src/app/(marketplace)/(public)/salones/[tenantSlug]/book/confirmation/[appointmentId]/page.tsx`

Server Component que lee el appointment de Firestore (REST o SDK server-side) y muestra la confirmación.

- [ ] **Step 1: Verificar cómo el resto de páginas lee de Firestore server-side**

```bash
grep -r "getServerSession\|getDoc\|getSalon" /Users/pedrovilamitjana/MujerApp/mujer-web/src/app/\(marketplace\) --include="*.tsx" -l
```

Revisar cómo `getSalonBySlug` lee Firestore para seguir el mismo patrón.

- [ ] **Step 2: Verificar qué exporta `marketplace.service.ts`**

```bash
grep "^export" /Users/pedrovilamitjana/MujerApp/mujer-web/src/lib/services/marketplace.service.ts
```

- [ ] **Step 3: Crear la página de confirmación**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSalonBySlug } from '@/lib/services/marketplace.service';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  params: Promise<{ tenantSlug: string; appointmentId: string }>;
}

export default async function BookConfirmationPage({ params }: Props) {
  const { tenantSlug, appointmentId } = await params;

  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  // Leer appointment desde Firestore (server-side)
  const appointmentSnap = await getDoc(
    doc(db, 'tenants', salon.id, 'appointments', appointmentId)
  );
  if (!appointmentSnap.exists()) notFound();

  const appt = appointmentSnap.data();
  const appointmentDate: Date = appt.date?.toDate?.() ?? new Date();
  const formattedDate = format(appointmentDate, "EEEE d 'de' MMMM", { locale: es });
  const formattedTime = format(appointmentDate, 'HH:mm');

  const calendarUrl = (() => {
    const start = appointmentDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(appointmentDate.getTime() + (appt.durationMinutes ?? 60) * 60000)
      .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(`Turno en ${salon.name}`);
    const details = encodeURIComponent(appt.serviceNames ?? '');
    const location = encodeURIComponent(salon.address ?? '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  })();

  const whatsappShareUrl = (() => {
    const msg = encodeURIComponent(
      `¡Reservé mi turno en ${salon.name}! 📅 ${formattedDate} a las ${formattedTime} — ${appt.serviceNames}`
    );
    return `https://wa.me/?text=${msg}`;
  })();

  const mapsUrl = salon.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* ── Éxito ── */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">¡Turno confirmado!</h1>
          <p className="text-muted-foreground text-sm">
            Revisá tu WhatsApp, te enviamos los detalles.
          </p>
        </div>

        {/* ── Resumen ── */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Salón</span>
              <span className="font-medium">{salon.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Servicio</span>
              <span className="font-medium text-right max-w-[55%]">{appt.serviceNames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profesional</span>
              <span className="font-medium">{appt.staffName}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha</span>
              <span className="font-medium capitalize">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora</span>
              <span className="font-medium">{formattedTime}</span>
            </div>
            {salon.address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dirección</span>
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-right max-w-[55%] underline underline-offset-2 hover:text-foreground text-muted-foreground"
                  >
                    {salon.address}
                  </a>
                ) : (
                  <span className="font-medium text-right max-w-[55%]">{salon.address}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Acciones ── */}
        <div className="space-y-3">
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-border bg-card hover:bg-accent text-sm font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Agregar a Google Calendar
          </a>
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Compartir por WhatsApp
          </a>
        </div>

        {/* ── CTA registro guest ── */}
        {appt.isGuestBooking && (
          <div className="rounded-2xl border border-border bg-card/50 p-5 text-center space-y-3">
            <p className="text-sm font-medium">¿Querés gestionar tus turnos fácil?</p>
            <p className="text-xs text-muted-foreground">Creá tu cuenta y accedé a tu historial, recordatorios y más.</p>
            <Link
              href={`/registro?email=${encodeURIComponent(appt.guestEmail ?? '')}&name=${encodeURIComponent(appt.clientName ?? '')}`}
              className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-foreground text-background text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              Crear mi cuenta
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link
            href={`/salones/${tenantSlug}`}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            ← Volver al salón
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(marketplace\)/\(public\)/salones/\[tenantSlug\]/book/confirmation/
git commit -m "feat(booking): add confirmation page with calendar, maps, and WhatsApp share"
```

---

## Task 6: Modificar book/page.tsx para permitir acceso sin sesión

**Archivos:**
- Modify: `src/app/(marketplace)/(public)/salones/[tenantSlug]/book/page.tsx`

### Cambio requerido

Actualmente hay un `redirect('/login?callbackUrl=...')` cuando no hay sesión. Eliminar ese redirect para permitir el guest checkout.

- [ ] **Step 1: Reemplazar el guard de sesión por un prop opcional**

```tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSalonBySlug, getSalonServices, getSalonStaff } from '@/lib/services/marketplace.service';
import { notFound } from 'next/navigation';
import BookingFlow from '@/components/marketplace/BookingFlow';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function BookPage({ params }: Props) {
  const { tenantSlug } = await params;

  // Obtener sesión opcionalmente — no redirigir si no hay (guest checkout)
  const session = await getServerSession(authOptions);

  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  const [services, staff] = await Promise.all([
    getSalonServices(salon.id),
    getSalonStaff(salon.id),
  ]);

  return (
    <div className="container mx-auto mt-4 px-2">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold mb-1 tracking-tight">Reservar turno en {salon.name}</h1>
        <p className="text-sm text-muted-foreground">Elegí tus servicios, profesional y horario.</p>
      </div>
      <BookingFlow
        tenantId={salon.id}
        tenantSlug={tenantSlug}
        services={services}
        staff={staff}
        isAuthenticated={!!session}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript (va a fallar hasta actualizar BookingFlow props — es esperado)**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1 | head -30
```

Esperado: error de `isAuthenticated` prop no reconocido en BookingFlow. Continuar con Task 7.

---

## Task 7: Guest mode en BookingFlow

**Archivos:**
- Modify: `src/components/marketplace/BookingFlow.tsx`

Este es el cambio más grande. Hay que:
1. Agregar prop `isAuthenticated: boolean`
2. Remover el early return que muestra "Necesitás iniciar sesión"
3. Agregar estado para datos del guest: `guestName`, `guestEmail`, `guestPhone`
4. Mostrar form de datos del guest cuando `!isAuthenticated` en el paso final
5. Llamar `createGuestBooking` cuando no hay sesión, `createBooking` cuando sí hay
6. Agregar stepper de 3 pasos visual (ya existe `step` state, falta el UI)
7. Redirigir a confirmation en lugar de `/salones/${tenantSlug}/dashboard`

- [ ] **Step 1: Agregar prop `isAuthenticated` a la interface Props**

En las líneas 29-34 de `BookingFlow.tsx`:

```tsx
interface Props {
  tenantId: string;
  tenantSlug: string;
  services: Service[];
  staff: Staff[];
  isAuthenticated: boolean;
}
```

- [ ] **Step 2: Actualizar la firma de la función**

```tsx
export default function BookingFlow({ tenantId, tenantSlug, services, staff, isAuthenticated }: Props) {
```

- [ ] **Step 3: Agregar estados para guest y stepper label**

Después de `const [phoneTouched, setPhoneTouched] = useState(false);` (línea ~88), agregar:

```tsx
// Guest mode state
const [guestName, setGuestName] = useState('');
const [guestEmail, setGuestEmail] = useState('');
const [guestPhone, setGuestPhone] = useState('');
```

- [ ] **Step 4: Agregar import de `createGuestBooking`**

En la línea 16 (imports de actions), agregar:

```tsx
import { getAvailableSlots, createBooking } from '@/actions/booking.actions';
import { createGuestBooking } from '@/actions/guest-booking.actions';
```

- [ ] **Step 5: Reemplazar el early return de `unauthenticated`**

Eliminar el bloque (líneas 153-162):

```tsx
if (status === 'unauthenticated') {
  return (
    <div className="text-center py-12 space-y-4">
      <p className="text-muted-foreground">Necesitás iniciar sesión para reservar un turno.</p>
      <Button onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)}>
        Iniciar sesión
      </Button>
    </div>
  );
}
```

No reemplazar por nada — el componente continúa mostrando el flujo de reserva.

- [ ] **Step 6: Agregar stepper de 3 pasos al inicio del JSX renderizado**

En el `return (` del componente, ANTES de la primera Card de servicios, agregar:

```tsx
{/* ── Stepper de progreso ─────────────────────────────────── */}
<div className="flex items-center justify-center gap-0 mb-8 max-w-sm mx-auto">
  {[
    { n: 1, label: 'Servicio' },
    { n: 2, label: 'Horario' },
    { n: 3, label: 'Confirmar' },
  ].map(({ n, label }, idx) => (
    <div key={n} className="flex items-center">
      <div className="flex flex-col items-center gap-1.5">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
          step >= n
            ? 'bg-foreground text-background'
            : 'bg-muted text-muted-foreground border border-border'
        )}>
          {step > n ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : n}
        </div>
        <span className={cn(
          'text-[9px] uppercase tracking-wider font-medium',
          step >= n ? 'text-foreground' : 'text-muted-foreground'
        )}>{label}</span>
      </div>
      {idx < 2 && (
        <div className={cn(
          'h-px w-16 mx-2 transition-colors duration-300',
          step > n ? 'bg-foreground' : 'bg-border'
        )} />
      )}
    </div>
  ))}
</div>
```

- [ ] **Step 7: Agregar campos de datos guest en el paso 3 (confirmación)**

En el `finalConfirmation` block (paso final antes de confirmar), agregar el formulario de datos del invitado cuando `!isAuthenticated`.

Buscar la sección donde se renderiza el bloque de confirmación final (donde `finalConfirmation === true`). Dentro del formulario de confirmación, agregar ANTES del campo de teléfono existente:

```tsx
{!isAuthenticated && (
  <div className="space-y-3 border-b border-border pb-4 mb-4">
    <p className="text-sm font-medium text-foreground">Tus datos de contacto</p>
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">Nombre completo</label>
      <input
        type="text"
        placeholder="Tu nombre"
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
      <input
        type="email"
        placeholder="tu@email.com"
        value={guestEmail}
        onChange={(e) => setGuestEmail(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">WhatsApp</label>
      <input
        type="tel"
        placeholder="9 11 XXXX-XXXX"
        value={guestPhone}
        onChange={(e) => setGuestPhone(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  </div>
)}
```

- [ ] **Step 8: Reemplazar `handleSubmit` para soportar ambos modos**

En `handleSubmit`, reemplazar la llamada a `createBooking` con lógica condicional:

```tsx
const handleSubmit = () => {
  if (!selectedStaff || selectedServices.length === 0 || !selectedDate || !selectedTime) {
    toast({ title: "Faltan datos", description: "Completá todos los pasos.", variant: "destructive" });
    return;
  }

  // Validación de datos guest
  if (!isAuthenticated) {
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      toast({ title: "Datos requeridos", description: "Completá nombre, email y WhatsApp para continuar.", variant: "destructive" });
      return;
    }
  } else if (!isPhoneValid) {
    setPhoneTouched(true);
    toast({ title: "Teléfono requerido", description: "Por favor ingresá un número de WhatsApp válido.", variant: "destructive" });
    return;
  }

  const selectedServiceNames = selectedServices.map(s => {
    let name = s.name;
    if (typeof s.price === 'object' && s.largo) name += ` (${s.largo})`;
    return name;
  }).join(', ');

  startTransition(async () => {
    let appointmentId: string | undefined;

    if (!isAuthenticated) {
      // Guest booking — sin sesión
      const result = await createGuestBooking({
        tenantId,
        tenantSlug,
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        serviceIds: selectedServices.map(s => s.id),
        serviceNames: selectedServiceNames,
        date: selectedDate.toISOString(),
        time: selectedTime,
        totalFrom,
        durationMinutes: totalDuration,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
      });

      if (!result.success) {
        toast({ title: "Error", description: result.error ?? 'No se pudo crear el turno.', variant: "destructive" });
        return;
      }
      appointmentId = result.appointmentId;
    } else {
      // Authenticated booking — flujo existente
      const result = await createBooking({
        tenantId,
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        serviceIds: selectedServices.map(s => s.id),
        serviceNames: selectedServiceNames,
        selectedServices: selectedServices.map(s => ({
          id: s.id,
          nombre: s.name,
          largo: s.largo,
          duracion: s.durationMinutes,
          precio: typeof s.price === 'number' ? s.price : undefined,
          precios: typeof s.price === 'object' ? { ...(s.price as ServicePriceByLength) } as Record<string, number> : undefined,
          preciosHasta: s.priceHasta ? { ...(s.priceHasta as ServicePriceByLength) } as Record<string, number> : undefined,
          requiereLargo: s.requiresLengthSelection,
          variable: s.variablePrice,
        })),
        date: selectedDate.toISOString(),
        time: selectedTime,
        totalFrom,
        totalTo,
        depositAmount,
        durationMinutes: totalDuration,
        clientPhone,
      });

      if (!result.success) {
        toast({ title: "Error", description: result.error ?? 'No se pudo crear el turno.', variant: "destructive" });
        return;
      }

      // MercadoPago seña (solo usuarios autenticados)
      if (depositAmount > 0 && result.appointmentId) {
        const mpResult = await createDepositPreference({
          appointmentId: result.appointmentId,
          tenantId,
          tenantSlug,
          depositAmount,
          serviceNames: selectedServiceNames,
        });

        if ('checkoutUrl' in mpResult) {
          window.location.href = mpResult.checkoutUrl;
          return;
        }
        if (!('error' in mpResult && mpResult.error === 'MP_NOT_CONFIGURED')) {
          toast({ title: "Advertencia", description: "No se pudo procesar el pago. El turno quedó reservado sin seña.", variant: "destructive" });
        }
      }
      appointmentId = result.appointmentId;
    }

    // Redirigir a confirmación
    router.push(`/salones/${tenantSlug}/book/confirmation/${appointmentId}`);
  });
};
```

- [ ] **Step 9: Verificar TypeScript**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1 | head -50
```

Esperado: sin errores. Si hay errores, aplicar systematic-debugging.

- [ ] **Step 10: Commit**

```bash
git add src/app/\(marketplace\)/\(public\)/salones/\[tenantSlug\]/book/page.tsx src/components/marketplace/BookingFlow.tsx
git commit -m "feat(booking): add guest checkout mode with stepper UI and confirmation redirect"
```

---

## Verificación final (verification-before-completion)

- [ ] **Step 1: TypeScript clean**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npx tsc --noEmit 2>&1
```

Esperado: exit code 0, sin errores.

- [ ] **Step 2: Build limpio**

```bash
cd /Users/pedrovilamitjana/MujerApp/mujer-web && npm run build 2>&1 | tail -20
```

Esperado: `Route (app)` table visible, sin errores de compilación.

- [ ] **Step 3: Checklist de requisitos del Sprint 1**

| Requisito | Verificación |
|-----------|-------------|
| Login diferenciado B2C/B2B | Tab "Soy clienta" / "Soy dueña" visible en `/login` |
| Redirect por rol correcto | Role `customer` → `/perfil`, `staff` → `/dashboard` (ya existía, verificar) |
| Guest checkout | `/book` accesible sin sesión, muestra form de nombre/email/teléfono |
| Página de confirmación | `/salones/[slug]/book/confirmation/[id]` muestra resumen, calendar link, WhatsApp share |
| CTAs en header | "Reservar turno" → `/explore`, "Sumá tu salón" → `/business` visible en header |
| Progress stepper | 3 pasos visibles en `/book` durante el flujo |
