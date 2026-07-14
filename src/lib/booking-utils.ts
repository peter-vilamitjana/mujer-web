import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Genera el ID único de lock para un slot de turno. DEBE ser idéntico en
 * los tres flujos de reserva (admin, cliente, invitado) para que los locks
 * colisionen correctamente y prevengan doble booking entre ellos.
 * `slotStart` es el datetime completo del turno (fecha + hora ya combinadas).
 */
export function buildSlotLockId(staffId: string, slotStart: Date): string {
  return `${staffId}_${slotStart.getTime()}`;
}

/**
 * Un slotLock vencido (>24h desde que se creó) se trata como libre —
 * ninguno de los flujos de cancelación borra el lock, así que sin esto
 * un turno cancelado dejaría el slot bloqueado para siempre.
 */
export function isSlotLockExpired(lockData: { expiresAt?: Timestamp } | undefined): boolean {
  if (!lockData?.expiresAt) return false;
  return lockData.expiresAt.toMillis() < Date.now();
}

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

  const snap = await adminDb
    .collection('tenants').doc(tenantId)
    .collection('appointments')
    .where('staffId', '==', staffId)
    .where('date', '>=', Timestamp.fromDate(startOfDay))
    .where('date', '<=', Timestamp.fromDate(endOfDay))
    .where('status', 'in', ['pending', 'confirmed', 'pending_payment'])
    .get();

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const existingStart: Date = (data.date as Timestamp).toDate();
    const existingDuration: number = data.durationMinutes ?? 30;
    const existingEnd = new Date(existingStart.getTime() + existingDuration * 60_000);

    if (requestedStart < existingEnd && requestedEnd > existingStart) {
      return true;
    }
  }

  return false;
}

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
