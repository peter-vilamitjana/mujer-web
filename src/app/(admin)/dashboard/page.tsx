import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function OldDashboardPage() {
  const session = await getServerSession(authOptions);
  // Default to a fallback if not available, though auth guard should prevent it
  const tenantSlug = (session?.user as any)?.salonSlug || 'dashboard';
  redirect(`/${tenantSlug}/dashboard`);
}
