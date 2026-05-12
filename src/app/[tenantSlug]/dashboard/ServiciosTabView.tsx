'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { useStaff } from '@/hooks/useStaff';
import { useTenant } from '@/contexts/TenantContext';
import { updateService, toggleServiceActive, createService } from '@/actions/services.actions';
import { updateStaffMember } from '@/actions/staff.actions';
import type { Service } from '@/lib/schema';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getServicePrice(svc: Service): number {
  if (typeof svc.price === 'number') return svc.price;
  if (svc.price && typeof svc.price === 'object') {
    if ('corto' in svc.price) return (svc.price as { corto: number }).corto;
    if ('from' in svc.price) return (svc.price as { from: number }).from;
  }
  return 0;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  'color-y-mechas': { label: 'Color & Mechas',  icon: 'gradient',    color: '#a78bfa' },
  color:            { label: 'Color & Mechas',  icon: 'gradient',    color: '#a78bfa' },
  'corte-y-estilo': { label: 'Corte & Estilo',  icon: 'content_cut', color: '#34d399' },
  corte:            { label: 'Corte & Estilo',  icon: 'content_cut', color: '#34d399' },
  tratamientos:     { label: 'Tratamientos',    icon: 'rebase_edit', color: '#fbbf24' },
  tratamiento:      { label: 'Tratamientos',    icon: 'rebase_edit', color: '#fbbf24' },
  manos:            { label: 'Manicura',        icon: 'front_hand',  color: '#f472b6' },
  manicura:         { label: 'Manicura',        icon: 'front_hand',  color: '#f472b6' },
  estetica:         { label: 'Estética',        icon: 'face',        color: '#38bdf8' },
};
const DEFAULT_META = { label: 'Servicios', icon: 'content_cut', color: '#a78bfa' };

function catMeta(categoryId?: string) {
  if (!categoryId) return DEFAULT_META;
  const key = categoryId.toLowerCase();
  if (CATEGORY_META[key]) return CATEGORY_META[key];
  const partial = Object.keys(CATEGORY_META).find(k => key.includes(k) || k.includes(key));
  return partial ? CATEGORY_META[partial] : DEFAULT_META;
}

