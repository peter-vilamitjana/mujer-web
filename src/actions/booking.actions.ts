'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { requireAuthSession } from '@/lib/auth-guards';
import { syncAppointmentToCalendar } from './calendar.actions';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { buildConfirmationMessage } from '@/lib/whatsapp-templates';
import { hasSlotConflict, buildOccupiedSlots, buildSlotLockId, isSlotLockExpired, parseLocalDate } from '@/lib/booking-utils';
import { bookingPayloadSchema, parseOrError } from '@/lib/validation/schemas';

export async function getAvailableSlots(
  tenantId: string,
  staffId: string,
  date: string
): Promise<{ occupiedSlots: string[]; error?: string }> {
  try {
    const startOfDay = parseLocalDate(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = parseLocalDate(date);
    endOfDay.setHours(23, 59, 59, 999);

    const snap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments')
      .where('staffId', '==', staffId)
      .where('date', '>=', Timestamp.fromDate(startOfDay))
      .where('date', '<=', Timestamp.fromDate(endOfDay))
      .where('status', 'in', ['pending', 'confirmed', 'pending_payment'])
      .get();

    const appointments = snap.docs.map(d => ({
      startDate: (d.data().date as Timestamp).toDate(),
      durationMinutes: (d.data().durationMinutes as number) ?? 30,
    }));
    return { occupiedSlots: buildOccupiedSlots(appointments) };
  } catch (error) {
    console.error('[getAvailableSlots] Error:', error);
    return { occupiedSlots: [], error: 'No se pudo verificar disponibilidad.' };
  }
}

export interface BookingPayload {
  tenantId: string;
  staffId: string;
  staffName: string;
  serviceIds: string[];
  serviceNames: string;
  selectedServices: Array<{
    id: string;
    nombre: string;
    largo?: string;
    duracion: number;
    precio?: number;
    precios?: Record<string, number>;
    preciosHasta?: Record<string, number>;
    requiereLargo: boolean;
    variable: boolean;
  }>;
  date: string;
  time: string;
  totalFrom: number;
  totalTo: number;
  depositAmount: number;
  durationMinutes: number;
  clientPhone: string;
}

// Validación: ver bookingPayloadSchema en src/lib/validation/schemas.ts

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getDefaultBranchId(tenantId: string): Promise<string> {
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

export async function createBooking(
  payload: BookingPayload
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  let uid: string;
  let userName: string | null | undefined;
  let userEmail: string | null | undefined;
  try {
    const auth = await requireAuthSession();
    uid      = auth.uid;
    userName  = auth.name;
    userEmail = null; // email se lee de la sesión directamente abajo
  } catch {
    return { success: false, error: 'No autenticado. Por favor iniciá sesión.' };
  }

  const parsed = parseOrError(bookingPayloadSchema, payload);
  if (!parsed.ok) return { success: false, error: parsed.error };

  const clientPhone = payload.clientPhone?.trim() || null;

  try {
    const tenantSnap = await adminDb.collection('tenants').doc(payload.tenantId).get();
    if (!tenantSnap.exists || tenantSnap.data()!.isActivePublicly !== true) {
      return { success: false, error: 'Este salón no está disponible para reservas en este momento.' };
    }
    const tenantName: string = tenantSnap.data()!.name ?? 'tu salón';

    // Pre-check no atómico — evita el round-trip de la transacción en la
    // mayoría de los casos. La transacción de abajo es la barrera definitiva.
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
    const appointmentDateTime = parseLocalDate(payload.date);
    appointmentDateTime.setHours(hour, minute, 0, 0);
    const slotStart = Timestamp.fromDate(appointmentDateTime);

    const appointmentRef = adminDb
      .collection('tenants').doc(payload.tenantId)
      .collection('appointments').doc();

    const branchId = await getDefaultBranchId(payload.tenantId);

    // Slot-lock: mismo patrón que createAppointment (admin) — documento
    // determinístico que previene el double-booking atómico entre requests
    // concurrentes que pasaron el pre-check. La fórmula de slotLockId debe
    // ser idéntica en los tres flujos de reserva o los locks no colisionan.
    const slotLockId  = buildSlotLockId(payload.staffId, appointmentDateTime);
    const slotLockRef = adminDb
      .collection('tenants').doc(payload.tenantId)
      .collection('slotLocks').doc(slotLockId);

    try {
      await adminDb.runTransaction(async (txn) => {
        const lockSnap = await txn.get(slotLockRef);
        if (lockSnap.exists && !isSlotLockExpired(lockSnap.data() as { expiresAt?: Timestamp })) {
          throw Object.assign(new Error('SLOT_TAKEN'), { code: 'SLOT_TAKEN' });
        }

        const lockExpiry = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60_000));
        txn.set(slotLockRef, {
          staffId:       payload.staffId,
          date:          slotStart,
          appointmentId: appointmentRef.id,
          expiresAt:     lockExpiry,
        });

        txn.set(appointmentRef, {
          id:              appointmentRef.id,
          tenantId:        payload.tenantId,
          branchId,
          clientId:        uid,
          clientName:      (userName ?? 'Cliente').slice(0, 100),
          staffId:         payload.staffId,
          staffName:       payload.staffName.trim().slice(0, 100),
          serviceIds:      payload.serviceIds,
          serviceNames:    payload.serviceNames.trim().slice(0, 500),
          date:            slotStart,
          durationMinutes: payload.durationMinutes,
          status:          'pending_payment',
          priceEstimated:  payload.totalFrom,
          depositAmount:   payload.depositAmount,
          depositPaid:     false,
          createdAt:       FieldValue.serverTimestamp(),
          createdBy:       uid,
          source:          'marketplace',
          notes:           '',
        });
      });
    } catch (err: any) {
      if (err?.code === 'SLOT_TAKEN') {
        return { success: false, error: 'El horario ya no está disponible. Por favor elegí otro.' };
      }
      throw err;
    }

    const customerRef = adminDb
      .collection('tenants').doc(payload.tenantId)
      .collection('customers').doc(uid);

    const customerData: Record<string, unknown> = {
      userId:    uid,
      fullName:  (userName ?? 'Cliente').slice(0, 100),
      createdAt: FieldValue.serverTimestamp(),
    };
    if (clientPhone) {
      customerData.phone     = clientPhone;
      customerData.updatedAt = FieldValue.serverTimestamp();
    }
    await customerRef.set(customerData, { merge: true });

    const customerSnap = await customerRef.get();
    if (customerSnap.exists && customerSnap.data()?.metrics) {
      await customerRef.update({
        'metrics.lastVisit': FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await customerRef.set({
        metrics: {
          totalVisits: 0,
          totalSpent: 0,
          firstVisit: FieldValue.serverTimestamp(),
          lastVisit:  FieldValue.serverTimestamp(),
        },
      }, { merge: true });
    }

    if (clientPhone) {
      sendWhatsAppMessage(
        buildConfirmationMessage({
          clientName:  (userName ?? 'Cliente').slice(0, 100),
          salonName:   tenantName,
          date: appointmentDateTime.toLocaleDateString('es-AR', {
            weekday: 'long', day: 'numeric', month: 'long',
          }),
          time:        payload.time,
          serviceName: payload.serviceNames.trim().slice(0, 500),
          staffName:   payload.staffName.trim().slice(0, 100),
          clientPhone,
        })
      ).catch((err) => console.error('[createBooking] WhatsApp notification failed:', err));
    }

    syncAppointmentToCalendar(payload.tenantId, appointmentRef.id).catch((err) =>
      console.error('[createBooking] GCal sync error:', err),
    );

    return { success: true, appointmentId: appointmentRef.id };
  } catch (error) {
    console.error('[createBooking] Error:', error);
    return { success: false, error: 'No se pudo crear el turno. Intentá de nuevo.' };
  }
}
