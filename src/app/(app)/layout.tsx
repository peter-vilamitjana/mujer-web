
'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Usuario } from '@/lib/types';
import { UserProvider } from '@/contexts/UserContext';
import { SessionProvider } from 'next-auth/react';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (!pathname.startsWith('/login') && pathname !== '/') {
          router.push('/login');
        }
        setLoading(false);
      } else {
        try {
          const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
          let userDoc = await getDoc(userDocRef);

          if (!userDoc.exists() && firebaseUser.email === 'admin@mujer.com') {
            const adminData: Omit<Usuario, 'id'> = {
              nombre: 'Administradora',
              email: 'admin@mujer.com',
              rol: 'admin',
            };
            await setDoc(userDocRef, adminData);
            userDoc = await getDoc(userDocRef);
          }

          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as Usuario;
            setUser(userData);

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
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (pathname.startsWith('/login')) {
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
          {/* Sidebar handling: For admin, we might want to suppress the mobile drawer if using BottomNav, 
                but keeping it accessible via Header hamburger allows access to Logout. 
                For now, we keep Sidebar as is, but MobileNav will be the primary nav. */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.rol} />

          <div className="flex flex-col md:pl-64 transition-all duration-300">
            <Header onMenuClick={() => setSidebarOpen(true)} userRole={user.rol} />
            {/* Add padding bottom for mobile nav spacing if admin */}
            <main className={cn(
              "flex-1 p-4 sm:p-6 lg:p-8",
              user.rol === 'admin' ? "pb-24 md:pb-8" : ""
            )}>
              {children}
            </main>
          </div>

          {/* Render Bottom Nav only for Admin on Mobile */}
          {user.rol === 'admin' && <MobileNav />}
        </div>
      </UserProvider>
    </SessionProvider>
  );
}