const CATEGORY_OPTIONS = [
  { value: 'color-y-mechas',  label: 'Color & Mechas' },
  { value: 'corte-y-estilo',  label: 'Corte & Estilo' },
  { value: 'tratamientos',    label: 'Tratamientos' },
  { value: 'manos',           label: 'Manicura' },
  { value: 'estetica',        label: 'Estética' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ServiciosTabView() {
  const { tenantId }  = useTenant();
  const { services: catalogServices, loading: catalogLoading } = useCatalog();
  const { staff }     = useStaff();

  // Local shadow of catalog so mutations reflect immediately without refetch
  const [localServices, setLocalServices] = useState<Service[]>([]);
  useEffect(() => {
    if (catalogServices.length > 0 || !catalogLoading) {
      setLocalServices(catalogServices.filter(s => s.active && s.name));
    }
  }, [catalogServices, catalogLoading]);

  const [search, setSearch]           = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedId, setSelectedId]   = useState<string | null>(null);

  // Edit form state (controlled)
  const [editPrice, setEditPrice]     = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState<string | null>(null);

  // New service modal
  const [showNew, setShowNew]         = useState(false);
  const [newName, setNewName]         = useState('');
  const [newCat, setNewCat]           = useState('color-y-mechas');
  const [newPrice, setNewPrice]       = useState('');
  const [newDuration, setNewDuration] = useState('60');
  const [newDesc, setNewDesc]         = useState('');
  const [creating, setCreating]       = useState(false);

  // When selected service changes, reset edit form
  const selectedService = localServices.find(s => s.id === selectedId) ?? null;
  useEffect(() => {
    if (selectedService) {
      setEditPrice(String(getServicePrice(selectedService)));
      setEditDuration(String(selectedService.durationMinutes));
      setEditDesc(selectedService.description ?? '');
    }
    setSaveMsg(null);
  }, [selectedId]); // intentionally only selectedId

  // Auto-select first service
  useEffect(() => {
    if (localServices.length > 0 && !selectedId) {
      setSelectedId(localServices[0].id);
    }
  }, [localServices, selectedId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of localServices) set.add(catMeta(s.categoryId).label);
    return Array.from(set);
  }, [localServices]);

  const filteredServices = useMemo(() => {
    const q = search.toLowerCase();
    return localServices.filter(s => {
      const matchSearch = (s.name ?? '').toLowerCase().includes(q);
      const matchCat = activeCategory === 'Todos' || catMeta(s.categoryId).label === activeCategory;
      return matchSearch && matchCat;
    });
  }, [localServices, search, activeCategory]);

  const selectedMeta = selectedService ? catMeta(selectedService.categoryId) : DEFAULT_META;

  const selectedPros = useMemo(() => {
    if (!selectedService) return [];
    return staff.filter(s => !s.services || s.services.length === 0 || s.services.includes(selectedService.id));
  }, [staff, selectedService]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!selectedService || !tenantId) return;
    const priceNum = parseFloat(editPrice);
    const durNum   = parseInt(editDuration, 10);
    if (isNaN(priceNum) || priceNum <= 0) { setSaveMsg('Precio inválido.'); return; }
    if (isNaN(durNum) || durNum <= 0) { setSaveMsg('Duración inválida (minutos).'); return; }
    setSaving(true);
    const result = await updateService(tenantId, selectedService.id, {
      price: priceNum,
      durationMinutes: durNum,
      description: editDesc.trim() || undefined,
    });
    setSaving(false);
    if (result.success) {
      setLocalServices(prev => prev.map(s =>
        s.id === selectedService.id
          ? { ...s, price: priceNum, durationMinutes: durNum, description: editDesc.trim() || undefined }
          : s,
      ));
      setSaveMsg('¡Guardado!');
    } else {
      setSaveMsg(result.error);
    }
    setTimeout(() => setSaveMsg(null), 3000);
  }

  async function handleDeactivate() {
    if (!selectedService || !tenantId) return;
    if (!window.confirm(`¿Desactivar "${selectedService.name}"? Dejará de aparecer en el catálogo.`)) return;
    const result = await toggleServiceActive(tenantId, selectedService.id, false);
    if (result.success) {
      setLocalServices(prev => prev.filter(s => s.id !== selectedService.id));
      setSelectedId(null);
    }
  }

  async function handleToggleStaff(staffId: string, currentlyEnabled: boolean) {
    if (!selectedService || !tenantId) return;
    const member = staff.find(s => s.id === staffId);
    if (!member) return;
    const current  = member.services ?? [];
    const next = currentlyEnabled
      ? current.filter(id => id !== selectedService.id)
      : [...current, selectedService.id];
    await updateStaffMember(tenantId, staffId, { services: next });
    // useStaff hook is real-time — will auto-reflect
  }

  async function handleCreate() {
    if (!newName.trim() || !newPrice || !tenantId) return;
    const priceNum = parseFloat(newPrice);
    const durNum   = parseInt(newDuration, 10);
    if (isNaN(priceNum) || isNaN(durNum)) return;
    setCreating(true);
    const result = await createService(tenantId, {
      name:                  newName.trim(),
      categoryId:            newCat,
      price:                 priceNum,
      durationMinutes:       durNum,
      description:           newDesc.trim() || undefined,
      requiresLengthSelection: false,
      variablePrice:         false,
      active:                true,
    });
    setCreating(false);
    if (result.success && result.id) {
      const newSvc: Service = {
        id: result.id,
        name: newName.trim(), categoryId: newCat, price: priceNum,
        durationMinutes: durNum, description: newDesc.trim() || undefined,
        requiresLengthSelection: false, variablePrice: false, active: true,
      };
      setLocalServices(prev => [...prev, newSvc]);
      setSelectedId(result.id!);
      setShowNew(false);
      setNewName(''); setNewCat('color-y-mechas'); setNewPrice(''); setNewDuration('60'); setNewDesc('');
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold italic text-[#f5f0e8] leading-tight">Gestión de Servicios</h1>
          <p className="text-[#7a766e] text-sm mt-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '16px' }}>inventory_2</span>
            {catalogLoading ? 'Cargando…' : `${localServices.length} servicios activos en catálogo`}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
          <span className="hidden sm:inline">Nuevo Servicio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[600px]">

        {/* LEFT: list */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="relative isolate rounded-[2rem] border border-white/[0.08] p-5 bg-[#0d0d0d]/40 overflow-hidden flex flex-col gap-5">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7a766e] group-focus-within:text-violet-400 transition-colors pointer-events-none" style={{ fontSize: '20px' }}>search</span>
              <input
                type="text"
                placeholder="Buscar servicio…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-2xl pl-12 pr-4 py-3.5 text-[14px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {['Todos', ...categories].map(cat => (
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

          {catalogLoading ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <span className="material-symbols-outlined text-violet-400 animate-spin" style={{ fontSize: '36px' }}>progress_activity</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map(svc => {
                const isSel = selectedId === svc.id;
                const meta  = catMeta(svc.categoryId);
                const price = getServicePrice(svc);
                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedId(svc.id)}
                    className={`relative isolate rounded-[1.8rem] border p-5 flex flex-col gap-4 cursor-pointer transition-all duration-300 group
                      ${isSel ? 'bg-violet-500/[0.06] border-violet-500/30 shadow-[0_10px_30px_rgba(139,92,246,0.1)]' : 'bg-[#0d0d0d]/40 border-white/[0.08] hover:border-white/[0.15]'}`}
                  >
                    <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{meta.icon}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[16px] font-bold text-[#f5f0e8] font-mono">
                          {svc.variablePrice ? 'Desde ' : ''}${price.toLocaleString('es-AR')}
                        </span>
                        <div className="flex items-center gap-1 text-[#7a766e] mt-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          <span className="text-[11px] font-bold">{formatDuration(svc.durationMinutes)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-[15px] font-bold ${isSel ? 'text-violet-300' : 'text-[#f5f0e8]'}`}>{svc.name}</h3>
                      <p className="text-[11px] text-[#7a766e] mt-1 uppercase tracking-wider font-bold">{meta.label}</p>
                      {svc.description && <p className="text-[12px] text-[#7a766e] mt-2 line-clamp-2">{svc.description}</p>}
                    </div>
                    {isSel && (
                      <div className="absolute top-4 right-4">
                        <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                          <span className="material-symbols-outlined text-white" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredServices.length === 0 && !catalogLoading && (
                <div className="col-span-2 py-16 text-center">
                  <span className="material-symbols-outlined text-[#7a766e]/40 mb-3" style={{ fontSize: '40px' }}>search_off</span>
                  <p className="text-[#7a766e] text-sm">No se encontraron servicios.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: editor */}
        <div className="lg:col-span-5 xl:col-span-4">
          {selectedService ? (
            <div className="sticky top-6 relative isolate rounded-[2rem] border border-white/[0.08] flex flex-col bg-[#0d0d0d]/40 overflow-hidden min-h-[600px] animate-in slide-in-from-right-8 duration-500">
              <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

              <div className="p-8 pb-4 flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-[2rem] blur-2xl opacity-20" style={{ background: selectedMeta.color }} />
                  <div className="relative w-20 h-20 rounded-[2rem] flex items-center justify-center border-2"
                    style={{ background: `${selectedMeta.color}1a`, color: selectedMeta.color, borderColor: `${selectedMeta.color}40` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>{selectedMeta.icon}</span>
                  </div>
                </div>
                <h2 className="font-playfair text-[24px] font-bold text-[#f5f0e8] mb-1 italic">{selectedService.name}</h2>
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em]">{selectedMeta.label}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-7">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Precio ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 font-mono text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-4 py-3 text-[15px] font-bold font-mono text-[#f5f0e8] focus:outline-none focus:border-violet-500/40"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Duración (min)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" style={{ fontSize: '18px' }}>schedule</span>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={editDuration}
                        onChange={e => setEditDuration(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-[14px] font-bold text-[#f5f0e8] focus:outline-none focus:border-violet-500/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Descripción</label>
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-[13px] leading-relaxed text-[#c9c3b8] focus:outline-none focus:border-violet-500/40 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Profesionales Habilitados</label>
                  <div className="flex flex-wrap gap-2">
                    {staff.map(pro => {
                      const enabled = pro.services == null || pro.services.length === 0 || pro.services.includes(selectedService.id);
                      return (
                        <button
                          key={pro.id}
                          onClick={() => handleToggleStaff(pro.id, enabled)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer
                            ${enabled ? 'bg-violet-500/20 border-violet-500/30 text-violet-300' : 'bg-white/[0.02] border-white/[0.05] text-[#7a766e] hover:border-violet-500/20'}`}
                        >
                          {pro.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-white/[0.06] bg-black/20 flex flex-col gap-2">
                {saveMsg && (
                  <p className={`text-center text-xs font-bold ${saveMsg.startsWith('¡') ? 'text-emerald-400' : 'text-rose-400'}`}>{saveMsg}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleDeactivate}
                    className="flex-1 py-4 bg-white/[0.05] hover:bg-rose-500/10 hover:border-rose-500/30 text-[#7a766e] hover:text-rose-300 font-bold rounded-2xl text-[13px] transition-all border border-white/[0.05] cursor-pointer"
                  >
                    Desactivar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-[2] py-4 bg-violet-500 hover:bg-violet-400 disabled:opacity-60 active:scale-[0.98] text-white font-bold rounded-2xl text-[13px] transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>save</span>
                    )}
                    {saving ? 'Guardando…' : 'Guardar Cambios'}
                  </button>
                </div>
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

      {/* ── Nuevo Servicio Modal ── */}
      {showNew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,5,4,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}
        >
          <div className="relative isolate w-full max-w-md rounded-[2rem] border border-white/[0.12] p-8 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-2xl font-bold italic text-[#f5f0e8]">Nuevo Servicio</h2>
              <button onClick={() => setShowNew(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] text-[#7a766e] hover:text-[#f5f0e8] transition-all cursor-pointer">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest">Nombre</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="ej. Keratina Premium"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest">Categoría</label>
                <select
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  className="w-full bg-[#0d0d0d]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all appearance-none cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest">Precio ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] font-mono text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest">Duración (min)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] font-mono text-[#f5f0e8] focus:outline-none focus:border-violet-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#7a766e] uppercase tracking-widest">Descripción (opcional)</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Descripción breve del servicio…"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-[13px] text-[#c9c3b8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#7a766e] hover:text-[#f5f0e8] font-bold rounded-2xl text-[13px] transition-all border border-white/[0.05] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim() || !newPrice}
                className="flex-[2] py-3.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold rounded-2xl text-[13px] transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer flex items-center justify-center gap-2"
              >
                {creating ? (
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                )}
                {creating ? 'Creando…' : 'Crear Servicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
