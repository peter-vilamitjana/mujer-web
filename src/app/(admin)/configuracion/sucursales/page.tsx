'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTenant } from '@/contexts/TenantContext';
import { useBranches } from '@/hooks/useBranches';
import { createBranch, updateBranch, toggleBranchActive } from '@/actions/branches.actions';
import type { Branch } from '@/lib/schema';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

const DAYS = [
  { key: 'monday',    label: 'Lunes' },
  { key: 'tuesday',   label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday',  label: 'Jueves' },
  { key: 'friday',    label: 'Viernes' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
];

const defaultSchedule = Object.fromEntries(
  DAYS.map((d) => [d.key, { open: '09:00', close: '18:00', isOpen: d.key !== 'sunday' }])
);

const branchSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  address: z.string().min(1, 'Dirección requerida'),
  phone: z.string().optional(),
  active: z.boolean().default(true),
  schedule: z.record(z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  })).default(defaultSchedule),
});

type BranchFormValues = z.infer<typeof branchSchema>;

const inputCls = "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 transition-all disabled:opacity-50";
const timeCls  = "bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1.5 text-[12px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all disabled:opacity-50 [color-scheme:dark]";

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0
        ${checked ? 'bg-violet-500' : 'bg-white/[0.12]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[11px] text-red-400 mt-1">{msg}</p>;
}

