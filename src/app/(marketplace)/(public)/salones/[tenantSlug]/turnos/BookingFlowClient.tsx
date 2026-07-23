'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Service, Staff } from '@/lib/schema';

const BookingFlow = dynamic(() => import('@/components/marketplace/BookingFlow'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 mt-4">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  ),
});

interface Props {
  tenantId: string;
  tenantSlug: string;
  services: Service[];
  staff: Staff[];
  isAuthenticated: boolean;
}

export default function BookingFlowClient(props: Props) {
  return <BookingFlow {...props} />;
}
