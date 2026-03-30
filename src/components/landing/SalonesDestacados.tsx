'use client';

import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';
import type { Tenant } from '@/lib/schema';

const mockSalones = [
  {
    id: 'mock-1',
    name: "L'Atelier Blanc",
    slug: 'demo-salon',
    address: 'Palermo, Buenos Aires',
    category: 'Hair & Color',
    logoUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
  },
  {
    id: 'mock-2',
    name: 'Maison de Beauté',
    slug: 'demo-salon',
    address: 'Recoleta, Buenos Aires',
    category: 'Skin & Spa',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138daaa0c0e1?w=800&q=80',
  },
  {
    id: 'mock-3',
    name: 'Studio Nude',
    slug: 'demo-salon',
    address: 'Belgrano, Buenos Aires',
    category: 'Estética Integral',
    logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
  },
];

interface SalonData {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  category?: string;
  logoUrl?: string;
}

interface Props {
  salones: Tenant[];
}

export default function SalonesDestacados({ salones }: Props) {
  // Mezclar salones reales con mocks para llegar a 3
  const reales: SalonData[] = salones.map(s => ({
    id: s.id,
    name: s.name,
    slug: (s as any).slug || s.id,
    address: (s as any).address,
    category: (s as any).category,
    logoUrl: (s as any).logoUrl,
  }));

  // Completar con mocks si hay menos de 3 salones reales
  const mocks = mockSalones.filter(m => !reales.find(r => r.slug === m.slug));
  const data: SalonData[] = [...reales, ...mocks].slice(0, 3);

  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-brand-primary/40 block mb-4 font-inter">
                Salones adheridos
              </span>
              <h2 className="font-vogue text-5xl md:text-6xl text-brand-primary">
                Descubrí tu lugar.
              </h2>
            </div>
            <Link
              href="/explore"
              className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/50 hover:text-brand-primary transition-colors duration-300 font-inter"
            >
              Ver directorio completo
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Grid compacto — 3 columnas uniformes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((salon, i) => (
            <ScrollReveal key={salon.id} delay={i * 0.1}>
              <Link
                href={`/salones/${salon.slug || salon.id}`}
                className="group block"
              >
                {/* Card */}
                <div className="rounded-[2rem] overflow-hidden border border-brand-primary/8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.4)]">

                  {/* Imagen */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-brand-surface">
                    <img
                      src={salon.logoUrl || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80'}
                      alt={salon.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay con CTA */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-500" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <span className="liquid-glass text-white px-6 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] whitespace-nowrap font-inter">
                        Ver vitrina
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 bg-brand-bg">
                    <h3 className="font-vogue text-xl text-brand-primary mb-1 leading-tight">
                      {salon.name}
                    </h3>
                    <p className="text-brand-primary/40 text-xs font-inter">
                      {salon.address || 'Buenos Aires'} · {salon.category || 'Salón de Belleza'}
                    </p>
                  </div>

                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
