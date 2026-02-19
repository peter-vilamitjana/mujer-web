'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TenantContextType {
    tenantId: string;
    setTenantId: (id: string) => void;
    branchId: string; // Currently active branch helpers
    setBranchId: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    // Phase 0: Hardcoded default tenant for migration
    const [tenantId, setTenantId] = useState('demo-salon');

    // Default branch (could be 'main' or null initially)
    const [branchId, setBranchId] = useState('sucursal-centro');

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
