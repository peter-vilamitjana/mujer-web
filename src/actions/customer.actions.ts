'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAppointmentsByClientId,
  getAppointmentsByPhone,
  DashboardAppointment,
} from '@/lib/services/customer.service';
import { getSalonBySlug } from '@/lib/services/marketplace.service';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Customer, Appointment } from '@/lib/schema';

type ActionResult = { success: true; id?: string } | { success: false; error: string };

// Converts Firestore Timestamp instances to ms numbers so they can cross
// the Server Action RSC serialization boundary (React only supports plain objects).
function toSerializable<T>(val: T): T {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') {
    if (typeof (val as any).toMillis === 'function') return (val as any).toMillis() as unknown as T;
    if (Array.isArray(val)) return (val as any[]).map(toSerializable) as unknown as T;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as object)) out[k] = toSerializable(v);
    return out as T;
  }
  return val;
}

// ─── Admin reads ──────────────────────────────────────────────────────────────

/**
 * Lista clientes de un tenant con paginación opcional.
 */
export async function getCustomers(
  tenantId: string,
  opts: { lim?: number } = {},
): Promise<Customer[]> {
  try {
    const lim = opts.lim ?? 50;
    const q = query(
      collection(db, 'tenants', tenantId, 'customers'),
      orderBy('fullName', 'asc'),
      limit(lim),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => toSerializable({ id: d.id, ...d.data() }) as Customer);
  } catch (err) {
    console.error('[getCustomers]', err);
    return [];
  }
}

/**
 * Busca clientes por nombre o teléfono (búsqueda simple lado servidor).
 */
export async function searchCustomers(
  tenantId: string,
  searchQuery: string,
): Promise<Customer[]> {
  if (!searchQuery.trim()) return [];

  try {
    const normalized = searchQuery.trim();
    const end = normalized.slice(0, -1) + String.fromCharCode(normalized.charCodeAt(normalized.length - 1) + 1);

    const [byName, byPhone] = await Promise.all([
      getDocs(
        query(
          collection(db, 'tenants', tenantId, 'customers'),
          orderBy('fullName'),
          where('fullName', '>=', normalized),
          where('fullName', '<',  end),
          limit(20),
        ),
      ),
      getDocs(
        query(
          collection(db, 'tenants', tenantId, 'customers'),
          where('phone', '>=', normalized),
          where('phone', '<',  end),
          limit(10),
        ),
      ),
    ]);

    const seen = new Set<string>();
    const results: Customer[] = [];
    for (const snap of [...byName.docs, ...byPhone.docs]) {
      if (seen.has(snap.id)) continue;
      seen.add(snap.id);
      results.push(toSerializable({ id: snap.id, ...snap.data() }) as Customer);
    }
    return results;
  } catch (err) {
    console.error('[searchCustomers]', err);
    return [];
  }
}

/**
 * Obtiene un cliente por ID.
 */
export async function getCustomer(
  tenantId: string,
  customerId: string,
): Promise<Customer | null> {
  const snap = await getDoc(doc(db, 'tenants', tenantId, 'customers', customerId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Customer;
}

/**
 * Devuelve el historial de turnos de un cliente, ordenado por fecha descendente.
 */
export async function getCustomerAppointments(
  tenantId: string,
  customerId: string,
  lim = 20,
): Promise<Appointment[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'tenants', tenantId, 'appointments'),
        where('clientId', '==', customerId),
        orderBy('date', 'desc'),
        limit(lim),
      ),
    );
    return snap.docs.map(d => toSerializable({ id: d.id, ...d.data() }) as Appointment);
  } catch (err) {
    console.error('[getCustomerAppointments]', err);
    return [];
  }
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

/**
 * Crea un cliente nuevo desde el panel admin.
 */
