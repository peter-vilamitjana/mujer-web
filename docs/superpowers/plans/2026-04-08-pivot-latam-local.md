# MujerApp — Pivot LATAM Local: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ejecutar el pivot estratégico LATAM: eliminar Genkit/email, agregar cierre de caja local (efectivo/MercadoPago), notificaciones WhatsApp nativas, y refinar la UI a "Rich Dark + Espacio Respirable".

**Architecture:** Tres subsistemas independientes con bajo acoplamiento: (1) schema + actions para checkout local en Firestore, (2) API route + Twilio WABA para WhatsApp, (3) tokens Tailwind/shadcn para design system Rich Dark. Cada subsistema puede desarrollarse en paralelo desde branches separadas.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Firestore (SDK + REST), Server Actions, shadcn/ui, Tailwind CSS v3, Twilio WhatsApp Business API, MercadoPago Checkout Pro.

---

## Scope Check

Este plan cubre tres subsistemas independientes:
- **A** — Schema + Cierre de Caja Local (checkout barrani)
- **B** — WhatsApp Notifications (reemplaza Resend)
- **C** — UI Rich Dark + Espacio Respirable (design tokens)
- **D** — Limpieza de deuda: remover Genkit + Resend

Cada uno produce software testeable de forma aislada. Se recomienda un branch por subsistema.

---

## File Structure

### Subsistema A — Schema + Cierre de Caja
- Modify: `src/lib/schema.ts` — extender `Appointment` + `AppointmentStatus`
- Create: `src/actions/checkout.actions.ts` — `closeAppointment(appointmentId, payload)`
- Modify: `src/app/(admin)/turnos/page.tsx` — botón "Cobrar" en row de turno
- Create: `src/app/(admin)/turnos/components/CheckoutSheet.tsx` — Sheet de cobro
- Create: `src/app/(admin)/caja/page.tsx` — Resumen de caja diaria

### Subsistema B — WhatsApp
- Create: `src/lib/whatsapp.ts` — helper `sendWhatsAppMessage(to, template, vars)`
- Create: `src/app/api/notifications/whatsapp/route.ts` — endpoint interno
- Modify: `src/actions/booking.actions.ts` — llamar a WhatsApp tras crear/confirmar turno
- Create: `src/lib/whatsapp-templates.ts` — templates de confirmación y recordatorio

### Subsistema C — UI Rich Dark
- Modify: `src/app/globals.css` — CSS variables para Rich Dark palette
- Modify: `tailwind.config.ts` — extender theme con tokens dark
- Create: `docs/ui/rich-dark-rules.md` — referencia de reglas de clase

