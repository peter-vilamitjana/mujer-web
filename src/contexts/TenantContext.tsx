'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TenantContextType {
    tenantId: string | null;       // null = cargando o usuario sin tenant asignado
    setTenantId: (id: string | null) => void;
    branchId: string | null;
    setBranchId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [branchId, setBranchId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return; // Sesión aún no resuelta, esperar

        if (status === 'authenticated') {
            const ids: string[] = (session.user as any).tenantIds ?? [];
            if (ids.length > 0 && tenantId === null) {
                setTenantId(ids[0]);
                // branchId no se autoasigna: cada vista lo setea según necesidad
            }
            // ids.length === 0 → usuario sin membresías (cliente final o nuevo usuario)
            // tenantId permanece null → el layout de (app)/ debe manejar este estado
        }

        if (status === 'unauthenticated') {
            setTenantId(null);
            setBranchId(null);
        }
    }, [session, status]); // ← tenantId removido de deps para evitar loops

    return (
        <TenantContext.Provider value={{ tenantId, setTenantId, branchId, setBranchId }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
