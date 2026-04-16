'use client';

import { useState, useMemo } from 'react';
import type { Tenant } from '@/lib/schema';
import PublicSalonCard from '@/components/marketplace/PublicSalonCard';
import ExploreSidebar from '@/components/marketplace/ExploreSidebar';
import PublicHeader from '@/components/marketplace/PublicHeader';

export default function ExploreClient({ salons }: { salons: Tenant[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSalons = useMemo(() => 
    salons.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [salons, searchQuery]
  );

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary/20">
      <PublicHeader />
      
      <main className="flex min-h-screen pt-20">
        <ExploreSidebar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <section className="flex-1 px-4 md:px-12 py-8 bg-surface-bright pb-32">
          
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-3 block">Directorio de Estética</span>
              <h1 className="font-headline text-4xl font-semibold tracking-tight text-on-surface">Resultados en tu red</h1>
              <p className="mt-4 text-zinc-500 font-body leading-relaxed">
                Descubrí los salones más exclusivos curados especialmente para vos. Calidad, estilo y confort en un solo lugar.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface">
                <span className="material-symbols-outlined text-on-surface-variant">grid_view</span>
              </button>
              <button className="p-2 rounded-full bg-transparent text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </header>

          {filteredSalons.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-outline/30">
              <p className="text-on-surface-variant font-medium">No encontramos salones mágicos que coincidan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredSalons.map(salon => (
                <PublicSalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          )}

          {/* Footer en el Main Content Area */}
          <footer className="mt-20 py-12 px-8 bg-zinc-50 dark:bg-zinc-950 border-t-0 tonal-shift rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <div>
                <span className="text-xl font-black text-[#191c1d] dark:text-white italic">Ouleeh</span>
                <p className="mt-4 text-zinc-500 font-body text-xs uppercase tracking-widest">© {new Date().getFullYear()} Ouleeh. Sumate a la red de salones.</p>
              </div>
              <div className="flex flex-col gap-3">
                <h5 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface">Comunidad</h5>
                <a className="font-body text-xs uppercase tracking-widest text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors" href="/business">¿Tenés un salón?</a>
                <a className="font-body text-xs uppercase tracking-widest text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors" href="#">Centro de ayuda</a>
              </div>
              <div className="flex flex-col gap-3">
                <h5 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface">Social</h5>
                <a className="font-body text-xs uppercase tracking-widest text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors" href="#">Instagram</a>
                <a className="font-body text-xs uppercase tracking-widest text-zinc-500 hover:text-[#191c1d] hover:underline decoration-[#775a19] transition-colors" href="#">Facebook</a>
              </div>
            </div>
          </footer>
        </section>
      </main>

      {/* Map View FAB */}
      <button className="fixed bottom-8 right-8 bg-on-surface text-surface px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 group hover:scale-105 transition-transform z-40">
        <span className="material-symbols-outlined">map</span>
        <span className="font-bold text-sm tracking-tight text-white">Ver mapa</span>
      </button>

    </div>
  );
}
