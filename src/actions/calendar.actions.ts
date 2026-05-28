'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar.server';
import type { Appointment } from '@/lib/schema';

type ActionResult = { success: true } | { success: false; error: string };

export async function syncAppointmentToCalendar(
  tenantId: string,
  appointmentId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'No autenticado.' };

    const apptSnap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments').doc(appointmentId)
      .get();
    if (!apptSnap.exists) return { success: false, error: 'Turno no encontrado.' };
    const appt = { id: apptSnap.id, ...apptSnap.data() } as Appointment;

    const staffSnap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('staff').doc(appt.staffId)
      .get();
    if (!staffSnap.exists) return { success: true };
    const staffUserId: string | undefined = staffSnap.data()!.userId;
    if (!staffUserId) return { success: true };

    const startDate = appt.date.toDate();
    const googleEventId = await createCalendarEvent({
      appointmentId: appt.id,
      clientName: appt.clientName,
      serviceNames: appt.serviceNames,
      startDate,
      durationMinutes: appt.durationMinutes,
      staffUserId,
      staffName: appt.staffName,
      notes: appt.notes,
    });

    if (googleEventId) {
      await adminDb
        .collection('tenants').doc(tenantId)
        .collection('appointments').doc(appointmentId)
        .update({ googleEventId, lastSyncedAt: FieldValue.serverTimestamp() });
    }

    return { success: true };
  } catch (err) {
    console.error('[syncAppointmentToCalendar]', err);
    return { success: false, error: 'Error sincronizando con Google Calendar.' };
  }
}

export async function cancelCalendarEvent(
  tenantId: string,
  appointmentId: string
): Promise<ActionResult> {
  try {
    const apptSnap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments').doc(appointmentId)
      .get();
    if (!apptSnap.exists) return { success: true };
    const appt = { id: apptSnap.id, ...apptSnap.data() } as Appointment;

    if (!appt.googleEventId) return { success: true };

    const staffSnap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('staff').doc(appt.staffId)
      .get();
    if (!staffSnap.exists) return { success: true };
    const staffUserId: string | undefined = staffSnap.data()!.userId;
    if (!staffUserId) return { success: true };

    await deleteCalendarEvent(staffUserId, appt.googleEventId);
    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments').doc(appointmentId)
      .update({ googleEventId: null, lastSyncedAt: FieldValue.serverTimestamp() });

    return { success: true };
  } catch (err) {
    console.error('[cancelCalendarEvent]', err);
    return { success: false, error: 'Error cancelando evento en Google Calendar.' };
  }
}
