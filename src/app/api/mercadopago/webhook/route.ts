import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPaymentStatus } from '@/lib/mercadopago';
import { rateLimit } from '@/lib/rate-limit';
import { mpWebhookPaymentSchema, parseOrError } from '@/lib/validation/schemas';
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
    const rawPayment = await getPaymentStatus(paymentId);

    // Valida la forma del payload de MP antes de tocar Firestore. No
    // rechazamos con 4xx — MP reintentaría agresivamente el webhook. Un
    // payload inválido se loguea y se ignora, igual que el catch de abajo.
    const parsedPayment = parseOrError(mpWebhookPaymentSchema, rawPayment);
    if (!parsedPayment.ok) {
      console.error('[MP Webhook] Payload de MP inválido:', parsedPayment.error, rawPayment);
      return NextResponse.json({ ok: true });
    }
    const payment = parsedPayment.data;

    // external_reference = "tenantId:appointmentId"
    const [tenantId, appointmentId] = (payment.external_reference ?? '').split(':');
    if (!tenantId || !appointmentId) {
      console.warn('[MP Webhook] external_reference inválido:', payment.external_reference);
      return NextResponse.json({ ok: true });
    }

    const appointmentRef = adminDb
      .collection('tenants').doc(tenantId)
      .collection('appointments').doc(appointmentId);

    if (payment.status === 'approved') {
      await appointmentRef.update({
        status:           'confirmed',
        paymentStatus:    'paid_partially',
        depositPaid:      true,             // boolean — el monto va en depositAmount, no acá
        depositAmount:    payment.amount,
        depositPaymentId: paymentId,
        depositPaidAt:    FieldValue.serverTimestamp(),
        updatedAt:        FieldValue.serverTimestamp(),
      });
      console.log(`[MP Webhook] Pago aprobado — appt ${appointmentId}, $${payment.amount}`);

      const paymentRef = adminDb.collection('payments').doc();
      await paymentRef.set({
        id:            paymentRef.id,
        tenantId,
        appointmentId,
        amount:        payment.amount,
        type:          'deposit',
        source:        'mercadopago',
        state:         'approved',
        externalId:    paymentId,
        createdAt:     FieldValue.serverTimestamp(),
        createdBy:     'system',
      });
    } else if (payment.status === 'rejected') {
      await appointmentRef.update({
        status:        'pending',
        paymentStatus: 'unpaid',
        updatedAt:     FieldValue.serverTimestamp(),
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
