'use server'

import crypto from 'crypto'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import { requireRole, requireAuthSession } from '@/lib/auth-guards'
import type { Invitation, Staff } from '@/lib/schema'

const INVITE_TTL_DAYS = 7

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '')
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  return 'http://localhost:3000'
}

// ── Crear invitación (solo admin) ──────────────────────────────────────────
export async function createInvitation(
  tenantId: string,
  staffId: string,
  role: 'admin' | 'employee',
): Promise<{ success: boolean; token?: string; url?: string; error?: string }> {
  try {
    const session = await requireRole(tenantId, ['admin'])

    const [staffSnap, tenantSnap] = await Promise.all([
      adminDb.collection('tenants').doc(tenantId).collection('staff').doc(staffId).get(),
      adminDb.collection('tenants').doc(tenantId).get(),
    ])

    if (!staffSnap.exists) return { success: false, error: 'Profesional no encontrado.' }
    const staff = staffSnap.data() as Staff

    if (staff.userId) {
      return { success: false, error: 'Este profesional ya tiene acceso activo.' }
    }

    // Revocar invitaciones previas pendientes de este staff
    const prev = await adminDb.collection('invitations')
      .where('staffId', '==', staffId)
      .where('usedAt', '==', null)
      .where('revokedAt', '==', null)
      .get()
    if (!prev.empty) {
      const batch = adminDb.batch()
      prev.docs.forEach(d => batch.update(d.ref, { revokedAt: Timestamp.now() }))
      await batch.commit()
    }

    // Token criptográficamente aleatorio — 256 bits, URL-safe
    const token = crypto.randomBytes(32).toString('base64url')

    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)
    )

    await adminDb.collection('invitations').doc(token).set({
      id:            token,
      tenantId,
      tenantName:    tenantSnap.data()?.name ?? 'el salón',
      staffId,
      staffName:     staff.name,
      role,
      invitedBy:     session.uid,
      invitedByName: session.name ?? 'La administración',
      createdAt:     Timestamp.now(),
      expiresAt,
      usedAt:        null,
      usedBy:        null,
      revokedAt:     null,
    })

    const url = `${getBaseUrl()}/invitacion/${token}`
    return { success: true, token, url }

  } catch (err) {
    console.error('[createInvitation]', err)
    return { success: false, error: 'No se pudo generar la invitación.' }
  }
}

// ── Leer invitación por token (público — la usa el landing) ────────────────
export async function getInvitationByToken(token: string): Promise<{
  state: 'valid' | 'expired' | 'used' | 'revoked' | 'not_found'
  invitation?: {
    tenantName: string
    staffName: string
    invitedByName: string
    role: 'admin' | 'employee'
  }
}> {
  const snap = await adminDb.collection('invitations').doc(token).get()
  if (!snap.exists) return { state: 'not_found' }

  const inv = snap.data() as Invitation
  const invitation = {
    tenantName:    inv.tenantName,
    staffName:     inv.staffName,
    invitedByName: inv.invitedByName,
    role:          inv.role,
  }

  if (inv.revokedAt) return { state: 'revoked', invitation }
  if (inv.usedAt)    return { state: 'used', invitation }
  if (inv.expiresAt.toMillis() <= Date.now()) return { state: 'expired', invitation }

  return { state: 'valid', invitation }
}

// ── Aceptar invitación (requiere sesión) ───────────────────────────────────
export async function acceptInvitation(
  token: string,
): Promise<{ success: boolean; tenantId?: string; error?: string }> {
  let uid: string
  let email: string | null | undefined

  try {
    const session = await requireAuthSession()
    uid = session.uid
    email = session.email
  } catch {
    return { success: false, error: 'Iniciá sesión para aceptar la invitación.' }
  }

  const inviteRef = adminDb.collection('invitations').doc(token)

  try {
    let tenantId = ''

    await adminDb.runTransaction(async (txn) => {
      const snap = await txn.get(inviteRef)
      if (!snap.exists) throw new Error('INVALID')

      const inv = snap.data() as Invitation

      if (inv.revokedAt) throw new Error('REVOKED')
      if (inv.usedAt)    throw new Error('USED')
      if (inv.expiresAt.toMillis() <= Date.now()) throw new Error('EXPIRED')

      tenantId = inv.tenantId

      // Membership — el corazón del flujo
      const membershipRef = adminDb
        .collection('users').doc(uid)
        .collection('memberships').doc(inv.tenantId)
      txn.set(membershipRef, {
        role:     inv.role,
        tenantId: inv.tenantId,
        joinedAt: Timestamp.now(),
      })

      // Vincular el perfil de Staff con la cuenta — el puente userId
      const staffRef = adminDb
        .collection('tenants').doc(inv.tenantId)
        .collection('staff').doc(inv.staffId)
      txn.update(staffRef, { userId: uid })

      // Marcar la invitación como usada
      txn.update(inviteRef, {
        usedAt: Timestamp.now(),
        usedBy: uid,
      })
    })

    await adminDb.collection('auditLogs').add({
      actorUid:   uid,
      actorEmail: email ?? '',
      action:     'user.role_changed',
      targetId:   tenantId,
      targetName: tenantId,
      before:     { role: null },
      after:      { role: 'employee', via: 'invitation' },
      createdAt:  Timestamp.now(),
    })

    return { success: true, tenantId }

  } catch (err: any) {
    const map: Record<string, string> = {
      INVALID: 'Invitación inválida.',
      REVOKED: 'Esta invitación fue revocada.',
      USED:    'Esta invitación ya fue usada.',
      EXPIRED: 'Esta invitación venció. Pedile una nueva a tu salón.',
    }
    return { success: false, error: map[err?.message] ?? 'No se pudo aceptar la invitación.' }
  }
}

