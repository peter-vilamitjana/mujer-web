/**
 * MercadoPago Checkout Pro helper — REST API directo, sin SDK.
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro
 *
 * Requiere: MERCADOPAGO_ACCESS_TOKEN en .env.local
 */

const MP_API = 'https://api.mercadopago.com';

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado.');
  return token;
}

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return 'http://localhost:3000';
}

export interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface CreatePreferencePayload {
  appointmentId: string;
  tenantId: string;
  tenantSlug: string;
  items: MercadoPagoItem[];
  payerEmail: string;
  payerName: string;
}

export interface MercadoPagoPreference {
  id: string;
  init_point: string;      // URL de producción
  sandbox_init_point: string; // URL de sandbox (test)
}

/**
 * Crea una preferencia de Checkout Pro para cobrar una seña.
 * Retorna la preferencia con `init_point` para redirigir al cliente.
 */
export async function createCheckoutPreference(
  payload: CreatePreferencePayload
): Promise<MercadoPagoPreference> {
  const base = getBaseUrl();

  const body = {
    items: payload.items.map((item) => ({
      ...item,
      currency_id: item.currency_id ?? 'ARS',
    })),
    payer: {
      email: payload.payerEmail,
      name: payload.payerName,
    },
    back_urls: {
      success: `${base}/salones/${payload.tenantSlug}/book/payment/success?appointmentId=${payload.appointmentId}`,
      failure: `${base}/salones/${payload.tenantSlug}/book/payment/failure?appointmentId=${payload.appointmentId}`,
      pending: `${base}/salones/${payload.tenantSlug}/book/payment/pending?appointmentId=${payload.appointmentId}`,
    },
    auto_return: 'approved',
    notification_url: `${base}/api/mercadopago/webhook`,
    external_reference: `${payload.tenantId}:${payload.appointmentId}`,
    metadata: {
      appointment_id: payload.appointmentId,
      tenant_id: payload.tenantId,
    },
  };

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[MercadoPago] createPreference falló: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  };
}

/**
 * Consulta el estado de un pago por su ID.
 */
export async function getPaymentStatus(paymentId: string): Promise<{
  status: 'approved' | 'pending' | 'rejected' | string;
  status_detail: string;
  amount: number;
  external_reference: string;
}> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`[MercadoPago] getPayment falló: ${res.status}`);
  }

  const data = await res.json();
  return {
    status: data.status,
    status_detail: data.status_detail,
    amount: data.transaction_amount,
    external_reference: data.external_reference ?? '',
  };
}
