
'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Usuario } from '@/lib/types';
import { UserProvider } from '@/contexts/UserContext';
import { SessionProvider } from 'next-auth/react';

import { useTenant } from "@/contexts/TenantContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { tenantId } = useTenant();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (!pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
          router.push('/login');
        }
        setLoading(false);
      } else {
        try {
          // 1. Get Tenant Role
          const membershipRef = doc(db, 'users', firebaseUser.uid, 'memberships', tenantId);
          const membershipSnap = await getDoc(membershipRef);
          let tenantRole = 'clienta'; // Default to client if no membership
          if (membershipSnap.exists()) {
            tenantRole = membershipSnap.data().role;
          }

          // 2. Get User Profile (Legacy)
          const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
          let userDoc = await getDoc(userDocRef);

          // Auto-create Admin (Legacy fallback/dev convenience)
          if (!userDoc.exists() && firebaseUser.email === 'admin@mujer.com') {
            const adminData: Omit<Usuario, 'id'> = {
              nombre: 'Administradora',
              email: 'admin@mujer.com',
              rol: 'admin',
            };
            await setDoc(userDocRef, adminData);
            userDoc = await getDoc(userDocRef);
            // Also give admin membership if missing (optional, but good for consistency)
            if (!membershipSnap.exists()) {
              await setDoc(membershipRef, { role: 'admin', tenantId, tenantName: 'Mujer Demo' });
              tenantRole = 'admin';
            }
          }

          if (userDoc.exists()) {
            // Merge profile with tenant role
            const userData = { id: userDoc.id, ...userDoc.data(), rol: tenantRole } as Usuario;
            setUser(userData);

            // Route Protection
            const protectedRoutes = ['/admin', '/agenda', '/clientes', '/dashboard'];
            // Check if current path starts with any protected route
            const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

            // Define who can access protected routes
            const canAccessProtected = ['admin', 'empleada', 'owner'].includes(userData.rol);

            if (isProtectedRoute && !canAccessProtected) {
              console.log(`Access denied for ${userData.rol} to ${pathname}`);
              router.push('/mis-turnos');
            }

            // Redirect from Login/Home
            if (pathname === '/login' || pathname === '/') {
              if (userData.rol === 'clienta') {
                router.push('/mis-turnos');
              } else {
                router.push('/dashboard');
              }
            }
          } else {
            console.error("Usuario no encontrado en Firestore, cerrando sesión.");
            await auth.signOut();
            router.push('/login');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          await auth.signOut();
          router.push('/login');
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router, pathname, tenantId]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return <SessionProvider><main>{children}</main></SessionProvider>;
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SessionProvider>
      <UserProvider user={user}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.rol} />
          <div className="flex flex-col md:pl-64 transition-all duration-300">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </UserProvider>
    </SessionProvider>
  );
}
