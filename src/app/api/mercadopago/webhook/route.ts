import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPaymentStatus } from '@/lib/mercadopago';

/**
 * MercadoPago IPN/Webhook handler.
 * MP envía POST a esta ruta cuando hay actualizaciones de pago.
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/notifications/ipn
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
