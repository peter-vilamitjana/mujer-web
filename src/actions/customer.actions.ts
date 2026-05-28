'use server';

import { requireTenantAccess, requireAuthSession } from '@/lib/auth-guards';
import {
  getAppointmentsByClientId,
  getAppointmentsByPhone,
} from '@/lib/services/customer.service';
import { getSalonBySlug } from '@/lib/services/marketplace.service';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Customer, Appointment, DashboardAppointment } from '@/lib/schema';

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
    const snap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('customers')
      .orderBy('fullName', 'asc')
      .limit(lim)
      .get();
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

    const customersRef = adminDb.collection('tenants').doc(tenantId).collection('customers');
    const [byName, byPhone] = await Promise.all([
      customersRef
        .orderBy('fullName')
        .where('fullName', '>=', normalized)
        .where('fullName', '<', end)
        .limit(20)
        .get(),
      customersRef
        .where('phone', '>=', normalized)
        .where('phone', '<', end)
        .limit(10)
        .get(),
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
  const snap = await adminDb
    .collection('tenants').doc(tenantId)
    .collection('customers').doc(customerId)
    .get();
  if (!snap.exists) return null;
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
    const snap = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments')
      .where('clientId', '==', customerId)
      .orderBy('date', 'desc')
      .limit(lim)
      .get();
    return snap.docs.map(d => toSerializable({ id: d.id, ...d.data() }) as Appointment);
  } catch (err) {
    console.error('[getCustomerAppointments]', err);
    return [];
  }
}

// ─── Sanitización ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Acepta dígitos, espacios, guiones y el "+" inicial de código de país
const PHONE_RE = /^\+?[\d\s\-().]{6,20}$/;

type CustomerMutableFields = Partial<Pick<Customer,
  'fullName' | 'email' | 'phone' | 'notes' | 'userId' | 'hairProfile' | 'metrics'
>>;

function sanitizeCustomerData(raw: Record<string, any>): CustomerMutableFields {
  const out: CustomerMutableFields = {};

  if (typeof raw.fullName === 'string') {
    const name = raw.fullName.trim().slice(0, 100);
    if (name.length > 0) out.fullName = name;
  }

  if (typeof raw.email === 'string') {
    const email = raw.email.trim().toLowerCase().slice(0, 254);
    if (email && !EMAIL_RE.test(email)) throw new Error('Email inválido.');
    if (email) out.email = email;
  }

  if (typeof raw.phone === 'string') {
    const phone = raw.phone.trim().slice(0, 20);
    if (phone && !PHONE_RE.test(phone)) throw new Error('Teléfono inválido.');
    if (phone) out.phone = phone;
  }

  if (typeof raw.notes === 'string') {
    out.notes = raw.notes.trim().slice(0, 1000);
  }

  // userId es un UID interno — solo se permite si es string sin espacios
  if (typeof raw.userId === 'string' && raw.userId.trim().length > 0) {
    out.userId = raw.userId.trim().slice(0, 128);
  }

  // hairProfile y metrics pasan tal cual — son estructuras internas
  // cuya validación detallada corresponde al schema de Firestore.
  if (raw.hairProfile && typeof raw.hairProfile === 'object') {
    out.hairProfile = raw.hairProfile as Customer['hairProfile'];
  }
  if (raw.metrics && typeof raw.metrics === 'object') {
    out.metrics = raw.metrics as Customer['metrics'];
  }

  return out;
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
    await requireTenantAccess(tenantId);

    const clean = sanitizeCustomerData(data as Record<string, any>);
    if (!clean.fullName) return { success: false, error: 'El nombre del cliente es obligatorio.' };

    const ref = await adminDb
      .collection('tenants').doc(tenantId)
      .collection('customers')
      .add({
        ...clean,
        metrics: clean.metrics ?? { totalVisits: 0, totalSpent: 0 },
        createdAt: FieldValue.serverTimestamp(),
      });
    return { success: true, id: ref.id };
  } catch (err: any) {
    if (err?.message === 'Email inválido.' || err?.message === 'Teléfono inválido.') {
      return { success: false, error: err.message };
    }
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
    await requireTenantAccess(tenantId);

    const clean = sanitizeCustomerData(data as Record<string, any>);

    await adminDb
      .collection('tenants').doc(tenantId)
      .collection('customers').doc(customerId)
      .update({ ...clean, updatedAt: FieldValue.serverTimestamp() });
    return { success: true };
  } catch (err: any) {
    if (err?.message === 'Email inválido.' || err?.message === 'Teléfono inválido.') {
      return { success: false, error: err.message };
    }
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
  let uid: string;
  try {
    ({ uid } = await requireAuthSession());
  } catch {
    return [];
  }

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
  let uid: string;
  let authSession: Awaited<ReturnType<typeof requireAuthSession>>;
  try {
    authSession = await requireAuthSession();
    uid = authSession.uid;
  } catch {
    return { success: false, error: 'No autenticado.' };
  }

  try {
    const tenantSnap = await adminDb.collection('tenants')
      .where('slug', '==', tenantSlug)
      .limit(1)
      .get();
    if (tenantSnap.empty) {
      return { success: false, error: 'Salón no encontrado.' };
    }
    const tenantDoc = tenantSnap.docs[0];
    const tenantId = tenantDoc.id;
    const tenantName: string = tenantDoc.data().name ?? tenantSlug;

    const appointmentRef = adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments').doc(appointmentId);
    const appointmentSnap = await appointmentRef.get();
    if (!appointmentSnap.exists) {
      return { success: false, error: 'Turno no encontrado.' };
    }

    const data = appointmentSnap.data()!;

    if (data.clientId !== uid) {
      return { success: false, error: 'No tenés permiso para cancelar este turno.' };
    }

    const cancellableStatuses = ['pending', 'confirmed', 'pending_payment'];
    if (!cancellableStatuses.includes(data.status)) {
      return { success: false, error: 'Este turno no puede cancelarse.' };
    }

    await appointmentRef.update({
      status: 'cancelled',
      cancellationReason: reason ?? '',
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: uid,
    });

    // WhatsApp cancellation — fire and forget
    const clientPhone = authSession.phone ?? null;
    if (clientPhone) {
      const dateStr = (data.date as Timestamp | undefined)?.toDate?.()?.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }) ?? '';
      sendWhatsAppMessage(
        buildCancellationMessage({
          clientName: authSession.name ?? 'clienta',
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
