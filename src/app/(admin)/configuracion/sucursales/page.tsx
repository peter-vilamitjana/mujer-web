'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTenant } from '@/contexts/TenantContext';
import { useBranches } from '@/hooks/useBranches';
import { createBranch, updateBranch, toggleBranchActive } from '@/actions/branches.actions';
import type { Branch } from '@/lib/schema';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, MapPin, Phone } from 'lucide-react';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
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
      ? {
          name: branch.name,
          address: branch.address,
          phone: branch.phone ?? '',
          active: branch.active,
          schedule: branch.schedule ?? defaultSchedule,
        }
      : { name: '', address: '', phone: '', active: true, schedule: defaultSchedule },
  });

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      form.reset(
        branch
          ? { name: branch.name, address: branch.address, phone: branch.phone ?? '', active: branch.active, schedule: branch.schedule ?? defaultSchedule }
          : { name: '', address: '', phone: '', active: true, schedule: defaultSchedule }
      );
    }
    onOpenChange(isOpen);
  };

  const watchedSchedule = form.watch('schedule');

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
        toast({ title: isEditing ? 'Sucursal actualizada' : 'Sucursal creada' });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar sucursal' : 'Nueva sucursal'}</SheetTitle>
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
                    <Input placeholder="Ej: Sucursal Centro" {...field} disabled={isPending} />
                  </FormControl>
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
                  <FormControl>
                    <Input placeholder="Ej: Av. Corrientes 1234, CABA" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono <span className="text-muted-foreground">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+54 11 1234-5678" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <p className="text-sm font-medium mb-3">Horarios de atención</p>
              <div className="space-y-2">
                {DAYS.map((day) => {
                  const s = watchedSchedule?.[day.key] ?? { open: '09:00', close: '18:00', isOpen: true };
                  return (
                    <div key={day.key} className="flex items-center gap-2 p-2 border rounded-lg">
                      <Switch
                        checked={s.isOpen}
                        onCheckedChange={(v) => form.setValue(`schedule.${day.key}.isOpen`, v)}
                        disabled={isPending}
                      />
                      <span className="w-20 text-sm">{day.label}</span>
                      {s.isOpen ? (
                        <div className="flex items-center gap-1 flex-1">
                          <Input
                            type="time"
                            value={s.open}
                            onChange={(e) => form.setValue(`schedule.${day.key}.open`, e.target.value)}
                            className="h-7 text-xs"
                            disabled={isPending}
                          />
                          <span className="text-muted-foreground text-xs">–</span>
                          <Input
                            type="time"
                            value={s.close}
                            onChange={(e) => form.setValue(`schedule.${day.key}.close`, e.target.value)}
                            className="h-7 text-xs"
                            disabled={isPending}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Cerrado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear sucursal'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default function SucursalesPage() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const { branches, loading, refetch } = useBranches();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [, startTransition] = useTransition();

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setSheetOpen(true);
  };

  const handleNew = () => {
    setEditingBranch(null);
    setSheetOpen(true);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Sucursales</h1>
          <p className="text-muted-foreground">Gestioná las sedes de tu salón.</p>
        </div>
        <Button onClick={handleNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva sucursal
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Aún no hay sucursales registradas.</p>
          <Button variant="outline" onClick={handleNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear primera sucursal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Card key={branch.id} className={`transition-opacity ${!branch.active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{branch.name}</CardTitle>
                  <Badge variant={branch.active ? 'default' : 'secondary'} className="shrink-0 text-xs">
                    {branch.active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {branch.address}
                </p>
                {branch.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3 shrink-0" />
                    {branch.phone}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={branch.active}
                      onCheckedChange={(v) => handleToggle(branch, v)}
                      aria-label={branch.active ? 'Desactivar' : 'Activar'}
                    />
                    <span className="text-xs text-muted-foreground">
                      {branch.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(branch)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
