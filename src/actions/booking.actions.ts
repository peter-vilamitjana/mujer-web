'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncAppointmentToCalendar } from './calendar.actions';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { buildConfirmationMessage } from '@/lib/whatsapp-templates';
import { hasSlotConflict, buildOccupiedSlots } from '@/lib/booking-utils';

export async function getAvailableSlots(
  tenantId: string,
  staffId: string,
  date: string
): Promise<{ occupiedSlots: string[]; error?: string }> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
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

export async function createBooking(
  payload: BookingPayload
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'No autenticado. Por favor iniciá sesión.' };
  }

  const uid = (session.user as { uid?: string }).uid || '';
  const userEmail = session.user.email ?? '';
  const userName = session.user.name ?? 'Cliente';

  try {
    const tenantSnap = await adminDb.collection('tenants').doc(payload.tenantId).get();
    if (!tenantSnap.exists || tenantSnap.data()!.isActivePublicly !== true) {
      return { success: false, error: 'Este salón no está disponible para reservas en este momento.' };
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
      clientId: uid,
      clientName: userName,
      staffId: payload.staffId,
      staffName: payload.staffName,
      serviceIds: payload.serviceIds,
      serviceNames: payload.serviceNames,
      date: Timestamp.fromDate(appointmentDateTime),
      durationMinutes: payload.durationMinutes,
      status: 'pending_payment',
      priceEstimated: payload.totalFrom,
      depositAmount: payload.depositAmount,
      depositPaid: false,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: uid,
      source: 'marketplace',
      notes: '',
    });

    const customerRef = adminDb
      .collection('tenants').doc(payload.tenantId)
      .collection('customers').doc(uid);

    const customerData: Record<string, unknown> = {
      userId: uid,
      fullName: userName,
      email: userEmail,
      createdAt: FieldValue.serverTimestamp(),
    };
    if (payload.clientPhone && uid) {
      customerData.phone = payload.clientPhone;
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
          lastVisit: FieldValue.serverTimestamp(),
        },
      }, { merge: true });
    }

    const clientPhone = payload.clientPhone || null;
    if (clientPhone) {
      sendWhatsAppMessage(
        buildConfirmationMessage({
          clientName: userName,
          salonName: tenantName,
          date: appointmentDateTime.toLocaleDateString('es-AR', {
            weekday: 'long', day: 'numeric', month: 'long',
          }),
          time: payload.time,
          serviceName: payload.serviceNames,
          staffName: payload.staffName,
          clientPhone,
        })
      ).catch((err) => console.error('[createBooking] WhatsApp notification failed:', err));
    }

    syncAppointmentToCalendar(payload.tenantId, appointmentRef.id).catch((err) =>
      console.error('[createBooking] GCal sync error:', err)
    );

    return { success: true, appointmentId: appointmentRef.id };
  } catch (error) {
    console.error('[createBooking] Error:', error);
    return { success: false, error: 'No se pudo crear el turno. Intentá de nuevo.' };
  }
}
