'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTenant } from '@/contexts/TenantContext';
import type { UserProfile, UserRole } from '@/lib/schema';

export interface ContextUser extends Omit<UserProfile, 'createdAt' | 'displayName'> {
  rol: UserRole;
  salonId: string;
  nombre: string;
}

const UserContext = createContext<ContextUser | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { tenantId } = useTenant();
  const [user, setUser] = useState<ContextUser | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || !tenantId) {
      setUser(null);
      return;
    }

    const uid = (session.user as any).uid as string;
    const sessionRole = (session.user as any).role as string;
    const rol: UserRole = sessionRole === 'staff' ? 'employee' : 'client';

    setUser({
      id: uid,
      nombre: session.user.name || 'Sin Nombre',
      email: session.user.email || '',
      rol,
      photoURL: session.user.image ?? undefined,
      salonId: tenantId,
    });
  }, [session, status, tenantId]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
