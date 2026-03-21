'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ExploreSidebar({ 
  searchQuery, 
  setSearchQuery 
}: { 
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}) {
  const { data: session } = useSession();

  return (
    <aside className="w-full md:w-[300px] h-[calc(100vh-5rem)] sticky top-20 bg-surface flex flex-col gap-4 py-8 overflow-y-auto hide-scrollbar border-r-0 md:bg-zinc-50 dark:bg-zinc-800/50">
      
      {/* Profile Section */}
      <div className="px-6 mb-4 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 mb-4">
          {session?.user?.image ? (
            <img 
              alt={session.user.name || 'User Profile'} 
              className="w-full h-full rounded-full object-cover ring-4 ring-primary-fixed shadow-lg" 
              src={session.user.image}
            />
          ) : (
            <div className="w-full h-full rounded-full ring-4 ring-primary-fixed shadow-lg bg-surface-container-high flex items-center justify-center">
              <span className="text-3xl font-display font-bold text-primary">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'M'}
              </span>
            </div>
          )}
          
          <div className="absolute bottom-0 right-0 bg-secondary px-2 py-0.5 rounded-full border-2 border-white">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {session ? 'Miembro' : 'Invitado'}
            </span>
          </div>
        </div>

        <h3 className="font-headline text-lg font-bold text-on-surface">
          {session ? session.user?.name : 'Bienvenid@ a MujerApp'}
        </h3>
        <p className="text-xs text-zinc-500 font-label tracking-widest uppercase">
          {session ? 'Buenos Aires, AR' : 'Tu red de belleza'}
        </p>

        {!session && (
          <div className="mt-4 w-full px-4">
             <Link href="/login" className="block w-full text-xs font-semibold uppercase tracking-wider bg-on-surface text-surface py-2 rounded-full hover:opacity-90 transition-opacity">
               Iniciar Sesión
             </Link>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      {session && (
        <nav className="space-y-1 px-2">
          <Link href="/mis-turnos" className="flex items-center gap-3 bg-primary text-white rounded-full px-4 py-3 mx-2 group transition-all">
            <span className="material-symbols-outlined text-xl">calendar_today</span>
            <span className="font-body text-sm font-medium">Mis Turnos</span>
          </Link>
          <button className="w-full flex items-center gap-3 text-zinc-600 dark:text-zinc-400 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full mx-2 group transition-all hover:translate-x-1">
            <span className="material-symbols-outlined text-xl">favorite</span>
            <span className="font-body text-sm font-medium">Favoritos</span>
          </button>
        </nav>
      )}

      {/* Search & Filters */}
      <div className="px-6 mt-6 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Buscar por nombre</label>
          <div className="relative group">
            <input 
              className="w-full bg-surface-container-high border-none rounded-full py-3 px-11 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface" 
              placeholder="¿Qué buscás hoy?" 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Rango de precio</label>
            <span className="text-xs font-semibold text-primary">$1k - $15k</span>
          </div>
          <input className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" type="range" />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Distancia</label>
          <select className="w-full bg-surface-container-high border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 text-on-surface appearance-none">
            <option>A menos de 2km</option>
            <option>5km a la redonda</option>
            <option>Toda la ciudad</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Servicios populares</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'balayage', label: 'Balayage', active: false },
              { id: 'keratina', label: 'Keratina', active: true },
              { id: 'hidratacion', label: 'Hidratación', active: false },
              { id: 'unas-gel', label: 'Uñas Gel', active: false },
            ].map(tag => (
              <button key={tag.id} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${tag.active ? 'bg-primary-fixed text-on-primary-fixed border-transparent' : 'border-outline/20 hover:border-primary hover:text-primary text-on-surface'}`}>
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
