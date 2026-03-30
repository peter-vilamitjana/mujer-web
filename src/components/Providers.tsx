'use client';
import "@/lib/shim-storage";

import { TenantProvider } from "@/contexts/TenantContext";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
            <SessionProvider>
                <TenantProvider>
                    {children}
                </TenantProvider>
            </SessionProvider>
        </ThemeProvider>
    );
}
