'use client';

import React, { useState } from 'react';

export default function ConfigTabView() {
  const [vacationMode, setVacationMode] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
      
      {/* Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold italic text-[#f5f0e8] leading-tight">Configuración del Salón</h1>
          <p className="text-[#7a766e] text-sm mt-1 flex items-center gap-1.5 italic">
            Refinando el arte de la gestión con precisión Liquid Glass.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] px-6 py-2.5 rounded-xl text-xs font-bold text-[#7a766e] hover:text-[#f5f0e8] transition-all cursor-pointer">
            Descartar
          </button>
          <button className="bg-violet-500 hover:bg-violet-400 text-white font-bold px-8 py-2.5 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95 cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>save</span>
            Guardar Cambios
          </button>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">
        
        {/* Section 1: Local Profile (Large Bento) */}
        <section className="md:col-span-8 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden flex flex-col group">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-playfair text-xl font-bold italic text-violet-300">Perfil del Local</h3>
              <p className="text-[12px] text-[#7a766e] mt-1">Identidad editorial y detalles de contacto.</p>
            </div>
            <span className="material-symbols-outlined text-violet-400/40" style={{ fontSize: '24px' }}>storefront</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Nombre del Salón</label>
              <input 
                type="text" 
                defaultValue="MujerApp Luxury Hair"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 focus:outline-none transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Contacto Editorial</label>
              <input 
                type="text" 
                defaultValue="+54 11 2345 6789"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 focus:outline-none transition-all" 
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Dirección (Buenos Aires)</label>
              <input 
                type="text" 
                defaultValue="Av. Alvear 1891, Recoleta, Buenos Aires"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 focus:outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Galería del Salón</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              <div className="aspect-square rounded-xl border border-white/[0.1] bg-violet-500/5 overflow-hidden group/img relative cursor-pointer">
                <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity z-10" />
                <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt="Salon 1" />
              </div>
              <div className="aspect-square rounded-xl border border-white/[0.1] bg-violet-500/5 overflow-hidden group/img relative cursor-pointer">
                <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity z-10" />
                <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt="Salon 2" />
              </div>
              <div className="aspect-square rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center cursor-pointer group/add">
                <span className="material-symbols-outlined text-violet-400 group-hover/add:scale-110 transition-transform">add_photo_alternate</span>
                <span className="text-[9px] font-bold uppercase tracking-tighter mt-1 text-[#7a766e]">Subir</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Business Hours (Small Bento) */}
        <section className="md:col-span-4 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden flex flex-col">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-playfair text-xl font-bold italic text-violet-300">Horarios</h3>
            <button 
              onClick={() => setVacationMode(!vacationMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${vacationMode ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' : 'bg-violet-500/10 border-violet-500/20 text-violet-300'}`}
            >
              <div className={`w-2 h-2 rounded-full ${vacationMode ? 'bg-rose-500 animate-pulse' : 'bg-violet-500'}`}></div>
              <span className="text-[9px] font-bold uppercase tracking-widest">{vacationMode ? 'Cerrado' : 'Abierto'}</span>
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {[
              { day: 'Lun - Vie', hours: '09:00 - 20:00' },
              { day: 'Sábados', hours: '10:00 - 18:00' },
              { day: 'Domingos', hours: 'Cerrado', closed: true }
            ].map((item, i) => (
              <div key={i} className={`flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0 ${item.closed ? 'opacity-40' : ''}`}>
                <span className="text-[13px] font-medium text-[#f5f0e8]">{item.day}</span>
                <span className={`text-[12px] font-bold font-mono ${item.closed ? 'text-[#7a766e]' : 'text-violet-300'}`}>{item.hours}</span>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-bold uppercase tracking-widest text-[#f5f0e8] transition-all cursor-pointer">
            Ajustar Calendario
          </button>
        </section>

        {/* Section 3: Team Management (Horizontal Long Bento) */}
        <section className="md:col-span-12 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-playfair text-xl font-bold italic text-violet-300">Gestión de Equipo</h3>
              <p className="text-[12px] text-[#7a766e] mt-1">Métricas de desempeño y niveles de comisión.</p>
            </div>
            <button className="flex items-center gap-2 bg-violet-500/10 text-violet-300 border border-violet-500/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-violet-500/20 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">person_add</span> 
              Agregar Estilista
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Valeria S.', role: 'Especialista Color', comm: '35%', avatar: 'VS', color: '#a78bfa' },
              { name: 'Mateo R.', role: 'Master Barber', comm: '40%', avatar: 'MR', color: '#34d399', highlight: true },
              { name: 'Lucia M.', role: 'Keratin Pro', comm: '30%', avatar: 'LM', color: '#fbbf24' }
            ].map((staff, i) => (
              <div key={i} className={`bg-[#0d0d0d]/60 border border-white/[0.06] p-4 rounded-2xl flex items-center gap-4 hover:translate-y-[-4px] transition-all group ${staff.highlight ? 'border-l-2 border-l-violet-400' : ''}`}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-[14px] font-black tracking-tighter shadow-lg border"
                     style={{ background: `${staff.color}15`, color: staff.color, borderColor: `${staff.color}30` }}>
                  {staff.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-[#f5f0e8] truncate">{staff.name}</h4>
                  <p className="text-[11px] text-[#7a766e] mt-0.5">{staff.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-violet-300 font-bold font-mono text-[15px]">{staff.comm}</p>
                  <p className="text-[9px] text-[#7a766e] uppercase font-bold tracking-tighter">Com.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Marketing & Perks (Medium Bento) */}
        <section className="md:col-span-6 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden flex flex-col">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '24px' }}>campaign</span>
            <h3 className="font-playfair text-xl font-bold italic text-violet-300">Marketing & Perks</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl flex justify-between items-center group">
              <div>
                <p className="text-[14px] font-bold text-[#f5f0e8]">Descuento Primera Visita</p>
                <p className="text-[11px] text-[#7a766e] mt-0.5">20% off en todos los servicios</p>
              </div>
              <div className="w-11 h-6 bg-violet-500 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex justify-between items-center opacity-60">
              <div>
                <p className="text-[14px] font-bold text-[#f5f0e8]">Programa de Lealtad</p>
                <p className="text-[11px] text-[#7a766e] mt-0.5">Acumulación de puntos por visita</p>
              </div>
              <div className="w-11 h-6 bg-white/[0.1] rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-[#7a766e] rounded-full"></div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button className="text-violet-400 font-bold text-[10px] uppercase tracking-widest hover:underline cursor-pointer">Administrar Todas las Promociones</button>
            </div>
          </div>
        </section>

        {/* Section 5: System Settings (Medium Bento) */}
        <section className="md:col-span-6 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden flex flex-col">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '24px' }}>tune</span>
            <h3 className="font-playfair text-xl font-bold italic text-violet-300">Ajustes del Sistema</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Moneda</label>
              <select className="w-full bg-[#0d0d0d]/60 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 outline-none transition-all appearance-none cursor-pointer">
                <option>ARS (Peso Argentino)</option>
                <option>USD (Dólar)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Idioma</label>
              <select className="w-full bg-[#0d0d0d]/60 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 outline-none transition-all appearance-none cursor-pointer">
                <option>Español (AR)</option>
                <option>English (US)</option>
              </select>
            </div>
            <div className="col-span-2 p-4 bg-violet-500/5 border border-white/[0.06] rounded-2xl flex items-center gap-4 mt-2">
              <div className="bg-violet-500/15 p-2.5 rounded-xl border border-violet-500/20">
                <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '20px' }}>chat</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#f5f0e8]">Notificaciones WhatsApp</p>
                <p className="text-[11px] text-[#7a766e]">Activado para el nodo de Buenos Aires.</p>
              </div>
              <button 
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${whatsappEnabled ? 'bg-violet-500' : 'bg-white/[0.1]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${whatsappEnabled ? 'right-1 bg-white' : 'left-1 bg-[#7a766e]'}`}></div>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
