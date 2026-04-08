'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAppointmentsByClientId,
  getAppointmentsByPhone,
  DashboardAppointment,
} from '@/lib/services/customer.service';
import { getSalonBySlug } from '@/lib/services/marketplace.service';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
