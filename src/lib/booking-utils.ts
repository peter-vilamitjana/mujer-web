import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Returns true if the proposed slot overlaps with any existing appointment
 * for the same staff member on the same day.
 *
 * Uses half-open interval comparison: [requestedStart, requestedEnd) overlaps
 * [existingStart, existingEnd) when requestedStart < existingEnd AND requestedEnd > existingStart.
 */
export async function hasSlotConflict(
  tenantId: string,
  staffId: string,
  date: string,
  time: string,
  durationMinutes: number
): Promise<boolean> {
  const [hour, minute] = time.split(':').map(Number);
  const requestedStart = new Date(date);
  requestedStart.setHours(hour, minute, 0, 0);
  const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60_000);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointmentsRef = collection(db, 'tenants', tenantId, 'appointments');
  const q = query(
    appointmentsRef,
    where('staffId', '==', staffId),
    where('date', '>=', Timestamp.fromDate(startOfDay)),
    where('date', '<=', Timestamp.fromDate(endOfDay)),
    where('status', 'in', ['pending', 'confirmed', 'pending_payment'])
  );

  const snap = await getDocs(q);

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const existingStart: Date = data.date.toDate();
    const existingDuration: number = data.durationMinutes ?? 30;
    const existingEnd = new Date(existingStart.getTime() + existingDuration * 60_000);

    if (requestedStart < existingEnd && requestedEnd > existingStart) {
      return true;
    }
  }

  return false;
}

/**
 * Returns all 30-minute time slots (as 'HH:MM' strings) occupied by a set
 * of appointments, accounting for each appointment's full duration.
 *
 * Example: an appointment at 10:00 for 90 min occupies ['10:00', '10:30', '11:00'].
 */
export function buildOccupiedSlots(
  appointments: Array<{ startDate: Date; durationMinutes: number }>
): string[] {
  const slots: string[] = [];
  for (const { startDate, durationMinutes } of appointments) {
    const steps = Math.ceil(durationMinutes / 30);
    for (let i = 0; i < steps; i++) {
      const slotDate = new Date(startDate.getTime() + i * 30 * 60_000);
      slots.push(
        `${String(slotDate.getHours()).padStart(2, '0')}:${String(slotDate.getMinutes()).padStart(2, '0')}`
      );
    }
  }
  return slots;
}
