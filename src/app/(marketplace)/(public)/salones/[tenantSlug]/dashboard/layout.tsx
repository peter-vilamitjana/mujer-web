'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import SalonSidebar from '@/components/salon/SalonSidebar';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { UserProvider } from '@/contexts/UserContext';
import { SessionProvider } from 'next-auth/react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Unauthenticated: render children directly so PhoneSearchView shows
  if (status === 'unauthenticated' || !session?.user) {
    return <>{children}</>;
  }

  return (
    <UserProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SalonSidebar
           isOpen={sidebarOpen}
           onClose={() => setSidebarOpen(false)}
           tenantSlug={tenantSlug}
        />
        <div className="flex flex-col md:pl-64 transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}

export default function SalonDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
