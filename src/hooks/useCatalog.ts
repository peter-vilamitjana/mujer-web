'use client';

import { useState, useEffect } from 'react';
import { catalogService } from '@/lib/services/catalog.service';
import { useTenant } from '@/contexts/TenantContext'; // Assuming you have this
import type { Service, Promotion, Staff } from '@/lib/schema';

export function useCatalog() {
    const { tenantId } = useTenant();
    const [services, setServices] = useState<Service[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!tenantId) return;

        let isMounted = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                const [servicesData, promosData, staffData] = await Promise.all([
                    catalogService.getServices(tenantId),
                    catalogService.getPromotions(tenantId),
                    catalogService.getStaff(tenantId)
                ]);

                if (isMounted) {
                    setServices(servicesData);
                    setPromotions(promosData);
                    setStaff(staffData);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error("Failed to fetch catalog:", err);
                    setError(err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [tenantId]);

    return { services, promotions, staff, loading, error };
}
