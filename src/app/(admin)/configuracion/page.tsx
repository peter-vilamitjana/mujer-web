'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTenant } from '@/contexts/TenantContext';
import { updateTenantSettings, checkSlugAvailability, getTenantSettings } from '@/actions/tenant.actions';
import type { Tenant } from '@/lib/schema';
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

const defaultHours = Object.fromEntries(
  DAYS.map((d) => [d.key, { open: '09:00', close: '18:00', isOpen: d.key !== 'sunday' }])
);

const tenantSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  slug: z.string().min(3, 'Mínimo 3 caracteres').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  coverImageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    whatsapp: z.string().optional(),
  }).default({}),
  businessHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  })).default(defaultHours),
});

type TenantFormValues = z.infer<typeof tenantSchema>;
type TabId = 'info' | 'contacto' | 'apariencia' | 'horarios';

function formDefaultsFromTenant(t: Tenant): TenantFormValues {
  return {
    name: t.name ?? '',
    slug: t.slug ?? '',
    description: t.description ?? '',
    phone: t.phone ?? '',
    address: t.address ?? '',
    logoUrl: t.logoUrl ?? '',
    coverImageUrl: t.coverImageUrl ?? '',
    socialLinks: {
      instagram: t.socialLinks?.instagram ?? '',
      facebook: t.socialLinks?.facebook ?? '',
      whatsapp: t.socialLinks?.whatsapp ?? '',
    },
    businessHours: t.businessHours ?? defaultHours,
  };
}

