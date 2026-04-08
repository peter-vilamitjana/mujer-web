'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTenant } from '@/contexts/TenantContext';
import { useStaff } from '@/hooks/useStaff';
import { createStaffMember, updateStaffMember, toggleStaffActive } from '@/actions/staff.actions';
import type { Staff, Service } from '@/lib/schema';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

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
  DAYS.map((d) => [d.key, { start: '09:00', end: '18:00', available: d.key !== 'sunday' }])
);

const scheduleSchema = z.record(
  z.object({ start: z.string(), end: z.string(), available: z.boolean() })
);

const staffSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  role: z.string().min(1, 'Rol requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  services: z.array(z.string()).default([]),
  schedule: scheduleSchema.default(defaultSchedule),
  active: z.boolean().default(true),
  assignedBranchIds: z.array(z.string()).default([]),
  avatarUrl: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

// ─── Avatar placeholder ───────────────────────────────────────────
function AvatarInitials({ name, className = '' }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className={`flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold ${className}`}>
      {initials || '?'}
    </div>
  );
}

// ─── Multi-step form ──────────────────────────────────────────────
function StaffFormSheet({
  open,
  onOpenChange,
  member,
  tenantId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Staff | null;
  tenantId: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const isEditing = member !== null;

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: member
      ? {
          name: member.name,
          role: member.role,
          email: member.email ?? '',
          phone: member.phone ?? '',
          services: member.services ?? [],
          schedule: member.schedule ?? defaultSchedule,
          active: member.active,
          assignedBranchIds: member.assignedBranchIds ?? [],
          avatarUrl: member.avatarUrl ?? '',
        }
      : {
          name: '',
          role: '',
          email: '',
          phone: '',
          services: [],
          schedule: defaultSchedule,
          active: true,
          assignedBranchIds: [],
        },
  });

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen) {
      setStep(1);
      form.reset(
        member
          ? {
              name: member.name,
              role: member.role,
              email: member.email ?? '',
              phone: member.phone ?? '',
              services: member.services ?? [],
              schedule: member.schedule ?? defaultSchedule,
              active: member.active,
              assignedBranchIds: member.assignedBranchIds ?? [],
            }
          : {
              name: '',
              role: '',
              email: '',
              phone: '',
              services: [],
              schedule: defaultSchedule,
              active: true,
              assignedBranchIds: [],
            }
      );
      // Load active services for step 2
      try {
        const snap = await getDocs(collection(db, 'tenants', tenantId, 'services'));
        const svcs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Service))
          .filter((s) => s.active);
        setAvailableServices(svcs);
      } catch {
        setAvailableServices([]);
      }
    }
    onOpenChange(isOpen);
  };

  const nextStep = async () => {
    let valid = false;
    if (step === 1) valid = await form.trigger(['name', 'role', 'email', 'phone']);
    if (step === 2) valid = true;
    if (valid) setStep((s) => Math.min(s + 1, 3));
  };

  const onSubmit = (values: StaffFormValues) => {
    startTransition(async () => {
      const payload: Omit<Staff, 'id'> = {
        name: values.name,
        role: values.role,
        email: values.email || undefined,
        phone: values.phone || undefined,
        services: values.services,
        schedule: values.schedule,
        active: values.active,
        assignedBranchIds: values.assignedBranchIds,
        avatarUrl: values.avatarUrl || undefined,
      };

      const result = isEditing
        ? await updateStaffMember(tenantId, member.id, payload)
        : await createStaffMember(tenantId, payload);

      if (result.success) {
        toast({ title: isEditing ? 'Profesional actualizado' : 'Profesional creado' });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  const watchedServices = form.watch('services');
  const watchedSchedule = form.watch('schedule');

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Editar profesional' : 'Nuevo profesional'} — Paso {step} de 3
          </SheetTitle>
          <div className="flex gap-1 pt-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-6">
            {/* STEP 1: Info básica */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: María González" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Estilista, Colorista..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-muted-foreground">(opcional)</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="maria@salon.com" {...field} />
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
                        <Input type="tel" placeholder="+54 9 11 1234-5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 2: Servicios */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Seleccioná los servicios que puede realizar este profesional.
                </p>
                {availableServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No hay servicios activos. Podés agregarlos luego desde la sección Servicios.
                  </p>
                ) : (
                  availableServices.map((svc) => {
                    const checked = watchedServices.includes(svc.id);
                    return (
                      <div key={svc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`svc-${svc.id}`}
                          checked={checked}
                          onCheckedChange={(c) => {
                            const current = form.getValues('services');
                            form.setValue(
                              'services',
                              c ? [...current, svc.id] : current.filter((id) => id !== svc.id)
                            );
                          }}
                        />
                        <label htmlFor={`svc-${svc.id}`} className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium">{svc.name}</p>
                          <p className="text-xs text-muted-foreground">{svc.durationMinutes} min</p>
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* STEP 3: Horarios */}
            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Configurá la disponibilidad semanal del profesional.
                </p>
                {DAYS.map((day) => {
                  const daySchedule = watchedSchedule?.[day.key] ?? {
                    start: '09:00',
                    end: '18:00',
                    available: true,
                  };
                  return (
                    <div key={day.key} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Switch
                        checked={daySchedule.available}
                        onCheckedChange={(v) =>
                          form.setValue(`schedule.${day.key}.available`, v)
                        }
                      />
                      <span className="w-24 text-sm font-medium">{day.label}</span>
                      {daySchedule.available && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={daySchedule.start}
                            onChange={(e) =>
                              form.setValue(`schedule.${day.key}.start`, e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                          <span className="text-muted-foreground text-sm">–</span>
                          <Input
                            type="time"
                            value={daySchedule.end}
                            onChange={(e) =>
                              form.setValue(`schedule.${day.key}.end`, e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                      {!daySchedule.available && (
                        <span className="text-sm text-muted-foreground italic">No disponible</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <SheetFooter className="pt-4 flex gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear profesional'}
                </Button>
              )}
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// ─── Staff Card ───────────────────────────────────────────────────
function StaffCard({
  member,
  tenantId,
  onEdit,
  onToggle,
}: {
  member: Staff;
  tenantId: string;
  onEdit: (m: Staff) => void;
  onToggle: (m: Staff, active: boolean) => void;
}) {
  const serviceCount = member.services?.length ?? 0;

  return (
    <Card className={`transition-opacity ${!member.active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <AvatarInitials name={member.name} className="h-12 w-12 text-base" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{member.name}</p>
            <p className="text-sm text-muted-foreground truncate">{member.role}</p>
          </div>
          <Badge variant={member.active ? 'default' : 'secondary'} className="shrink-0 text-xs">
            {member.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {serviceCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {serviceCount} servicio{serviceCount !== 1 ? 's' : ''} asignado{serviceCount !== 1 ? 's' : ''}
          </p>
        )}
        {member.email && (
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={member.active}
              onCheckedChange={(checked) => onToggle(member, checked)}
              aria-label={member.active ? 'Desactivar' : 'Activar'}
            />
            <span className="text-xs text-muted-foreground">
              {member.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(member)}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function StaffAdminPage() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const { staff, loading, refetch } = useStaff();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Staff | null>(null);
  const [, startTransition] = useTransition();

  const handleEdit = (member: Staff) => {
    setEditingMember(member);
    setSheetOpen(true);
  };

  const handleNew = () => {
    setEditingMember(null);
    setSheetOpen(true);
  };

  const handleToggle = (member: Staff, active: boolean) => {
    if (!tenantId) return;
    startTransition(async () => {
      const result = await toggleStaffActive(tenantId, member.id, active);
      if (result.success) {
        toast({ title: active ? 'Profesional activado' : 'Profesional desactivado' });
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
          <h1 className="text-3xl font-bold tracking-tight">Equipo</h1>
          <p className="text-muted-foreground">Gestioná los profesionales de tu salón.</p>
        </div>
        <Button onClick={handleNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo profesional
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Aún no hay profesionales registrados.</p>
          <Button variant="outline" onClick={handleNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar primer profesional
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              tenantId={tenantId}
              onEdit={handleEdit}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {tenantId && (
        <StaffFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          member={editingMember}
          tenantId={tenantId}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
