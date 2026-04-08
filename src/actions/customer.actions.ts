'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAppointmentsByClientId,
  getAppointmentsByPhone,
  DashboardAppointment,
} from '@/lib/services/customer.service';
import { getSalonBySlug } from '@/lib/services/marketplace.service';

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
