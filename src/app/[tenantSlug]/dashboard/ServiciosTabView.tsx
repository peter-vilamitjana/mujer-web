'use client';

import React, { useState, useMemo } from 'react';

// Mock Data
type ServiceCategory = 'Color & Mechas' | 'Corte & Estilo' | 'Tratamientos' | 'Manicura' | 'Estética';

interface Service {
  id: number;
  name: string;
  category: ServiceCategory;
  price: number;
  duration: string;
  description: string;
  icon: string;
  color: string;
  professionals?: string[];
}

const SERVICES_DB: Service[] = [
  { 
    id: 1, 
    name: 'Técnica Balayage', 
    category: 'Color & Mechas', 
    price: 18500, 
    duration: '4h', 
    description: 'Técnica de degradado natural con iluminación personalizada. Incluye tonalización, lavado premium y secado.',
    icon: 'gradient', 
    color: '#a78bfa',
    professionals: ['Valentina', 'Ana']
  },
  { 
    id: 2, 
    name: 'Corte & Estilo Pro', 
    category: 'Corte & Estilo', 
    price: 8500, 
    duration: '1h', 
    description: 'Corte personalizado según morfología facial y asesoramiento de estilo. Incluye lavado y peinado.',
    icon: 'content_cut', 
    color: '#34d399',
    professionals: ['Valentina', 'Julián']
  },
  { 
    id: 3, 
    name: 'Tratamiento Olaplex', 
    category: 'Tratamientos', 
    price: 14500, 
    duration: '1.5h', 
    description: 'Reconstrucción profunda de enlaces capilares para cabellos dañados o procesados. Recupera la fuerza y el brillo.',
    icon: 'rebase_edit', 
    color: '#fbbf24',
    professionals: ['Ana', 'Julián']
  },
  { 
    id: 4, 
    name: 'Manicura + Pedicura', 
    category: 'Manicura', 
    price: 9500, 
    duration: '2h', 
    description: 'Servicio completo de embellecimiento de manos y pies con esmaltado semipermanente y exfoliación.',
    icon: 'front_hand', 
    color: '#f472b6',
    professionals: ['Ana']
  },
  { 
    id: 5, 
    name: 'Keratina Nanoplastia', 
    category: 'Tratamientos', 
    price: 28000, 
    duration: '4h', 
    description: 'Alisado orgánico y restauración de fibra capilar con brillo espejo. Libre de formol.',
    icon: 'auto_awesome', 
    color: '#38bdf8',
    professionals: ['Valentina', 'Julián']
  },
  { 
    id: 6, 
    name: 'Tinte Raíz Premium', 
    category: 'Color & Mechas', 
    price: 12000, 
    duration: '2h', 
    description: 'Cobertura de canas 100% con productos orgánicos de alta gama que protegen el cuero cabelludo.',
    icon: 'colorize', 
    color: '#a78bfa',
    professionals: ['Valentina', 'Ana']
  },
];

const CATEGORIES: ServiceCategory[] = ['Color & Mechas', 'Corte & Estilo', 'Tratamientos', 'Manicura', 'Estética'];

