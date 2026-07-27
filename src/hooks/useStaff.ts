'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTenant } from '@/contexts/TenantContext';
import type { Staff } from '@/lib/schema';

export function useStaff() {
  const { tenantId } = useTenant();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStaff = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tenants', tenantId, 'staff'));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Staff));
      setStaff(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('[useStaff]', err);
      setError(err instanceof Error ? err : new Error('Error cargando staff'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return { staff, loading, error, refetch: fetchStaff };
}