function BranchFormSheet({
  open,
  onOpenChange,
  branch,
  tenantId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  tenantId: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEditing = branch !== null;

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: branch
      ? { name: branch.name, address: branch.address, phone: branch.phone ?? '', active: branch.active, schedule: branch.schedule ?? defaultSchedule }
      : { name: '', address: '', phone: '', active: true, schedule: defaultSchedule },
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form;
  const watchedSchedule = watch('schedule');

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      reset(
        branch
          ? { name: branch.name, address: branch.address, phone: branch.phone ?? '', active: branch.active, schedule: branch.schedule ?? defaultSchedule }
          : { name: '', address: '', phone: '', active: true, schedule: defaultSchedule }
      );
    }
    onOpenChange(isOpen);
  };

  const onSubmit = (values: BranchFormValues) => {
    startTransition(async () => {
      const payload: Omit<Branch, 'id'> = {
        name: values.name,
        address: values.address,
        phone: values.phone || undefined,
        active: values.active,
        schedule: values.schedule,
      };
      const result = isEditing
        ? await updateBranch(tenantId, branch.id, payload)
        : await createBranch(tenantId, payload);

      if (result.success) {
        toast({ title: isEditing ? 'Sucursal actualizada' : '¡Sucursal creada!' });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent className="sm:max-w-md overflow-y-auto bg-[#0f0e0c] border-white/[0.08] p-0">
        {/* Sheet header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <h2 className="font-playfair text-[22px] font-bold italic text-[#f5f0e8] leading-tight">
            {isEditing ? 'Editar sucursal' : 'Nueva sucursal'}
          </h2>
          <p className="text-[#7a766e] text-[12px] mt-0.5">
            {isEditing ? `Editando: ${branch?.name}` : 'Completá los datos de la nueva sede'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">Nombre</label>
            <input
              {...register('name')}
              placeholder="Ej: Sucursal Centro"
              disabled={isPending}
              className={inputCls}
            />
            <FieldError msg={errors.name?.message} />
          </div>

          {/* Address */}
          <div>
            <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">Dirección</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a766e]">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>location_on</span>
              </span>
              <input
                {...register('address')}
                placeholder="Ej: Av. Corrientes 1234, CABA"
                disabled={isPending}
                className={inputCls + ' pl-9'}
              />
            </div>
            <FieldError msg={errors.address?.message} />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">
              Teléfono <span className="text-[#7a766e] font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a766e]">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>phone</span>
              </span>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+54 11 1234-5678"
                disabled={isPending}
                className={inputCls + ' pl-9'}
              />
            </div>
            <FieldError msg={errors.phone?.message} />
          </div>

          {/* Schedule */}
          <div className="pt-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label mb-3">Horarios de atención</p>
            <div className="relative isolate rounded-xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.04]">
              <div className="absolute inset-0 bg-white/[0.02] -z-10" />
              {DAYS.map((day) => {
                const s = watchedSchedule?.[day.key] ?? { open: '09:00', close: '18:00', isOpen: true };
                return (
                  <div key={day.key} className={`flex items-center gap-2.5 px-3.5 py-2.5 transition-opacity ${!s.isOpen ? 'opacity-50' : ''}`}>
                    <Toggle
                      checked={s.isOpen}
                      onChange={(v) => setValue(`schedule.${day.key}.isOpen`, v)}
                      disabled={isPending}
                    />
                    <span className="w-[76px] text-[12px] font-semibold text-[#f5f0e8] shrink-0">{day.label}</span>
                    {s.isOpen ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="time"
                          value={s.open}
                          onChange={(e) => setValue(`schedule.${day.key}.open`, e.target.value)}
                          disabled={isPending}
                          className={timeCls}
                        />
                        <span className="text-[#7a766e] text-[11px]">–</span>
                        <input
                          type="time"
                          value={s.close}
                          onChange={(e) => setValue(`schedule.${day.key}.close`, e.target.value)}
                          disabled={isPending}
                          className={timeCls}
                        />
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#7a766e] italic">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.25)]"
            >
              {isPending
                ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span> Guardando…</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>save</span>
                   {isEditing ? 'Guardar cambios' : 'Crear sucursal'}</>
              }
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

const BRANCH_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#60a5fa'];
const branchColor = (name = '') => BRANCH_COLORS[(name.charCodeAt(0) || 0) % BRANCH_COLORS.length];

export default function SucursalesPage() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const { branches, loading, refetch } = useBranches();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [, startTransition] = useTransition();

  const handleEdit = (branch: Branch) => { setEditingBranch(branch); setSheetOpen(true); };
  const handleNew  = () => { setEditingBranch(null); setSheetOpen(true); };

  const handleToggle = (branch: Branch, active: boolean) => {
    if (!tenantId) return;
    startTransition(async () => {
      const result = await toggleBranchActive(tenantId, branch.id, active);
      if (result.success) {
        toast({ title: active ? 'Sucursal activada' : 'Sucursal desactivada' });
        refetch();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

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
          <h1 className="font-playfair text-[32px] font-bold italic text-[#f5f0e8] leading-tight">Sucursales</h1>
          <p className="text-[#7a766e] text-[13px] mt-1">Gestioná las sedes de tu salón</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 text-white text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>add_business</span>
          Nueva sucursal
        </button>
      </div>

      {/* ── KPI card ── */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'store',         label: 'Total',   value: String(branches.length),                          color: '#a78bfa' },
            { icon: 'check_circle',  label: 'Activas', value: String(branches.filter(b => b.active).length),    color: '#34d399' },
            { icon: 'do_not_disturb',label: 'Inactivas',value: String(branches.filter(b => !b.active).length),  color: '#fbbf24' },
          ].map(stat => (
            <div key={stat.label} className="relative isolate rounded-2xl border border-white/[0.07] p-4 overflow-hidden">
              <div className="absolute inset-0 bg-white/[0.02] -z-10" />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${stat.color}18` }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <p className="text-[26px] font-bold text-[#f5f0e8] leading-none font-mono">{stat.value}</p>
              <p className="text-[9px] text-[#7a766e] font-label uppercase tracking-widest font-bold mt-1.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl border border-white/[0.05] animate-pulse" style={{ background: `rgba(255,255,255,${0.02 + i * 0.005})` }} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && branches.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '28px' }}>store</span>
          </div>
          <div>
            <p className="text-[#f5f0e8] font-semibold text-[15px]">Aún no hay sucursales</p>
            <p className="text-[13px] text-[#7a766e] mt-1.5 max-w-xs mx-auto leading-relaxed">
              Creá tu primera sede con el botón de arriba.
            </p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-[#f5f0e8] text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>add_business</span>
            Crear primera sucursal
          </button>
        </div>
      )}

      {/* ── Branch cards ── */}
      {!loading && branches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const color = branchColor(branch.name);
            const initial = (branch.name[0] ?? '').toUpperCase();
            const openDays = Object.values(branch.schedule ?? {}).filter(s => s.isOpen).length;

            return (
              <div
                key={branch.id}
                className={`relative isolate rounded-2xl border border-white/[0.07] overflow-hidden transition-opacity ${!branch.active ? 'opacity-55' : ''}`}
              >
                <div className="absolute inset-0 bg-white/[0.02] -z-10" />

                {/* Card header */}
                <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black shrink-0"
                      style={{ background: `${color}20`, color, border: `1.5px solid ${color}35` }}
                    >
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#f5f0e8] truncate leading-tight">{branch.name}</p>
                      <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                        ${branch.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/[0.04] text-[#7a766e] border border-white/[0.08]'
                        }`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>
                          {branch.active ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        {branch.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#7a766e] mt-0.5 shrink-0" style={{ fontSize: '14px' }}>location_on</span>
                    <p className="text-[12px] text-[#7a766e] leading-relaxed">{branch.address}</p>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '14px' }}>phone</span>
                      <p className="text-[12px] text-[#7a766e]">{branch.phone}</p>
                    </div>
                  )}
                  {openDays > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#7a766e]" style={{ fontSize: '14px' }}>schedule</span>
                      <p className="text-[12px] text-[#7a766e]">{openDays} día{openDays !== 1 ? 's' : ''} por semana</p>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-white/[0.05] mt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={branch.active}
                      onClick={() => handleToggle(branch, !branch.active)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none
                        ${branch.active ? 'bg-violet-500' : 'bg-white/[0.12]'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${branch.active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-[11px] text-[#7a766e]">{branch.active ? 'Activa' : 'Inactiva'}</span>
                  </div>
                  <button
                    onClick={() => handleEdit(branch)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-violet-500/[0.10] hover:border-violet-500/30 text-[#7a766e] hover:text-violet-300 transition-all text-[11px] font-bold uppercase tracking-wide cursor-pointer"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>edit</span>
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tenantId && (
        <BranchFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          branch={editingBranch}
          tenantId={tenantId}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
