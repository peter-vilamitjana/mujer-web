'use server';

import { requireAuthSession } from '@/lib/auth-guards';
import { createCheckoutPreference } from '@/lib/mercadopago';

interface CreateDepositPreferenceArgs {
  appointmentId: string;
  tenantId: string;
  tenantSlug: string;
  depositAmount: number;
  serviceNames: string;
}

/**
 * Crea una preferencia de Checkout Pro de MercadoPago para cobrar la seña de un turno.
 * Retorna la URL de checkout o null si MP no está configurado (flujo sin seña).
 */
export async function createDepositPreference(
  args: CreateDepositPreferenceArgs
): Promise<{ checkoutUrl: string } | { error: string }> {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return { error: 'MP_NOT_CONFIGURED' };
  }

  let payerEmail: string;
  let payerName: string;
  try {
    const auth = await requireAuthSession();
    payerEmail = auth.email ?? 'cliente@mujerapp.com';
    payerName  = auth.name  ?? 'Clienta';
  } catch {
    return { error: 'No autenticado.' };
  }

  // Validar el monto antes de llamar a MP
  if (!Number.isFinite(args.depositAmount) || args.depositAmount <= 0 || args.depositAmount > 1_000_000) {
    return { error: 'Monto de seña inválido.' };
  }
  if (!args.appointmentId?.trim() || !args.tenantId?.trim()) {
    return { error: 'Datos de turno inválidos.' };
  }

  try {
    const preference = await createCheckoutPreference({
      appointmentId: args.appointmentId,
      tenantId:      args.tenantId,
      tenantSlug:    args.tenantSlug,
      items: [
        {
          id:         `deposit-${args.appointmentId}`,
          title:      `Seña — ${args.serviceNames.trim().slice(0, 200)}`,
          quantity:   1,
          unit_price: args.depositAmount,
          currency_id: 'ARS',
        },
      ],
      payerEmail,
      payerName,
    });

    const isDev = process.env.NODE_ENV !== 'production';
    return { checkoutUrl: isDev ? preference.sandbox_init_point : preference.init_point };
  } catch (err) {
    console.error('[createDepositPreference]', err);
    return { error: 'No se pudo iniciar el pago. Intentá de nuevo.' };
  }
}
