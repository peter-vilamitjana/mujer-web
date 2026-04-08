'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTenant } from '@/contexts/TenantContext';
import { updateTenantSettings, checkSlugAvailability, getTenantSettings } from '@/actions/tenant.actions';
import type { Tenant } from '@/lib/schema';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
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

export default function ConfiguracionPage() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Slug availability state
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

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    getTenantSettings(tenantId).then((t) => {
      if (t) {
        setTenant(t);
        form.reset(formDefaultsFromTenant(t));
      }
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
        toast({ title: 'Configuración guardada' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  if (!tenantId) return <div className="p-6 text-muted-foreground">No hay salón activo.</div>;

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const watchedHours = form.watch('businessHours');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración del salón</h1>
        <p className="text-muted-foreground">Personalizá la información pública y operativa de tu salón.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="contacto">Contacto</TabsTrigger>
              <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
              <TabsTrigger value="horarios">Horarios</TabsTrigger>
            </TabsList>

            {/* TAB: Info General */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Información general</CardTitle>
                  <CardDescription>Datos principales de tu salón visibles en la vitrina pública.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del salón</FormLabel>
                        <FormControl><Input placeholder="Mi Salón" {...field} disabled={isPending} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del salón (slug)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="mi-salon"
                              {...field}
                              disabled={isPending}
                              onChange={(e) => {
                                const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                                field.onChange(v);
                                handleSlugChange(v);
                              }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {slugStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                              {slugStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              {slugStatus === 'taken' && <XCircle className="h-4 w-4 text-destructive" />}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          <span className="text-muted-foreground text-xs">mujerapp.com/salones/</span>
                          <span className="font-medium text-xs">{field.value || 'mi-salon'}</span>
                          {slugStatus === 'taken' && <Badge variant="destructive" className="ml-2 text-xs">No disponible</Badge>}
                          {slugStatus === 'available' && <Badge variant="outline" className="ml-2 text-xs text-green-600">Disponible</Badge>}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción <span className="text-muted-foreground">(opcional)</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Contá qué hace especial a tu salón..."
                            {...field}
                            disabled={isPending}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Contacto */}
            <TabsContent value="contacto">
              <Card>
                <CardHeader>
                  <CardTitle>Contacto y redes</CardTitle>
                  <CardDescription>Datos de contacto y redes sociales del salón.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl><Input type="tel" placeholder="+54 11 1234-5678" {...field} disabled={isPending} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl><Input placeholder="Av. Ejemplo 1234, CABA" {...field} disabled={isPending} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2 space-y-3">
                    <p className="text-sm font-medium">Redes sociales</p>
                    {(['instagram', 'facebook', 'whatsapp'] as const).map((red) => (
                      <FormField
                        key={red}
                        control={form.control}
                        name={`socialLinks.${red}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="capitalize">{red}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  red === 'instagram' ? '@mi_salon' :
                                  red === 'facebook' ? 'facebook.com/mi-salon' :
                                  '+54 9 11 1234-5678'
                                }
                                {...field}
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Apariencia */}
            <TabsContent value="apariencia">
              <Card>
                <CardHeader>
                  <CardTitle>Apariencia</CardTitle>
                  <CardDescription>Logo e imagen de portada de la vitrina pública.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del logo</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} disabled={isPending} /></FormControl>
                        <FormDescription className="text-xs">Formato recomendado: cuadrado, PNG o SVG con fondo transparente.</FormDescription>
                        <FormMessage />
                        {field.value && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={field.value} alt="Logo preview" className="mt-2 h-16 w-16 object-contain border rounded-lg" />
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL imagen de portada</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} disabled={isPending} /></FormControl>
                        <FormDescription className="text-xs">Formato recomendado: 1200×400px, JPG o WebP.</FormDescription>
                        <FormMessage />
                        {field.value && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={field.value} alt="Cover preview" className="mt-2 h-24 w-full object-cover border rounded-lg" />
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Horarios */}
            <TabsContent value="horarios">
              <Card>
                <CardHeader>
                  <CardTitle>Horarios de atención</CardTitle>
                  <CardDescription>Horarios del salón que se muestran en la vitrina pública.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {DAYS.map((day) => {
                    const s = watchedHours?.[day.key] ?? { open: '09:00', close: '18:00', isOpen: true };
                    return (
                      <div key={day.key} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Switch
                          checked={s.isOpen}
                          onCheckedChange={(v) => form.setValue(`businessHours.${day.key}.isOpen`, v)}
                          disabled={isPending}
                        />
                        <span className="w-24 text-sm font-medium">{day.label}</span>
                        {s.isOpen ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={s.open}
                              onChange={(e) => form.setValue(`businessHours.${day.key}.open`, e.target.value)}
                              className="h-8 text-sm"
                              disabled={isPending}
                            />
                            <span className="text-muted-foreground">–</span>
                            <Input
                              type="time"
                              value={s.close}
                              onChange={(e) => form.setValue(`businessHours.${day.key}.close`, e.target.value)}
                              className="h-8 text-sm"
                              disabled={isPending}
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Cerrado</span>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isPending || slugStatus === 'taken'}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar configuración'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
