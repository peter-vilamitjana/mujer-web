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
    <div
      className="min-h-screen text-[#f5f0e8] selection:bg-red-500/30 selection:text-[#f5f0e8] relative bg-[#09090b]"
    >
      <style>{`
        .sidebar-expand { width: 60px !important; }
        .sidebar-expand:hover { width: 220px !important; }
        .sidebar-liquid {
          --glass-reflex-light: 1;
          --glass-reflex-dark: 1;
        }
        .sidebar-liquid-lens {
          background-color: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(48px) saturate(200%);
          -webkit-backdrop-filter: blur(48px) saturate(200%);
          box-shadow: 
            inset 0 1px 1px color-mix(in srgb, white calc(var(--glass-reflex-light) * 15%), transparent),
            inset 0 0 0 1px color-mix(in srgb, white calc(var(--glass-reflex-light) * 8%), transparent),
            inset 0 -1px 1px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 30%), transparent),
            0 12px 32px rgba(0,0,0,0.25),
            0 24px 64px rgba(0,0,0,0.38);
        }
      `}</style>

      {/* Red ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background: 'radial-gradient(circle at 15% 25%, rgba(239,68,68,0.05) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(185,28,28,0.03) 0%, transparent 40%)',
      }} />

      <SuperAdminSidebar userInitial={(session.user?.name || session.user?.email || 'S')[0].toUpperCase()} />

      {/* ══ MAIN CONTENT ══ */}
      <main className="md:pl-[84px] pb-28 md:pb-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
