'use client';

import { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useBranches } from '@/hooks/useBranches';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

const STORAGE_KEY = 'mujerapp_branchId';

export default function BranchSelector() {
  const { branchId, setBranchId } = useTenant();
  const { branches, loading } = useBranches();

  // Restore persisted branchId on mount
  useEffect(() => {
    if (branches.length === 0) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const activeBranches = branches.filter((b) => b.active);
    if (stored && activeBranches.some((b) => b.id === stored)) {
      setBranchId(stored);
    } else if (activeBranches.length > 0 && !branchId) {
      setBranchId(activeBranches[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  const handleChange = (value: string) => {
    setBranchId(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const activeBranches = branches.filter((b) => b.active);

  if (loading || activeBranches.length <= 1) return null;

  return (
    <Select value={branchId ?? ''} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-[180px] text-sm gap-1">
        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Sucursal..." />
      </SelectTrigger>
      <SelectContent>
        {activeBranches.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
