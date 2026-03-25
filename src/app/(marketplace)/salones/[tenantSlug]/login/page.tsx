import { getSalonBySlug } from '@/lib/services/marketplace.service';
import { notFound } from 'next/navigation';
import SalonLoginClient from './SalonLoginClient';

export default async function SalonLoginPage({ params }: { params: { tenantSlug: string } }) {
  const salon = await getSalonBySlug(params.tenantSlug);
  if (!salon) notFound();

  // @ts-ignore
  return <SalonLoginClient salon={salon} tenantSlug={params.tenantSlug} />;
}
