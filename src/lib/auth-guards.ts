'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import type { UserRole } from '@/lib/schema';

export interface AuthenticatedSession {
  uid: string;
  tenantIds: string[];
  name?: string | null;
  email?: string | null;
  image?: string | null;
  phone?: string | null;
}

/**
 * Verifica que el usuario esté autenticado Y que pertenezca al tenant solicitado.
 * Lanza un Error si alguna de las dos condiciones falla — las server actions
 * deben capturarlo y devolver { success: false, error: '...' }.
 */
export async function requireTenantAccess(tenantId: string): Promise<AuthenticatedSession> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) throw new Error('Sesión inválida.');

  const tenantIds: string[] = (session.user as any).tenantIds ?? [];
  if (!tenantIds.includes(tenantId)) throw new Error('Acceso denegado.');

  return {
    uid,
    tenantIds,
    name:  session.user.name,
    email: session.user.email,
    image: session.user.image,
    phone: (session.user as any).phone ?? null,
  };
}

/**
 * Verifica que el usuario autenticado tenga uno de los roles permitidos
 * DENTRO del tenant especificado. El rol se lee del documento de membership
 * (users/{uid}/memberships/{tenantId}), no del JWT — el JWT solo guarda un
 * rol global ('staff'/'customer') que no distingue admin de employee.
 */
export async function requireRole(
  tenantId: string,
  allowedRoles: UserRole[],
): Promise<AuthenticatedSession & { role: UserRole }> {
  const session = await requireTenantAccess(tenantId);

  const membershipSnap = await adminDb
    .collection('users').doc(session.uid)
    .collection('memberships').doc(tenantId)
    .get();

  if (!membershipSnap.exists) throw new Error('Acceso denegado.');

  const role = membershipSnap.data()?.role as UserRole | undefined;
  if (!role || !allowedRoles.includes(role)) throw new Error('Acceso denegado.');

  return { ...session, role };
}

/**
 * Verifica que el usuario tenga rol superadmin.
 * Debe llamarse al inicio de cada Server Action del panel de super admin.
 */
export async function requireSuperAdmin(): Promise<AuthenticatedSession> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');
  if ((session.user as any).role !== 'superadmin') throw new Error('No autorizado.');

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) throw new Error('Sesión inválida.');

  return {
    uid,
    tenantIds: [],
    name:  session.user.name,
    email: session.user.email,
    image: session.user.image,
    phone: (session.user as any).phone ?? null,
  };
}

/**
 * Verifica solo que el usuario esté autenticado, sin validar tenantId.
 * Usar únicamente en operaciones que no están ligadas a un tenant específico
 * (por ej. actualizar el perfil propio del usuario B2C).
 */
export async function requireAuthSession(): Promise<AuthenticatedSession> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado.');

  const uid = (session.user as any).uid as string | undefined;
  if (!uid) throw new Error('Sesión inválida.');

  const tenantIds: string[] = (session.user as any).tenantIds ?? [];
  return {
    uid,
    tenantIds,
    name:  session.user.name,
    email: session.user.email,
    image: session.user.image,
    phone: (session.user as any).phone ?? null,
  };
}
