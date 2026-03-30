import { getSalonBySlug } from '@/lib/services/marketplace.service';
import { notFound } from 'next/navigation';
import SalonLoginClient from './SalonLoginClient';

export default async function SalonLoginPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  // @ts-ignore
  return <SalonLoginClient salon={salon} tenantSlug={tenantSlug} />;
}
