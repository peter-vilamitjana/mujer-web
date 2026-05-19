'use client';
import "@/lib/shim-storage";

import { TenantProvider } from "@/contexts/TenantContext";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from 'next-themes';
import { PostHogProvider } from '@/components/PostHogProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
        >
            <SessionProvider>
                <TenantProvider>
                    <PostHogProvider>
                        {children}
                    </PostHogProvider>
                </TenantProvider>
            </SessionProvider>
        </ThemeProvider>
    );
}
