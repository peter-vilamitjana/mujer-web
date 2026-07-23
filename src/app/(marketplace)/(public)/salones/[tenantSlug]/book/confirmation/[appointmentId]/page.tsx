import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ tenantSlug: string; appointmentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Preserva links de confirmación ya compartidos/guardados con la URL vieja.
export default async function BookConfirmationRedirect({ params, searchParams }: Props) {
  const { tenantSlug, appointmentId } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams(sp as Record<string, string>).toString();
  redirect(`/salones/${tenantSlug}/turnos/confirmation/${appointmentId}${qs ? `?${qs}` : ''}`);
}
