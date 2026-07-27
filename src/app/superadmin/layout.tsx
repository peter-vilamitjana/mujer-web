import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SuperAdminSidebar } from './_components/SuperAdminSidebar'
import { SuperAdminHeader } from './_components/SuperAdminHeader'
import { GlassHoverScript } from './_components/GlassHoverScript'

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
      className="min-h-screen text-[#dde4dd] selection:bg-[#5af0b3]/30 selection:text-white relative bg-[#0e1511]"
    >
      <style>{`
        .sidebar-expand { width: 60px !important; }
        .sidebar-expand:hover { width: 220px !important; }
        .sidebar-liquid {
          --glass-reflex-light: 1;
          --glass-reflex-dark: 1;
        }
        .sidebar-liquid-lens {
          background-color: rgba(14, 21, 17, 0.6);
          backdrop-filter: blur(48px) saturate(200%);
          -webkit-backdrop-filter: blur(48px) saturate(200%);
          box-shadow:
            inset 0 1px 1px color-mix(in srgb, white calc(var(--glass-reflex-light) * 10%), transparent),
            inset 0 0 0 1px color-mix(in srgb, white calc(var(--glass-reflex-light) * 4%), transparent),
            inset 0 -1px 1px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 30%), transparent),
            0 12px 32px rgba(0,0,0,0.25),
            0 24px 64px rgba(0,0,0,0.38);
        }
      `}</style>

      {/* Emerald ambient glow — identidad superadmin */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background: 'radial-gradient(circle at 20% 30%, rgba(90,240,179,0.04) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(52,211,153,0.03) 0%, transparent 40%)',
      }} />

      <GlassHoverScript />
      <SuperAdminSidebar userInitial={(session.user?.name || session.user?.email || 'S')[0].toUpperCase()} />

      {/* ══ MAIN CONTENT ══ */}
      <main className="md:pl-[84px] pt-3 pb-28 md:pb-12 overflow-x-hidden px-4 md:px-5">
        <SuperAdminHeader userInitial={(session.user?.name || session.user?.email || 'S')[0].toUpperCase()} />
        {children}
      </main>
    </div>
  )
}