const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-[#f5f0e8] placeholder-[#7a766e] focus:outline-none focus:border-violet-500/40 transition-all disabled:opacity-50";
const timeCls  = "bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[12px] text-[#f5f0e8] focus:outline-none focus:border-violet-500/40 transition-all disabled:opacity-50 [color-scheme:dark]";

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

export default function ConfiguracionPage() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugTimer, setSlugTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: '', slug: '', description: '', phone: '', address: '',
      logoUrl: '', coverImageUrl: '',
      socialLinks: { instagram: '', facebook: '', whatsapp: '' },
      businessHours: defaultHours,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedHours   = watch('businessHours');
  const watchedLogoUrl = watch('logoUrl');
  const watchedCoverUrl= watch('coverImageUrl');
  const watchedSlug    = watch('slug');

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    getTenantSettings(tenantId).then((t) => {
      if (t) form.reset(formDefaultsFromTenant(t));
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const handleSlugChange = useCallback((slug: string) => {
    if (slugTimer) clearTimeout(slugTimer);
    if (!slug || slug.length < 3 || !tenantId) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const { available } = await checkSlugAvailability(slug, tenantId);
      setSlugStatus(available ? 'available' : 'taken');
    }, 600);
    setSlugTimer(timer);
  }, [slugTimer, tenantId]);

  const onSubmit = (values: TenantFormValues) => {
    if (!tenantId) return;
    if (slugStatus === 'taken') { toast({ variant: 'destructive', title: 'El slug no está disponible.' }); return; }
    startTransition(async () => {
      const payload: Partial<Omit<Tenant, 'id' | 'createdAt'>> = {
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        logoUrl: values.logoUrl || undefined,
        coverImageUrl: values.coverImageUrl || undefined,
        socialLinks: {
          instagram: values.socialLinks.instagram || undefined,
          facebook: values.socialLinks.facebook || undefined,
          whatsapp: values.socialLinks.whatsapp || undefined,
        },
        businessHours: values.businessHours,
      };
      const result = await updateTenantSettings(tenantId, payload);
      if (result.success) {
        toast({ title: '¡Configuración guardada!' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'info',       label: 'Info',       icon: 'store' },
    { id: 'contacto',   label: 'Contacto',   icon: 'contacts' },
    { id: 'apariencia', label: 'Apariencia', icon: 'palette' },
    { id: 'horarios',   label: 'Horarios',   icon: 'schedule' },
  ];

  if (!tenantId) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-[#7a766e]">No hay salón activo.</p>
    </div>
  );

  if (loading) return (
    <div className="space-y-5">
      <div className="h-9 w-52 rounded-2xl bg-white/[0.04] animate-pulse" />
      <div className="h-12 rounded-2xl bg-white/[0.04] animate-pulse" />
      <div className="h-64 rounded-2xl bg-white/[0.04] animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-[32px] font-bold italic text-[#f5f0e8] leading-tight">Configuración</h1>
          <p className="text-[#7a766e] text-[13px] mt-1">Personalizá la información de tu salón</p>
        </div>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending || slugStatus === 'taken'}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]"
        >
          {isPending
            ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span> Guardando…</>
            : <><span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>save</span> Guardar</>
          }
        </button>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-150 cursor-pointer border
              ${activeTab === tab.id
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                : 'text-[#7a766e] hover:text-[#f5f0e8] bg-white/[0.02] border-white/[0.07]'}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── TAB: Info ── */}
        {activeTab === 'info' && (
          <div className="relative isolate rounded-2xl border border-white/[0.07] p-5 overflow-hidden space-y-5">
            <div className="absolute inset-0 bg-white/[0.02] -z-10" />

            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label mb-4">Información general</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">Nombre del salón</label>
                  <input
                    {...register('name')}
                    placeholder="Mi Salón"
                    disabled={isPending}
                    className={inputCls}
                  />
                  <FieldError msg={errors.name?.message} />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">URL del salón (slug)</label>
                  <div className="relative">
                    <input
                      {...register('slug')}
                      placeholder="mi-salon"
                      disabled={isPending}
                      className={inputCls + ' pr-10'}
                      onChange={(e) => {
                        const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                        setValue('slug', v, { shouldValidate: true });
                        handleSlugChange(v);
                      }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {slugStatus === 'checking' && (
                        <span className="material-symbols-outlined animate-spin text-[#7a766e]" style={{ fontSize: '16px' }}>autorenew</span>
                      )}
                      {slugStatus === 'available' && (
                        <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                      {slugStatus === 'taken' && (
                        <span className="material-symbols-outlined text-red-400" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[11px] text-[#7a766e]">mujerapp.com/salones/</span>
                    <span className="text-[11px] text-[#f5f0e8] font-medium">{watchedSlug || 'mi-salon'}</span>
                    {slugStatus === 'taken' && (
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">· No disponible</span>
                    )}
                    {slugStatus === 'available' && (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">· Disponible</span>
                    )}
                  </div>
                  <FieldError msg={errors.slug?.message} />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">
                    Descripción <span className="text-[#7a766e] font-normal">(opcional)</span>
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder="Contá qué hace especial a tu salón..."
                    disabled={isPending}
                    rows={4}
                    className={inputCls + ' resize-none'}
                  />
                  <FieldError msg={errors.description?.message} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Contacto ── */}
        {activeTab === 'contacto' && (
          <div className="relative isolate rounded-2xl border border-white/[0.07] p-5 overflow-hidden space-y-5">
            <div className="absolute inset-0 bg-white/[0.02] -z-10" />

            <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Contacto y redes</p>

            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">Teléfono</label>
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

              {/* Address */}
              <div>
                <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">Dirección</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a766e]">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>location_on</span>
                  </span>
                  <input
                    {...register('address')}
                    placeholder="Av. Ejemplo 1234, CABA"
                    disabled={isPending}
                    className={inputCls + ' pl-9'}
                  />
                </div>
                <FieldError msg={errors.address?.message} />
              </div>

              {/* Social links */}
              <div className="pt-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label mb-3">Redes sociales</p>
                <div className="space-y-3">
                  {([
                    { field: 'instagram' as const, icon: 'photo_camera',  placeholder: '@mi_salon',              label: 'Instagram' },
                    { field: 'facebook'  as const, icon: 'thumb_up',      placeholder: 'facebook.com/mi-salon',  label: 'Facebook' },
                    { field: 'whatsapp'  as const, icon: 'chat',          placeholder: '+54 9 11 1234-5678',     label: 'WhatsApp' },
                  ]).map(({ field, icon, placeholder, label }) => (
                    <div key={field}>
                      <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">{label}</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a766e]">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{icon}</span>
                        </span>
                        <input
                          {...register(`socialLinks.${field}`)}
                          placeholder={placeholder}
                          disabled={isPending}
                          className={inputCls + ' pl-9'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Apariencia ── */}
        {activeTab === 'apariencia' && (
          <div className="relative isolate rounded-2xl border border-white/[0.07] p-5 overflow-hidden space-y-5">
            <div className="absolute inset-0 bg-white/[0.02] -z-10" />

            <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Apariencia visual</p>

            <div className="space-y-5">
              {/* Logo */}
              <div>
                <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">URL del logo</label>
                <input
                  {...register('logoUrl')}
                  placeholder="https://..."
                  disabled={isPending}
                  className={inputCls}
                />
                <p className="text-[11px] text-[#7a766e] mt-1.5">Formato recomendado: cuadrado, PNG o SVG con fondo transparente.</p>
                <FieldError msg={errors.logoUrl?.message} />
                {watchedLogoUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={watchedLogoUrl}
                      alt="Logo preview"
                      className="h-16 w-16 object-contain rounded-xl border border-white/[0.08] bg-white/[0.03]"
                    />
                    <p className="text-[11px] text-[#7a766e]">Vista previa del logo</p>
                  </div>
                )}
              </div>

              {/* Cover */}
              <div>
                <label className="block text-[12px] font-semibold text-[#f5f0e8] mb-1.5">URL imagen de portada</label>
                <input
                  {...register('coverImageUrl')}
                  placeholder="https://..."
                  disabled={isPending}
                  className={inputCls}
                />
                <p className="text-[11px] text-[#7a766e] mt-1.5">Formato recomendado: 1200×400px, JPG o WebP.</p>
                <FieldError msg={errors.coverImageUrl?.message} />
                {watchedCoverUrl && (
                  <div className="mt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={watchedCoverUrl}
                      alt="Cover preview"
                      className="h-28 w-full object-cover rounded-xl border border-white/[0.08]"
                    />
                    <p className="text-[11px] text-[#7a766e] mt-1.5">Vista previa de portada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Horarios ── */}
        {activeTab === 'horarios' && (
          <div className="relative isolate rounded-2xl border border-white/[0.07] overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02] -z-10" />

            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#7a766e] font-label">Horarios de atención</p>
              <p className="text-[12px] text-[#7a766e] mt-1">Se muestran en la vitrina pública de tu salón.</p>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {DAYS.map((day) => {
                const s = watchedHours?.[day.key] ?? { open: '09:00', close: '18:00', isOpen: true };
                return (
                  <div key={day.key} className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${!s.isOpen ? 'opacity-50' : ''}`}>
                    <Toggle
                      checked={s.isOpen}
                      onChange={(v) => setValue(`businessHours.${day.key}.isOpen`, v)}
                      disabled={isPending}
                    />
                    <span className="w-24 text-[13px] font-semibold text-[#f5f0e8]">{day.label}</span>
                    {s.isOpen ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={s.open}
                          onChange={(e) => setValue(`businessHours.${day.key}.open`, e.target.value)}
                          disabled={isPending}
                          className={timeCls}
                        />
                        <span className="text-[#7a766e] text-[12px]">–</span>
                        <input
                          type="time"
                          value={s.close}
                          onChange={(e) => setValue(`businessHours.${day.key}.close`, e.target.value)}
                          disabled={isPending}
                          className={timeCls}
                        />
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#7a766e] italic">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Save button (bottom) ── */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || slugStatus === 'taken'}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.28)]"
          >
            {isPending
              ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span> Guardando…</>
              : <><span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>save</span> Guardar configuración</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
