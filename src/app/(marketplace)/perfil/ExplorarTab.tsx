'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { fetchPublicSalons, type SalonListing } from '@/actions/explore.actions';
import { getMyFavorites, toggleFavorite as toggleFavoriteAction } from '@/actions/profile.actions';

// ── Search Engine ──────────────────────────────────────────────────────────────

const TRENDING = ['Manicura gel', 'Balayage', 'Keratina', 'Corte + brushing', 'Masajes', 'Facial hidratante'];

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[#f1c97d] font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

interface SearchSuggestion {
  type: 'recent' | 'salon' | 'trending';
  label: string;
  sublabel?: string;
  slug?: string;
}

function SearchEngine({
  salons,
  onCommit,
}: {
  salons: SalonListing[];
  onCommit: (q: string) => void;
}) {
  const [rawQuery, setRawQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setSelectedIdx(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const q = rawQuery.trim();
    if (!q) {
      const recents: SearchSuggestion[] = recentSearches.slice(0, 3).map(r => ({
        type: 'recent', label: r,
      }));
      const trending: SearchSuggestion[] = TRENDING.slice(0, 4).map(t => ({
        type: 'trending', label: t,
      }));
      return [...recents, ...trending];
    }
    const ql = q.toLowerCase();
    return salons
      .filter(s =>
        s.name.toLowerCase().includes(ql) ||
        s.address.toLowerCase().includes(ql) ||
        s.description.toLowerCase().includes(ql)
      )
      .slice(0, 6)
      .map(s => ({
        type: 'salon' as const,
        label: s.name,
        sublabel: s.address || 'Buenos Aires',
        slug: s.slug,
      }));
  }, [rawQuery, salons, recentSearches]);

  const commit = useCallback((val: string) => {
    const q = val.trim();
    if (q && !recentSearches.includes(q)) {
      setRecentSearches(prev => [q, ...prev].slice(0, 5));
    }
    onCommit(q);
    setIsFocused(false);
    setSelectedIdx(-1);
  }, [onCommit, recentSearches]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawQuery(val);
    setSelectedIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onCommit(val), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0 && suggestions[selectedIdx]) {
        const s = suggestions[selectedIdx];
        setRawQuery(s.label);
        commit(s.label);
      } else {
        commit(rawQuery);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSelectedIdx(-1);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (s: SearchSuggestion) => {
    setRawQuery(s.label);
    commit(s.label);
  };

  const clearQuery = () => {
    setRawQuery('');
    onCommit('');
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      {/* ── Pill container ── */}
      <div className={`
        flex items-center bg-[#1c1c1e]/70 backdrop-blur-2xl
        rounded-[2rem] h-[64px] p-1.5
        border transition-all duration-300
        shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.02)]
        ${isFocused
          ? 'border-[#f1c97d]/30 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_4px_rgba(241,201,125,0.06),inset_0_0_0_1px_rgba(255,255,255,0.05)]'
          : 'border-white/[0.08] hover:border-white/[0.14] hover:bg-[#1c1c1e]/80'
        }
        ${showDropdown ? 'rounded-b-none rounded-t-[2rem] border-b-transparent' : ''}
      `}>

        {/* Qué buscás */}
        <div className="flex-1 flex flex-col justify-center px-5 h-full rounded-[1.5rem] hover:bg-white/[0.03] transition-colors cursor-text relative min-w-0 group/q">
          <label className="text-[9px] font-bold text-[#f5f0e8]/70 uppercase tracking-[0.12em] mb-0.5 cursor-text select-none">
            Qué buscás
          </label>
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              ref={inputRef}
              type="text"
              placeholder="Todos los tratamientos"
              value={rawQuery}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-[13px] text-[#f5f0e8] w-full min-w-0 placeholder:text-[#525255] font-medium leading-none"
              autoComplete="off"
              spellCheck={false}
            />
            {rawQuery && (
              <button
                onMouseDown={(e) => { e.preventDefault(); clearQuery(); }}
                className="shrink-0 w-5 h-5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-[#7a766e] text-[12px] leading-none">close</span>
              </button>
            )}
          </div>
          {/* Divider */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-7 bg-white/[0.08] group-hover/q:opacity-0 transition-opacity" />
        </div>

        {/* Dónde */}
        <div className="flex-1 flex flex-col justify-center px-5 h-full rounded-[1.5rem] hover:bg-white/[0.03] transition-colors cursor-text relative hidden sm:flex group/d">
          <label className="text-[9px] font-bold text-[#f5f0e8]/70 uppercase tracking-[0.12em] mb-0.5 cursor-text select-none">Dónde</label>
          <input
            type="text"
            placeholder="Área del mapa"
            className="bg-transparent border-none outline-none text-[13px] text-[#f5f0e8] w-full placeholder:text-[#525255] font-medium leading-none"
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-7 bg-white/[0.08] group-hover/d:opacity-0 transition-opacity" />
        </div>

        {/* Cuándo */}
        <div className="flex-[0.8] flex flex-col justify-center px-5 h-full rounded-[1.5rem] hover:bg-white/[0.03] transition-colors cursor-text hidden md:flex">
          <label className="text-[9px] font-bold text-[#f5f0e8]/70 uppercase tracking-[0.12em] mb-0.5 cursor-text select-none">Cuándo</label>
          <input
            type="text"
            placeholder="Cualquier momento"
            className="bg-transparent border-none outline-none text-[13px] text-[#f5f0e8] w-full placeholder:text-[#525255] font-medium leading-none"
          />
        </div>

        {/* Search button */}
        <button
          onClick={() => commit(rawQuery)}
          className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#f1c97d] to-[#c9a84c] text-[#050504] flex items-center justify-center shrink-0 ml-1 hover:scale-[1.05] active:scale-95 transition-transform shadow-[0_4px_20px_rgba(241,201,125,0.35)] cursor-pointer"
          aria-label="Buscar"
        >
          <span className="material-symbols-outlined text-[22px] font-bold leading-none">search</span>
        </button>
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="
          absolute left-0 right-0 top-[calc(100%-1px)] z-50
          bg-[#1a1a1d]/95 backdrop-blur-2xl
          border border-[#f1c97d]/20 border-t-white/[0.06]
          rounded-b-[2rem] overflow-hidden
          shadow-[0_24px_60px_rgba(0,0,0,0.7)]
          divide-y divide-white/[0.04]
        ">
          {/* Section header */}
          <div className="px-6 pt-3 pb-2">
            <span className="text-[10px] font-label uppercase tracking-[0.18em] text-[#525255]">
              {rawQuery.trim() ? 'Resultados' : recentSearches.length > 0 ? 'Recientes y tendencias' : 'Tendencias'}
            </span>
          </div>

          {/* Suggestions list */}
          <ul className="py-2 max-h-72 overflow-y-auto hide-scrollbar">
            {suggestions.map((s, i) => (
              <li key={`${s.type}-${s.label}`}>
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s); }}
                  onMouseEnter={() => setSelectedIdx(i)}
                  className={`
                    w-full flex items-center gap-4 px-5 py-3
                    text-left transition-colors duration-100 cursor-pointer
                    ${selectedIdx === i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                    ${s.type === 'recent' ? 'bg-white/[0.06] text-[#7a766e]' :
                      s.type === 'salon' ? 'bg-[#f1c97d]/[0.12] text-[#f1c97d]' :
                      'bg-white/[0.04] text-[#7a766e]'}
                  `}>
                    <span className="material-symbols-outlined text-[18px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {s.type === 'recent' ? 'history' : s.type === 'salon' ? 'storefront' : 'trending_up'}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#f5f0e8] font-medium leading-snug truncate">
                      <HighlightMatch text={s.label} query={rawQuery} />
                    </p>
                    {s.sublabel && (
                      <p className="text-[11px] text-[#7a766e] mt-0.5 truncate">{s.sublabel}</p>
                    )}
                  </div>

                  {/* Arrow */}
                  <span className={`
                    material-symbols-outlined text-[16px] leading-none shrink-0 transition-transform duration-150
                    ${selectedIdx === i ? 'text-[#f5f0e8] translate-x-0.5' : 'text-[#525255]'}
                  `}>
                    north_west
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          {recentSearches.length > 0 && !rawQuery.trim() && (
            <div className="px-5 py-3 flex justify-end">
              <button
                onMouseDown={(e) => { e.preventDefault(); setRecentSearches([]); }}
                className="text-[10px] font-label uppercase tracking-wider text-[#525255] hover:text-[#7a766e] transition-colors cursor-pointer"
              >
                Limpiar historial
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'todo',     label: 'Todo',            icon: 'explore',                 keywords: [] },
  { id: 'corte',    label: 'Corte & Peinado', icon: 'content_cut',             keywords: ['corte', 'peinado', 'cabello', 'hair'] },
  { id: 'color',    label: 'Coloración',       icon: 'palette',                 keywords: ['color', 'balayage', 'mechas', 'rubio', 'tintura'] },
  { id: 'keratina', label: 'Keratina',         icon: 'auto_awesome',            keywords: ['keratina', 'alisa', 'botox', 'lissage'] },
  { id: 'unas',     label: 'Uñas',            icon: 'back_hand',               keywords: ['uña', 'gel', 'nail', 'manicura', 'pedicura'] },
  { id: 'spa',      label: 'Spa & Masajes',    icon: 'spa',                     keywords: ['spa', 'masaje', 'relax', 'aromaterapia'] },
  { id: 'facial',   label: 'Facial',          icon: 'face_retouching_natural', keywords: ['facial', 'hidra', 'limpieza', 'peeling'] },
  { id: 'novias',   label: 'Novias',          icon: 'diamond',                 keywords: ['novia', 'boda', 'casamiento', 'quinceañera'] },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=85',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=85',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=85',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=85',
  'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&q=85',
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=85',
];

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-[1.75rem] overflow-hidden border border-white/[0.06] bg-[#0d0d0f]">
      <div className="aspect-[4/3] relative overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.03]" />
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-white/[0.05] rounded-full w-2/3 relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="h-3 bg-white/[0.04] rounded-full w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="h-3 bg-white/[0.04] rounded-full w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="h-10 bg-white/[0.04] rounded-2xl mt-5 relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

// ── Salon Card ─────────────────────────────────────────────────────────────────

function SalonSearchCard({ salon, index, isFavorited, onToggleFavorite }: {
  salon: SalonListing;
  index: number;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const fallback = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const imgSrc = salon.coverImageUrl || fallback;
  const distance = (0.8 + (index * 1.3)).toFixed(1);
  const reviews = 127 + (index * 43);
  const rating = (4.6 + (index % 4) * 0.1).toFixed(1);

  return (
    <Link href={`/salones/${salon.slug}`} className="block group cursor-pointer">
      <article className="
        relative rounded-[1.75rem] overflow-hidden flex flex-col h-full
        bg-[#0d0d0f] border border-white/[0.07]
        transition-all duration-300 ease-out
        hover:-translate-y-1.5
        hover:border-[#f1c97d]/25
        hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-10px_rgba(241,201,125,0.12)]
      ">

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={salon.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== FALLBACK_IMAGES[0]) {
                target.src = FALLBACK_IMAGES[0];
              }
            }}
          />

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/40 to-transparent pointer-events-none" />

          {/* Rating badge — top left */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[#f1c97d] text-[13px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-white text-[11px] font-bold tabular-nums">{rating}</span>
          </div>

          {/* Heart — top right */}
          <button
            className={`
              absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-xl
              flex items-center justify-center border transition-all duration-200 cursor-pointer z-10
              ${isFavorited
                ? 'bg-[#f1c97d]/20 border-[#f1c97d]/40 text-[#f1c97d]'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-black/60'
              }
            `}
            onClick={(e) => { e.preventDefault(); onToggleFavorite(salon.id); }}
            aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <span
              className="material-symbols-outlined text-[16px] leading-none"
              style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>

          {/* Distance pill — bottom left overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[#7a766e] text-[11px] leading-none">near_me</span>
            <span className="text-[#f5f0e8] text-[11px] font-medium tabular-nums">{distance} km</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 pt-3.5">
          <h3 className="font-headline text-[#f5f0e8] text-[17px] leading-snug line-clamp-1 group-hover:text-[#f1c97d] transition-colors duration-300 mb-1">
            {salon.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[#7a766e] text-[12px] font-body mb-3">
            <span className="line-clamp-1">{salon.address || 'Buenos Aires, Argentina'}</span>
            <span className="shrink-0 w-1 h-1 rounded-full bg-[#7a766e]/40" />
            <span className="shrink-0 tabular-nums">{reviews.toLocaleString()} reseñas</span>
          </div>

          {/* CTA */}
          <div className="mt-auto pt-3 border-t border-white/[0.06]">
            <div className="
              w-full h-10 rounded-2xl flex items-center justify-center gap-2
              bg-white/[0.04] border border-white/[0.08]
              text-[#f5f0e8] text-[12px] font-label uppercase tracking-wider
              group-hover:bg-[#f1c97d]/10 group-hover:border-[#f1c97d]/30 group-hover:text-[#f1c97d]
              transition-all duration-300
            ">
              <span className="material-symbols-outlined text-[14px] leading-none">calendar_month</span>
              Ver disponibilidad
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Category Chip ──────────────────────────────────────────────────────────────

function CategoryChip({
  category,
  isActive,
  onClick,
}: {
  category: typeof CATEGORIES[number];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-full
        text-[12px] font-label uppercase tracking-wider whitespace-nowrap
        transition-all duration-200 cursor-pointer
        ${isActive
          ? 'bg-[#f1c97d] text-[#050504] font-bold shadow-[0_0_20px_-4px_rgba(241,201,125,0.4)]'
          : 'bg-white/[0.04] text-[#7a766e] border border-white/[0.08] hover:bg-white/[0.08] hover:text-[#f5f0e8] hover:border-white/[0.15]'
        }
      `}
    >
      <span
        className="material-symbols-outlined text-[15px] leading-none"
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
      >
        {category.icon}
      </span>
      {category.label}
    </button>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  const suggestions = ['Manicura', 'Balayage', 'Masajes', 'Facial'];
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[#7a766e] text-[28px]">search_off</span>
      </div>
      <h3 className="font-headline text-[#f5f0e8] text-xl mb-2">
        {query ? `Sin resultados para "${query}"` : 'Próximamente en tu zona'}
      </h3>
      <p className="text-[#7a766e] text-sm font-body max-w-xs leading-relaxed mb-6">
        {query
          ? 'Probá con otro término o explorá estas categorías populares.'
          : 'Estamos sumando los mejores salones de Buenos Aires. Mientras tanto, explorá:'}
      </p>
      {!query && (
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((s) => (
            <span
              key={s}
              className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#f5f0e8] text-[12px] font-label uppercase tracking-wider"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Interactive Map ────────────────────────────────────────────────────────────

function InteractiveMap({ salons, activePinId, onPinHover }: {
  salons: SalonListing[];
  activePinId: string | null;
  onPinHover: (id: string | null) => void;
}) {
  const getCoords = (id: string, index: number) => {
    const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const x = 12 + ((hash * 13) % 76);
    const y = 12 + ((hash * 27 + index * 11) % 72);
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="w-full h-full relative bg-[#08080a] overflow-hidden rounded-[2rem] border border-white/[0.06]">

      {/* Grid streets */}
      <div className="absolute inset-0 origin-center rotate-[-10deg] scale-[1.4] pointer-events-none z-0">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1.5px, transparent 1.5px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1.5px, transparent 1.5px)',
          backgroundSize: '120px 120px',
        }} />
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        {/* Main avenues */}
        <div className="absolute top-[35%] left-0 w-full h-[5px] bg-[#f1c97d]/[0.08] shadow-[0_0_12px_rgba(241,201,125,0.08)]" />
        <div className="absolute top-[65%] left-0 w-full h-[3px] bg-[#f1c97d]/[0.05]" />
        <div className="absolute top-0 left-[38%] w-[5px] h-full bg-[#f1c97d]/[0.08] shadow-[0_0_12px_rgba(241,201,125,0.08)]" />
        <div className="absolute top-0 left-[72%] w-[3px] h-full bg-[#f1c97d]/[0.04]" />
      </div>

      {/* Edge fade */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, #08080a 100%)',
      }} />

      {/* Pins */}
      {salons.map((salon, i) => {
        const isActive = activePinId === (salon.id || salon.slug);
        return (
          <div
            key={salon.id || salon.slug}
            className="absolute z-10 cursor-pointer"
            style={getCoords(salon.id || salon.slug, i)}
            onMouseEnter={() => onPinHover(salon.id || salon.slug)}
            onMouseLeave={() => onPinHover(null)}
          >
            <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full">

              {/* Tooltip */}
              <div className={`
                absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2
                bg-[#1a1a1d]/95 border border-white/[0.12] px-3 py-2 rounded-xl
                backdrop-blur-xl pointer-events-none whitespace-nowrap z-20
                shadow-[0_8px_32px_rgba(0,0,0,0.6)]
                transition-all duration-200
                ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
              `}>
                <p className="text-[12px] text-[#f5f0e8] font-medium leading-none mb-1">{salon.name}</p>
                <p className="text-[10px] text-[#7a766e]">{salon.address || 'Buenos Aires'}</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white/[0.12]" />
              </div>

              {/* Pin */}
              <div className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                transition-all duration-200
                ${isActive
                  ? 'bg-[#f1c97d] text-[#050504] shadow-[0_0_20px_rgba(241,201,125,0.5)] scale-110'
                  : 'bg-[#1a1a1d] border border-white/20 text-white hover:bg-[#252528] hover:scale-105 shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
                }
              `}>
                <span className={`material-symbols-outlined text-[11px] leading-none ${isActive ? 'text-[#050504]' : 'text-[#f1c97d]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-[11px] font-bold tabular-nums">5.0</span>
              </div>

              {/* Tail */}
              <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] -mt-px transition-colors duration-200 ${isActive ? 'border-t-[#f1c97d]' : 'border-t-white/20'}`} />
              <div className={`w-1 h-1 rounded-full blur-[1px] mt-0.5 transition-colors duration-200 ${isActive ? 'bg-[#f1c97d]/40' : 'bg-black/40'}`} />
            </div>
          </div>
        );
      })}

      {/* Map controls */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-10">
        <button className="w-9 h-9 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] hover:bg-white/[0.15] rounded-xl flex items-center justify-center text-[#f5f0e8] transition-all duration-200 cursor-pointer shadow-lg">
          <span className="material-symbols-outlined text-[16px] leading-none">my_location</span>
        </button>
        <div className="flex flex-col bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-xl overflow-hidden shadow-lg mt-1">
          <button className="w-9 h-9 hover:bg-white/[0.15] flex items-center justify-center text-[#f5f0e8] transition-all duration-200 cursor-pointer border-b border-white/[0.08]">
            <span className="material-symbols-outlined text-[16px] leading-none">add</span>
          </button>
          <button className="w-9 h-9 hover:bg-white/[0.15] flex items-center justify-center text-[#f5f0e8] transition-all duration-200 cursor-pointer">
            <span className="material-symbols-outlined text-[16px] leading-none">remove</span>
          </button>
        </div>
      </div>

      {/* Map label */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl border border-white/[0.08] px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f1c97d] animate-pulse" />
          <span className="text-[#f5f0e8] text-[11px] font-label uppercase tracking-widest">En vivo</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ExplorarTab() {
  const [salons, setSalons] = useState<SalonListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('todo');
  const [showMap, setShowMap] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [activeTabType, setActiveTabType] = useState<'establecimientos' | 'profesionales'>('establecimientos');

  useEffect(() => {
    fetchPublicSalons()
      .then(setSalons)
      .catch(() => setSalons([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getMyFavorites()
      .then(favs => setFavorites(new Set(favs.map(f => f.tenantId))))
      .catch(() => setFavorites(new Set()));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const wasFavorite = favorites.has(id);

    // Optimistic update — revert if the server call fails.
    setFavorites(prev => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(id);
      else next.add(id);
      return next;
    });

    toggleFavoriteAction(id).then(result => {
      if (result.error) {
        setFavorites(prev => {
          const next = new Set(prev);
          if (wasFavorite) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    });
  }, [favorites]);

  const filtered = useMemo(() => {
    let results = [...salons];
    const q = query.toLowerCase().trim();
    if (q) {
      results = results.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'todo') {
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      const kws = (cat as any)?.keywords as string[] | undefined;
      if (kws && kws.length > 0) {
        results = results.filter(s =>
          kws.some(kw =>
            s.name.toLowerCase().includes(kw) ||
            s.description.toLowerCase().includes(kw)
          )
        );
      }
    }
    return results;
  }, [salons, query, activeCategory]);

  return (
    <div className="animate-in fade-in duration-500 pb-10">

      {/* ── Search Engine ───────────────────────────────────────────────────────── */}
      <div className="mb-6 -mt-2">
        <SearchEngine salons={salons} onCommit={setQuery} />
      </div>

      {/* ── Category Chips ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 hide-scrollbar -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.id}
            category={cat}
            isActive={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          />
        ))}
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5 gap-3 flex-wrap">

        {/* Type tabs */}
        <div className="flex bg-white/[0.04] p-0.5 rounded-full border border-white/[0.08]">
          {(['establecimientos', 'profesionales'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTabType(type)}
              className={`
                px-4 py-1.5 rounded-full text-[11px] font-label uppercase tracking-wider
                transition-all duration-200 cursor-pointer capitalize
                ${activeTabType === type
                  ? 'bg-[#f1c97d] text-[#050504] font-bold shadow-sm'
                  : 'text-[#7a766e] hover:text-[#f5f0e8]'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[#7a766e] text-[11px] font-label uppercase tracking-widest whitespace-nowrap">
            {loading ? '—' : `${filtered.length} en el área`}
          </span>

          <button className="
            flex items-center gap-1.5 border border-white/[0.10] px-3.5 py-2 rounded-full
            text-[#7a766e] text-[11px] font-label uppercase tracking-wider
            hover:bg-white/[0.08] hover:text-[#f5f0e8] hover:border-white/[0.18]
            transition-all duration-200 cursor-pointer
          ">
            <span className="material-symbols-outlined text-[15px] leading-none">tune</span>
            Filtros
          </button>

          <button
            onClick={() => setShowMap(!showMap)}
            className={`
              flex items-center gap-1.5 border px-3.5 py-2 rounded-full
              text-[11px] font-label uppercase tracking-wider
              transition-all duration-200 cursor-pointer
              ${showMap
                ? 'border-[#f1c97d]/30 text-[#f1c97d] bg-[#f1c97d]/[0.06] hover:bg-[#f1c97d]/[0.12]'
                : 'border-white/[0.10] text-[#7a766e] hover:bg-white/[0.08] hover:text-[#f5f0e8]'
              }
            `}
          >
            <span className="material-symbols-outlined text-[15px] leading-none">{showMap ? 'map' : 'map'}</span>
            {showMap ? 'Ocultar mapa' : 'Ver mapa'}
          </button>
        </div>
      </div>

      {/* ── Split Layout ────────────────────────────────────────────────────────── */}
      <div className="flex gap-5" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>

        {/* Left: Results */}
        <div className={`
          overflow-y-auto stylish-scrollbar pr-1 pb-16 flex-shrink-0
          transition-all duration-500
          ${showMap ? 'w-[54%]' : 'w-full'}
        `}>
          <div className={`grid gap-4 ${showMap ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
                ? <EmptyState query={query} />
                : filtered.map((salon, i) => (
                  <SalonSearchCard
                    key={salon.id || salon.slug}
                    salon={salon}
                    index={i}
                    isFavorited={favorites.has(salon.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))
            }
          </div>

          {/* Promo banner */}
          {!loading && filtered.length > 0 && (
            <div className="mt-8 rounded-[2rem] relative overflow-hidden border border-[#f1c97d]/[0.12] p-7 flex items-center justify-between gap-5">
              <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(130deg, rgba(241,201,125,0.07) 0%, rgba(13,13,15,0.9) 55%)' }} />
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full -z-10 opacity-25" style={{ background: 'radial-gradient(circle, rgba(241,201,125,0.18) 0%, transparent 65%)', transform: 'translate(25%, -35%)' }} />
              <div>
                <p className="text-[9px] font-label uppercase tracking-[0.3em] text-[#f1c97d] mb-2">Próximamente</p>
                <h3 className="font-headline text-[#f5f0e8] text-xl leading-tight">
                  Salones cerca tuyo, en tiempo real
                </h3>
                <p className="text-[#7a766e] text-[12px] font-body mt-1">Activá tu ubicación para ver distancias exactas.</p>
              </div>
              <button className="
                shrink-0 h-10 px-5 rounded-full border border-[#f1c97d]/30 text-[#f1c97d]
                text-[11px] font-label uppercase tracking-widest
                hover:bg-[#f1c97d]/10 transition-all duration-200 cursor-pointer whitespace-nowrap
              ">
                Activar
              </button>
            </div>
          )}
        </div>

        {/* Right: Map */}
        {showMap && (
          <div className="flex-1 h-full sticky top-0 animate-in fade-in slide-in-from-right-6 duration-400">
            <InteractiveMap salons={filtered} activePinId={activePinId} onPinHover={setActivePinId} />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .stylish-scrollbar::-webkit-scrollbar { width: 4px; }
        .stylish-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .stylish-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        .stylish-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          animation: shimmer 1.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .skeleton-shimmer { animation: none; }
          .animate-in { animation: none; }
          .animate-pulse { animation: none; }
        }
      ` }} />
    </div>
  );
}
