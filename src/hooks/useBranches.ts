'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTenant } from '@/contexts/TenantContext';
import type { Branch } from '@/lib/schema';

export function useBranches() {
  const { tenantId } = useTenant();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tenants', tenantId, 'branches'));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Branch));
      setBranches(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('[useBranches]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return { branches, loading, refetch: fetchBranches };
}
