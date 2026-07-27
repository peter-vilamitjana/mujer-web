import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { Staff } from '@/lib/schema';
import { ALL_TIME_SLOTS } from '@/lib/time-slots';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Parsea un string 'YYYY-MM-DD' como medianoche en el timezone LOCAL del
 * servidor. `new Date('YYYY-MM-DD')` se parsea como medianoche UTC (spec
 * de ECMAScript para forms date-only) — en timezones detrás de UTC (ej.
 * Argentina, UTC-3) eso cae en la noche del día anterior, y cualquier
 * `.setHours(...)` posterior queda pegado a ese día equivocado.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

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
  const requestedStart = parseLocalDate(date);
  requestedStart.setHours(hour, minute, 0, 0);
  const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60_000);

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

/**
 * Slots libres de un staff para un día puntual: ALL_TIME_SLOTS acotado
 * al horario de trabajo cargado en `staff.schedule` (mismo criterio que
 * createAppointment en appointments.actions.ts — start/end en minutos,
 * available:false o día ausente del schedule = sin horario ese día),
 * menos los `occupiedSlots` ya ocupados. Si el staff no tiene `schedule`
 * cargado (campo opcional, hoy sin poblar en la mayoría), se usa
 * ALL_TIME_SLOTS completo como universo.
 */
export function getFreeSlotsForDay(
  schedule: Staff['schedule'] | undefined,
  date: Date,
  occupiedSlots: string[],
): string[] {
  let universe: string[] = ALL_TIME_SLOTS;

  if (schedule) {
    const daySched = schedule[DAY_NAMES[date.getDay()]];
    if (!daySched || !daySched.available) return [];

    const [sh, sm] = daySched.start.split(':').map(Number);
    const [eh, em] = daySched.end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    universe = ALL_TIME_SLOTS.filter((t) => {
      const [h, m] = t.split(':').map(Number);
      const min = h * 60 + m;
      return min >= startMin && min < endMin;
    });
  }

  return universe.filter((t) => !occupiedSlots.includes(t));
}
