'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Usuario } from '@/lib/types';

const UserContext = createContext<Usuario | null>(null);

export function UserProvider({ children, user }: { children: ReactNode, user: Usuario | null }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  return context;
}
