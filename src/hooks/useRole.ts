'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTenant } from '@/contexts/TenantContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useRole() {
    const user = useUser();
    const { tenantId } = useTenant();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If no user or no tenant, no role
        if (!user || !tenantId) {
            setRole(null);
            // Only set loading to false if we are sure initialized state is settled.
            // Assuming useUser and useTenant are initialized.
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsub = onSnapshot(doc(db, 'users', user.id, 'memberships', tenantId),
            (docSnap) => {
                if (docSnap.exists()) {
                    setRole(docSnap.data().role as string);
                } else {
                    setRole(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching role:", error);
                setRole(null);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [user, tenantId]);

    return {
        role,
        loading,
        isAdmin: role === 'admin',
        isStaff: role === 'employee' || role === 'admin'
    };
}
