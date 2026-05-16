'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fetchPublicSalons, type SalonListing } from '@/actions/explore.actions';

// ── Category definitions ───────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'todo',     label: 'Todo',               icon: 'explore',        keywords: [] },
  { id: 'corte',    label: 'Corte & Peinado',     icon: 'content_cut',    keywords: ['corte', 'peinado', 'cabello', 'hair'] },
  { id: 'color',    label: 'Coloración',           icon: 'palette',        keywords: ['color', 'balayage', 'mechas', 'rubio', 'tintura'] },
  { id: 'keratina', label: 'Keratina',             icon: 'auto_awesome',   keywords: ['keratina', 'alisa', 'botox', 'lissage'] },
  { id: 'unas',     label: 'Uñas',                icon: 'back_hand',      keywords: ['uña', 'gel', 'nail', 'manicura', 'pedicura'] },
  { id: 'spa',      label: 'Spa & Masajes',        icon: 'spa',            keywords: ['spa', 'masaje', 'relax', 'aromaterapia'] },
  { id: 'facial',   label: 'Facial',              icon: 'face_retouching_natural', keywords: ['facial', 'hidra', 'limpieza', 'peeling'] },
  { id: 'novias',   label: 'Novias',              icon: 'diamond',        keywords: ['novia', 'boda', 'casamiento', 'quinceañera'] },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

const SORT_OPTIONS = [
  { id: 'relevancia', label: 'Relevancia' },
  { id: 'valorados',  label: 'Mejor valorados' },
  { id: 'az',         label: 'A → Z' },
] as const;

type SortId = typeof SORT_OPTIONS[number]['id'];

// ── Skeleton card ──────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-[1.5rem] overflow-hidden border border-white/5 animate-pulse">
      <div className="aspect-[4/3] bg-white/[0.04]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/[0.06] rounded-full w-2/3" />
        <div className="h-3 bg-white/[0.04] rounded-full w-1/2" />
        <div className="h-3 bg-white/[0.04] rounded-full w-3/4" />
        <div className="h-10 bg-white/[0.04] rounded-xl mt-4" />
      </div>
    </div>
  );
}

// ── Salon card ─────────────────────────────────────────────────────────────────

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
  'https://images.unsplash.com/photo-1633681122987-5efb6b4ce5ba?w=600&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600&q=80',
  'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=600&q=80',
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80',
];

