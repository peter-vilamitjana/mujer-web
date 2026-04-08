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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Clock, DollarSign } from 'lucide-react';

const serviceSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(1, 'Duración mínima 1 min').max(480, 'Duración máxima 8 horas'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  categoryId: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

function ServiceFormSheet({
  open,
  onOpenChange,
  service,
  tenantId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  tenantId: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEditing = service !== null;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      durationMinutes: 60,
      price: 0,
      categoryId: '',
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description ?? '',
        durationMinutes: service.durationMinutes,
        price: typeof service.price === 'number' ? service.price : 0,
        categoryId: service.categoryId ?? '',
      });
    } else {
      form.reset({ name: '', description: '', durationMinutes: 60, price: 0, categoryId: '' });
    }
  }, [service, form]);

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar servicio' : 'Nuevo servicio'}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Corte y peinado" {...field} disabled={isPending} />
                  </FormControl>
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
                    <Textarea placeholder="Describe el servicio..." {...field} disabled={isPending} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (ARS)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="0" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (min)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={480} placeholder="60" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría <span className="text-muted-foreground">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Coloración, Tratamientos..." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear servicio'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

function ServiceCard({
  service,
  tenantId,
  onEdit,
  onToggle,
}: {
  service: Service;
  tenantId: string;
  onEdit: (s: Service) => void;
  onToggle: (s: Service, active: boolean) => void;
}) {
  const price = typeof service.price === 'number' ? service.price : 0;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);

  return (
    <Card className={`transition-opacity ${!service.active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{service.name}</CardTitle>
          <Badge variant={service.active ? 'default' : 'secondary'} className="shrink-0 text-xs">
            {service.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <DollarSign className="h-4 w-4" />
            {formatPrice(price)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {service.durationMinutes} min
          </span>
        </div>
        {service.categoryId && (
          <Badge variant="outline" className="text-xs">{service.categoryId}</Badge>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Switch
              checked={service.active}
              onCheckedChange={(checked) => onToggle(service, checked)}
              aria-label={service.active ? 'Desactivar servicio' : 'Activar servicio'}
            />
            <span className="text-xs text-muted-foreground">
              {service.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(service)}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServiciosAdminPage() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [, startTransition] = useTransition();

  const fetchServices = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tenants', tenantId, 'services'));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service));
      setServices(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('[fetchServices]', err);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los servicios.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setSheetOpen(true);
  };

  const handleNew = () => {
    setEditingService(null);
    setSheetOpen(true);
  };

  const handleToggle = (service: Service, active: boolean) => {
    if (!tenantId) return;
    // Optimistic update
    setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, active } : s)));
    startTransition(async () => {
      const result = await toggleServiceActive(tenantId, service.id, active);
      if (!result.success) {
        // Revert
        setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, active: !active } : s)));
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: active ? 'Servicio activado' : 'Servicio archivado' });
      }
    });
  };

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No hay un salón activo en la sesión.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">Gestioná el catálogo de servicios de tu salón.</p>
        </div>
        <Button onClick={handleNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo servicio
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Aún no hay servicios registrados.</p>
          <Button variant="outline" onClick={handleNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear primer servicio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              tenantId={tenantId}
              onEdit={handleEdit}
              onToggle={handleToggle}
            />
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