export async function createCustomer(
  tenantId: string,
  data: Omit<Customer, 'id' | 'createdAt'>,
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'No autenticado.' };

    const ref = await addDoc(collection(db, 'tenants', tenantId, 'customers'), {
      ...data,
      metrics: data.metrics ?? { totalVisits: 0, totalSpent: 0 },
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (err) {
    console.error('[createCustomer]', err);
    return { success: false, error: 'No se pudo crear el cliente.' };
  }
}

/**
 * Actualiza campos de un cliente (notas, hairProfile, datos de contacto).
 * Todos los campos son opcionales — solo se actualizan los provistos.
 */
export async function updateCustomer(
  tenantId: string,
  customerId: string,
  data: Partial<Omit<Customer, 'id' | 'createdAt'>>,
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'No autenticado.' };

    await updateDoc(doc(db, 'tenants', tenantId, 'customers', customerId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[updateCustomer]', err);
    return { success: false, error: 'No se pudo actualizar el cliente.' };
  }
}
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { buildCancellationMessage } from '@/lib/whatsapp-templates';

/**
 * Retorna los turnos del usuario autenticado en un salón específico.
 */
export async function getMyAppointments(
  tenantSlug: string
): Promise<DashboardAppointment[]> {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.uid) return [];

  const uid = (session.user as any).uid as string;

  const tenant = await getSalonBySlug(tenantSlug);
  if (!tenant) return [];

  return getAppointmentsByClientId(tenant.id, uid, tenant.name);
}

/**
 * Busca turnos por número de teléfono en un salón específico.
 */
export async function searchAppointmentsByPhone(
  tenantSlug: string,
  phone: string
): Promise<DashboardAppointment[]> {
  const tenant = await getSalonBySlug(tenantSlug);
  if (!tenant) return [];

  return getAppointmentsByPhone(tenant.id, phone, tenant.name);
}

/**
 * Cancela un turno del usuario autenticado.
 * Valida que el turno pertenece al usuario y que está en estado cancelable.
 */
export async function cancelAppointment(
  appointmentId: string,
  tenantSlug: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'No autenticado.' };
  }

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) {
    return { success: false, error: 'Sesión inválida.' };
  }

  try {
    // Resolver tenantId desde slug (sin filtro isActivePublicly — se puede cancelar aunque esté inactivo)
    const tenantsRef = collection(db, 'tenants');
    const tenantSnap = await getDocs(
      query(tenantsRef, where('slug', '==', tenantSlug), limit(1))
    );
    if (tenantSnap.empty) {
      return { success: false, error: 'Salón no encontrado.' };
    }
    const tenantDoc = tenantSnap.docs[0];
    const tenantId = tenantDoc.id;
    const tenantName: string = tenantDoc.data().name ?? tenantSlug;

    // Obtener el appointment y verificar propiedad
    const appointmentRef = doc(db, 'tenants', tenantId, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    if (!appointmentSnap.exists()) {
      return { success: false, error: 'Turno no encontrado.' };
    }

    const data = appointmentSnap.data();

    // Validar ownership
    if (data.clientId !== uid) {
      return { success: false, error: 'No tenés permiso para cancelar este turno.' };
    }

    // Validar que el status permite cancelación
    const cancellableStatuses = ['pending', 'confirmed', 'pending_payment'];
    if (!cancellableStatuses.includes(data.status)) {
      return { success: false, error: 'Este turno no puede cancelarse.' };
    }

    // Actualizar status
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      cancellationReason: reason ?? '',
      cancelledAt: serverTimestamp(),
      cancelledBy: uid,
    });

    // WhatsApp cancellation — fire and forget
    const clientPhone = (session.user as any).phone ?? null;
    if (clientPhone) {
      const dateStr = data.date?.toDate?.()?.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }) ?? '';
      sendWhatsAppMessage(
        buildCancellationMessage({
          clientName: session.user.name ?? 'clienta',
          salonName: tenantName,
          date: dateStr,
          serviceName: data.serviceNames ?? '',
          clientPhone,
        })
      ).catch((err) => console.error('[cancelAppointment] WhatsApp failed:', err));
    }

    return { success: true };
  } catch (err) {
    console.error('[cancelAppointment] Error:', err);
    return { success: false, error: 'No se pudo cancelar el turno. Intentá de nuevo.' };
  }
}
