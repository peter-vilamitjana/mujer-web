'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Star, Heart, MapPin } from 'lucide-react';
import { DashboardSidebar } from '../_components/DashboardSidebar';
import { type FavoriteSalonData, toggleFavorite } from '@/actions/profile.actions';

interface Props {
  initialFavorites: FavoriteSalonData[];
}

function SalonCard({
  salon,
  onToggle,
  toggling,
}: {
  salon: FavoriteSalonData;
  onToggle: (tenantId: string) => void;
  toggling: boolean;
}) {
  return (
    <div
      className="rounded-[12px] overflow-hidden transition-colors duration-200 group"
      style={{ backgroundColor: '#111010', width: '280px', minHeight: '320px' }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ height: '160px', background: 'linear-gradient(135deg, #22252A 0%, #111010 100%)' }}
      >
        <span className="font-vogue text-6xl select-none opacity-20" style={{ color: '#D4AF37' }}>
          {salon.name.charAt(0)}
        </span>
        <button
          onClick={() => onToggle(salon.tenantId)}
          disabled={toggling}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          aria-label="Quitar de favoritos"
        >
          <Heart
            className="w-4 h-4"
            style={{ fill: '#D4AF37', color: '#D4AF37' }}
          />
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-vogue text-[17px] mb-3" style={{ color: '#F4F4F5' }}>
          {salon.name}
        </h3>

        {salon.address && (
          <div className="flex items-center gap-1.5 mb-5">
            <MapPin className="w-3 h-3 shrink-0" style={{ color: '#8A8F98' }} />
            <p className="text-[12px]" style={{ color: '#8A8F98' }}>{salon.address}</p>
          </div>
        )}

        <Link
          href={`/salones/${salon.slug}`}
          className="block text-center text-[13px] font-medium py-2.5 rounded-[6px] transition-opacity duration-150 hover:opacity-80"
          style={{ backgroundColor: '#D4AF37', color: '#050504' }}
        >
          Reservar
        </Link>
      </div>
    </div>
  );
}

export default function FavoritosClient({ initialFavorites }: Props) {
  const [favorites, setFavorites] = useState<FavoriteSalonData[]>(initialFavorites);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleToggle = (tenantId: string) => {
    // Optimistic remove
    setFavorites((prev) => prev.filter((s) => s.tenantId !== tenantId));
    setTogglingId(tenantId);

    startTransition(async () => {
      const result = await toggleFavorite(tenantId);
      if (result.error) {
        // Rollback: re-fetch would be ideal, but keep optimistic for now
        console.error('[toggleFavorite]', result.error);
      }
      setTogglingId(null);
    });
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#050504' }}>
      <DashboardSidebar />

      <main className="flex-1 min-w-0 px-12 py-10">
        <header className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] font-medium mb-2" style={{ color: '#8A8F98' }}>
            COLECCIÓN
          </p>
          <div className="flex items-end justify-between">
            <h2 className="font-vogue text-[32px] font-semibold leading-none" style={{ color: '#F4F4F5' }}>
              Favoritos
            </h2>
            {favorites.length > 0 && (
              <span
                className="text-[11px] font-medium px-3 py-1.5 rounded-full border mb-0.5"
                style={{ color: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.2)' }}
              >
                {favorites.length} salones
              </span>
            )}
          </div>
          <div className="mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
        </header>

        {favorites.length > 0 ? (
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {favorites.map((salon) => (
              <SalonCard
                key={salon.tenantId}
                salon={salon}
                onToggle={handleToggle}
                toggling={togglingId === salon.tenantId}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-[12px]"
            style={{ border: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#111010' }}
          >
            <Heart className="w-10 h-10 mb-4" style={{ color: '#8A8F98' }} />
            <p className="font-vogue text-xl mb-2" style={{ color: '#8A8F98' }}>Sin salones favoritos</p>
            <p className="text-sm mb-8" style={{ color: '#8A8F98', opacity: 0.6 }}>
              Guardá los salones que más te gusten.
            </p>
            <Link
              href="/explore"
              className="text-[11px] font-semibold uppercase tracking-widest px-6 py-3 rounded-[6px] transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#D4AF37', color: '#050504' }}
            >
              Explorar Salones
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
