'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTenant } from '@/contexts/TenantContext';
import { createService, updateService, toggleServiceActive } from '@/actions/services.actions';
import type { Service } from '@/lib/schema';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

/* ── Schema ──────────────────────────────────────────────────────────────── */
const serviceSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(1, 'Mínimo 1 min').max(480, 'Máximo 480 min'),
  price: z.coerce.number().min(0, 'No puede ser negativo'),
  categoryId: z.string().optional(),
});
type ServiceFormValues = z.infer<typeof serviceSchema>;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const getIcon = (name: string, cat = '') => {
  const n = (name + cat).toLowerCase();
  if (n.includes('color') || n.includes('tint') || n.includes('mech') || n.includes('balayage')) return 'palette';
  if (n.includes('cort') || n.includes('cut')) return 'content_cut';
  if (n.includes('manicur') || n.includes('pedicur') || n.includes('uña')) return 'back_hand';
  if (n.includes('keratina') || n.includes('nanoplast') || n.includes('briz')) return 'water_drop';
  if (n.includes('olaplex') || n.includes('hidrat') || n.includes('tratamiento')) return 'spa';
  if (n.includes('peinado') || n.includes('estilo')) return 'brush';
  if (n.includes('técnica') || n.includes('mechas')) return 'auto_awesome';
  return 'spa';
};

const fmtPrice = (price: Service['price']): { label: string; prefix: string } => {
  if (typeof price === 'number') return { prefix: '', label: `$${price.toLocaleString('es-AR')}` };
  const min = Math.min(price.corto, price.mediano, price.largo);
  return { prefix: 'desde ', label: `$${min.toLocaleString('es-AR')}` };
};

const fmtDur = (min: number) =>
  min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}m` : ''}` : `${min}min`;

