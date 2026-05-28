'use server'

import { requireSuperAdmin } from '@/lib/auth-guards'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// ── Vista 1: Command Center ────────────────────────────────────────────

export async function getSuperAdminStats() {
  await requireSuperAdmin()

  const [tenantsSnap, usersSnap] = await Promise.all([
    adminDb.collection('tenants').get(),
    adminDb.collection('users').get(),
  ])

  const tenants = tenantsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const users   = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  const activeTenants  = tenants.filter((t: any) => t.isActivePublicly !== false)
  const customerUsers  = users.filter((u: any) => u.role === 'customer' || !u.role)
  const adminUsers     = users.filter((u: any) => u.role === 'admin')

  const planCounts = tenants.reduce((acc: any, t: any) => {
    const plan = t.plan || 'free'
    acc[plan] = (acc[plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const apptSnap = await adminDb
    .collectionGroup('appointments')
    .where('date', '>=', today)
    .where('date', '<=', todayEnd)
    .get()

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const newTenantsThisWeek = tenants.filter((t: any) => {
    const created = t.createdAt?.toDate?.() ?? new Date(t.createdAt || 0)
    return created > weekAgo
  }).length

  const newCustomersThisWeek = customerUsers.filter((u: any) => {
    const created = u.createdAt?.toDate?.() ?? new Date(u.createdAt || 0)
    return created > weekAgo
  }).length

  const recentTenants = [...tenants]
    .sort((a: any, b: any) => {
      const aDate = a.createdAt?.toDate?.() ?? new Date(a.createdAt || 0)
      const bDate = b.createdAt?.toDate?.() ?? new Date(b.createdAt || 0)
      return bDate.getTime() - aDate.getTime()
    })
    .slice(0, 5)
    .map((t: any) => ({
      id:        t.id,
      name:      t.name ?? '—',
      slug:      t.slug ?? '',
      plan:      t.plan ?? 'free',
      createdAt: t.createdAt?.toDate?.()?.toISOString() ?? null,
    }))

  const recentCustomers = [...customerUsers]
    .sort((a: any, b: any) => {
      const aDate = a.createdAt?.toDate?.() ?? new Date(a.createdAt || 0)
      const bDate = b.createdAt?.toDate?.() ?? new Date(b.createdAt || 0)
      return bDate.getTime() - aDate.getTime()
    })
    .slice(0, 5)
    .map((u: any) => ({
      id:        u.id,
      email:     u.email ?? '—',
      name:      u.displayName ?? u.name ?? '—',
      createdAt: u.createdAt?.toDate?.()?.toISOString() ?? null,
    }))

  return {
    totalTenants:      tenants.length,
    activeTenants:     activeTenants.length,
    totalCustomers:    customerUsers.length,
    totalAdmins:       adminUsers.length,
    appointmentsToday: apptSnap.size,
    planCounts,
    newTenantsThisWeek,
    newCustomersThisWeek,
    recentTenants,
    recentCustomers,
  }
}

// ── Vista 2: Gestión de Salones ────────────────────────────────────────

export async function getAllTenants() {
  await requireSuperAdmin()
  const snap = await adminDb.collection('tenants').orderBy('createdAt', 'desc').get()
  return snap.docs.map(d => {
    const data = d.data()
    return {
      id:              d.id,
      name:            data.name ?? '—',
      slug:            data.slug ?? '',
      plan:            data.plan ?? 'free',
      isActivePublicly: data.isActivePublicly ?? true,
      isDeleted:       data.isDeleted ?? false,
      createdAt:       data.createdAt?.toDate?.()?.toISOString() ?? null,
      phone:           data.phone ?? null,
      address:         data.address ?? null,
    }
  })
}

export async function updateTenantPlan(
  tenantId: string,
  plan: 'free' | 'pro' | 'enterprise'
) {
  await requireSuperAdmin()
  await adminDb.collection('tenants').doc(tenantId).update({
    plan,
    updatedAt: FieldValue.serverTimestamp(),
  })
  return { success: true }
}

export async function toggleTenantActive(tenantId: string, active: boolean) {
  await requireSuperAdmin()
  await adminDb.collection('tenants').doc(tenantId).update({
    isActivePublicly: active,
    updatedAt: FieldValue.serverTimestamp(),
  })
  return { success: true }
}

export async function deleteTenant(tenantId: string) {
  await requireSuperAdmin()
  await adminDb.collection('tenants').doc(tenantId).update({
    isDeleted: true,
    isActivePublicly: false,
    deletedAt: FieldValue.serverTimestamp(),
  })
  return { success: true }
}

// ── Vista 3: Gestión de Usuarios ───────────────────────────────────────

export async function getAllUsers(limit = 100) {
  await requireSuperAdmin()
  const snap = await adminDb
    .collection('users')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()
  return snap.docs.map(d => {
    const data = d.data()
    return {
      id:        d.id,
      email:     data.email ?? '—',
      name:      data.displayName ?? data.name ?? '—',
      role:      data.role ?? 'customer',
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      phone:     data.phone ?? null,
    }
  })
}

export async function updateUserRole(
  uid: string,
  role: 'customer' | 'admin'
) {
  await requireSuperAdmin()
  // Nunca permitir asignar superadmin desde acá
  if ((role as string) === 'superadmin') throw new Error('No permitido.')
  await adminDb.collection('users').doc(uid).update({ role })
  return { success: true }
}

// ── Vista 5: Estado del sistema ────────────────────────────────────────

export async function getSystemStatus() {
  await requireSuperAdmin()

  let firestoreOk = false
  try {
    await adminDb.collection('_health').doc('ping').set({
      ts: FieldValue.serverTimestamp(),
    })
    firestoreOk = true
  } catch {
    firestoreOk = false
  }

  return {
    firestore:      firestoreOk ? 'ok' : 'error',
    mercadopago:    process.env.MERCADOPAGO_ACCESS_TOKEN ? 'configured' : 'missing',
    googleCalendar: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
    nextauth:       process.env.NEXTAUTH_SECRET ? 'ok' : 'missing',
    environment:    process.env.NODE_ENV ?? 'development',
  }
}

// ── Vista 6: Actividad reciente ────────────────────────────────────────

export async function getRecentActivity(limit = 50) {
  await requireSuperAdmin()

  const [tenantsSnap, usersSnap, apptSnap] = await Promise.all([
    adminDb.collection('tenants').orderBy('createdAt', 'desc').limit(20).get(),
    adminDb.collection('users').orderBy('createdAt', 'desc').limit(20).get(),
    adminDb.collectionGroup('appointments').orderBy('createdAt', 'desc').limit(20).get(),
  ])

  type ActivityItem = {
    type: 'salon' | 'user' | 'appointment'
    description: string
    createdAt: string | null
    ts: number
  }

  const events: ActivityItem[] = []

  tenantsSnap.docs.forEach(d => {
    const data = d.data()
    events.push({
      type: 'salon',
      description: `${data.name ?? 'Salón sin nombre'} se registró`,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      ts: data.createdAt?.toDate?.()?.getTime() ?? 0,
    })
  })

  usersSnap.docs.forEach(d => {
    const data = d.data()
    if (data.role === 'superadmin') return
    events.push({
      type: 'user',
      description: `${data.email ?? '—'} se registró`,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      ts: data.createdAt?.toDate?.()?.getTime() ?? 0,
    })
  })

  apptSnap.docs.forEach(d => {
    const data = d.data()
    events.push({
      type: 'appointment',
      description: `Turno ${data.status ?? 'nuevo'}: ${data.serviceName ?? 'servicio'}`,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      ts: data.createdAt?.toDate?.()?.getTime() ?? 0,
    })
  })

  return events
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map(({ ts: _ts, ...rest }) => rest)
}
