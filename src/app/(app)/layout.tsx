'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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

  const profileUnsubRef = useRef<() => void>(() => { });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cleanup previous profile listener if any/auth changes
      profileUnsubRef.current();

      if (!firebaseUser) {
        setUser(null);
        if (!pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
          router.push('/login');
        }
        setLoading(false);
      } else {
        try {
          // 1. Get Tenant Role (Membership)
          const membershipRef = doc(db, 'users', firebaseUser.uid, 'memberships', tenantId);
          // We assume membership doesn't change often enough to need snapshot, but we could if needed.
          const membershipSnap = await getDoc(membershipRef);
          let tenantRole = 'clienta'; // Default to client if no membership
          if (membershipSnap.exists()) {
            tenantRole = membershipSnap.data().role;
          } else if (firebaseUser.email === 'admin@mujer.com') {
            // If admin email and no membership, create admin membership
            await setDoc(membershipRef, { role: 'admin', tenantId, tenantName: 'Mujer Demo' });
            tenantRole = 'admin';
          }

          // 2. Real-time Profile Listener (Fixes photo update and race conditions)
          const userDocRef = doc(db, 'usuarios', firebaseUser.uid);

          const unsubProfile = onSnapshot(userDocRef, async (userDoc) => {
            // Auto-create Admin (Legacy fallback/dev convenience)
            if (!userDoc.exists() && firebaseUser.email === 'admin@mujer.com') {
              const adminData: Omit<Usuario, 'id'> = {
                nombre: 'Administradora',
                email: 'admin@mujer.com',
                rol: 'admin',
              };
              await setDoc(userDocRef, adminData);
              // The onSnapshot listener will fire again with the newly created document
              return;
            }

            if (userDoc.exists()) {
              const userData = { id: userDoc.id, ...userDoc.data(), rol: tenantRole } as Usuario;
              setUser(userData);

              // Route Protection
              const protectedRoutes = ['/admin', '/agenda', '/clientes', '/dashboard'];
              const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
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
              setLoading(false);
            } else {
              // Profile doesn't exist yet
              // If on register page, this is expected. Keep loading true.
              // If on other pages, we wait for the profile to be created.
              console.log("Waiting for user profile creation...");
              if (!pathname.startsWith('/register') && !pathname.startsWith('/login')) {
                // This state indicates a user is logged in but has no profile.
                // The loading spinner will remain until a profile is created or they log out.
              }
            }
          }, (error) => {
            console.error("Profile snapshot error:", error);
            // If there's an error with the snapshot, we should stop loading
            // and potentially log out or show an error message.
            setLoading(false);
            // Optionally, force logout if a critical error occurs
            // auth.signOut();
            // router.push('/login');
          });

          profileUnsubRef.current = unsubProfile;

        } catch (error) {
          console.error("Error during auth state change or data fetching:", error);
          // Ensure loading is set to false even if an error occurs before snapshot setup
          setLoading(false);
          // If a critical error, force logout
          await auth.signOut();
          router.push('/login');
        }
      }
    });

    return () => {
      unsubscribeAuth();
      profileUnsubRef.current(); // Cleanup profile listener on component unmount
    };
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
