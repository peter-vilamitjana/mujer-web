'use client';
import "@/lib/shim-storage";

import { TenantProvider } from "@/contexts/TenantContext";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <TenantProvider>
                {children}
            </TenantProvider>
        </SessionProvider>
    );
}
