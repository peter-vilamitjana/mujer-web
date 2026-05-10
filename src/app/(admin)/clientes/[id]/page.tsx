'use client';
import { useState, useEffect } from 'react';
import { notFound, useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, Timestamp, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { Cliente, Turno, FichaTecnica, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { safeFormatDate } from '@/lib/utils';
import { useTenant } from "@/contexts/TenantContext";
import { useUser } from "@/contexts/UserContext";

const AVATAR_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const ESTADO_CFG: Record<Turno['estado'], { bg: string; text: string; border: string; label: string; icon: string }> = {
  realizado:      { bg: 'rgba(52,211,153,0.10)',  text: '#6ee7b7', border: 'rgba(52,211,153,0.22)',  label: 'Realizado',   icon: 'task_alt'     },
  cancelado:      { bg: 'rgba(244,63,94,0.10)',   text: '#fda4af', border: 'rgba(244,63,94,0.22)',   label: 'Cancelado',   icon: 'cancel'       },
  pendiente:      { bg: 'rgba(251,191,36,0.10)',  text: '#fcd34d', border: 'rgba(251,191,36,0.22)',  label: 'Pendiente',   icon: 'pending'      },
  pendiente_pago: { bg: 'rgba(249,115,22,0.10)',  text: '#fdba74', border: 'rgba(249,115,22,0.22)',  label: 'Sin cobrar',  icon: 'error_outline'},
};

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { tenantId } = useTenant();
  const user = useUser();
  const userRole: UserRole = user?.rol ?? 'clienta';

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [fichas, setFichas] = useState<FichaTecnica[]>([]);
  const [newFicha, setNewFicha] = useState({ servicioRealizado: '', tono: '', observaciones: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ficha' | 'historial'>('ficha');

  const isReadOnly = userRole === 'clienta';
  const canEditFicha = userRole === 'admin';

  useEffect(() => {
    if (!id || !tenantId) return;
    setLoading(true);

    const unsubCliente = onSnapshot(
      doc(db, "tenants", tenantId, "customers", id),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const c = {
            id: snap.id,
            nombre: data.firstName || data.nombre,
            apellido: data.lastName || data.apellido,
            email: data.email,
            telefono: data.phone || data.telefono,
            observaciones: data.notes || data.observaciones,
            fechaRegistro: data.createdAt,
          } as Cliente;
          setCliente(c);
          setFormData(c);
        } else {
          setCliente(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        toast({ title: "Error", description: "No se pudo cargar la clienta.", variant: "destructive" });
      }
    );

    const unsubTurnos = onSnapshot(
      query(collection(db, "tenants", tenantId, "appointments"), where("clientId", "==", id)),
      (snap) => {
        const data = snap.docs.map(d => {
          const row = d.data();
          const fecha = row.date instanceof Timestamp ? row.date.toDate().toISOString() : safeFormatDate(row.date);
          let estado: Turno['estado'] = 'pendiente';
          if (row.status === 'completed') estado = 'realizado';
          else if (row.status === 'cancelled') estado = 'cancelado';
          else if (row.status === 'pending_payment') estado = 'pendiente_pago';
          return { id: d.id, ...row, fecha, estado, servicio: row.serviceNames || '', clienteNombre: row.clientName, empleadaNombre: row.staffName } as Turno;
        });
        data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setTurnos(data);
      },
      (err) => { console.error(err); toast({ title: "Error", description: "No se pudo cargar el historial.", variant: "destructive" }); }
    );

    const unsubFichas = onSnapshot(
      query(collection(db, "tenants", tenantId, "customers", id, "technicalRecords"), orderBy("date", "desc")),
      (snap) => {
        setFichas(snap.docs.map(d => {
          const row = d.data();
          return {
            id: d.id, ...row,
            fecha: safeFormatDate(row.date),
            servicioRealizado: row.serviceSummary,
            tono: row.formula,
            observaciones: row.notes,
            empleadaNombre: row.staffName,
          } as FichaTecnica;
        }));
      },
      (err) => { console.error(err); toast({ title: "Error", description: "No se pudo cargar la ficha técnica.", variant: "destructive" }); }
    );

    return () => { unsubCliente(); unsubTurnos(); unsubFichas(); };
  }, [id, tenantId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFichaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFicha(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (userRole !== 'admin' || !tenantId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "tenants", tenantId, "customers", id), {
        firstName: formData.nombre, lastName: formData.apellido,
        email: formData.email, phone: formData.telefono, notes: formData.observaciones,
      });
      toast({ title: "¡Guardado!", description: "Los datos de la clienta se actualizaron." });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo guardar los cambios.", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleAddFicha = async () => {
    if (isReadOnly || !newFicha.servicioRealizado.trim() || !tenantId) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "tenants", tenantId, "customers", id, "technicalRecords"), {
        date: serverTimestamp(), staffName: user?.nombre ?? 'Admin',
        serviceSummary: newFicha.servicioRealizado, formula: newFicha.tono, notes: newFicha.observaciones,
      });
      setNewFicha({ servicioRealizado: '', tono: '', observaciones: '' });
      toast({ title: "Ficha agregada", description: "La entrada se guardó correctamente." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo agregar la ficha.", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-5 w-28 rounded-xl bg-white/[0.06]" />
      <div className="h-[120px] rounded-2xl bg-white/[0.04] border border-white/[0.05]" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-72 rounded-2xl bg-white/[0.04] border border-white/[0.05]" />
        <div className="lg:col-span-2 h-72 rounded-2xl bg-white/[0.04] border border-white/[0.05]" />
      </div>
    </div>
  );

  if (!cliente) return notFound();

  const color = avatarColor(cliente.nombre || '');
  const initials = `${(cliente.nombre || '')[0] ?? ''}${(cliente.apellido || '')[0] ?? ''}`.toUpperCase();
  const completedTurnos = turnos.filter(t => t.estado === 'realizado');
  const totalGastado = completedTurnos.reduce((s, t) => s + (t.precio || 0), 0);

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 transition-all";
  const labelCls = "text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label mb-1.5 block";

  return (
    <div className="space-y-5">

      {/* ── Back ── */}
      <Link href="/clientes"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.07] transition-all text-[12px] font-semibold cursor-pointer">
        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>chevron_left</span>
        Volver a Clientes
      </Link>

      {/* ── Hero card ── */}
      <div className="relative isolate rounded-2xl border border-white/[0.08] p-5 overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.02] -z-10" />
        <div className="flex flex-wrap items-start gap-4">
          {/* Avatar */}
          <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-[20px] font-black shrink-0"
            style={{ background: `${color}20`, color, border: `2px solid ${color}40` }}>
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-playfair text-[26px] font-bold italic text-[#f5f0e8] leading-tight">
              {cliente.nombre} {cliente.apellido}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              {cliente.email && (
                <span className="flex items-center gap-1.5 text-[12px] text-[#7a766e]">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>mail</span>
                  {cliente.email}
                </span>
              )}
              {cliente.telefono && (
                <span className="flex items-center gap-1.5 text-[12px] text-[#7a766e]">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>smartphone</span>
                  {cliente.telefono}
                </span>
              )}
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.28)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1" }}>history</span>
                {completedTurnos.length} visitas
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{ background: 'rgba(52,211,153,0.10)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.22)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1" }}>payments</span>
                ${totalGastado.toLocaleString('es-AR')} gastado
              </span>
              {fichas.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: 'rgba(251,191,36,0.10)', color: '#fcd34d', border: '1px solid rgba(251,191,36,0.22)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1" }}>science</span>
                  {fichas.length} ficha{fichas.length !== 1 ? 's' : ''} técnica{fichas.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Quick actions */}
          {userRole === 'admin' && (
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setIsEditing(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] text-[#7a766e] hover:text-[#f5f0e8] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all text-[11px] font-bold uppercase tracking-wide cursor-pointer">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{isEditing ? 'close' : 'edit'}</span>
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
              <Link href={`/turnos?clienteId=${id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/[0.15] border border-violet-500/30 text-violet-300 hover:bg-violet-500/[0.25] transition-all text-[11px] font-bold uppercase tracking-wide cursor-pointer">
                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                Nuevo turno
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* ── Info personal card ── */}
        <div className="relative isolate rounded-2xl border border-white/[0.08] overflow-hidden h-fit">
          <div className="absolute inset-0 bg-white/[0.02] -z-10" />
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400 font-label">Información personal</span>
          </div>

          <div className="p-5 space-y-4">
            {isEditing ? (
              /* Edit mode */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nombre</label>
                    <input id="nombre" value={formData.nombre || ''} onChange={handleInputChange} className={inputCls} placeholder="Nombre" />
                  </div>
                  <div>
                    <label className={labelCls}>Apellido</label>
                    <input id="apellido" value={formData.apellido || ''} onChange={handleInputChange} className={inputCls} placeholder="Apellido" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} className={inputCls} placeholder="email@ejemplo.com" />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input id="telefono" type="tel" value={formData.telefono || ''} onChange={handleInputChange} className={inputCls} placeholder="+54 11 ..." />
                </div>
                <div>
                  <label className={labelCls}>Notas internas</label>
                  <textarea id="observaciones" value={formData.observaciones || ''} onChange={handleInputChange}
                    placeholder="Alergias, preferencias, sensibilidades..."
                    rows={3} className={`${inputCls} resize-none leading-relaxed`} />
                </div>
                <button onClick={handleSaveChanges} disabled={isSaving}
                  className="w-full py-2.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold rounded-xl text-[13px] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.30)]">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>save</span>
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            ) : (
              /* View mode */
              <div className="space-y-4">
                {[
                  { icon: 'person',      label: 'Nombre completo', value: `${cliente.nombre} ${cliente.apellido}` },
                  { icon: 'mail',        label: 'Email',           value: cliente.email || '—' },
                  { icon: 'smartphone',  label: 'Teléfono',        value: cliente.telefono || '—' },
                ].map(row => (
                  <div key={row.label}>
                    <p className={labelCls}>{row.label}</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '14px' }}>{row.icon}</span>
                      <p className="text-[13px] text-[#f5f0e8]">{row.value}</p>
                    </div>
                  </div>
                ))}
                {cliente.observaciones && (
                  <div>
                    <p className={labelCls}>Notas internas</p>
                    <p className="text-[13px] text-[#7a766e] italic leading-relaxed">{cliente.observaciones}</p>
                  </div>
                )}
                {!cliente.observaciones && !isEditing && userRole === 'admin' && (
                  <button onClick={() => setIsEditing(true)}
                    className="w-full py-2 rounded-xl border border-dashed border-white/[0.10] text-[11px] text-[#7a766e] hover:text-[#f5f0e8] hover:border-white/[0.20] transition-all cursor-pointer font-label uppercase tracking-widest">
                    + Agregar notas
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs: Ficha + Historial ── */}
        <div className="lg:col-span-2 flex flex-col gap-0">
          {/* Tab switcher */}
          <div className="flex gap-0 p-1 bg-white/[0.03] border border-white/[0.07] rounded-2xl mb-4">
            {(['ficha', 'historial'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer"
                style={activeTab === tab
                  ? { background: 'rgba(139,92,246,0.18)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.28)' }
                  : { color: '#7a766e' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: activeTab === tab ? "'FILL' 1" : "'FILL' 0" }}>
                  {tab === 'ficha' ? 'science' : 'calendar_month'}
                </span>
                {tab === 'ficha' ? 'Ficha Técnica' : 'Historial de Turnos'}
              </button>
            ))}
          </div>

          {/* ── Ficha Técnica ── */}
          {activeTab === 'ficha' && (
            <div className="relative isolate rounded-2xl border border-white/[0.08] overflow-hidden">
              <div className="absolute inset-0 bg-white/[0.02] -z-10" />
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400 font-label">Ficha técnica</span>
                <span className="text-[10px] text-[#7a766e]">{fichas.length} entrada{fichas.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="p-5 space-y-4">
                {/* New entry form */}
                {!isReadOnly && (
                  <div className="p-4 rounded-xl border border-violet-500/20 space-y-3" style={{ background: 'rgba(139,92,246,0.05)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-violet-400 font-label">Nueva entrada</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Servicio realizado</label>
                        <input name="servicioRealizado" placeholder="Ej: Balayage + corte" value={newFicha.servicioRealizado}
                          onChange={handleFichaChange} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Tono / Fórmula</label>
                        <input name="tono" placeholder="Ej: 7.1 + matiz ceniza" value={newFicha.tono}
                          onChange={handleFichaChange} className={`${inputCls} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Observaciones del trabajo</label>
                      <textarea name="observaciones" placeholder="Anotaciones sobre el procedimiento..." value={newFicha.observaciones}
                        onChange={handleFichaChange} rows={2}
                        className={`${inputCls} resize-none leading-relaxed`} />
                    </div>
                    <button onClick={handleAddFicha} disabled={isSaving || !newFicha.servicioRealizado.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[12px] transition-all cursor-pointer shadow-[0_0_16px_rgba(139,92,246,0.28)]">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                      Agregar a ficha
                    </button>
                  </div>
                )}

                {/* Ficha entries */}
                {fichas.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '22px' }}>science</span>
                    </div>
                    <p className="text-[13px] text-[#7a766e]">La ficha técnica está vacía</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fichas.map(ficha => {
                      let fechaStr = '';
                      try { fechaStr = format(parseISO(ficha.fecha), "d MMM yyyy", { locale: es }); } catch { fechaStr = ficha.fecha; }
                      return (
                        <div key={ficha.id} className="relative overflow-hidden rounded-xl border border-white/[0.07] group hover:border-white/[0.12] transition-all">
                          {/* Violet left accent */}
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-500/50" />
                          <div className="pl-5 pr-4 py-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#7a766e]"
                                  style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>person</span>
                                <span className="text-[11px] text-[#7a766e]">{ficha.empleadaNombre}</span>
                              </div>
                              <span className="text-[10px] text-[#7a766e]/60">{fechaStr}</span>
                            </div>
                            {/* Service */}
                            <p className="text-[13px] font-bold text-[#f5f0e8] flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-violet-400"
                                style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>spa</span>
                              {ficha.servicioRealizado}
                            </p>
                            {/* Tono */}
                            {ficha.tono && (
                              <p className="text-[11px] font-mono mb-1">
                                <span className="text-violet-400/70">tono:</span>{' '}
                                <span className="text-[#7a766e]">{ficha.tono}</span>
                              </p>
                            )}
                            {/* Notes */}
                            {ficha.observaciones && (
                              <p className="text-[12px] text-[#7a766e] italic mt-2 leading-relaxed">{ficha.observaciones}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Historial de Turnos ── */}
          {activeTab === 'historial' && (
            <div className="relative isolate rounded-2xl border border-white/[0.08] overflow-hidden">
              <div className="absolute inset-0 bg-white/[0.02] -z-10" />
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400 font-label">Historial de turnos</span>
                <span className="text-[10px] text-[#7a766e]">{turnos.length} turno{turnos.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="p-5">
                {turnos.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '22px' }}>calendar_month</span>
                    </div>
                    <p className="text-[13px] text-[#7a766e]">No hay turnos registrados</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {turnos.map(turno => {
                      const cfg = ESTADO_CFG[turno.estado] ?? ESTADO_CFG.pendiente;
                      let fechaStr = '';
                      try { fechaStr = format(parseISO(turno.fecha), "d 'de' MMMM yyyy · HH:mm'hs'", { locale: es }); } catch { fechaStr = turno.fecha; }
                      return (
                        <div key={turno.id}
                          className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.07] hover:bg-white/[0.02] transition-all">
                          {/* Status dot */}
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: cfg.text, fontVariationSettings: "'FILL' 1" }}>
                              {cfg.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-[12px] font-semibold text-[#f5f0e8] truncate">{turno.servicio || '—'}</p>
                              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
                                style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#7a766e] mt-0.5">{fechaStr}</p>
                            {turno.empleadaNombre && (
                              <p className="text-[10px] text-[#7a766e]/60 mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>person</span>
                                {turno.empleadaNombre}
                              </p>
                            )}
                          </div>
                          {turno.precio > 0 && (
                            <p className="text-[13px] font-bold text-[#f5f0e8] font-mono shrink-0">
                              ${turno.precio.toLocaleString('es-AR')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
