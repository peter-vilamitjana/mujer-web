'use server';

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar.server';
import type { Appointment } from '@/lib/schema';

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Syncs an existing appointment to the staff's Google Calendar.
 * Called after appointment creation. Best-effort — never throws.
 */
export async function syncAppointmentToCalendar(
  tenantId: string,
  appointmentId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'No autenticado.' };

    // Fetch appointment
    const apptSnap = await getDoc(doc(db, 'tenants', tenantId, 'appointments', appointmentId));
    if (!apptSnap.exists()) return { success: false, error: 'Turno no encontrado.' };
    const appt = { id: apptSnap.id, ...apptSnap.data() } as Appointment;

    // Get staff userId
    const staffSnap = await getDoc(doc(db, 'tenants', tenantId, 'staff', appt.staffId));
    if (!staffSnap.exists()) return { success: true }; // staff not found — skip
    const staffData = staffSnap.data();
    const staffUserId: string | undefined = staffData.userId;

    if (!staffUserId) return { success: true }; // staff has no linked user account — skip

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
      await updateDoc(doc(db, 'tenants', tenantId, 'appointments', appointmentId), {
        googleEventId,
        lastSyncedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (err) {
    console.error('[syncAppointmentToCalendar]', err);
    return { success: false, error: 'Error sincronizando con Google Calendar.' };
  }
}

/**
 * Cancels a Google Calendar event when an appointment is cancelled.
 */
export async function cancelCalendarEvent(
  tenantId: string,
  appointmentId: string
): Promise<ActionResult> {
  try {
    const apptSnap = await getDoc(doc(db, 'tenants', tenantId, 'appointments', appointmentId));
    if (!apptSnap.exists()) return { success: true };
    const appt = { id: apptSnap.id, ...apptSnap.data() } as Appointment;

    if (!appt.googleEventId) return { success: true }; // no GCal event — skip

    const staffSnap = await getDoc(doc(db, 'tenants', tenantId, 'staff', appt.staffId));
    if (!staffSnap.exists()) return { success: true };
    const staffUserId: string | undefined = staffSnap.data().userId;
    if (!staffUserId) return { success: true };

    await deleteCalendarEvent(staffUserId, appt.googleEventId);
    await updateDoc(doc(db, 'tenants', tenantId, 'appointments', appointmentId), {
      googleEventId: null,
      lastSyncedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error('[cancelCalendarEvent]', err);
    return { success: false, error: 'Error cancelando evento en Google Calendar.' };
  }
}
