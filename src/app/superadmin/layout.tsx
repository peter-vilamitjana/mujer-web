import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SuperAdminSidebar } from './_components/SuperAdminSidebar'

export const metadata = { title: 'Super Admin — MujerApp' }

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'superadmin') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      <SuperAdminSidebar email={session.user?.email} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
