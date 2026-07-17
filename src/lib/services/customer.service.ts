/**
 * customer.service.ts
 *
 * Usa el Admin SDK de Firestore (bypasea las reglas de seguridad con
 * credenciales de servicio) para queries de datos de clientes.
 * Diseñado para uso en Server Components y Server Actions.
 */

import { adminDb } from '@/lib/firebase-admin';
import type { AppointmentStatus, DashboardAppointment } from '@/lib/schema';

export type { DashboardAppointment };

/**
 * Formatea una Date a string legible en español argentino.
 * Ejemplo: "viernes 14 feb, 15:00"
 */
function formatAppointmentDate(date: Date): string {
  const datePart = date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${datePart}, ${hours}:${minutes}`;
}

/**
 * Obtiene los turnos de un cliente por su clientId en la subcolección appointments de un tenant.
 */
export async function getAppointmentsByClientId(
  tenantId: string,
  clientId: string,
  salonName: string
): Promise<DashboardAppointment[]> {
  try {
    const snap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments')
      .where('clientId', '==', clientId)
      .limit(50)
      .get();

    const appointments: DashboardAppointment[] = snap.docs.map((doc) => {
      const data = doc.data();

      // El campo date llega como Firestore Timestamp (Admin SDK) — a
      // diferencia de la versión REST, ya no hay que desempaquetar
      // stringValue/timestampValue manualmente.
      let dateRaw: Date;
      if (data.date?.toDate) {
        dateRaw = data.date.toDate();
      } else if (data.date instanceof Date) {
        dateRaw = data.date;
      } else if (typeof data.date === 'string') {
        dateRaw = new Date(data.date);
      } else {
        dateRaw = new Date();
      }

      return {
        id: doc.id,
        serviceName: (data.serviceNames as string) || '',
        staffName: (data.staffName as string) || '',
        salonName,
        date: formatAppointmentDate(dateRaw),
        dateRaw,
        status: (data.status as AppointmentStatus) || 'pending',
        price: (data.priceEstimated as number) || 0,
      };
    });

    // Ordenar por dateRaw descendente (más reciente primero)
    appointments.sort((a, b) => b.dateRaw.getTime() - a.dateRaw.getTime());

    return appointments;
  } catch (err) {
    console.error('[customer.service] Error fetching appointments:', err);
    return [];
  }
}

/**
 * Busca un customer por teléfono dentro de un tenant y retorna su userId.
 */
export async function getCustomerByPhone(
  tenantId: string,
  phone: string
): Promise<string | null> {
  try {
    const snap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('customers')
      .where('phone', '==', phone)
      .limit(1)
      .get();

    if (snap.empty) return null;
    return (snap.docs[0].data().userId as string) || null;
  } catch (err) {
    console.error('[customer.service] Error fetching customer by phone:', err);
    return null;
  }
}

/**
 * Busca los turnos de un cliente por su número de teléfono.
 * Primero resuelve el userId del customer, luego trae sus appointments.
 */
export async function getAppointmentsByPhone(
  tenantId: string,
  phone: string,
  salonName: string
): Promise<DashboardAppointment[]> {
  const userId = await getCustomerByPhone(tenantId, phone);
  if (!userId) return [];
  return getAppointmentsByClientId(tenantId, userId, salonName);
}
