import { z } from 'zod';

// ── Helper para parsear con error legible ──────────────────────────────────

export function parseOrError<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const firstError = result.error.errors[0];
  return { ok: false, error: firstError?.message ?? 'Datos inválidos.' };
}

// ── Booking (usuarios con cuenta) ──────────────────────────────────────────

const PHONE_RE = /^\+?[\d\s\-().]{6,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isNotPastDate(dateStr: string): boolean {
  const bookingDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
}

export const bookingPayloadSchema = z
  .object({
    tenantId: z.string().min(1, 'Salón inválido.'),
    staffId: z.string().min(1, 'Profesional inválido.'),
    staffName: z.string().min(1).max(100),
    serviceIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un servicio.'),
    serviceNames: z.string().min(1).max(500),
    date: z.string().regex(DATE_RE, 'Fecha inválida.'),
    time: z.string().regex(TIME_RE, 'Hora inválida.'),
    durationMinutes: z.number().int().min(5, 'Duración inválida.').max(480, 'Duración inválida.'),
    totalFrom: z.number().finite().min(0, 'Precio inválido.').max(1_000_000, 'Precio inválido.'),
    depositAmount: z.number().finite().min(0, 'Seña inválida.'),
    // clientPhone es requerido por el tipo pero se permite vacío — solo se
    // valida el formato cuando viene con contenido (mismo comportamiento
    // que el validador manual que reemplaza).
    clientPhone: z.string().refine(
      (v) => !v.trim() || PHONE_RE.test(v.trim()),
      'El teléfono no tiene un formato válido.',
    ),
  })
  .refine((data) => data.depositAmount <= data.totalFrom, {
    message: 'Seña inválida.',
    path: ['depositAmount'],
  })
  .refine((data) => isNotPastDate(data.date), {
    message: 'No se puede reservar en una fecha pasada.',
    path: ['date'],
  });

// ── Guest booking (invitados sin cuenta) ───────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const guestBookingPayloadSchema = z
  .object({
    tenantId: z.string().min(1, 'Salón inválido.'),
    staffId: z.string().min(1, 'Profesional inválido.'),
    staffName: z.string().min(1).max(100),
    serviceIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un servicio.'),
    serviceNames: z.string().min(1).max(500),
    date: z.string().regex(DATE_RE, 'Fecha inválida.'),
    time: z.string().regex(TIME_RE, 'Hora inválida.'),
    totalFrom: z.number().finite().min(0, 'Precio inválido.').max(1_000_000, 'Precio inválido.'),
    durationMinutes: z.number().int().min(5, 'Duración inválida.').max(480, 'Duración inválida.'),
    guestName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100, 'El nombre es demasiado largo.'),
    guestEmail: z.string().max(254, 'El email es demasiado largo.').refine(
      (v) => !v.trim() || EMAIL_RE.test(v.trim()),
      'El email no tiene un formato válido.',
    ),
    guestPhone: z.string().trim().min(1, 'El teléfono es obligatorio.').refine(
      (v) => PHONE_RE.test(v),
      'El teléfono no tiene un formato válido.',
    ),
  })
  .refine((data) => isNotPastDate(data.date), {
    message: 'No se puede reservar en una fecha pasada.',
    path: ['date'],
  });

// ── Checkout ────────────────────────────────────────────────────────────────

export const checkoutPayloadSchema = z.object({
  amountPaid: z.number().finite().min(0, 'Monto inválido.').max(10_000_000, 'Monto inválido.'),
  paymentMethod: z.enum(['efectivo', 'mercadopago', 'tarjeta', 'transferencia']),
  paymentMethods: z
    .object({
      efectivo: z.number().finite().min(0).optional(),
      mercadopago: z.number().finite().min(0).optional(),
      tarjeta: z.number().finite().min(0).optional(),
      transferencia: z.number().finite().min(0).optional(),
    })
    .optional(),
  commissionCalculated: z.number().min(0).max(100).optional().nullable(),
});

// ── MercadoPago Webhook ─────────────────────────────────────────────────────

export const mpWebhookPaymentSchema = z.object({
  status: z.string(), // MP puede mandar valores fuera del enum documentado — no rechazar, solo tipar como string
  status_detail: z.string(),
  amount: z.number().finite().min(0),
  external_reference: z.string(),
});
