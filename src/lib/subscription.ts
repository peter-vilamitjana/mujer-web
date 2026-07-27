import { adminDb } from '@/lib/firebase-admin';
import type { Subscription } from '@/lib/schema';

/**
 * Lee la suscripción de un tenant y calcula su estado efectivo.
 * El estado guardado (`status`) puede estar desactualizado si el cron de
 * lifecycle todavía no corrió; esta función calcula el estado REAL en base
 * a las fechas, no solo al campo persistido.
 */
export async function getSubscriptionState(tenantId: string): Promise<{
  subscription: Subscription | null;
  isActive: boolean;
  isTrialing: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
}> {
  const snap = await adminDb
    .collection('subscriptions')
    .where('tenantId', '==', tenantId)
    .limit(1)
    .get();

  if (snap.empty) {
    return { subscription: null, isActive: false, isTrialing: false, isExpired: true, daysRemaining: null };
  }

  const doc = snap.docs[0];
  const sub = { id: doc.id, ...doc.data() } as Subscription;
  const now = Date.now();
  const periodEnd = sub.currentPeriodEnd.toMillis();
  const daysRemaining = Math.ceil((periodEnd - now) / (24 * 60 * 60 * 1000));

  const isTrialing = sub.status === 'trialing' && periodEnd > now;
  const isActivePaid = sub.status === 'active' && periodEnd > now;
  const isActive = isTrialing || isActivePaid;
  const isExpired = periodEnd <= now && sub.status !== 'cancelled';

  return {
    subscription: sub,
    isActive,
    isTrialing,
    isExpired,
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
  };
}
