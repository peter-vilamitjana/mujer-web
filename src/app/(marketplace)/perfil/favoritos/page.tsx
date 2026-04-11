'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Heart, MapPin } from 'lucide-react'
import { DashboardSidebar } from '../_components/DashboardSidebar'

interface Salon {
  id: string
  name: string
  slug: string
  address: string
  category: string
  rating: number
  isFavorite: boolean
}

const MOCK_SALONS: Salon[] = [
  { id: '1', name: 'Casa Blanca', slug: 'casa-blanca', address: 'Palermo, CABA', category: 'Salón', rating: 4.9, isFavorite: true },
  { id: '2', name: 'Aura Wellness', slug: 'aura-wellness', address: 'Recoleta, CABA', category: 'Spa', rating: 4.8, isFavorite: true },
  { id: '3', name: 'Studio Minimal', slug: 'studio-minimal', address: 'San Telmo, CABA', category: 'Studio', rating: 4.7, isFavorite: true },
  { id: '4', name: 'Maison de Beauté', slug: 'maison', address: 'Belgrano, CABA', category: 'Salón', rating: 4.6, isFavorite: true },
  { id: '5', name: 'Le Spa Prestige', slug: 'le-spa', address: 'Puerto Madero, CABA', category: 'Spa', rating: 5.0, isFavorite: true },
  { id: '6', name: 'Nails & Co.', slug: 'nails-co', address: 'Núñez, CABA', category: 'Studio', rating: 4.5, isFavorite: true },
]

function SalonCard({ salon, onToggle }: { salon: Salon; onToggle: (id: string) => void }) {
  return (
    <div
      className="rounded-[12px] overflow-hidden transition-colors duration-200 group"
      style={{ backgroundColor: '#1A1C20', width: '280px', minHeight: '320px' }}
    >
      {/* Top half — salon photo placeholder */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: '160px',
          backgroundColor: '#22252A',
          background: 'linear-gradient(135deg, #22252A 0%, #1A1C20 100%)',
        }}
      >
        {/* Salon initial as decorative element */}
        <span
          className="font-vogue text-6xl select-none opacity-20"
          style={{ color: '#D4AF37' }}
        >
          {salon.name.charAt(0)}
        </span>

        {/* Category badge */}
        <span
          className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-medium"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#8A8F98' }}
        >
          {salon.category}
        </span>

        {/* Heart icon — top right, toggleable */}
        <button
          onClick={() => onToggle(salon.id)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          aria-label={salon.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            className="w-4 h-4"
            style={{
              fill: salon.isFavorite ? '#D4AF37' : 'none',
              color: salon.isFavorite ? '#D4AF37' : '#F4F4F5',
            }}
          />
        </button>
      </div>

      {/* Bottom half — info */}
      <div className="p-5">
        <h3 className="font-vogue text-[17px] mb-1" style={{ color: '#F4F4F5' }}>
          {salon.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-3.5 h-3.5" style={{ fill: '#D4AF37', color: '#D4AF37' }} />
          <span className="text-[13px] font-medium" style={{ color: '#D4AF37' }}>
            {salon.rating.toFixed(1)}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1.5 mb-5">
          <MapPin className="w-3 h-3 shrink-0" style={{ color: '#8A8F98' }} />
          <p className="text-[12px]" style={{ color: '#8A8F98' }}>
            {salon.address}
          </p>
        </div>

        {/* Reservar CTA */}
        <Link
          href={`/salones/${salon.slug}`}
          className="block text-center text-[13px] font-medium py-2.5 rounded-[6px] transition-opacity duration-150 hover:opacity-80"
          style={{ backgroundColor: '#D4AF37', color: '#0F1012' }}
        >
          Reservar
        </Link>
      </div>
    </div>
  )
}

export default function FavoritosPage() {
  const [salons, setSalons] = useState(MOCK_SALONS)

  const toggleFavorite = (id: string) => {
    setSalons((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    )
  }

  const favorites = salons.filter((s) => s.isFavorite)

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0F1012' }}>
      <DashboardSidebar />

      <main className="flex-1 min-w-0 px-12 py-10">
        <div>

          {/* Header */}
          <header className="mb-10">
            <p
              className="text-[10px] uppercase tracking-[0.4em] font-medium mb-2"
              style={{ color: '#8A8F98' }}
            >
              COLECCIÓN
            </p>
            <div className="flex items-end justify-between">
              <h2
                className="font-vogue text-[32px] font-semibold leading-none"
                style={{ color: '#F4F4F5' }}
              >
                Favoritos
              </h2>
              {favorites.length > 0 && (
                <span
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full border mb-0.5"
                  style={{
                    color: '#D4AF37',
                    backgroundColor: 'rgba(212,175,55,0.08)',
                    borderColor: 'rgba(212,175,55,0.2)',
                  }}
                >
                  {favorites.length} salones
                </span>
              )}
            </div>
            <div className="mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          </header>

          {/* Grid */}
          {favorites.length > 0 ? (
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
            >
              {favorites.map((salon) => (
                <SalonCard key={salon.id} salon={salon} onToggle={toggleFavorite} />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-24 rounded-[12px]"
              style={{ border: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#1A1C20' }}
            >
              <Heart className="w-10 h-10 mb-4" style={{ color: '#8A8F98' }} />
              <p className="font-vogue text-xl mb-2" style={{ color: '#8A8F98' }}>
                Sin salones favoritos
              </p>
              <p className="text-sm mb-8" style={{ color: '#8A8F98', opacity: 0.6 }}>
                Guardá los salones que más te gusten.
              </p>
              <Link
                href="/explore"
                className="text-[11px] font-semibold uppercase tracking-widest px-6 py-3 rounded-[6px] transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#D4AF37', color: '#0F1012' }}
              >
                Explorar Salones
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
