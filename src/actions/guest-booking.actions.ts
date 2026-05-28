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

export async function createGuestBooking(
  payload: GuestBookingPayload
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
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
      payload.durationMinutes
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
      createdAt: FieldValue.serverTimestamp(),
      createdBy: 'guest',
      source: 'marketplace',
      isGuestBooking: true,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone,
      notes: '',
    });

    sendWhatsAppMessage(
      buildConfirmationMessage({
        clientName: payload.guestName,
        salonName: tenantName,
        date: appointmentDateTime.toLocaleDateString('es-AR', {
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