/* ── Sheet form ──────────────────────────────────────────────────────────── */
function ServiceFormSheet({
  open, onOpenChange, service, tenantId, onSuccess,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  service: Service | null; tenantId: string; onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEditing = service !== null;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '', description: '', durationMinutes: 60, price: 0, categoryId: '' },
  });

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description ?? '',
        durationMinutes: service.durationMinutes,
        price: typeof service.price === 'number' ? service.price : 0,
        categoryId: service.categoryId ?? '',
      });
    } else {
      reset({ name: '', description: '', durationMinutes: 60, price: 0, categoryId: '' });
    }
  }, [service, reset]);

  const onSubmit = (values: ServiceFormValues) => {
    startTransition(async () => {
      const payload: Omit<Service, 'id'> = {
        name: values.name,
        description: values.description,
        durationMinutes: values.durationMinutes,
        price: values.price,
        categoryId: values.categoryId || undefined,
        active: service?.active ?? true,
        requiresLengthSelection: service?.requiresLengthSelection ?? false,
        variablePrice: service?.variablePrice ?? false,
      };
      const result = isEditing
        ? await updateService(tenantId, service.id, payload)
        : await createService(tenantId, payload);

      if (result.success) {
        toast({ title: isEditing ? 'Servicio actualizado' : 'Servicio creado' });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  const inputCls = "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/50 transition-all disabled:opacity-50";
  const labelCls = "text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label mb-1.5 block";
  const errCls = "text-[11px] text-rose-400 mt-1";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto bg-[#0d0d0d] border-white/[0.08]">
        <SheetHeader className="border-b border-white/[0.06] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-400" style={{ fontSize: '17px', fontVariationSettings: "'FILL' 1" }}>
                {isEditing ? 'edit' : 'add_circle'}
              </span>
            </div>
            <div>
              <SheetTitle className="font-playfair text-[18px] font-bold italic text-[#f5f0e8] leading-tight">
                {isEditing ? 'Editar servicio' : 'Nuevo servicio'}
              </SheetTitle>
              <p className="text-[10px] text-[#7a766e] font-label uppercase tracking-widest mt-0.5">
                {isEditing ? service?.name : 'Completá los datos del servicio'}
              </p>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
          <div>
            <label className={labelCls}>Nombre del servicio *</label>
            <input {...register('name')} placeholder="Ej: Corte y peinado" disabled={isPending} className={inputCls} />
            {errors.name && <p className={errCls}>{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Descripción <span className="text-[#7a766e]/50 normal-case tracking-normal">(opcional)</span></label>
            <textarea {...register('description')} placeholder="Describe el servicio brevemente..." disabled={isPending}
              rows={3} className={`${inputCls} resize-none leading-relaxed`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Precio (ARS) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a766e] text-[13px] font-bold pointer-events-none">$</span>
                <input type="number" min={0} {...register('price')} placeholder="0" disabled={isPending}
                  className={`${inputCls} pl-7`} />
              </div>
              {errors.price && <p className={errCls}>{errors.price.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Duración (min) *</label>
              <div className="relative">
                <input type="number" min={1} max={480} {...register('durationMinutes')} placeholder="60" disabled={isPending}
                  className={`${inputCls} pr-10`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a766e] text-[10px] pointer-events-none">min</span>
              </div>
              {errors.durationMinutes && <p className={errCls}>{errors.durationMinutes.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Categoría <span className="text-[#7a766e]/50 normal-case tracking-normal">(opcional)</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7a766e] pointer-events-none" style={{ fontSize: '15px' }}>category</span>
              <input {...register('categoryId')} placeholder="Ej: Coloración, Tratamientos..." disabled={isPending}
                className={`${inputCls} pl-9`} />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button type="submit" disabled={isPending}
              className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold rounded-xl text-[13px] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.30)] min-h-[44px]">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                {isPending ? 'hourglass_empty' : isEditing ? 'save' : 'add_circle'}
              </span>
              {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear servicio'}
            </button>
            <button type="button" onClick={() => onOpenChange(false)} disabled={isPending}
              className="w-full py-2.5 rounded-xl border border-white/[0.08] text-[#7a766e] hover:text-[#f5f0e8] hover:bg-white/[0.04] text-[12px] font-bold transition-all cursor-pointer">
              Cancelar
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ── Service card ────────────────────────────────────────────────────────── */
function ServiceCard({ service, onEdit, onToggle }: {
  service: Service; onEdit: (s: Service) => void; onToggle: (s: Service, active: boolean) => void;
}) {
  const { prefix, label } = fmtPrice(service.price);
  const icon = getIcon(service.name, service.categoryId);

  return (
    <div className={`relative isolate rounded-2xl border flex flex-col overflow-hidden transition-all duration-200 group hover:border-white/[0.12] ${!service.active ? 'opacity-55' : ''}`}
      style={{ borderColor: service.active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}>
      <div className="absolute inset-0 bg-white/[0.02] -z-10" />

      {/* Inactive overlay */}
      {!service.active && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#7a766e', border: '1px solid rgba(255,255,255,0.08)' }}>
            Inactivo
          </span>
        </div>
      )}

      {/* Card body */}
      <div className="p-4 flex-1">
        {/* Icon + active badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ background: service.active ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.05)', border: service.active ? '1px solid rgba(139,92,246,0.22)' : '1px solid rgba(255,255,255,0.08)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: service.active ? '#a78bfa' : '#7a766e', fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
          </div>
          {service.active && (
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.10)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.20)' }}>
              Activo
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-[15px] font-bold text-[#f5f0e8] leading-tight mb-1">{service.name}</h3>

        {/* Category chip */}
        {service.categoryId && (
          <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
            style={{ background: 'rgba(139,92,246,0.08)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.16)' }}>
            {service.categoryId}
          </span>
        )}

        {/* Description */}
        {service.description && (
          <p className="text-[12px] text-[#7a766e] leading-relaxed line-clamp-2">{service.description}</p>
        )}
      </div>

      {/* Price + Duration strip */}
      <div className="px-4 py-3 border-t border-white/[0.05] flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-[9px] text-[#7a766e] font-label uppercase tracking-widest">{prefix}</span>}
          <span className="text-[22px] font-bold text-[#f5f0e8] font-mono leading-none">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '12px' }}>schedule</span>
          <span className="text-[11px] font-bold text-[#7a766e]">{fmtDur(service.durationMinutes)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
        {/* Custom toggle */}
        <button
          onClick={() => onToggle(service, !service.active)}
          aria-label={service.active ? 'Desactivar servicio' : 'Activar servicio'}
          className="relative w-9 h-[20px] rounded-full flex-shrink-0 transition-all duration-200 cursor-pointer focus:outline-none"
          style={{ background: service.active ? 'rgba(139,92,246,0.65)' : 'rgba(255,255,255,0.12)' }}>
          <div className="absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{ transform: service.active ? 'translateX(18px)' : 'translateX(0)' }} />
        </button>
        <span className="text-[11px] text-[#7a766e] flex-1">{service.active ? 'Activado' : 'Archivado'}</span>
        <button onClick={() => onEdit(service)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.14] text-[#7a766e] hover:text-[#f5f0e8] transition-all text-[11px] font-bold uppercase tracking-wide cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>edit</span>
          Editar
        </button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function ServiciosAdminPage() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [, startTransition] = useTransition();

  const fetchServices = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tenants', tenantId, 'services'));
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los servicios.' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, [tenantId]); // eslint-disable-line

  const handleEdit = (s: Service) => { setEditingService(s); setSheetOpen(true); };
  const handleNew = () => { setEditingService(null); setSheetOpen(true); };

  const handleToggle = (service: Service, active: boolean) => {
    if (!tenantId) return;
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, active } : s));
    startTransition(async () => {
      const result = await toggleServiceActive(tenantId, service.id, active);
      if (!result.success) {
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, active: !active } : s));
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: active ? 'Servicio activado' : 'Servicio archivado' });
      }
    });
  };

  const categories = [...new Set(services.filter(s => s.categoryId).map(s => s.categoryId!))].sort();

  const filtered = services.filter(s => {
    if (filter === 'active' && !s.active) return false;
    if (filter === 'inactive' && s.active) return false;
    if (categoryFilter && s.categoryId !== categoryFilter) return false;
    return true;
  });

  const activeCount = services.filter(s => s.active).length;
  const inactiveCount = services.length - activeCount;

  if (!tenantId) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-[#7a766e]">No hay un salón activo en la sesión.</p>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-[32px] font-bold italic text-[#f5f0e8] leading-tight">Servicios</h1>
          <p className="text-[#7a766e] text-[13px] mt-1">Catálogo de servicios de tu salón</p>
        </div>
        <button onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]">
          <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Nuevo servicio
        </button>
      </div>

      {/* ── KPI stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: 'grid_view',   label: 'Total',    value: loading ? '–' : String(services.length), color: '#a78bfa' },
          { icon: 'check_circle', label: 'Activos',  value: loading ? '–' : String(activeCount),    color: '#34d399' },
          { icon: 'archive',     label: 'Inactivos', value: loading ? '–' : String(inactiveCount),  color: '#7a766e' },
        ].map(stat => (
          <div key={stat.label} className="relative isolate rounded-2xl border border-white/[0.07] p-4 overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02] -z-10" />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${stat.color}18` }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <p className="text-[26px] font-bold text-[#f5f0e8] leading-none font-mono">{stat.value}</p>
            <p className="text-[9px] text-[#7a766e] font-label uppercase tracking-widest font-bold mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      {!loading && services.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex gap-0.5 p-0.5 bg-white/[0.03] border border-white/[0.07] rounded-xl">
            {([
              { key: 'all',      label: `Todos (${services.length})` },
              { key: 'active',   label: `Activos (${activeCount})` },
              { key: 'inactive', label: `Inactivos (${inactiveCount})` },
            ] as const).map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer"
                style={filter === f.key
                  ? { background: 'rgba(139,92,246,0.20)', color: '#c4b5fd' }
                  : { color: '#7a766e' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categoryFilter && (
                <button onClick={() => setCategoryFilter('')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-all"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                  {categoryFilter}
                </button>
              )}
              {!categoryFilter && categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-white/[0.04] border border-white/[0.07] text-[#7a766e] hover:text-[#f5f0e8] hover:border-white/[0.14] transition-all cursor-pointer">
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[220px] rounded-2xl border border-white/[0.05] animate-pulse"
              style={{ background: `rgba(255,255,255,${0.018 + i * 0.002})` }} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '28px' }}>spa</span>
          </div>
          <div>
            <p className="text-[#f5f0e8] font-semibold text-[15px]">
              {services.length === 0 ? 'Aún no hay servicios' : 'Sin resultados para este filtro'}
            </p>
            <p className="text-[13px] text-[#7a766e] mt-1.5 max-w-xs mx-auto leading-relaxed">
              {services.length === 0
                ? 'Creá tu primer servicio para que aparezca en tu calendario y en el marketplace.'
                : 'Probá cambiando el filtro activo.'}
            </p>
          </div>
          {services.length === 0 && (
            <button onClick={handleNew}
              className="flex items-center gap-2 px-5 py-2.5 border border-violet-500/30 bg-violet-500/[0.10] text-violet-300 hover:bg-violet-500/[0.18] rounded-xl text-[13px] font-bold transition-all cursor-pointer">
              <span className="material-symbols-outlined" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              Crear primer servicio
            </button>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(service => (
            <ServiceCard key={service.id} service={service} onEdit={handleEdit} onToggle={handleToggle} />
          ))}
        </div>
      )}

      <ServiceFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        service={editingService}
        tenantId={tenantId}
        onSuccess={fetchServices}
      />
    </div>
  );
}
