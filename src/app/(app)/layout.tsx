'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Usuario, UserRole } from '@/lib/types';
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
          let tenantRole: UserRole = 'clienta'; // Default to client if no membership
          if (membershipSnap.exists()) {
            tenantRole = membershipSnap.data().role as UserRole;
          } else if (firebaseUser.email === 'admin@mujer.com') {
            // If admin email and no membership, create admin membership
            await setDoc(membershipRef, { role: 'admin', tenantId, tenantName: 'Mujer Demo' });
            tenantRole = 'admin';
          }

          // 2. Real-time Profile Listener (New Source of Truth with Fallback)
          const newProfileRef = doc(db, 'users', firebaseUser.uid);

          const unsubProfile = onSnapshot(newProfileRef, async (userDoc) => {
            if (userDoc.exists()) {
              // Happy path: User has been migrated or is new
              const data = userDoc.data();
              // Map new schema to internal Usuario type
              const userData: Usuario = {
                id: userDoc.id,
                nombre: data.displayName || data.nombre || 'Sin Nombre',
                email: data.email,
                rol: tenantRole,
                photoURL: data.photoURL || undefined, // Map null to undefined
                salonId: tenantId // Contextual
              };
              setUser(userData);
              handleNavigation(userData, pathname, router);
              setLoading(false);
            } else {
              // Missing in 'users'? Check Legacy 'usuarios' (Self-healing)
              console.warn('[LEGACY ACCESS DETECTED] Profile not found in \'users\', checking legacy \'usuarios\'...');

              try {
                const legacyRef = doc(db, 'usuarios', firebaseUser.uid);
                const legacySnap = await getDoc(legacyRef);

                if (legacySnap.exists()) {
                  console.log("Found legacy profile. Migrating to 'users'...");
                  const legacyData = legacySnap.data() as Usuario;

                  const newProfileData = {
                    id: firebaseUser.uid,
                    displayName: legacyData.nombre || firebaseUser.displayName || 'Usuario',
                    email: legacyData.email || firebaseUser.email,
                    photoURL: legacyData.photoURL || firebaseUser.photoURL || null,
                    migratedAt: new Date(),
                    source: 'legacy_migration'
                  };

                  // Perform Migration
                  await setDoc(newProfileRef, newProfileData);
                  // The listener will trigger again with the new doc, entering the "Happy path"
                  return;
                }

                // Handle Admin Seed Case (if not in legacy either)
                if (firebaseUser.email === 'admin@mujer.com') {
                  console.log("Seeding Admin profile...");
                  const adminData = {
                    displayName: 'Administradora',
                    email: 'admin@mujer.com',
                    createdAt: new Date()
                  };
                  await setDoc(newProfileRef, adminData);
                  // Listener re-triggers
                  return;
                }

              } catch (err) {
                console.error("Migration/Fallback error:", err);
              }

              // If we are here, no profile exists in either. 
              // Registration page should handle creation.
              if (!pathname.startsWith('/register') && !pathname.startsWith('/login')) {
                console.log("No profile found anywhere.");
              }
            }
          }, (error) => {
            console.error("Profile snapshot error:", error);
            setLoading(false);
          });

          profileUnsubRef.current = unsubProfile;

        } catch (error) {
          console.error("Error during auth state change or data fetching:", error);
          setLoading(false);
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

  // Helper to centralize navigation logic (defined outside or inside useEffect, simplified here)
  const handleNavigation = (userData: Usuario, path: string, router: any) => {
    const protectedRoutes = ['/admin', '/agenda', '/clientes', '/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
    const canAccessProtected = ['admin', 'empleada', 'owner'].includes(userData.rol);

    if (isProtectedRoute && !canAccessProtected) {
      console.log(`Access denied for ${userData.rol} to ${path}`);
      router.push('/mis-turnos');
    }

    if (path === '/login' || path === '/') {
      if (userData.rol === 'clienta') {
        router.push('/mis-turnos');
      } else {
        router.push('/dashboard');
      }
    }
  };

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
