import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPaymentStatus } from '@/lib/mercadopago';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

function verifyMpSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  // If no secret configured, skip verification (dev / not-yet-configured)
  if (!secret) return true;

  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');
  if (!xSignature || !xRequestId) return false;

  // x-signature format: "ts=<timestamp>,v1=<hash>"
  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.split('=') as [string, string])
  );
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  // Extract data.id from body for the manifest
  let dataId = '';
  try {
    const body = JSON.parse(rawBody);
    dataId = String(body?.data?.id ?? '');
  } catch {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts}`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'));
}

/**
 * MercadoPago IPN/Webhook handler.
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/notifications/ipn
 */
export async function POST(req: NextRequest) {
  // Rate limit: 60 requests/min per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!rateLimit(`mp-webhook:${ip}`, 60)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!verifyMpSignature(req, rawBody)) {
    console.warn('[MP Webhook] Firma inválida — request rechazado');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);
    const { type, data } = body;

    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ ok: true });
    }

    const paymentId = String(data.id);
    const payment = await getPaymentStatus(paymentId);

    // external_reference = "tenantId:appointmentId"
    const [tenantId, appointmentId] = (payment.external_reference ?? '').split(':');
    if (!tenantId || !appointmentId) {
      console.warn('[MP Webhook] external_reference inválido:', payment.external_reference);
      return NextResponse.json({ ok: true });
    }

    const appointmentRef = doc(db, 'tenants', tenantId, 'appointments', appointmentId);

    if (payment.status === 'approved') {
      await updateDoc(appointmentRef, {
        status: 'confirmed',
        paymentStatus: 'paid_partially',
        depositPaid: payment.amount,
        depositPaymentId: paymentId,
        depositPaidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`[MP Webhook] Pago aprobado — appt ${appointmentId}, $${payment.amount}`);
    } else if (payment.status === 'rejected') {
      await updateDoc(appointmentRef, {
        status: 'pending',
        paymentStatus: 'unpaid',
        updatedAt: serverTimestamp(),
      });
      console.log(`[MP Webhook] Pago rechazado — appt ${appointmentId}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[MP Webhook] Error:', err);
    // Siempre devolver 200 a MP para evitar retries excesivos
    return NextResponse.json({ ok: true });
  }
}

// MP también envía GET al activar el webhook — responder 200
export async function GET() {
  return NextResponse.json({ ok: true });
}