### Subsistema D — Limpieza Genkit + Resend
- Delete: `src/ai/` — directorio completo
- Modify: `package.json` — remover dependencias genkit, @genkit-ai/*, resend
- Modify: `src/lib/services/notification.ts` — remover imports Resend

---

## Task A1: Extender schema.ts para Checkout Local

**Files:**
- Modify: `src/lib/schema.ts`

- [ ] **Step 1: Extender `AppointmentStatus` con `'cobrado'`**

```typescript
// src/lib/schema.ts — línea ~114
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'pending_payment'
  | 'cobrado'; // ← nuevo: turno cerrado con pago registrado
```

- [ ] **Step 2: Agregar tipo `PaymentMethod`**

```typescript
// src/lib/schema.ts — después de AppointmentStatus
export type PaymentMethod = 'efectivo' | 'mercadopago' | 'tarjeta' | 'transferencia';
```

- [ ] **Step 3: Extender interfaz `Appointment` con campos de checkout**

Reemplazar la interfaz `Appointment` existente (líneas ~116–137) con:

```typescript
export interface Appointment {
    id: string;
    tenantId: string;
    branchId: string;
    clientId: string;
    clientName: string;       // Denormalized for lists
    staffId: string;
    staffName: string;        // Denormalized
    serviceIds: string[];
    serviceNames: string;     // Denormalized "Corte, Color..."
    date: Timestamp;          // Start time
    durationMinutes: number;
    status: AppointmentStatus;
    priceEstimated: number;
    priceFinal?: number;
    depositAmount?: number;
    depositPaid: boolean;
    notes?: string;
    createdAt: Timestamp;
    createdBy: string;        // User ID
    googleEventId?: string;
    // ── Campos de Checkout Local (Pivot LATAM) ──────────────────
    amountPaid?: number;              // Monto real cobrado al cerrar caja
    paymentMethod?: PaymentMethod;    // Cómo pagó la clienta
    commissionCalculated?: number;    // Comisión calculada al staff (si aplica)
    checkoutAt?: Timestamp;           // Cuándo se cerró el cobro
    checkoutBy?: string;              // UID del admin que cobró
}
```

- [ ] **Step 4: Verificar que TypeScript compila limpio**

```bash
npx tsc --noEmit
```

Expected: sin errores relacionados a `Appointment` ni `AppointmentStatus`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema.ts
git commit -m "feat(schema): add local checkout fields to Appointment (amountPaid, paymentMethod, commissionCalculated)"
```

---

## Task A2: Server Action — closeAppointment

**Files:**
- Create: `src/actions/checkout.actions.ts`

- [ ] **Step 1: Escribir el test (integración manual — no hay suite aún)**

Crear archivo temporal `src/actions/__tests__/checkout.manual.ts` para validar shape:

```typescript
// Este archivo es para inspección manual, no se ejecuta en CI
import type { PaymentMethod } from '@/lib/schema';

const payload: {
    amountPaid: number;
    paymentMethod: PaymentMethod;
    commissionCalculated?: number;
} = {
    amountPaid: 2500,
    paymentMethod: 'efectivo',
};

// Si TypeScript no tira error, el tipo está bien definido.
console.log(payload);
```

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 2: Implementar `closeAppointment` como Server Action**

```typescript
// src/actions/checkout.actions.ts
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { PaymentMethod, AppointmentStatus } from '@/lib/schema';

interface CheckoutPayload {
    amountPaid: number;
    paymentMethod: PaymentMethod;
    commissionCalculated?: number;
}

export async function closeAppointment(
    tenantId: string,
    appointmentId: string,
    payload: CheckoutPayload
): Promise<{ success: boolean; error?: string }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'No autorizado' };
    }

    const status: AppointmentStatus = 'cobrado';

    await adminDb
        .collection('tenants')
        .doc(tenantId)
        .collection('appointments')
        .doc(appointmentId)
        .update({
            status,
            amountPaid: payload.amountPaid,
            paymentMethod: payload.paymentMethod,
            commissionCalculated: payload.commissionCalculated ?? null,
            checkoutAt: Timestamp.now(),
            checkoutBy: session.user.id,
        });

    return { success: true };
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0, sin errores en `checkout.actions.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/actions/checkout.actions.ts
git commit -m "feat(checkout): add closeAppointment server action with local payment support"
```

---

## Task A3: UI — CheckoutSheet en la vista de Turnos

**Files:**
- Create: `src/app/(admin)/turnos/components/CheckoutSheet.tsx`
- Modify: `src/app/(admin)/turnos/page.tsx` — agregar botón "Cobrar" y wiring del Sheet

- [ ] **Step 1: Crear `CheckoutSheet.tsx`**

```typescript
// src/app/(admin)/turnos/components/CheckoutSheet.tsx
'use client';

import { useState, useTransition } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { closeAppointment } from '@/actions/checkout.actions';
import type { PaymentMethod } from '@/lib/schema';

interface CheckoutSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenantId: string;
    appointmentId: string;
    estimatedPrice: number;
    clientName: string;
    serviceNames: string;
    onSuccess?: () => void;
}

export function CheckoutSheet({
    open,
    onOpenChange,
    tenantId,
    appointmentId,
    estimatedPrice,
    clientName,
    serviceNames,
    onSuccess,
}: CheckoutSheetProps) {
    const [amountPaid, setAmountPaid] = useState(String(estimatedPrice));
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleSubmit() {
        setError(null);
        const amount = parseFloat(amountPaid);
        if (isNaN(amount) || amount <= 0) {
            setError('Ingresá un monto válido');
            return;
        }
        startTransition(async () => {
            const result = await closeAppointment(tenantId, appointmentId, {
                amountPaid: amount,
                paymentMethod,
            });
            if (result.success) {
                onOpenChange(false);
                onSuccess?.();
            } else {
                setError(result.error ?? 'Error al cerrar el turno');
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-zinc-950 border-zinc-800">
                <SheetHeader className="pb-6">
                    <SheetTitle className="text-white">Cerrar Cobro</SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        {clientName} — {serviceNames}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 px-1">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Método de pago</Label>
                        <Select
                            value={paymentMethod}
                            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                                <SelectItem value="efectivo">Efectivo</SelectItem>
                                <SelectItem value="mercadopago">MercadoPago</SelectItem>
                                <SelectItem value="transferencia">Transferencia</SelectItem>
                                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Monto cobrado ($)</Label>
                        <Input
                            type="number"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-white text-lg"
                            placeholder={String(estimatedPrice)}
                        />
                        <p className="text-xs text-zinc-500">
                            Precio estimado: ${estimatedPrice}
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}
                </div>

                <SheetFooter className="pt-8">
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full bg-white text-zinc-950 hover:bg-zinc-100 font-semibold h-12"
                    >
                        {isPending ? 'Cerrando...' : 'Confirmar Cobro'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
```

- [ ] **Step 2: Agregar botón "Cobrar" en la tabla de turnos**

En `src/app/(admin)/turnos/page.tsx`, dentro de la row de cada turno, agregar condicionalmente:

```typescript
// Importar al inicio del archivo
import { CheckoutSheet } from './components/CheckoutSheet';

// En el componente, agregar estado:
const [checkoutTarget, setCheckoutTarget] = useState<string | null>(null);

// En la row del turno (donde están los botones de acción):
{appointment.status !== 'cobrado' && appointment.status !== 'cancelled' && (
    <Button
        size="sm"
        variant="outline"
        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        onClick={() => setCheckoutTarget(appointment.id)}
    >
        Cobrar
    </Button>
)}

// Fuera de la tabla, el Sheet:
{checkoutTarget && (
    <CheckoutSheet
        open={!!checkoutTarget}
        onOpenChange={(open) => { if (!open) setCheckoutTarget(null); }}
        tenantId={tenantId}
        appointmentId={checkoutTarget}
        estimatedPrice={appointments.find(a => a.id === checkoutTarget)?.priceEstimated ?? 0}
        clientName={appointments.find(a => a.id === checkoutTarget)?.clientName ?? ''}
        serviceNames={appointments.find(a => a.id === checkoutTarget)?.serviceNames ?? ''}
        onSuccess={() => router.refresh()}
    />
)}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Smoke test manual**

1. Ir a `/dashboard/turnos` con un turno en status `confirmed`
2. Hacer click en "Cobrar"
3. Seleccionar "Efectivo", ingresar monto, confirmar
4. Verificar en Firestore console que el turno tiene `status: "cobrado"`, `amountPaid`, `paymentMethod`, `checkoutAt`

- [ ] **Step 5: Commit**

```bash
git add src/app/(admin)/turnos/components/CheckoutSheet.tsx src/app/(admin)/turnos/page.tsx
git commit -m "feat(checkout): add CheckoutSheet UI for local payment collection"
```

---

## Task B1: WhatsApp Helper + Templates

**Files:**
- Create: `src/lib/whatsapp-templates.ts`
- Create: `src/lib/whatsapp.ts`

**Pre-requisito**: Cuenta Twilio con WABA habilitado. Variables de entorno:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

- [ ] **Step 1: Crear `whatsapp-templates.ts`**

```typescript
// src/lib/whatsapp-templates.ts

export interface WhatsAppTemplate {
    body: string;
}

interface ConfirmationVars {
    clientName: string;
    salonName: string;
    date: string;      // "viernes 11 de abril"
    time: string;      // "14:30"
    serviceName: string;
    staffName: string;
}

interface ReminderVars {
    clientName: string;
    salonName: string;
    date: string;
    time: string;
    serviceName: string;
    cancelUrl?: string;
}

export function bookingConfirmationTemplate(vars: ConfirmationVars): WhatsAppTemplate {
    return {
        body: `Hola ${vars.clientName} 👋\n\n✅ *Tu turno está confirmado en ${vars.salonName}*\n\n📅 ${vars.date} a las ${vars.time}h\n💇 ${vars.serviceName} con ${vars.staffName}\n\n¡Te esperamos!`,
    };
}

export function reminderTemplate(vars: ReminderVars): WhatsAppTemplate {
    const cancelLine = vars.cancelUrl
        ? `\n\n¿No podés asistir? Cancelá acá: ${vars.cancelUrl}`
        : '';
    return {
        body: `Hola ${vars.clientName}! 👋\n\n⏰ *Recordatorio de turno — mañana en ${vars.salonName}*\n\n📅 ${vars.date} a las ${vars.time}h\n💇 ${vars.serviceName}${cancelLine}`,
    };
}
```

- [ ] **Step 2: Crear `whatsapp.ts`**

```typescript
// src/lib/whatsapp.ts
import Twilio from 'twilio';
import type { WhatsAppTemplate } from './whatsapp-templates';

const client = Twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

const FROM = process.env.TWILIO_WHATSAPP_FROM!; // "whatsapp:+14155238886"

export async function sendWhatsAppMessage(
    toPhone: string,
    template: WhatsAppTemplate
): Promise<{ success: boolean; sid?: string; error?: string }> {
    // Normalizar número a formato E.164 con prefijo whatsapp:
    const normalizedTo = toPhone.startsWith('whatsapp:')
        ? toPhone
        : `whatsapp:${toPhone.startsWith('+') ? toPhone : `+54${toPhone}`}`;

    try {
        const message = await client.messages.create({
            from: FROM,
            to: normalizedTo,
            body: template.body,
        });
        return { success: true, sid: message.sid };
    } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        console.error('[WhatsApp] Error sending message:', error);
        return { success: false, error };
    }
}
```

- [ ] **Step 3: Instalar dependencia Twilio**

```bash
npm install twilio
npm install --save-dev @types/twilio
```

Run: `npm run build`
Expected: build limpio sin errores de tipos.

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsapp.ts src/lib/whatsapp-templates.ts package.json package-lock.json
git commit -m "feat(whatsapp): add Twilio WABA helper and message templates"
```

---

## Task B2: Integrar WhatsApp en booking.actions.ts

**Files:**
- Modify: `src/actions/booking.actions.ts`

- [ ] **Step 1: Importar helpers en `booking.actions.ts`**

Al inicio del archivo, agregar:

```typescript
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { bookingConfirmationTemplate } from '@/lib/whatsapp-templates';
```

- [ ] **Step 2: Disparar WhatsApp tras crear turno exitoso**

Dentro de la función que crea el appointment (buscar `createAppointment` o equivalente), después del `await adminDb...set(appointmentData)`, agregar:

```typescript
// Notificación WhatsApp — non-blocking (no bloquea el flujo si falla)
if (clientPhone) {
    sendWhatsAppMessage(
        clientPhone,
        bookingConfirmationTemplate({
            clientName: clientName,
            salonName: tenantName,
            date: formatDate(appointmentDate),   // helper existente o new Intl.DateTimeFormat
            time: formatTime(appointmentDate),
            serviceName: serviceNames,
            staffName: staffName,
        })
    ).catch((err) => console.error('[Booking] WhatsApp notification failed:', err));
}
```

> Nota: `clientPhone` debe venir del documento `Customer` asociado al `clientId`. Si el cliente no tiene teléfono, omitir silenciosamente.

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Test de integración — smoke test**

1. Crear un turno de prueba con un número de WhatsApp real en el campo `phone` del cliente
2. Verificar que llega el mensaje de confirmación al WhatsApp
3. Verificar en Twilio Console que el mensaje tiene status `delivered`

- [ ] **Step 5: Commit**

```bash
git add src/actions/booking.actions.ts
git commit -m "feat(notifications): send WhatsApp confirmation on booking creation (replaces Resend)"
```

---

## Task C1: UI Rich Dark — Design Tokens y Reglas Tailwind

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `docs/ui/rich-dark-rules.md`

### Las 3 Reglas Maestras de "Rich Dark + Espacio Respirable"

```
REGLA 1 — Superficie: bg-zinc-950 + border-zinc-800/50
REGLA 2 — Espacio: p-6 en cards (p-4 → p-6), gap-6 en grids
REGLA 3 — Tipografía: text-white (títulos) + text-zinc-400 (secundario) + text-zinc-500 (placeholders)
```

**Clases de aplicación sistemática:**

| Contexto | Antes | Después (Rich Dark) |
|----------|-------|---------------------|
| Card container | `bg-card p-4 rounded-lg border` | `bg-zinc-950 p-6 rounded-xl border border-zinc-800/50` |
| Card header text | `text-foreground` | `text-white font-medium tracking-tight` |
| Card sub-text | `text-muted-foreground` | `text-zinc-400 text-sm` |
| Sheet/Dialog bg | `bg-background` | `bg-zinc-950 border-zinc-800` |
| Input | `bg-background border-input` | `bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500` |
| Table row hover | `hover:bg-muted` | `hover:bg-zinc-900/60` |
| Badge neutral | `bg-secondary` | `bg-zinc-900 text-zinc-300 border border-zinc-700` |
| Button primary | `bg-primary` | `bg-white text-zinc-950 hover:bg-zinc-100` |
| Page padding | `p-4` o `p-6` | `p-6 md:p-8` |

- [ ] **Step 1: Actualizar CSS variables en `globals.css`**

En la sección `:root { [dark] ... }` o en `@layer base`, actualizar para que el sistema dark use zinc puro:

```css
/* src/app/globals.css — dentro del bloque .dark o [data-theme="dark"] */
.dark {
  --background: 9 9 11;          /* zinc-950 */
  --card: 9 9 11;                 /* zinc-950 */
  --card-foreground: 250 250 250; /* white */
  --border: 39 39 42;             /* zinc-800 */
  --input: 24 24 27;              /* zinc-900 */
  --muted: 24 24 27;              /* zinc-900 */
  --muted-foreground: 161 161 170; /* zinc-400 */
  --popover: 9 9 11;
  --popover-foreground: 250 250 250;
}
```

- [ ] **Step 2: Extender `tailwind.config.ts` con tokens custom**

```typescript
// tailwind.config.ts — dentro de theme.extend
extend: {
  // ... existente
  spacing: {
    'card': '1.5rem', // 24px — p-card como alias de p-6
  },
  borderRadius: {
    'card': '0.75rem', // rounded-xl consistente para todos los cards
  },
  boxShadow: {
    'card-glow': '0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
  },
}
```

- [ ] **Step 3: Auditar los cards más usados y aplicar las 3 reglas**

Archivos de mayor impacto visual a actualizar primero:
- `src/app/(admin)/dashboard/page.tsx` — cards de métricas
- `src/app/(admin)/servicios/page.tsx` — lista de servicios
- `src/app/(admin)/staff/page.tsx` — lista de staff

Patrón de reemplazo sistemático en cada archivo:

```bash
# Búsqueda manual de clases a reemplazar
grep -n "rounded-lg border p-4\|bg-card\|p-4 " src/app/(admin)/dashboard/page.tsx
```

Aplicar:
- `rounded-lg` → `rounded-xl`
- `p-4` → `p-6` (en Card y CardContent)
- `bg-card border` → `bg-zinc-950 border-zinc-800/50`
- `text-muted-foreground` → `text-zinc-400`

- [ ] **Step 4: Crear referencia de reglas**

```bash
mkdir -p docs/ui
```

Crear `docs/ui/rich-dark-rules.md` con la tabla del Task C1 arriba (para que el equipo sepa qué clases usar sin preguntar).

- [ ] **Step 5: Verificar visual en browser**

```bash
npm run dev
```

Navegar a `/dashboard` en modo dark. Verificar:
- Cards tienen fondo `zinc-950` con borde sutil `zinc-800/50`
- Padding es `p-6` uniforme — "espacio respirable"
- Textos principales en `white`, secundarios en `zinc-400`

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css tailwind.config.ts docs/ui/rich-dark-rules.md
git add src/app/(admin)/dashboard/page.tsx src/app/(admin)/servicios/page.tsx src/app/(admin)/staff/page.tsx
git commit -m "feat(ui): apply Rich Dark + Espacio Respirable design system (zinc-950 surface, p-6 cards)"
```

