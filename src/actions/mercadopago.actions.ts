'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'No autenticado.' };

  const payerEmail = session.user.email ?? 'cliente@mujerapp.com';
  const payerName = session.user.name ?? 'Clienta';

  try {
    const preference = await createCheckoutPreference({
      appointmentId: args.appointmentId,
      tenantId: args.tenantId,
      tenantSlug: args.tenantSlug,
      items: [
        {
          id: `deposit-${args.appointmentId}`,
          title: `Seña — ${args.serviceNames}`,
          quantity: 1,
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
