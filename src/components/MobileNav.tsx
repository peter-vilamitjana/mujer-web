'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, Scissors, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Inicio', icon: Home },
        { href: '/agenda', label: 'Agenda', icon: Calendar },
        { href: '/turnos', label: 'Nuevo', icon: Plus, isCta: true },
        { href: '/clientes', label: 'Clientes', icon: Users },
        { href: '/servicios', label: 'Servicios', icon: Scissors },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe md:hidden">
            <nav className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    if (item.isCta) {
                        return (
                            <div key={item.href} className="relative -top-5">
                                <Link href={item.href}>
                                    <Button
                                        size="icon"
                                        className="h-14 w-14 rounded-full shadow-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-4 border-background"
                                    >
                                        <item.icon className="h-7 w-7" />
                                    </Button>
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-[#8B5CF6]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
