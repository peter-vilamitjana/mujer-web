'use client';

import { useSession } from 'next-auth/react';

export function useRole() {
  const { data: session, status } = useSession();
  const sessionRole = (session?.user as any)?.role as string | undefined;

  return {
    role: sessionRole ?? null,
    loading: status === 'loading',
    isAdmin: sessionRole === 'staff',
    isStaff: sessionRole === 'staff',
  };
}
