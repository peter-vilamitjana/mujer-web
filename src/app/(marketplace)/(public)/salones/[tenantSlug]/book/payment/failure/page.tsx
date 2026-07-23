import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Preserva preferencias de MercadoPago ya generadas con la URL vieja.
export default async function BookPaymentFailureRedirect({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams(sp as Record<string, string>).toString();
  redirect(`/salones/${tenantSlug}/turnos/payment/failure${qs ? `?${qs}` : ''}`);
}
