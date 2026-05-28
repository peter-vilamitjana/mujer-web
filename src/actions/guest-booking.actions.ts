'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { buildConfirmationMessage } from '@/lib/whatsapp-templates';
import { hasSlotConflict } from '@/lib/booking-utils';

export interface GuestBookingPayload {
  tenantId: string;
  tenantSlug: string;
  staffId: string;
  staffName: string;
  serviceIds: string[];
  serviceNames: string;
  date: string;
  time: string;
  totalFrom: number;
  durationMinutes: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

// ─── Validators ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{6,20}$/;
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE  = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateGuestBooking(p: GuestBookingPayload): string | null {
  // Identidad del invitado
  const name = p.guestName?.trim() ?? '';
  if (!name || name.length < 2)    return 'El nombre debe tener al menos 2 caracteres.';
  if (name.length > 100)           return 'El nombre es demasiado largo.';

  const email = p.guestEmail?.trim() ?? '';
  if (email && !EMAIL_RE.test(email)) return 'El email no tiene un formato válido.';
  if (email.length > 254)          return 'El email es demasiado largo.';

  const phone = p.guestPhone?.trim() ?? '';
  if (!phone)                      return 'El teléfono es obligatorio.';
  if (!PHONE_RE.test(phone))       return 'El teléfono no tiene un formato válido.';

  // Fecha y hora
  if (!DATE_RE.test(p.date))       return 'Fecha inválida.';
  if (!TIME_RE.test(p.time))       return 'Hora inválida.';

  // La fecha no puede ser en el pasado (comparación a nivel de día)
  const bookingDate = new Date(p.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today)         return 'No se puede reservar en una fecha pasada.';

  // Duración y precio
  if (!Number.isInteger(p.durationMinutes) || p.durationMinutes < 5 || p.durationMinutes > 480) {
    return 'Duración inválida.';
  }
  if (!Number.isFinite(p.totalFrom) || p.totalFrom < 0 || p.totalFrom > 1_000_000) {
    return 'Precio inválido.';
  }

  // IDs mínimos
  if (!p.tenantId?.trim())         return 'Salón inválido.';
  if (!p.staffId?.trim())          return 'Profesional inválido.';
  if (!Array.isArray(p.serviceIds) || p.serviceIds.length === 0) {
    return 'Debe seleccionar al menos un servicio.';
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getDefaultBranchId(tenantId: string): Promise<string> {
  const snap = await adminDb
    .collection('tenants').doc(tenantId)
    .collection('branches')
    .where('active', '==', true)
    .limit(1)
    .get();
  if (!snap.empty) return snap.docs[0].id;
  const allSnap = await adminDb
    .collection('tenants').doc(tenantId)
    .collection('branches')
    .limit(1)
    .get();
  return allSnap.empty ? 'default' : allSnap.docs[0].id;
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function createGuestBooking(
  payload: GuestBookingPayload
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  // Validación server-side antes de tocar Firestore
  const validationError = validateGuestBooking(payload);
  if (validationError) return { success: false, error: validationError };

  // Normalizar strings limpios
  const guestName  = payload.guestName.trim().slice(0, 100);
  const guestEmail = payload.guestEmail.trim().toLowerCase().slice(0, 254);
  const guestPhone = payload.guestPhone.trim().slice(0, 20);

  try {
    const tenantSnap = await adminDb.collection('tenants').doc(payload.tenantId).get();
    if (!tenantSnap.exists || tenantSnap.data()!.isActivePublicly !== true) {
      return { success: false, error: 'Este salón no está disponible para reservas.' };
    }
    const tenantName: string = tenantSnap.data()!.name ?? 'tu salón';

    const conflict = await hasSlotConflict(
      payload.tenantId,
      payload.staffId,
      payload.date,
      payload.time,
      payload.durationMinutes,
    );
    if (conflict) {
      return { success: false, error: 'El horario ya no está disponible. Por favor elegí otro.' };
    }

    const [hour, minute] = payload.time.split(':').map(Number);
    const appointmentDateTime = new Date(payload.date);
    appointmentDateTime.setHours(hour, minute, 0, 0);

    const appointmentRef = adminDb
      .collection('tenants').doc(payload.tenantId)
      .collection('appointments').doc();

    await appointmentRef.set({
      id:              appointmentRef.id,
      tenantId:        payload.tenantId,
      branchId:        await getDefaultBranchId(payload.tenantId),
      clientId:        null,
      clientName:      guestName,
      staffId:         payload.staffId,
      staffName:       payload.staffName.trim().slice(0, 100),
      serviceIds:      payload.serviceIds,
      serviceNames:    payload.serviceNames.trim().slice(0, 500),
      date:            Timestamp.fromDate(appointmentDateTime),
      durationMinutes: payload.durationMinutes,
      status:          'pending',
      priceEstimated:  payload.totalFrom,
      depositAmount:   0,
      depositPaid:     false,
      createdAt:       FieldValue.serverTimestamp(),
      createdBy:       'guest',
      source:          'marketplace',
      isGuestBooking:  true,
      guestEmail,
      guestPhone,
      notes:           '',
    });

    sendWhatsAppMessage(
      buildConfirmationMessage({
        clientName:  guestName,
        salonName:   tenantName,
        date: appointmentDateTime.toLocaleDateString('es-AR', {
          weekday: 'long', day: 'numeric', month: 'long',
        }),
        time:        payload.time,
        serviceName: payload.serviceNames.trim().slice(0, 500),
        staffName:   payload.staffName.trim().slice(0, 100),
        clientPhone: guestPhone,
      })
    ).catch((err) => console.error('[createGuestBooking] WhatsApp failed:', err));

    return { success: true, appointmentId: appointmentRef.id };
  } catch (error) {
    console.error('[createGuestBooking] Error:', error);
    return { success: false, error: 'No se pudo crear el turno. Intentá de nuevo.' };
  }
}
