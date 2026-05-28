/**
 * customer.service.ts
 *
 * Usa la Firestore REST API directamente para queries de datos de clientes.
 * Diseñado para uso en Server Components y Server Actions.
 */

import type { AppointmentStatus, DashboardAppointment } from '@/lib/schema';

export type { DashboardAppointment };

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mujer-app';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Convierte un valor de Firestore REST API al tipo JS correspondiente.
 */
function parseFirestoreValue(value: any): any {
  if (value === undefined || value === null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue, 10);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return new Date(value.timestampValue);
  if ('mapValue' in value) {
    const fields = value.mapValue?.fields || {};
    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, parseFirestoreValue(v)])
    );
  }
  if ('arrayValue' in value) {
    return (value.arrayValue?.values || []).map(parseFirestoreValue);
  }
  return null;
}

/**
 * Convierte un documento de Firestore REST API a un objeto JS plano.
 */
function parseFirestoreDoc(doc: any): Record<string, any> {
  const fields = doc.fields || {};
  const parsed: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    parsed[key] = parseFirestoreValue(value);
  }
  // Extraer el ID del documento desde el name (último segmento del path)
  const nameParts = (doc.name || '').split('/');
  parsed._id = nameParts[nameParts.length - 1];
  return parsed;
}

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
  const url = `${FIRESTORE_BASE}/tenants/${tenantId}:runQuery`;

  const structuredQuery = {
    from: [{ collectionId: 'appointments' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'clientId' },
        op: 'EQUAL',
        value: { stringValue: clientId },
      },
    },
    limit: 50,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[customer.service] Firestore REST error:', await res.text());
      return [];
    }

    const results = await res.json();
    const docs: Record<string, any>[] = results
      .filter((r: any) => r.document)
      .map((r: any) => parseFirestoreDoc(r.document));

    const appointments: DashboardAppointment[] = docs.map((doc) => {
      // El campo date puede llegar como Date (ya parseado por parseFirestoreValue) o como raw timestamp
      let dateRaw: Date;
      if (doc.date instanceof Date) {
        dateRaw = doc.date;
      } else if (typeof doc.date === 'string') {
        dateRaw = new Date(doc.date);
      } else {
        dateRaw = new Date();
      }

      return {
        id: doc._id as string,
        serviceName: (doc.serviceNames as string) || '',
        staffName: (doc.staffName as string) || '',
        salonName,
        date: formatAppointmentDate(dateRaw),
        dateRaw,
        status: (doc.status as AppointmentStatus) || 'pending',
        price: (doc.priceEstimated as number) || 0,
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
  const url = `${FIRESTORE_BASE}/tenants/${tenantId}:runQuery`;

  const structuredQuery = {
    from: [{ collectionId: 'customers' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'phone' },
        op: 'EQUAL',
        value: { stringValue: phone },
      },
    },
    limit: 1,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[customer.service] Firestore REST error (getCustomerByPhone):', await res.text());
      return null;
    }

    const results = await res.json();
    const docs: Record<string, any>[] = results
      .filter((r: any) => r.document)
      .map((r: any) => parseFirestoreDoc(r.document));

    if (docs.length === 0) return null;
    return (docs[0].userId as string) || null;
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
