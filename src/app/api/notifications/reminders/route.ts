import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { buildReminderMessage } from '@/lib/whatsapp-templates';
import type { Appointment } from '@/lib/schema';

/**
 * Cron endpoint — recordatorios de turnos.
 * Llamado por Cloud Scheduler cada hora. Protegido por CRON_SECRET en el header.
 *
 * Ventana de 24-25h: el cron corre cada hora, así que cada turno cae en
 * exactamente una ejecución. No achicar la ventana sin ajustar el intervalo
 * del cron — si son más chicas, se pierden recordatorios entre corridas.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Reminders] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const snapshot = await adminDb
      .collectionGroup('appointments')
      .where('status', '==', 'confirmed')
      .where('date', '>=', Timestamp.fromDate(windowStart))
      .where('date', '<', Timestamp.fromDate(windowEnd))
      .get();

    const results = {
      found: snapshot.size,
      sent: 0,
      skipped: 0,
      already: 0,
      errors: 0,
    };

    // Cachea el nombre del salón por tenantId — el collection group query
    // puede traer turnos de varios tenants en la misma corrida.
    const tenantNameCache = new Map<string, string>();

    for (const doc of snapshot.docs) {
      const appt = doc.data() as Appointment;

      if (appt.reminderSentAt) {
        results.already++;
        continue;
      }

      // El Appointment no guarda el teléfono del cliente registrado —
      // solo guestPhone para reservas sin cuenta. Para clientes con cuenta
      // hay que resolverlo desde el registro de Customer.
      let clientPhone = appt.guestPhone;
      if (!clientPhone && appt.clientId) {
        const customerSnap = await adminDb
          .collection('tenants').doc(appt.tenantId)
          .collection('customers').doc(appt.clientId)
          .get();
        clientPhone = customerSnap.data()?.phone as string | undefined;
      }

      if (!clientPhone) {
        results.skipped++;
        continue;
      }

      let salonName = tenantNameCache.get(appt.tenantId);
      if (!salonName) {
        const tenantSnap = await adminDb.collection('tenants').doc(appt.tenantId).get();
        const fetchedName: string = (tenantSnap.data()?.name as string | undefined) ?? 'tu salón';
        tenantNameCache.set(appt.tenantId, fetchedName);
        salonName = fetchedName;
      }

      const apptDate = appt.date.toDate();
      const dateStr = apptDate.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const timeStr = apptDate.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = buildReminderMessage({
        clientName: appt.clientName || 'Cliente',
        salonName,
        date: dateStr,
        time: timeStr,
        serviceName: appt.serviceNames || 'tu servicio',
        staffName: appt.staffName || 'tu profesional',
        clientPhone,
      });

      const result = await sendWhatsAppMessage(message);

      if (result.success) {
        await doc.ref.update({
          reminderSentAt: Timestamp.now(),
          reminderSkipped: result.skipped ?? false,
        });
        if (result.skipped) results.skipped++;
        else results.sent++;
      } else {
        results.errors++;
        console.error('[Reminders] Failed to send to', clientPhone, result.error);
      }
    }

    console.log('[Reminders] Run complete:', results);
    return NextResponse.json({ ok: true, ...results });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Reminders] Fatal error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
