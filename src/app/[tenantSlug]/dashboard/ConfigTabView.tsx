'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useStaff } from '@/hooks/useStaff';
import { getTenantSettings, updateTenantSettings } from '@/actions/tenant.actions';
import { updateStaffCommissions, createStaffMember, toggleStaffActive } from '@/actions/staff.actions';
import { getStaffAccessState, revokeStaffAccess } from '@/actions/invitations.actions';
import type { StaffAccessState } from '@/actions/invitations.actions';
import StaffAccessModal from './StaffAccessModal';
import { usePlan } from '@/hooks/usePlan';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};

const AVATAR_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (name = '') => {
  const p = name.trim().split(' ').filter(Boolean);
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

function AccessBadge({ state }: { state?: StaffAccessState }) {
  if (!state) {
    return <span className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e]/40">…</span>;
  }
  if (state.hasAccess) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/[0.10] border border-emerald-400/25 text-emerald-300 text-[9px] font-bold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Acceso activo · {state.role === 'admin' ? 'Admin' : 'Profesional'}
      </span>
    );
  }
  if (state.pendingInvite && !state.pendingInvite.expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/[0.10] border border-amber-400/25 text-amber-300 text-[9px] font-bold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Invitación pendiente
      </span>
    );
  }
  if (state.pendingInvite && state.pendingInvite.expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/[0.08] border border-zinc-500/20 text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
        Invitación vencida
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
      Sin acceso
    </span>
  );
}

type HoursMap = Record<string, { open: string; close: string; isOpen: boolean }>;

function defaultHours(): HoursMap {
  return Object.fromEntries(DAYS_ORDER.map(d => [d, { open: '09:00', close: '19:00', isOpen: d !== 'sunday' }]));
}

