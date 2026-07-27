'use server';

import { getPublicSalons } from '@/lib/services/marketplace.service';

export interface SalonListing {
  id: string;
  name: string;
  slug: string;
  address: string;
  coverImageUrl: string;
  description: string;
}

export async function fetchPublicSalons(): Promise<SalonListing[]> {
  const salons = await getPublicSalons();
  return salons.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    address: s.address ?? '',
    coverImageUrl: s.coverImageUrl ?? '',
    description: s.description ?? '',
  }));
}
