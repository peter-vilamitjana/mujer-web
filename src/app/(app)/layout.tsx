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
        setLoading(false);
        router.push('/login');
      } else {
        try {
          const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
          let userDoc = await getDoc(userDocRef);

          // If the admin user doc doesn't exist, create it on the fly.
          // This makes the initial setup process smoother for the user.
          if (!userDoc.exists() && firebaseUser.email === 'admin@mujer.com') {
            console.log("Admin user document not found, creating it...");
            const adminData: Omit<Usuario, 'id'> = {
                nombre: 'Administradora',
                email: 'admin@mujer.com',
                rol: 'admin',
            };
            await setDoc(userDocRef, adminData);
            userDoc = await getDoc(userDocRef); // Re-fetch the doc
            console.log("Admin user document created successfully.");
          }

          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as Usuario;
            setUser(userData);
            
            // Role-based redirection logic
            const { rol } = userData;
            const isServicesRoute = pathname.startsWith('/servicios');
            const isClientSpecificRoute = pathname.startsWith('/mis-turnos') || pathname.startsWith('/agendar');
            const isAdminEmployeeRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/agenda') || pathname.startsWith('/clientes');

            if (rol === 'empleada' && !isAdminEmployeeRoute) {
                router.push('/dashboard');
            } else if (rol === 'clienta' && !isServicesRoute && !isClientSpecificRoute) {
                router.push('/servicios');
            } else if (rol === 'admin' && !isAdminEmployeeRoute && !isServicesRoute) {
                router.push('/dashboard');
            }

          } else {
             // If user exists in Auth but not in Firestore, something is wrong.
             // For now, log out and redirect to login.
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

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserProvider user={user}>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.rol} />
        <div className="flex flex-col md:pl-64 transition-all duration-300">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900/50">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