export default function ConfigTabView() {
  const { tenantId } = useTenant();
  const { staff, refetch: refetchStaff } = useStaff();
  const planFeatures = usePlan();

  // ── Perfil del local ──────────────────────────────────────────────────────
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [address, setAddress]   = useState('');
  const [logoUrl, setLogoUrl]   = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  // ── Horarios ──────────────────────────────────────────────────────────────
  const [hours, setHours]           = useState<HoursMap>(defaultHours());
  const [editingHours, setEditingHours] = useState(false);
  const [isOpenToday, setIsOpenToday] = useState(true); // isActivePublicly

  // ── Sistema ───────────────────────────────────────────────────────────────
  const [currency, setCurrency]     = useState('ARS');
  const [whatsappNotif, setWhatsappNotif] = useState(true);

  const [isActivePublicly, setIsActivePublicly] = useState(true);
  const [vitrineSettings, setVitrineSettings] = useState({
    showServices:      true,
    showStaff:         true,
    showPrices:        true,
    showReviews:       false,
    allowGuestBooking: true,
    showGiftCards:     false,
  });
  const [slotDuration, setSlotDuration] = useState(30);
  const [cancellationHours, setCancellationHours] = useState(24);

  // ── Comisiones del equipo (editables inline) ──────────────────────────────
  const [commEdits, setCommEdits]   = useState<Record<string, string>>({});
  const [savingComm, setSavingComm] = useState<string | null>(null);

  // ── Agregar nuevo profesional ─────────────────────────────────────────────
  const [showNewStaff, setShowNewStaff] = useState(false);
  const [newName, setNewName]           = useState('');
  const [newRole, setNewRole]           = useState('');
  const [newPhone, setNewPhone]         = useState('');
  const [newEmail, setNewEmail]         = useState('');
  const [newComm, setNewComm]           = useState('30');
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [togglingStaff, setTogglingStaff] = useState<string | null>(null);

  // ── Acceso a la cuenta (invitaciones) ─────────────────────────────────────
  const [accessState, setAccessState] = useState<Record<string, StaffAccessState>>({});
  const [accessModalStaffId, setAccessModalStaffId] = useState<string | null>(null);
  const [revokingAccess, setRevokingAccess] = useState<string | null>(null);

  // ── Save state ────────────────────────────────────────────────────────────
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // ── Load tenant on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return;
    getTenantSettings(tenantId).then(t => {
      if (!t) return;
      setName(t.name ?? '');
      setPhone(t.phone ?? '');
      setAddress(t.address ?? '');
      setLogoUrl(t.logoUrl ?? '');
      setCoverUrl(t.coverImageUrl ?? '');
      setInstagram(t.socialLinks?.instagram ?? '');
      setWhatsappLink(t.socialLinks?.whatsapp ?? '');
      setIsOpenToday(t.isActivePublicly ?? true);
      setCurrency(t.settings?.currency ?? 'ARS');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setWhatsappNotif((t.settings as any)?.whatsappNotifications ?? true);
      if (t.businessHours && Object.keys(t.businessHours).length > 0) {
        setHours(t.businessHours as HoursMap);
      }
      setIsActivePublicly(t.isActivePublicly ?? true);
      setSlotDuration(t.slotDurationMinutes ?? 30);
      setCancellationHours(t.cancellationPolicy?.hoursInAdvance ?? 24);
      setVitrineSettings({
        showServices:      t.settings?.showServices      ?? true,
        showStaff:         t.settings?.showStaff         ?? true,
        showPrices:        t.settings?.showPrices        ?? true,
        showReviews:       t.settings?.showReviews       ?? false,
        allowGuestBooking: t.isGuestBookingEnabled       ?? true,
        showGiftCards:     t.settings?.showGiftCards     ?? false,
      });
    });
  }, [tenantId]);

  // Initialize commission edit inputs when staff loads
  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const s of staff) {
      initial[s.id] = String(s.commissions?.default ?? 30);
    }
    setCommEdits(initial);
  }, [staff]);

  // ── Save main settings ────────────────────────────────────────────────────
  async function handleSave() {
    if (!tenantId) return;
    setSaving(true);
    setSaveMsg(null);
    const result = await updateTenantSettings(tenantId, {
      name, phone, address,
      logoUrl: logoUrl || undefined,
      coverImageUrl: coverUrl || undefined,
      businessHours: hours,
      socialLinks: {
        instagram: instagram || undefined,
        whatsapp: whatsappLink || undefined,
      },
      isActivePublicly,
      slotDurationMinutes: slotDuration,
      cancellationPolicy:  { hoursInAdvance: cancellationHours },
      isGuestBookingEnabled: vitrineSettings.allowGuestBooking,
      settings: {
        currency,
        timezone: 'America/Argentina/Buenos_Aires',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(({ whatsappNotifications: whatsappNotif } as any)),
        showServices:  vitrineSettings.showServices,
        showStaff:     vitrineSettings.showStaff,
        showPrices:    vitrineSettings.showPrices,
        showReviews:   vitrineSettings.showReviews,
        showGiftCards: vitrineSettings.showGiftCards,
      },
    });
    setSaving(false);
    setSaveMsg(result.success ? '¡Guardado!' : (result as { success: false; error: string }).error);
    setTimeout(() => setSaveMsg(null), 3000);
  }

  // ── Crear nuevo profesional ───────────────────────────────────────────────
  async function handleCreateStaff() {
    if (!tenantId || !newName.trim() || !newRole.trim()) return;
    setCreatingStaff(true);
    const commVal = parseInt(newComm, 10);
    await createStaffMember(tenantId, {
      name: newName.trim(),
      role: newRole.trim(),
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      assignedBranchIds: [],
      active: true,
      commissions: { default: isNaN(commVal) ? 30 : commVal },
    });
    setNewName(''); setNewRole(''); setNewPhone(''); setNewEmail(''); setNewComm('30');
    setShowNewStaff(false);
    setCreatingStaff(false);
  }

  // ── Archivar / reactivar profesional ─────────────────────────────────────
  async function handleToggleStaff(staffId: string, currentActive: boolean) {
    if (!tenantId) return;
    setTogglingStaff(staffId);
    await toggleStaffActive(tenantId, staffId, !currentActive);
    setTogglingStaff(null);
  }

  // ── Save single staff commission ──────────────────────────────────────────
  async function handleSaveComm(staffId: string) {
    if (!tenantId) return;
    const val = parseInt(commEdits[staffId] ?? '30', 10);
    if (isNaN(val) || val < 0 || val > 100) return;
    setSavingComm(staffId);
    await updateStaffCommissions(tenantId, staffId, { default: val });
    setSavingComm(null);
  }

  // ── Acceso a la cuenta (invitaciones) ─────────────────────────────────────
  async function loadAccessState() {
    if (!tenantId) return;
    const states = await getStaffAccessState(tenantId);
    setAccessState(Object.fromEntries(states.map(s => [s.staffId, s])));
  }

  useEffect(() => {
    loadAccessState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, staff.length]);

  async function handleRevokeAccess(staffId: string) {
    if (!tenantId) return;
    if (!confirm('¿Quitarle el acceso a la cuenta a este profesional?')) return;
    setRevokingAccess(staffId);
    await revokeStaffAccess(tenantId, staffId);
    setRevokingAccess(null);
    await Promise.all([loadAccessState(), refetchStaff()]);
  }

  function handleAccessModalChanged() {
    loadAccessState();
    refetchStaff();
  }

  // ── Hours helpers ─────────────────────────────────────────────────────────
  function setDayField(day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">

      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold italic text-[#f5f0e8] leading-tight">Configuración del Salón</h1>
          <p className="text-[#7a766e] text-sm mt-1">Datos del local, horarios, equipo y sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-xs font-bold ${saveMsg.startsWith('¡') ? 'text-emerald-400' : 'text-rose-400'}`}>{saveMsg}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold px-8 py-2.5 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>save</span>
            {saving ? 'Guardando…' : 'Guardar Cambios'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">

        {/* ── Perfil del Local ── */}
        <section className="md:col-span-8 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden flex flex-col">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-playfair text-xl font-bold italic text-violet-300">Perfil del Local</h3>
              <p className="text-[12px] text-[#7a766e] mt-1">Identidad y datos de contacto.</p>
            </div>
            <span className="material-symbols-outlined text-violet-400/40" style={{ fontSize: '24px' }}>storefront</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Nombre del Salón</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del salón"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Teléfono</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+54 11 …"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 focus:outline-none transition-all" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Dirección</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Av. Ejemplo 1234, Ciudad"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Instagram URL</label>
              <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/…"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">WhatsApp Link</label>
              <input type="url" value={whatsappLink} onChange={e => setWhatsappLink(e.target.value)} placeholder="https://wa.me/549…"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 focus:outline-none transition-all" />
            </div>
          </div>

          {/* Gallery / logos */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Imágenes del Salón (URLs)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#7a766e] ml-1">Logo URL</p>
                <div className="flex gap-2 items-center">
                  {logoUrl && (
                    <img src={logoUrl} alt="logo" className="w-10 h-10 rounded-xl object-cover border border-white/[0.08]" onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                  <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://…"
                    className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#7a766e] ml-1">Portada URL</p>
                <div className="flex gap-2 items-center">
                  {coverUrl && (
                    <img src={coverUrl} alt="cover" className="w-10 h-10 rounded-xl object-cover border border-white/[0.08]" onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                  <input type="url" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://…"
                    className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Horarios ── */}
        <section className="md:col-span-4 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden flex flex-col">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-playfair text-xl font-bold italic text-violet-300">Horarios</h3>
            <button
              onClick={() => setIsOpenToday(!isOpenToday)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${isOpenToday ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-rose-500/20 border-rose-500/30 text-rose-300'}`}
            >
              <div className={`w-2 h-2 rounded-full ${isOpenToday ? 'bg-violet-500' : 'bg-rose-500 animate-pulse'}`} />
              <span className="text-[9px] font-bold uppercase tracking-widest">{isOpenToday ? 'Abierto' : 'Cerrado'}</span>
            </button>
          </div>

          {/* Read-only view */}
          {!editingHours && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {DAYS_ORDER.map(day => {
                const h = hours[day] ?? { open: '09:00', close: '19:00', isOpen: day !== 'sunday' };
                return (
                  <div key={day} className={`flex justify-between items-center py-1.5 border-b border-white/[0.05] last:border-0 ${!h.isOpen ? 'opacity-40' : ''}`}>
                    <span className="text-[12px] font-medium text-[#f5f0e8]">{DAY_LABELS[day]}</span>
                    <span className={`text-[11px] font-bold font-mono ${h.isOpen ? 'text-violet-300' : 'text-[#7a766e]'}`}>
                      {h.isOpen ? `${h.open} – ${h.close}` : 'Cerrado'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Edit mode */}
          {editingHours && (
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {DAYS_ORDER.map(day => {
                const h = hours[day] ?? { open: '09:00', close: '19:00', isOpen: true };
                return (
                  <div key={day} className="flex items-center gap-2">
                    <button
                      onClick={() => setDayField(day, 'isOpen', !h.isOpen)}
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all cursor-pointer ${h.isOpen ? 'bg-violet-500 border-violet-500' : 'bg-transparent border-white/[0.15]'}`}
                    >
                      {h.isOpen && <span className="material-symbols-outlined text-white" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>check</span>}
                    </button>
                    <span className="text-[11px] font-medium text-[#f5f0e8] w-20 shrink-0">{DAY_LABELS[day].slice(0, 3)}</span>
                    <input type="time" value={h.open} onChange={e => setDayField(day, 'open', e.target.value)} disabled={!h.isOpen}
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] text-[#f5f0e8] font-mono focus:outline-none focus:border-violet-500/40 disabled:opacity-30 [color-scheme:dark]" />
                    <span className="text-[#7a766e] text-[10px]">–</span>
                    <input type="time" value={h.close} onChange={e => setDayField(day, 'close', e.target.value)} disabled={!h.isOpen}
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] text-[#f5f0e8] font-mono focus:outline-none focus:border-violet-500/40 disabled:opacity-30 [color-scheme:dark]" />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setEditingHours(!editingHours)}
            className="mt-5 w-full py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-bold uppercase tracking-widest text-[#f5f0e8] transition-all cursor-pointer"
          >
            {editingHours ? 'Listo' : 'Ajustar Horarios'}
          </button>
        </section>

        {/* ── Control de Vitrina ── */}
        <section className="md:col-span-12 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '24px' }}>storefront</span>
              <div>
                <h3 className="font-playfair text-xl font-bold italic text-violet-300">Tu Vitrina</h3>
                <p className="text-[11px] text-[#7a766e]">Controlá qué ven tus clientas cuando visitan tu perfil público</p>
              </div>
            </div>
            {/* Toggle publicar/despublicar */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#7a766e]">
                {isActivePublicly ? 'Visible al público' : 'Oculto al público'}
              </span>
              <button
                onClick={() => setIsActivePublicly(v => !v)}
                className={`w-11 h-6 rounded-full relative transition-all cursor-pointer ${
                  isActivePublicly ? 'bg-violet-500' : 'bg-white/[0.1]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  isActivePublicly ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Grid de toggles */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {([
              { key: 'showServices',      icon: 'content_cut',    label: 'Mostrar servicios',      desc: 'Tu catálogo visible en la vitrina' },
              { key: 'showStaff',         icon: 'people',         label: 'Mostrar equipo',         desc: 'Las clientas eligen profesional' },
              { key: 'showPrices',        icon: 'payments',       label: 'Mostrar precios',        desc: 'Precios visibles en el catálogo' },
              { key: 'showReviews',       icon: 'star',           label: 'Mostrar reseñas',        desc: 'Opiniones de clientas anteriores' },
              { key: 'allowGuestBooking', icon: 'person_add',     label: 'Reservas sin cuenta',    desc: 'Clientas sin registro pueden reservar' },
              { key: 'showGiftCards',     icon: 'card_giftcard',  label: 'Vitrina gift cards',     desc: 'Vendé gift cards desde tu perfil' },
            ] as { key: keyof typeof vitrineSettings; icon: string; label: string; desc: string }[]).map(({ key, icon, label, desc }) => {
              const enabled = vitrineSettings[key];
              return (
                <div
                  key={key}
                  onClick={() => setVitrineSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    enabled
                      ? 'bg-violet-500/[0.08] border-violet-400/[0.25]'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.10]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`material-symbols-outlined ${enabled ? 'text-violet-400' : 'text-[#7a766e]'}`}
                      style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
                    >
                      {icon}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      enabled ? 'bg-violet-400 border-violet-400' : 'border-white/[0.20]'
                    }`}>
                      {enabled && (
                        <span className="material-symbols-outlined text-[#09090b]" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>
                          check
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-[12px] font-bold mb-0.5 transition-colors ${
                    enabled ? 'text-[#f5f0e8]' : 'text-[#a09a8e]'
                  }`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-[#7a766e] leading-tight">{desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Equipo ── */}
        <section className="md:col-span-12 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-playfair text-xl font-bold italic text-violet-300">Gestión de Equipo</h3>
              <p className="text-[12px] text-[#7a766e] mt-1">Añadí, archivá y ajustá comisiones por profesional.</p>
            </div>
            <button
              onClick={() => setShowNewStaff(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500/15 hover:bg-violet-500/30 border border-violet-500/20 text-violet-300 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                {showNewStaff ? 'close' : 'person_add'}
              </span>
              {showNewStaff ? 'Cancelar' : 'Agregar Profesional'}
            </button>
          </div>

          {/* ── Formulario nuevo profesional ── */}
          {showNewStaff && (
            <div className="mb-6 p-5 bg-violet-500/5 border border-violet-500/15 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="text-[12px] font-bold text-violet-300 uppercase tracking-widest mb-4">Nuevo Profesional</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Nombre *</label>
                  <input
                    type="text" value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Rol *</label>
                  <input
                    type="text" value={newRole} onChange={e => setNewRole(e.target.value)}
                    placeholder="Estilista, Colorista…"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Teléfono</label>
                  <input
                    type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)}
                    placeholder="+54 11 …"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                    placeholder="profesional@mail.com"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#7a766e] uppercase tracking-widest ml-1">Comisión %</label>
                  <input
                    type="number" min="0" max="100" value={newComm} onChange={e => setNewComm(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] font-mono text-violet-300 focus:outline-none focus:border-violet-500/40 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateStaff}
                disabled={creatingStaff || !newName.trim() || !newRole.trim()}
                className="px-6 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white font-bold rounded-xl text-[12px] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {creatingStaff ? (
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>person_add</span>
                )}
                {creatingStaff ? 'Guardando…' : 'Guardar Profesional'}
              </button>
            </div>
          )}

          {/* ── Lista de profesionales ── */}
          {staff.length === 0 ? (
            <p className="text-[#7a766e] text-sm py-4 text-center">No hay profesionales cargados aún.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {staff.map(s => {
                const isActive = s.active !== false;
                const color = avatarColor(s.name);
                const commVal = commEdits[s.id] ?? String(s.commissions?.default ?? 30);
                const isSaving = savingComm === s.id;
                const isToggling = togglingStaff === s.id;
                return (
                  <div key={s.id} className={`bg-[#0d0d0d]/60 border rounded-2xl p-4 transition-all ${isActive ? 'border-white/[0.06] hover:border-violet-400/20' : 'border-white/[0.03] opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-black border shrink-0"
                        style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
                        {s.avatarUrl
                          ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full rounded-full object-cover" />
                          : initials(s.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-bold text-[#f5f0e8] truncate">{s.name}</h4>
                        <p className="text-[11px] text-[#7a766e] truncate">{s.role}</p>
                      </div>
                      {/* Toggle activo / archivado */}
                      <button
                        onClick={() => handleToggleStaff(s.id, isActive)}
                        disabled={isToggling}
                        title={isActive ? 'Archivar' : 'Reactivar'}
                        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer disabled:opacity-40 ${
                          isActive
                            ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10'
                            : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {isToggling ? (
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '13px' }}>progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>
                            {isActive ? 'archive' : 'unarchive'}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Acceso a la cuenta */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <AccessBadge state={accessState[s.id]} />
                      {accessState[s.id]?.hasAccess ? (
                        <button
                          onClick={() => handleRevokeAccess(s.id)}
                          disabled={revokingAccess === s.id}
                          title="Quitar acceso"
                          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[#7a766e] hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer disabled:opacity-40"
                        >
                          {revokingAccess === s.id ? (
                            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '13px' }}>progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>person_remove</span>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setAccessModalStaffId(s.id)}
                          className="shrink-0 text-[9px] font-bold text-violet-300 hover:text-violet-200 uppercase tracking-widest cursor-pointer transition-colors"
                        >
                          Habilitar acceso
                        </button>
                      )}
                    </div>

                    {isActive && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#7a766e] uppercase tracking-widest">Comisión %</label>
                        <div className="flex gap-2">
                          <input
                            type="number" min="0" max="100"
                            value={commVal}
                            onChange={e => setCommEdits(prev => ({ ...prev, [s.id]: e.target.value }))}
                            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-[14px] font-bold font-mono text-violet-300 focus:outline-none focus:border-violet-500/40"
                          />
                          <button
                            onClick={() => handleSaveComm(s.id)}
                            disabled={isSaving}
                            className="px-3 py-2 bg-violet-500/15 hover:bg-violet-500/30 border border-violet-500/20 text-violet-300 rounded-xl text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            {isSaving ? (
                              <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {!isActive && (
                      <p className="text-[10px] text-[#7a766e] text-center py-1">Archivado · no aparece en la agenda</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Sistema ── */}
        <section className="md:col-span-6 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden flex flex-col">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '24px' }}>tune</span>
            <h3 className="font-playfair text-xl font-bold italic text-violet-300">Ajustes del Sistema</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Moneda</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#0d0d0d]/60 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="ARS">ARS (Peso Argentino)</option>
                <option value="USD">USD (Dólar)</option>
                <option value="CLP">CLP (Peso Chileno)</option>
                <option value="MXN">MXN (Peso Mexicano)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">Zona horaria</label>
              <select
                disabled
                className="w-full bg-[#0d0d0d]/60 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#7a766e] outline-none appearance-none cursor-not-allowed opacity-60"
              >
                <option>America/Buenos_Aires</option>
              </select>
            </div>

            <div className="col-span-2 p-4 bg-violet-500/5 border border-white/[0.06] rounded-2xl flex items-center gap-4 mt-2">
              <div className="bg-violet-500/15 p-2.5 rounded-xl border border-violet-500/20">
                <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '20px' }}>chat</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#f5f0e8]">Notificaciones WhatsApp</p>
                <p className="text-[11px] text-[#7a766e]">Recordatorios automáticos a clientes.</p>
              </div>
              <button
                onClick={() => setWhatsappNotif(!whatsappNotif)}
                className={`w-10 h-5 rounded-full relative transition-all cursor-pointer shrink-0 ${whatsappNotif ? 'bg-violet-500' : 'bg-white/[0.1]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${whatsappNotif ? 'right-1 bg-white' : 'left-1 bg-[#7a766e]'}`} />
              </button>
            </div>

            {/* Política de turnos */}
            <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">
                  Duración de turnos
                </label>
                <select
                  value={slotDuration}
                  onChange={e => setSlotDuration(Number(e.target.value))}
                  className="w-full bg-[#0d0d0d]/60 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] ml-1">
                  Cancelación con anticipación
                </label>
                <select
                  value={cancellationHours}
                  onChange={e => setCancellationHours(Number(e.target.value))}
                  className="w-full bg-[#0d0d0d]/60 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-[#f5f0e8] focus:ring-1 focus:ring-violet-500/40 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value={1}>1 hora</option>
                  <option value={2}>2 horas</option>
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                </select>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#7a766e]/60 mt-4">Los cambios de sistema se guardan con el botón "Guardar Cambios" de arriba.</p>
        </section>

        {/* ── Plan SaaS ── */}
        <section className="md:col-span-6 relative isolate rounded-[24px] border border-white/[0.08] p-6 bg-[#0d0d0d]/40 overflow-hidden flex flex-col">
          <div className="absolute inset-0 liquid-glass-rich pointer-events-none rounded-[inherit] -z-10" />
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '24px' }}>workspace_premium</span>
            <h3 className="font-playfair text-xl font-bold italic text-violet-300">Plan & Suscripción</h3>
          </div>

          {planFeatures.loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-violet-400/40" style={{ fontSize: '24px' }}>progress_activity</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3">
              {/* Plan badge */}
              <div className={`p-4 rounded-2xl border ${planFeatures.plan === 'enterprise' ? 'bg-amber-500/5 border-amber-500/15' : planFeatures.plan === 'pro' ? 'bg-violet-500/5 border-violet-500/15' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-bold text-[#f5f0e8] capitalize">
                    Plan {planFeatures.plan === 'free' ? 'Gratis' : planFeatures.plan === 'pro' ? 'Pro' : 'Enterprise'}
                  </p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${planFeatures.plan === 'enterprise' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : planFeatures.plan === 'pro' ? 'text-violet-400 bg-violet-400/10 border-violet-400/20' : 'text-[#7a766e] bg-white/[0.03] border-white/[0.06]'}`}>
                    Activo
                  </span>
                </div>
                <p className="text-[11px] text-[#7a766e]">
                  {planFeatures.plan === 'enterprise'
                    ? 'Multi-sucursal · Analytics avanzado · Todo incluido'
                    : planFeatures.plan === 'pro'
                    ? 'Turnos ilimitados · Staff ilimitado · Caja · Google Calendar'
                    : 'Agenda básica · Hasta 3 turnos/día'}
                </p>
              </div>

              {/* Features checklist */}
              {([
                { key: 'guestBooking',           label: 'Booking público sin cuenta' },
                { key: 'onlinePayments',          label: 'Cobros online (MercadoPago)' },
                { key: 'whatsappNotifications',   label: 'Notificaciones WhatsApp' },
                { key: 'googleCalendarSync',      label: 'Sync Google Calendar' },
                { key: 'performanceReports',      label: 'Reportes de rendimiento' },
                { key: 'advancedAnalytics',       label: 'Analytics avanzado' },
                { key: 'multipleBranches',        label: 'Multi-sucursal' },
              ] as { key: keyof typeof planFeatures; label: string }[]).map(f => {
                const enabled = planFeatures[f.key] as boolean;
                return (
                  <div key={f.key} className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined ${enabled ? 'text-emerald-400' : 'text-[#7a766e]/40'}`}
                      style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}
                    >
                      {enabled ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`text-[12px] ${enabled ? 'text-[#f5f0e8]' : 'text-[#7a766e]/50 line-through'}`}>
                      {f.label}
                    </span>
                  </div>
                );
              })}

              {/* Upgrade CTA */}
              {planFeatures.plan !== 'enterprise' && (
                <a
                  href="/business#pricing"
                  className="mt-2 w-full py-2.5 rounded-xl text-center text-[11px] font-bold uppercase tracking-widest transition-all border border-violet-500/20 text-violet-300 hover:bg-violet-500/10 cursor-pointer"
                >
                  {planFeatures.plan === 'free' ? 'Upgradeá a Pro →' : 'Ver plan Enterprise →'}
                </a>
              )}
            </div>
          )}
        </section>

      </div>

      {accessModalStaffId && tenantId && (() => {
        const modalStaff = staff.find(s => s.id === accessModalStaffId);
        if (!modalStaff) return null;
        return (
          <StaffAccessModal
            staff={modalStaff}
            tenantId={tenantId}
            tenantName={name}
            pendingInvite={accessState[modalStaff.id]?.pendingInvite ?? null}
            onClose={() => setAccessModalStaffId(null)}
            onChanged={handleAccessModalChanged}
          />
        );
      })()}
    </div>
  );
}
