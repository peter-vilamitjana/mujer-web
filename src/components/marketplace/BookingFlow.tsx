'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Calendar as CalendarIcon, Clock, User, Scissors, Users, CheckCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { getAvailableSlots, createBooking } from '@/actions/booking.actions';
import { createGuestBooking } from '@/actions/guest-booking.actions';
import { createDepositPreference } from '@/actions/mercadopago.actions';
import type { Service, Staff, ServicePriceByLength } from '@/lib/schema';
import type { LargoPelo } from '@/lib/_types_archive';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MONTO_SEÑA_PORCENTAJE = 0.15;
const ALL_TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

interface Props {
  tenantId: string;
  tenantSlug: string;
  services: Service[];
  staff: Staff[];
  isAuthenticated: boolean;
}

type SelectedServiceWithLargo = Service & { largo?: LargoPelo };

const LengthPopoverContent = () => (
  <PopoverContent className="w-64 text-sm" onClick={(e) => e.stopPropagation()}>
    <h4 className="font-bold mb-2">Cómo definimos el largo</h4>
    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
      <li><span className="font-semibold text-foreground">Corto:</span> hasta el mentón</li>
      <li><span className="font-semibold text-foreground">Mediano:</span> hasta los hombros</li>
      <li><span className="font-semibold text-foreground">Largo:</span> por debajo de los hombros</li>
    </ul>
    <p className="mt-4 text-xs text-muted-foreground">
      <span className="font-bold">Nota:</span> El precio mostrado es a partir de según diagnóstico al llegar.
    </p>
  </PopoverContent>
);

const LengthPopoverTrigger = ({ asChild = false }: { asChild?: boolean }) => (
  <Popover>
    <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
      {asChild ? (
        <button className="text-xs text-muted-foreground underline hover:text-primary">
          Ver cómo definimos el largo
        </button>
      ) : (
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-4 w-4 text-muted-foreground ml-1"
          aria-label="Información sobre largo"
        >
          <Info className="h-4 w-4" />
        </button>
      )}
    </PopoverTrigger>
    <LengthPopoverContent />
  </Popover>
);