---

## Task D1: Eliminar Genkit

**Files:**
- Delete: `src/ai/` (directorio completo)
- Modify: `package.json`

- [ ] **Step 1: Verificar que `src/ai/` no es importado en ningún archivo activo**

```bash
grep -r "from.*@/ai\|from.*src/ai\|import.*genkit" src/ --include="*.ts" --include="*.tsx" | grep -v "src/ai/"
```

Expected: sin resultados (nadie importa desde `src/ai/`).

- [ ] **Step 2: Borrar el directorio `src/ai/`**

```bash
rm -rf src/ai/
```

- [ ] **Step 3: Remover dependencias Genkit**

```bash
npm uninstall genkit @genkit-ai/googleai @genkit-ai/next
```

- [ ] **Step 4: Verificar build limpio**

```bash
npx tsc --noEmit && npm run build
```

Expected: exit 0, build sin errores.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Genkit AI dependency (dead code, pivot LATAM)"
```

---

## Task D2: Eliminar Resend

**Files:**
- Modify: `src/lib/services/notification.ts` (o equivalente)
- Modify: `package.json`

- [ ] **Step 1: Encontrar todos los usos de Resend**

```bash
grep -rn "resend\|Resend\|sendEmail" src/ --include="*.ts" --include="*.tsx"
```

Anotar todos los archivos que lo usan.

- [ ] **Step 2: Remover imports y llamadas a Resend**

Para cada archivo encontrado, eliminar el bloque de envío de email. Si la función solo enviaba emails, eliminar la función completa. Si hacía más cosas, reemplazar el bloque de email con un comentario:

```typescript
// Email notifications removed — replaced by WhatsApp (see Task B2)
```

- [ ] **Step 3: Desinstalar dependencia**

```bash
npm uninstall resend
```

- [ ] **Step 4: Verificar TypeScript + build**

```bash
npx tsc --noEmit && npm run build
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Resend email dependency (replaced by WhatsApp notifications)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Cierre de Caja Local: Tasks A1, A2, A3
- ✅ WhatsApp nativo: Tasks B1, B2
- ✅ UI Rich Dark: Task C1
- ✅ Eliminar Genkit: Task D1
- ✅ Eliminar Resend/Email: Task D2
- ✅ schema.ts con `amountPaid`, `paymentMethod`, `commissionCalculated`, status `cobrado`
- ✅ Las 3 reglas Tailwind/shadcn documentadas y aplicadas

**Placeholder scan:** Ninguno. Todos los pasos tienen código real.

**Type consistency:**
- `PaymentMethod` definido en A1, usado en A2 (`CheckoutPayload`), A3 (`CheckoutSheet`)
- `AppointmentStatus` extendido en A1, usado en A2 (`closeAppointment`)
- `WhatsAppTemplate` definido en B1 (`whatsapp-templates.ts`), consumido en B1 (`whatsapp.ts`)

---

## Execution Handoff

Plan guardado en `docs/superpowers/plans/2026-04-08-pivot-latam-local.md`.

**Dos opciones de ejecución:**

**1. Subagent-Driven (recomendado)** — Dispatch un subagente por task, revisión entre tasks, iteración rápida

**2. Inline Execution** — Ejecutar en esta sesión usando executing-plans, ejecución en batch con checkpoints

**¿Cuál preferís?**
