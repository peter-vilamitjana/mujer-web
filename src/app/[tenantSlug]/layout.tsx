import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const session = await getServerSession(authOptions);

  // Guard: solo admins con sesión activa
  if (!session || (session.user as any).role === 'customer') {
    redirect('/login');
  }

  // Next.js App Router pasa params como Promise en versiones recientes,
  // la firma anterior sugería param: { tenantSlug: string } pero es mejor
  // tiparlo seguro por los warnings de Next 15.
  // const resolvedParams = await params;

  return (
    <div className="bg-[#09090b] min-h-screen text-white font-inter">
      {children}
    </div>
  );
}