export default function BookingFlow({ tenantId, tenantSlug, services, staff, isAuthenticated }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<SelectedServiceWithLargo[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [showLengthError, setShowLengthError] = useState(false);
  const [clientPhone, setClientPhone] = useState((session?.user as any)?.phone || '');
  const [phoneTouched, setPhoneTouched] = useState(false);

  // Guest mode — datos del invitado cuando no hay sesión
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const isPhoneValid = useMemo(() => /^\d{8,15}$/.test(clientPhone.replace(/\s/g, '')), [clientPhone]);

  // Pure helpers — defined before early returns so useMemo below can reference them
  const getServicePrice = (service: SelectedServiceWithLargo): { from: number; to?: number } => {
    if (service.requiresLengthSelection && !service.largo) return { from: 0, to: 0 };
    if (typeof service.price === 'object' && service.largo) {
      const priceObj = service.price as ServicePriceByLength;
      const fromPrice = priceObj[service.largo];
      const toPrice = service.variablePrice && service.priceHasta ? (service.priceHasta as ServicePriceByLength)[service.largo] : undefined;
      return { from: fromPrice, to: toPrice };
    }
    return { from: typeof service.price === 'number' ? service.price : 0 };
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return '0min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m === 0) return `${h}h`;
    if (h === 0) return `${m}min`;
    return `${h}h ${m}min`;
  };

  // All useMemo hooks must come before any early return to satisfy Rules of Hooks
  const { totalFrom, totalTo, hasRange } = useMemo(() => {
    let from = 0, to = 0, range = false;
    selectedServices.forEach(s => {
      const p = getServicePrice(s);
      from += p.from;
      if (p.to) { to += p.to; range = true; } else { to += p.from; }
    });
    return { totalFrom: from, totalTo: to, hasRange: range && to > from };
  }, [selectedServices]);

  const totalDuration = useMemo(() =>
    selectedServices.reduce((acc, s) => {
      if (s.requiresLengthSelection && !s.largo) return acc;
      return acc + (s.durationMinutes || 0)
    }, 0),
    [selectedServices]
  );

  const depositAmount = useMemo(() => Math.round(totalFrom * MONTO_SEÑA_PORCENTAJE), [totalFrom]);

  const canGoNextFromStep1 = useMemo(() =>
    selectedServices.length > 0 &&
    selectedServices.every(s => !s.requiresLengthSelection || !!s.largo),
    [selectedServices]
  );

  const servicesSummary = useMemo(() => {
    if (selectedServices.length === 0) return 'Ninguno';
    const names = selectedServices.map(s => s.name);
    const limit = 3;
    let summary = names.slice(0, limit).join(', ');
    if (names.length > limit) summary += ` +${names.length - limit} más`;
    return summary;
  }, [selectedServices]);

  // Early returns after all hooks — safe per Rules of Hooks
  if (status === 'loading') {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      return isSelected ? prev.filter(s => s.id !== service.id) : [...prev, { ...service, largo: undefined }];
    });
    setShowLengthError(false);
  };

  const handleLargoChange = (serviceId: string, largo: LargoPelo) => {
    setSelectedServices(prev => prev.map(s => s.id === serviceId ? { ...s, largo } : s));
    setShowLengthError(false);
  };

  const handleDateChange = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setOccupiedSlots([]);

    if (!date || !selectedStaff) return;

    setLoadingSlots(true);
    const isoDate = format(date, 'yyyy-MM-dd');
    const result = await getAvailableSlots(tenantId, selectedStaff.id, isoDate);
    setOccupiedSlots(result.occupiedSlots);
    setLoadingSlots(false);
  };

  const handleStaffSelect = (member: Staff) => {
    setSelectedStaff(member);
    if (selectedDate) {
      handleDateChange(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!selectedStaff || selectedServices.length === 0 || !selectedDate || !selectedTime) {
      toast({ title: "Faltan datos", description: "Completá todos los pasos.", variant: "destructive" });
      return;
    }

    if (!isAuthenticated) {
      if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
        toast({ title: "Datos requeridos", description: "Completá nombre, email y WhatsApp para continuar.", variant: "destructive" });
        return;
      }
    } else if (!isPhoneValid) {
      setPhoneTouched(true);
      toast({ title: "Teléfono requerido", description: "Por favor ingresá un número de WhatsApp válido.", variant: "destructive" });
      return;
    }

    const selectedServiceNames = selectedServices.map(s => {
      let name = s.name;
      if (typeof s.price === 'object' && s.largo) name += ` (${s.largo})`;
      return name;
    }).join(', ');

    startTransition(async () => {
      let appointmentId: string | undefined;

      if (!isAuthenticated) {
        // Guest booking — sin sesión
        const result = await createGuestBooking({
          tenantId,
          tenantSlug,
          staffId: selectedStaff.id,
          staffName: selectedStaff.name,
          serviceIds: selectedServices.map(s => s.id),
          serviceNames: selectedServiceNames,
          date: selectedDate.toISOString(),
          time: selectedTime,
          totalFrom,
          durationMinutes: totalDuration,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
        });

        if (!result.success) {
          toast({ title: "Error", description: result.error ?? 'No se pudo crear el turno.', variant: "destructive" });
          return;
        }
        appointmentId = result.appointmentId;
      } else {
        // Authenticated booking — flujo existente con MercadoPago
        const result = await createBooking({
          tenantId,
          staffId: selectedStaff.id,
          staffName: selectedStaff.name,
          serviceIds: selectedServices.map(s => s.id),
          serviceNames: selectedServiceNames,
          selectedServices: selectedServices.map(s => ({
            id: s.id,
            nombre: s.name,
            largo: s.largo,
            duracion: s.durationMinutes,
            precio: typeof s.price === 'number' ? s.price : undefined,
            precios: typeof s.price === 'object' ? { ...(s.price as ServicePriceByLength) } as Record<string, number> : undefined,
            preciosHasta: s.priceHasta ? { ...(s.priceHasta as ServicePriceByLength) } as Record<string, number> : undefined,
            requiereLargo: s.requiresLengthSelection,
            variable: s.variablePrice,
          })),
          date: selectedDate.toISOString(),
          time: selectedTime,
          totalFrom,
          totalTo,
          depositAmount,
          durationMinutes: totalDuration,
          clientPhone,
        });

        if (!result.success) {
          toast({ title: "Error", description: result.error ?? 'No se pudo crear el turno.', variant: "destructive" });
          return;
        }

        // MercadoPago seña — solo para usuarios autenticados
        if (depositAmount > 0 && result.appointmentId) {
          const mpResult = await createDepositPreference({
            appointmentId: result.appointmentId,
            tenantId,
            tenantSlug,
            depositAmount,
            serviceNames: selectedServiceNames,
          });

          if ('checkoutUrl' in mpResult) {
            window.location.href = mpResult.checkoutUrl;
            return;
          }
          if (!('error' in mpResult && mpResult.error === 'MP_NOT_CONFIGURED')) {
            toast({ title: "Advertencia", description: "No se pudo procesar el pago. El turno quedó reservado sin seña.", variant: "destructive" });
          }
        }
        appointmentId = result.appointmentId;
      }

      // Redirigir a página de confirmación con datos como query params
      const params = new URLSearchParams({
        service: selectedServiceNames,
        staff: selectedStaff.name,
        date: selectedDate.toISOString(),
        time: selectedTime,
        isGuest: String(!isAuthenticated),
        ...((!isAuthenticated) && {
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
        }),
      });
      router.push(`/salones/${tenantSlug}/book/confirmation/${appointmentId}?${params.toString()}`);
    });
  };

  const stepsInfo = [
    { id: 1, name: 'Tus servicios', icon: Scissors },
    { id: 2, name: 'Profesional', icon: Users },
    { id: 3, name: 'Fecha y hora', icon: CalendarIcon },
    { id: 4, name: 'Resumen', icon: CheckCircle },
  ];

  const currentStepConfig = stepsInfo.find(s => s.id === step);
  const clientName = isAuthenticated ? (session?.user?.name || 'Cliente') : (guestName || 'Invitada');

  return (
    <div className="space-y-6 mx-auto w-full">
      <div className="p-2 bg-muted rounded-full flex items-center justify-between shadow-inner">
        {stepsInfo.map(s => (
          <button
            key={s.id}
            onClick={() => { if (step > s.id) setStep(s.id) }}
            disabled={step < s.id}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300",
              step === s.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground",
              step > s.id && "hover:bg-primary/5"
            )}
          >
            <s.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{s.name}</span>
          </button>
        ))}
      </div>

      {step === 1 && (
        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle>Paso 1: Elige tus servicios</CardTitle>
            <CardDescription>Selecciona uno o más tratamientos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                const selectedData = selectedServices.find(s => s.id === service.id);
                return (
                  <div key={service.id} className="h-full">
                    <div
                      onClick={() => handleServiceToggle(service)}
                      className={cn(
                        "p-4 border rounded-xl cursor-pointer transition-all flex flex-col h-full",
                        isSelected ? "border-primary ring-2 ring-primary/20 shadow-lg bg-primary/5" : "hover:border-primary/50 dark:border-border/50 bg-background",
                      )}
                    >
                      <div className='flex justify-between items-start'>
                        <div className="flex-grow pr-2">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-semibold">{service.name}</h4>
                            {typeof service.price === 'object' && selectedData?.largo && isSelected ?
                              <p className="text-primary font-bold text-sm bg-background px-1.5 rounded-sm">≈ {formatPrice(getServicePrice(selectedData).from)}</p> :
                              typeof service.price === 'number' && <p className="text-primary font-bold text-sm">{formatPrice(service.price)}</p>
                            }
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(service.durationMinutes)}</span>
                          </div>
                        </div>
                        <Checkbox checked={isSelected} className="rounded-full h-5 w-5 pointer-events-none data-[state=checked]:bg-primary" />
                      </div>

                      <div className="mt-4 flex-grow flex flex-col justify-end">
                        {isSelected && service.requiresLengthSelection && (
                          <div className="mt-4 pt-4 border-t border-dashed border-border/60">
                            <div className="grid grid-cols-3 gap-2">
                              {(['corto', 'mediano', 'largo'] as LargoPelo[]).map(largo => (
                                <Button
                                  key={largo}
                                  variant={selectedData?.largo === largo ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLargoChange(service.id, largo)
                                  }}
                                  className="capitalize flex-col h-auto py-1 shadow-sm text-xs"
                                >
                                  {largo}
                                </Button>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center bg-background/50 rounded-md py-1">
                              Precio desde. Se confirma en el local.
                              <LengthPopoverTrigger />
                            </div>
                            {showLengthError && !selectedData?.largo && <p className="text-xs text-red-500 font-semibold text-center mt-2 animate-pulse">Elegí un largo para continuar.</p>}
                          </div>
                        )}
                        {isSelected && (
                          <div className="pt-3 text-center text-primary text-xs tracking-wider uppercase font-bold mt-auto flex items-center justify-center gap-1.5">
                            <CheckCircle className="h-4 w-4" /> Seleccionado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4 md:flex-row md:justify-between border-t bg-muted/20 p-6 rounded-b-2xl">
            {selectedServices.length > 0 ? (
              <div className='text-sm w-full space-y-1.5 bg-background p-4 rounded-xl shadow-sm border'>
                <p className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Total estimado:</span> <span className="font-bold text-base">{canGoNextFromStep1 ? (hasRange ? `${formatPrice(totalFrom)} - ${formatPrice(totalTo)}` : formatPrice(totalFrom)) : '--'}</span></p>
                <p className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Tiempo total:</span> <span>{canGoNextFromStep1 ? formatDuration(totalDuration) : '--'}</span></p>
                <p className="truncate text-muted-foreground text-xs"><span className="font-semibold">Items:</span> {servicesSummary}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1 italic">Estimación sujeta a diagnóstico en caja local.</p>
              </div>
            ) : (
              <div className='p-4 border border-dashed rounded-xl bg-muted/30 text-sm text-center text-muted-foreground w-full'>
                Aún no has seleccionado ningún servicio.
              </div>
            )}
            <div className='flex items-center justify-end w-full md:w-auto mt-2 md:mt-0'>
              <Button size="lg" className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow" onClick={() => { canGoNextFromStep1 ? setStep(2) : setShowLengthError(true) }} disabled={selectedServices.length === 0}> Continuar a Profesional </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle>Paso 2: Elige a tu profesional</CardTitle>
            <CardDescription>Nuestras expertas están listas para atenderte.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {staff.map(prof => (
              <div
                key={prof.id}
                role="button"
                tabIndex={0}
                aria-pressed={selectedStaff?.id === prof.id}
                onClick={() => handleStaffSelect(prof)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStaffSelect(prof); } }}
                className={cn("p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 text-center bg-background",
                  selectedStaff?.id === prof.id ? "border-primary ring-2 ring-primary/20 shadow-md bg-primary/5" : "hover:border-primary/50 dark:border-border/50"
                )}>
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted overflow-hidden flex items-center justify-center shadow-sm">
                  {prof.avatarUrl ? (
                     <Image src={prof.avatarUrl} alt={prof.name} fill className="object-cover object-top aspect-square" />
                  ) : <User className="h-8 w-8 text-muted-foreground/50"/>}
                </div>
                <div>
                  <h4 className="font-semibold text-sm line-clamp-1">{prof.name}</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{prof.role}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/20 p-6 rounded-b-2xl">
            <Button variant="outline" onClick={() => setStep(1)}>Volver a Servicios</Button>
            <Button onClick={() => setStep(3)} disabled={!selectedStaff}>Siguiente Paso</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle>Paso 3: Elige fecha y hora</CardTitle>
            <CardDescription>Selecciona el día de tu cita e infórmate de los horarios disponibles con {selectedStaff?.name.split(' ')[0]}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 md:p-6 items-center md:items-start px-4 py-2">
            <div className="flex justify-center w-full max-w-xs bg-muted/20 rounded-xl p-2 md:p-4 border shadow-inner">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || date.getDay() === 0}
                className="bg-transparent self-start"
                locale={es}
              />
            </div>
            <div className="bg-background rounded-xl p-4 flex-1 w-full border border-dashed text-center min-h-[300px] flex flex-col justify-center">
              {loadingSlots ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                  <p className="text-sm text-muted-foreground">Consultando disponibilidad en tiempo real...</p>
                </div>
              ) : !selectedDate ? (
                   <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 py-10"><CalendarIcon className="w-5 h-5 opacity-50"/>Toca un día en el calendario para ver los horarios disponibles.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto p-1.5 w-full styling-scrollbar items-start content-start">
                   {ALL_TIME_SLOTS.map(time => {
                     const isOccupied = occupiedSlots.includes(time);
                     return (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        disabled={isOccupied}
                        onClick={() => setSelectedTime(time)}
                        className={cn("h-10 text-xs shadow-sm transition-all", isOccupied && "opacity-30 cursor-not-allowed line-through bg-muted")}
                      >
                        {time} {selectedTime === time && "✓"}
                      </Button>
                     )
                   })}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/20 p-6 rounded-b-2xl">
            <Button variant="outline" onClick={() => setStep(2)}>Atrás</Button>
            <Button onClick={() => setStep(4)} disabled={!selectedDate || !selectedTime}>Ver Resumen Final</Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
       <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
       <CardHeader className="text-center md:text-left">
         <CardTitle className="text-2xl">Paso 4: Resumen y seña final</CardTitle>
         <CardDescription>Estás a un paso de confirmar tu cita mágicamente.</CardDescription>
       </CardHeader>
       <CardContent className="space-y-6 md:p-6 p-4">
         <div className="p-5 border dark:border-border/50 rounded-2xl bg-muted/50 dark:bg-muted/10 space-y-4 text-sm shadow-inner relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-2xl opacity-80" />
           <p className="flex items-center gap-3"><User className="h-4 w-4 text-primary shrink-0" /> <span className="text-muted-foreground min-w-[100px]">Clienta:</span> <span className="font-semibold">{clientName}</span></p>
           <p className="flex items-center gap-3"><Users className="h-4 w-4 text-primary shrink-0" /> <span className="text-muted-foreground min-w-[100px]">Profesional:</span> <span className="font-semibold">{selectedStaff?.name}</span></p>
           <p className="flex items-center gap-3"><CalendarIcon className="h-4 w-4 text-primary shrink-0" /> <span className="text-muted-foreground min-w-[100px]">Fecha:</span> <span className="font-semibold capitalize">{selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span></p>
           <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary shrink-0" /> <span className="text-muted-foreground min-w-[100px]">Horario:</span> <span className="font-semibold">{selectedTime} hs</span></p>
           <div className="border-t dark:border-border/50 py-4 mt-4 text-xs font-mono bg-background px-4 rounded-xl shadow-xs">
             <p className="flex justify-between uppercase tracking-wider text-muted-foreground/80 font-bold mb-3 border-b pb-2"><span>Tus Servicios Seleccionados</span> <span>Est. {formatDuration(totalDuration)}</span></p>
             <ul className="space-y-2">
               {selectedServices.map(s => <li key={s.id} className="flex justify-between items-center"><span className="text-foreground tracking-tight">{s.name}{s.largo ? ` (${s.largo})` : ''}</span></li>)}
             </ul>
           </div>
         </div>

          <div className="space-y-4">
            {/* ── Guest: datos de contacto ───────────────────────────── */}
            {!isAuthenticated && (
              <div className="space-y-3 border border-border rounded-xl p-4">
                <p className="text-sm font-medium">Tus datos de contacto</p>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="9 11 XXXX-XXXX"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-zinc-400 text-sm font-medium">Tu WhatsApp para la confirmación</label>
              <div className={cn(
                "flex items-center bg-zinc-900 border transition-all duration-300 rounded-xl overflow-hidden px-4 py-2",
                phoneTouched && !isPhoneValid ? "border-red-400/50 ring-1 ring-red-400/20" : 
                isPhoneValid ? "border-emerald-400/50 ring-1 ring-emerald-400/20" : "border-white/10"
              )}>
                <div className="flex items-center gap-2 pr-4 border-r border-white/10 text-zinc-500 font-medium select-none">
                  <img src="https://flagcdn.com/w20/ar.png" alt="AR" className="w-4 h-auto rounded-sm opacity-50" />
                  <span className="text-sm">+54</span>
                </div>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setClientPhone(val);
                    if (!phoneTouched) setPhoneTouched(true);
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="9 11 XXXX-XXXX"
                  className="bg-transparent flex-1 px-4 py-1 text-white placeholder:text-zinc-600 focus:outline-none font-inter"
                />
                <svg className={cn("w-5 h-5 transition-colors", isPhoneValid ? "text-emerald-400" : "text-zinc-700")} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="flex justify-between items-center">
                <p className={cn("text-xs transition-colors", isPhoneValid ? "text-emerald-400" : "text-zinc-500")}>
                  {(session?.user as any)?.phone && clientPhone === (session?.user as any)?.phone ? "Usamos el número de tu cuenta" : "Vas a recibir la confirmación por acá"}
                </p>
                {phoneTouched && !isPhoneValid && (
                  <p className="text-red-400 text-[10px] font-semibold animate-pulse">Tu número es necesario para confirmar</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
           <div className="p-8 border rounded-2xl text-center bg-gradient-to-br from-background to-muted/40 shadow-sm relative overflow-hidden">
             <div className="absolute top-3 right-3 opacity-10"><CheckCircle className="w-24 h-24"/></div>
             <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Seña para confirmar turno</p>
             <p className="text-5xl font-extrabold text-primary my-2 drop-shadow-sm">{formatPrice(depositAmount)}</p>
             <p className="text-xs text-muted-foreground/80 mt-4 max-w-sm mx-auto leading-relaxed">El remanente estimado de <span className="font-semibold text-foreground">{hasRange ? `${formatPrice(totalFrom)} - ${formatPrice(totalTo)}` : formatPrice(totalFrom)}</span> se abona directo en el salón. Valores sujetos al diagnóstico en persona de {selectedStaff?.name.split(' ')[0]}.</p>
           </div>
           <div className="items-top flex space-x-3 p-4 bg-muted/20 border rounded-xl hover:bg-muted/30 transition-colors">
             <Checkbox id="terms1" checked={finalConfirmation} onCheckedChange={(checked) => setFinalConfirmation(checked as boolean)} className="mt-0.5 data-[state=checked]:bg-primary"/>
             <div className="grid gap-1.5 leading-none">
               <label
                 htmlFor="terms1"
                 className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground cursor-pointer"
               >
                 Confirmo que mi cabello actual coincide cercanamente con el <span className="text-foreground font-semibold">largo declarado</span>, previniendo sorpresas de cobro adicional o carencia de tiempo técnico disponible hoy.
               </label>
             </div>
           </div>
         </div>
       </CardContent>
       <CardFooter className="flex flex-col sm:flex-row justify-between border-t bg-muted/10 p-4 sm:p-6 rounded-b-2xl gap-3">
         <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(3)}>Modificar Detalles</Button>
         <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow text-base tracking-wide" onClick={handleSubmit} disabled={isPending || !finalConfirmation}>
           {isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Confirmar Cita Exacta'}
         </Button>
       </CardFooter>
     </Card>
      )}
    </div>
  );
}