// ── Revocar invitación pendiente (solo admin) ──────────────────────────────
export async function revokeInvitation(
  tenantId: string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(tenantId, ['admin'])
    await adminDb.collection('invitations').doc(token).update({
      revokedAt: Timestamp.now(),
    })
    return { success: true }
  } catch (err) {
    console.error('[revokeInvitation]', err)
    return { success: false, error: 'No se pudo revocar la invitación.' }
  }
}

// ── Quitar acceso a un empleado activo (solo admin) ────────────────────────
export async function revokeStaffAccess(
  tenantId: string,
  staffId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireRole(tenantId, ['admin'])

    const staffRef = adminDb.collection('tenants').doc(tenantId).collection('staff').doc(staffId)
    const staffSnap = await staffRef.get()
    if (!staffSnap.exists) return { success: false, error: 'Profesional no encontrado.' }

    const staff = staffSnap.data() as Staff
    if (!staff.userId) return { success: false, error: 'Este profesional no tiene acceso.' }

    if (staff.userId === session.uid) {
      return { success: false, error: 'No podés quitarte el acceso a vos misma.' }
    }

    const batch = adminDb.batch()
    batch.delete(adminDb.collection('users').doc(staff.userId).collection('memberships').doc(tenantId))
    batch.update(staffRef, { userId: FieldValue.delete() })
    await batch.commit()

    return { success: true }
  } catch (err) {
    console.error('[revokeStaffAccess]', err)
    return { success: false, error: 'No se pudo quitar el acceso.' }
  }
}

// ── Listar el estado de acceso de todo el staff (solo admin) ───────────────
export interface StaffAccessState {
  staffId: string
  hasAccess: boolean
  role: 'admin' | 'employee' | null
  pendingInvite: { token: string; url: string; expiresAt: number; expired: boolean; role: 'admin' | 'employee' } | null
}

export async function getStaffAccessState(tenantId: string): Promise<StaffAccessState[]> {
  await requireRole(tenantId, ['admin'])

  const [staffSnap, pendingSnap] = await Promise.all([
    adminDb.collection('tenants').doc(tenantId).collection('staff').get(),
    adminDb.collection('invitations')
      .where('tenantId', '==', tenantId)
      .where('usedAt', '==', null)
      .where('revokedAt', '==', null)
      .get(),
  ])

  const pendingByStaffId = new Map<string, Invitation>()
  for (const doc of pendingSnap.docs) {
    const inv = doc.data() as Invitation
    const existing = pendingByStaffId.get(inv.staffId)
    // Si hay varias (no debería, createInvitation revoca las previas), quedarse con la más nueva
    if (!existing || inv.createdAt.toMillis() > existing.createdAt.toMillis()) {
      pendingByStaffId.set(inv.staffId, inv)
    }
  }

  const staffWithAccess = staffSnap.docs.filter(d => (d.data() as Staff).userId)
  const membershipSnaps = await Promise.all(
    staffWithAccess.map(d =>
      adminDb.collection('users').doc((d.data() as Staff).userId as string)
        .collection('memberships').doc(tenantId).get()
    )
  )
  const roleByStaffId = new Map<string, 'admin' | 'employee'>()
  staffWithAccess.forEach((d, i) => {
    const role = membershipSnaps[i].data()?.role
    if (role) roleByStaffId.set(d.id, role)
  })

  const baseUrl = getBaseUrl()

  return staffSnap.docs.map(d => {
    const staff = d.data() as Staff
    const pending = pendingByStaffId.get(d.id)
    return {
      staffId: d.id,
      hasAccess: !!staff.userId,
      role: staff.userId ? (roleByStaffId.get(d.id) ?? null) : null,
      pendingInvite: pending
        ? {
            token: pending.id,
            url: `${baseUrl}/invitacion/${pending.id}`,
            expiresAt: pending.expiresAt.toMillis(),
            expired: pending.expiresAt.toMillis() <= Date.now(),
            role: pending.role,
          }
        : null,
    }
  })
}
