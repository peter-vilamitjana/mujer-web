'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserProfile } from '@/lib/services/user.service';
import { useTenant } from '@/contexts/TenantContext';
import type { Usuario, UserRole } from '@/lib/types';

// El contexto expone el usuario ya construido con rol resuelto
const UserContext = createContext<Usuario | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { tenantId } = useTenant();
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || !tenantId) return;

    const uid = (session.user as any).uid;
    const email = session.user.email ?? null;

    // Suscripción al perfil en tiempo real
    const profileRef = doc(db, 'users', uid);
    const unsub = onSnapshot(
      profileRef,
      async (snap) => {
        let data = snap.data();

        // Si no existe o no tiene datos, intentar migración
        if (!data) {
          data = await getUserProfile(uid, email) ?? undefined;
          if (!data) return;
        }

        // Obtener rol desde membership del tenant activo
        let rol: UserRole = 'clienta';
        try {
          const membershipSnap = await getDoc(doc(db, 'users', uid, 'memberships', tenantId));
          if (membershipSnap.exists()) {
            rol = membershipSnap.data().role as UserRole;
          }
        } catch (e) {
          console.error('Error leyendo membership:', e);
        }

        setUser({
          id: uid,
          nombre: data.displayName || data.nombre || 'Sin Nombre',
          email: data.email || email || '',
          rol,
          photoURL: data.photoURL ?? undefined,
          salonId: tenantId,
        });
      },
      (err) => console.error('[UserContext] profile onSnapshot:', err),
    );

    return () => unsub();
  }, [session, status, tenantId]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
