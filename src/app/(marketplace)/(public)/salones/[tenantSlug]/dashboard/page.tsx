import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMyAppointments } from '@/actions/customer.actions';
import { getSalonBySlug } from '@/lib/services/marketplace.service';
import { CustomerDashboardView } from './CustomerDashboardView';
import { PhoneSearchView } from './PhoneSearchView';

interface CustomerDashboardPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function CustomerDashboardPage({ params }: CustomerDashboardPageProps) {
  const { tenantSlug } = await params;

  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.uid as string | undefined;

  if (uid) {
    const [appointments, tenant] = await Promise.all([
      getMyAppointments(tenantSlug),
      getSalonBySlug(tenantSlug),
    ]);

    return (
      <CustomerDashboardView
        appointments={appointments}
        salonName={tenant?.name ?? ''}
        tenantSlug={tenantSlug}
        userName={(session?.user as any)?.name ?? undefined}
      />
    );
  }

  return <PhoneSearchView tenantSlug={tenantSlug} />;
}
