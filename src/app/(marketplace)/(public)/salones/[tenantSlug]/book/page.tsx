import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

// /book quedó reemplazada por /turnos — se mantiene como redirect en vez de
// eliminarla del todo para no romper links viejos ya compartidos/guardados.
export default async function BookPageRedirect({ params }: Props) {
  const { tenantSlug } = await params;
  redirect(`/salones/${tenantSlug}/turnos`);
}