export default function ServiciosTabView() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(SERVICES_DB[0].id);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'Todos'>('Todos');

  const filteredServices = useMemo(() => {
    return SERVICES_DB.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const selectedService = SERVICES_DB.find(s => s.id === selectedId) || null;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold italic text-[#f5f0e8] leading-tight">Gestión de Servicios</h1>
          <p className="text-[#7a766e] text-sm mt-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '16px' }}>inventory_2</span>
            {SERVICES_DB.length} servicios en catálogo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
            <span className="hidden sm:inline">Nuevo Servicio</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[600px]">

        {/* LEFT COLUMN: CATALOG */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          
          {/* Search and Categories */}
          <div className="relative isolate rounded-[2rem] border border-white/[0.08] p-5 bg-[#0d0d0d]/40 overflow-hidden flex flex-col gap-5">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
            
            <div className="relative group flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7a766e] group-focus-within:text-violet-400 transition-colors pointer-events-none" style={{ fontSize: '20px' }}>search</span>
              <input 
                type="text" 
                placeholder="Buscar servicio por nombre..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-2xl pl-12 pr-4 py-3.5 text-[14px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] transition-all" 
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => setActiveCategory('Todos')}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer border
                  ${activeCategory === 'Todos' ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'bg-transparent border-white/[0.05] text-[#7a766e] hover:bg-white/[0.04] hover:text-[#f5f0e8]'}`}
              >
                Todos
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer border
                    ${activeCategory === cat ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'bg-transparent border-white/[0.05] text-[#7a766e] hover:bg-white/[0.04] hover:text-[#f5f0e8]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(service => {
              const isSel = selectedId === service.id;
              return (
                <div 
                  key={service.id}
                  onClick={() => setSelectedId(service.id)}
                  className={`relative isolate rounded-[1.8rem] border p-5 flex flex-col gap-4 cursor-pointer transition-all duration-300 group
                    ${isSel ? 'bg-violet-500/[0.06] border-violet-500/30 shadow-[0_10px_30px_rgba(139,92,246,0.1)]' : 'bg-[#0d0d0d]/40 border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'}`}
                >
                  <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                  
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                         style={{ background: `${service.color}15`, color: service.color, border: `1px solid ${service.color}30` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{service.icon}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[16px] font-bold text-[#f5f0e8] font-mono">${service.price.toLocaleString('es-AR')}</span>
                      <div className="flex items-center gap-1 text-[#7a766e] mt-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span className="text-[11px] font-bold">{service.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-[15px] font-bold transition-colors ${isSel ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>{service.name}</h3>
                    <p className="text-[11px] text-[#7a766e] mt-1 uppercase tracking-wider font-bold">{service.category}</p>
                    <p className="text-[12px] text-[#7a766e] mt-3 line-clamp-2 leading-relaxed">{service.description}</p>
                  </div>

                  {isSel && (
                    <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                      <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SERVICE EDITOR */}
        <div className="lg:col-span-5 xl:col-span-4">
          {selectedService ? (
            <div className="sticky top-6 relative isolate rounded-[2rem] border border-white/[0.08] flex flex-col bg-[#0d0d0d]/40 overflow-hidden min-h-[600px] animate-in slide-in-from-right-8 duration-500">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              
              {/* Header with Icon Box */}
              <div className="p-8 pb-4 flex flex-col items-center text-center">
                <div className="relative mb-5 group">
                  <div className="absolute inset-0 rounded-[2rem] blur-2xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                       style={{ background: selectedService.color }}></div>
                  <div className="relative w-20 h-20 rounded-[2rem] flex items-center justify-center text-[32px] shadow-2xl border-2" 
                       style={{ background: `${selectedService.color}1a`, color: selectedService.color, borderColor: `${selectedService.color}40` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>{selectedService.icon}</span>
                  </div>
                </div>
                
                <h2 className="font-playfair text-[24px] font-bold text-[#f5f0e8] mb-1 leading-tight italic">{selectedService.name}</h2>
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em]">{selectedService.category}</span>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-7">
                
                {/* Price and Duration Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Precio</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 font-mono text-sm">$</span>
                      <input 
                        type="text" 
                        defaultValue={selectedService.price}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3 text-[15px] font-bold font-mono text-[#f5f0e8] focus:outline-none focus:border-violet-500/40" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Duración</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" style={{ fontSize: '18px' }}>schedule</span>
                      <input 
                        type="text" 
                        defaultValue={selectedService.duration}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-[14px] font-bold text-[#f5f0e8] focus:outline-none focus:border-violet-500/40" 
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Descripción del Servicio</label>
                  <textarea 
                    rows={4}
                    defaultValue={selectedService.description}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-[13px] leading-relaxed text-[#c9c3b8] focus:outline-none focus:border-violet-500/40 resize-none"
                  />
                </div>

                {/* Professionals */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Profesionales Habilitados</label>
                  <div className="flex flex-wrap gap-2">
                    {['Valentina', 'Ana', 'Julián', 'Sofía', 'Camila'].map(pro => {
                      const isEnabled = selectedService.professionals?.includes(pro);
                      return (
                        <button 
                          key={pro}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer
                            ${isEnabled ? 'bg-violet-500/20 border-violet-500/30 text-violet-300' : 'bg-white/[0.02] border-white/[0.05] text-[#7a766e]'}`}
                        >
                          {pro}
                        </button>
                      );
                    })}
                    <button className="w-9 h-9 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.1] flex items-center justify-center text-[#7a766e] hover:border-violet-500/40 hover:text-violet-400 transition-all">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="p-8 pt-4 border-t border-white/[0.06] bg-black/20 flex gap-3">
                <button className="flex-1 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-[#7a766e] hover:text-[#f5f0e8] font-bold rounded-2xl text-[13px] transition-all border border-white/[0.05] cursor-pointer">
                  Desactivar
                </button>
                <button className="flex-[2] py-4 bg-violet-500 hover:bg-violet-400 active:scale-[0.98] text-white font-bold rounded-2xl text-[13px] transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] cursor-pointer flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>save</span>
                  Guardar Cambios
                </button>
              </div>
            </div>
          ) : (
            <div className="relative isolate rounded-[2rem] border border-white/[0.08] p-8 flex flex-col items-center justify-center bg-[#0d0d0d]/40 overflow-hidden h-full min-h-[400px]">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
              <div className="w-20 h-20 rounded-[2rem] bg-white/[0.03] border border-dashed border-white/[0.1] flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[#7a766e]/30" style={{ fontSize: '40px' }}>inventory_2</span>
              </div>
              <p className="text-[#f5f0e8] text-lg font-medium mb-1 italic font-playfair">Seleccioná un servicio</p>
              <p className="text-[#7a766e] text-sm text-center max-w-[250px] leading-relaxed">Elegí un servicio del catálogo para editar sus detalles, ajustar precios o gestionar profesionales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