function SalonSearchCard({ salon, index }: { salon: SalonListing; index: number }) {
  const fallback = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const imgSrc = salon.coverImageUrl || fallback;

  const initials = salon.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <Link href={`/salones/${salon.slug}`} className="block group">
      <article className="relative rounded-[1.5rem] overflow-hidden border border-white/[0.07] hover:border-[#f1c97d]/20 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(241,201,125,0.15)] hover:-translate-y-1 h-full flex flex-col" style={{ background: 'rgba(17,16,14,0.7)', backdropFilter: 'blur(12px)' }}>

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={salon.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c0a]/90 via-[#0d0c0a]/20 to-transparent" />

          {/* Rating badge top-right */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
            <span className="material-symbols-outlined text-[#f1c97d] text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-white text-[11px] font-semibold">4.9</span>
          </div>

          {/* Initials badge bottom-left */}
          <div className="absolute bottom-3 left-3 w-9 h-9 rounded-full bg-[#f1c97d]/10 border border-[#f1c97d]/25 flex items-center justify-center">
            <span className="text-[#f1c97d] text-[10px] font-bold tracking-wider">{initials}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-headline text-[#f5f0e8] text-[17px] leading-snug line-clamp-1 group-hover:text-[#f1c97d] transition-colors duration-300">
            {salon.name}
          </h3>

          {salon.address && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="material-symbols-outlined text-[#7a766e] text-[13px]">location_on</span>
              <span className="text-[#7a766e] text-[12px] font-label line-clamp-1">{salon.address}</span>
            </div>
          )}

          {salon.description && (
            <p className="text-[#c8c4bc] text-[12px] leading-relaxed mt-3 line-clamp-2 font-body">
              {salon.description}
            </p>
          )}

          {/* Services preview */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['Corte', 'Color', 'Keratina'].map(tag => (
              <span key={tag} className="text-[10px] font-label uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[#7a766e]">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
            <div>
              <p className="text-[9px] font-label uppercase tracking-widest text-[#7a766e]">Servicios desde</p>
              <p className="text-[#f1c97d] font-semibold text-sm mt-0.5">$ Consultar</p>
            </div>
            <div className="h-8 px-4 rounded-full bg-[#f1c97d] hover:bg-[#c9a84c] text-[#050504] text-[11px] font-bold uppercase tracking-widest font-label flex items-center transition-colors duration-200">
              Reservar
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[#7a766e] text-[28px]">search_off</span>
      </div>
      <h3 className="font-headline text-[#f5f0e8] text-xl mb-2">
        {query ? `Sin resultados para "${query}"` : 'Próximamente en tu zona'}
      </h3>
      <p className="text-[#7a766e] text-sm font-body max-w-xs leading-relaxed">
        {query
          ? 'Probá con otro término o explorá todas las categorías.'
          : 'Estamos sumando los mejores salones de Buenos Aires.'}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ExplorarTab() {
  const [salons, setSalons] = useState<SalonListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('todo');
  const [activeSort, setActiveSort] = useState<SortId>('relevancia');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchPublicSalons()
      .then(setSalons)
      .catch(() => setSalons([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let results = [...salons];

    // Text search
    const q = query.toLowerCase().trim();
    if (q) {
      results = results.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    // Category
    const cat = CATEGORIES.find(c => c.id === activeCategory);
    if (cat && cat.keywords.length > 0) {
      results = results.filter(s => {
        const text = `${s.name} ${s.description}`.toLowerCase();
        return cat.keywords.some(k => text.includes(k));
      });
    }

    // Sort
    if (activeSort === 'az') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }, [salons, query, activeCategory, activeSort]);

  const currentSortLabel = SORT_OPTIONS.find(o => o.id === activeSort)?.label ?? 'Relevancia';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-5xl font-body font-light text-[#f5f0e8] mb-1">Explorar</h1>
        <p className="text-[#7a766e] text-xs tracking-wide font-label uppercase">
          Los mejores salones y espacios de belleza
        </p>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7a766e] text-[20px] pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Buscar salones, servicios, barrios..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] focus:border-[#f1c97d]/30 focus:bg-white/[0.06] text-[#f5f0e8] placeholder-[#3e3b35] text-sm outline-none transition-all duration-200 font-body"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a766e] hover:text-[#f5f0e8] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Location chip */}
        <button className="h-12 px-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 text-[#c8c4bc] text-sm hover:border-[#f1c97d]/20 hover:text-[#f1c97d] transition-all duration-200 whitespace-nowrap shrink-0 font-body">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          Buenos Aires
          <span className="material-symbols-outlined text-[14px] text-[#7a766e]">expand_more</span>
        </button>
      </div>

      {/* ── Category chips ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 hide-scrollbar">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full border text-[12px] font-label uppercase tracking-widest whitespace-nowrap shrink-0 transition-all duration-200
                ${isActive
                  ? 'bg-[#f1c97d]/10 border-[#f1c97d]/40 text-[#f1c97d]'
                  : 'bg-white/[0.03] border-white/[0.07] text-[#7a766e] hover:border-white/20 hover:text-[#c8c4bc]'
                }
              `}
            >
              <span className="material-symbols-outlined text-[15px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {cat.icon}
              </span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Filter row ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {/* Available today chip */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.07] text-[#7a766e] text-[11px] font-label uppercase tracking-widest hover:border-white/20 hover:text-[#c8c4bc] transition-all duration-200">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Disponible hoy
          </button>

          {/* Price chip */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.07] text-[#7a766e] text-[11px] font-label uppercase tracking-widest hover:border-white/20 hover:text-[#c8c4bc] transition-all duration-200">
            <span className="material-symbols-outlined text-[14px]">payments</span>
            Precio
            <span className="material-symbols-outlined text-[13px]">expand_more</span>
          </button>
        </div>

        {/* Results count + sort */}
        <div className="flex items-center gap-4">
          {!loading && (
            <p className="text-[#7a766e] text-[11px] font-label uppercase tracking-widest">
              {filtered.length} {filtered.length === 1 ? 'salón' : 'salones'}
            </p>
          )}

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(v => !v)}
              className="flex items-center gap-1.5 text-[#c8c4bc] text-[11px] font-label uppercase tracking-widest hover:text-[#f1c97d] transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">sort</span>
              {currentSortLabel}
              <span className="material-symbols-outlined text-[13px]">expand_more</span>
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-8 z-20 rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl" style={{ background: 'rgba(17,16,14,0.95)', backdropFilter: 'blur(20px)', minWidth: '160px' }}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setActiveSort(opt.id); setShowSortMenu(false); }}
                      className={`w-full text-left px-5 py-3 text-[11px] font-label uppercase tracking-widest transition-colors ${activeSort === opt.id ? 'text-[#f1c97d] bg-[#f1c97d]/5' : 'text-[#7a766e] hover:text-[#c8c4bc] hover:bg-white/[0.03]'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Results grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          filtered.map((salon, i) => (
            <SalonSearchCard key={salon.id || salon.slug} salon={salon} index={i} />
          ))
        )}
      </div>

      {/* ── Promotional banner ───────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="mt-10 rounded-[2rem] overflow-hidden relative border border-[#f1c97d]/10 p-8 flex items-center justify-between gap-6">
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, rgba(241,201,125,0.06) 0%, rgba(17,16,14,0.8) 60%)' }} />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full -z-10 opacity-30" style={{ background: 'radial-gradient(circle, rgba(241,201,125,0.15) 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
          <div>
            <p className="text-[9px] font-label uppercase tracking-[0.3em] text-[#f1c97d] mb-2">Próximamente</p>
            <h3 className="font-headline text-[#f5f0e8] text-2xl leading-tight">
              Encontrá salones cerca tuyo
            </h3>
            <p className="text-[#7a766e] text-sm mt-2 font-body">
              Activá tu ubicación para ver disponibilidad en tiempo real.
            </p>
          </div>
          <button className="shrink-0 h-11 px-6 rounded-full border border-[#f1c97d]/30 text-[#f1c97d] text-[11px] font-label uppercase tracking-widest hover:bg-[#f1c97d]/10 transition-all duration-200 whitespace-nowrap">
            Activar ubicación
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}
