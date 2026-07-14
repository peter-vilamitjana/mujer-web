import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { Subscription, AuditAction } from '@/lib/schema';

const PAST_DUE_GRACE_DAYS = 7;

/**
 * Cron diario — ciclo de vida de suscripciones. Llamado por Cloud Scheduler,
 * protegido por CRON_SECRET (mismo patrón que /api/notifications/reminders).
 *
 * - trialing o active con período vencido → past_due
 * - past_due con más de PAST_DUE_GRACE_DAYS de gracia vencida → cancelled
 *
 * No cobra nada, no toca Tenant.plan ni el acceso real de la app — solo
 * transiciona Subscription.status según fechas. El enforcement es una
 * épica futura.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Subscriptions] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = Date.now();
    const results = { trialExpired: 0, pastDue: 0, cancelled: 0 };

    const snapshot = await adminDb.collection('subscriptions').get();

    for (const doc of snapshot.docs) {
      const sub = doc.data() as Subscription;
      const periodEnd = sub.currentPeriodEnd.toMillis();

      if ((sub.status === 'trialing' || sub.status === 'active') && periodEnd <= now) {
        await doc.ref.update({ status: 'past_due' });
        await logSubscriptionChange(doc.id, sub.tenantId, sub.status, 'past_due');
        if (sub.status === 'trialing') results.trialExpired++;
        else results.pastDue++;
        continue;
      }

      if (sub.status === 'past_due') {
        const graceDeadline = periodEnd + PAST_DUE_GRACE_DAYS * 24 * 60 * 60 * 1000;
        if (now > graceDeadline) {
          await doc.ref.update({
            status: 'cancelled',
            cancelledAt: Timestamp.now(),
            plan: 'free',
          });
          await logSubscriptionChange(doc.id, sub.tenantId, 'past_due', 'cancelled');
          results.cancelled++;
        }
      }
    }

    console.log('[Subscriptions] Lifecycle run:', results);
    return NextResponse.json({ ok: true, ...results });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Subscriptions] Fatal error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

async function logSubscriptionChange(
  subscriptionId: string,
  tenantId: string,
  before: string,
  after: string,
) {
  const action: AuditAction = 'subscription.status_changed';
  await adminDb.collection('auditLogs').add({
    actorUid: 'system',
    actorEmail: 'system@ouleeh',
    action,
    targetId: subscriptionId,
    targetName: tenantId,
    before: { status: before },
    after: { status: after },
    createdAt: Timestamp.now(),
  });
}
