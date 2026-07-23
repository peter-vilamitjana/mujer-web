'use client';

import { useState, useMemo, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
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
import { ALL_TIME_SLOTS } from '@/lib/time-slots';
import { createGuestBooking } from '@/actions/guest-booking.actions';
import { createDepositPreference } from '@/actions/mercadopago.actions';
import type { Service, Staff, ServicePriceByLength } from '@/lib/schema';
type LargoPelo = keyof ServicePriceByLength;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Feedback táctil de un tap — se salta solo si el usuario prefiere menos movimiento.
const pulsePress = (el: HTMLElement | null) => {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.fromTo(el, { scale: 1 }, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' });
};

const MONTO_SEÑA_PORCENTAJE = 0.15;

interface Props {
  tenantId: string;
  tenantSlug: string;
  services: Service[];
  staff: Staff[];
  isAuthenticated: boolean;
}

type SelectedServiceWithLargo = Service & { largo?: LargoPelo };

const LengthPopoverContent = () => (
  <PopoverContent className="w-64 bg-surface-card border-outline-subtle font-sans text-sm" onClick={(e) => e.stopPropagation()}>
    <h4 className="font-bold text-on-surface mb-2">Cómo definimos el largo</h4>
    <ul className="list-disc list-inside space-y-1 text-on-surface-secondary">
      <li><span className="font-semibold text-on-surface">Corto:</span> hasta el mentón</li>
      <li><span className="font-semibold text-on-surface">Mediano:</span> hasta los hombros</li>
      <li><span className="font-semibold text-on-surface">Largo:</span> por debajo de los hombros</li>
    </ul>
    <p className="mt-4 text-xs text-on-surface-secondary">
      <span className="font-bold">Nota:</span> El precio mostrado es a partir de según diagnóstico al llegar.
    </p>
  </PopoverContent>
);

const LengthPopoverTrigger = ({ asChild = false }: { asChild?: boolean }) => (
  <Popover>
    <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
      {asChild ? (
        <button className="font-sans text-xs text-on-surface-secondary underline hover:text-primary">
          Ver cómo definimos el largo
        </button>
      ) : (
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 hover:bg-surface-hover h-4 w-4 text-on-surface-secondary ml-1"
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
  const posthog = usePostHog();

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

  const getServiceImage = (service: Service): string => {
    if (service.image) return service.image;
    const lower = (service.name || '').toLowerCase();
    if (lower.includes('alisad') || lower.includes('lacio') || lower.includes('desriz')) return '/images/services/alisado.png';
    if (lower.includes('balayage') || lower.includes('mecha') || lower.includes('reflejo') || lower.includes('ilumin')) return '/images/services/balayage.png';
    if (lower.includes('color') || lower.includes('tint') || lower.includes('tono') || lower.includes('raiz') || lower.includes('raíz')) return '/images/services/coloracion.png';
    if (lower.includes('corte') || lower.includes('flequillo') || lower.includes('peinado') || lower.includes('brashing') || lower.includes('brushing')) return '/images/services/corte.png';
    if (lower.includes('keratin') || lower.includes('botox') || lower.includes('bótox') || lower.includes('baño') || lower.includes('bano') || lower.includes('crema') || lower.includes('tratamiento') || lower.includes('lavado') || lower.includes('nutric')) return '/images/services/keratina.png';
    if (lower.includes('permanente') || lower.includes('ond')) return '/images/services/permanente.png';
    return '/hero-salon.png';
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

  const stepContentRef = useRef<HTMLDivElement>(null);
  const stepIndicatorRef = useRef<HTMLDivElement>(null);
  const slotsContainerRef = useRef<HTMLDivElement>(null);

  // Transición entre pasos: la card entrante hace un fade+slide corto en vez
  // de aparecer de golpe con el salto seco del re-render condicional.
  useGSAP(() => {
    if (!stepContentRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        stepContentRef.current,
        { autoAlpha: 0, x: 16 },
        { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' }
      );
    });
    return () => mm.revert();
  }, [step]);

  // Pill que se desliza detrás del paso activo del stepper — antes el único
  // feedback de progreso era un cambio de color, ahora hay un movimiento que
  // comunica "avanzaste" en vez de "cambió un color".
  useGSAP(() => {
    if (!stepIndicatorRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(stepIndicatorRef.current, { xPercent: (step - 1) * 100, duration: 0.4, ease: 'power2.out' });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(stepIndicatorRef.current, { xPercent: (step - 1) * 100 });
    });
    return () => mm.revert();
  }, [step]);

  // Horarios disponibles: entran en cascada apenas resuelve la consulta de
  // disponibilidad, en vez de aparecer todos de golpe.
  useGSAP(() => {
    if (loadingSlots || !selectedDate || !slotsContainerRef.current) return;
    const buttons = slotsContainerRef.current.querySelectorAll('button');
    if (buttons.length === 0) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(buttons, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.02, ease: 'power2.out' });
    });
    return () => mm.revert();
  }, [loadingSlots, selectedDate, occupiedSlots]);

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
          date: format(selectedDate, 'yyyy-MM-dd'),
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
          date: format(selectedDate, 'yyyy-MM-dd'),
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
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        isGuest: String(!isAuthenticated),
        ...((!isAuthenticated) && {
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
        }),
      });
      posthog?.capture('booking_confirmed', {
        tenant_slug: tenantSlug,
        is_guest: !isAuthenticated,
        services_count: selectedServices.length,
        has_deposit: depositAmount > 0,
      });
      router.push(`/salones/${tenantSlug}/turnos/confirmation/${appointmentId}?${params.toString()}`);
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
      <div className="relative p-2 bg-surface-card border border-outline-subtle rounded-full flex items-center justify-between">
        <div
          ref={stepIndicatorRef}
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-2 rounded-full bg-primary"
          style={{ width: 'calc((100% - 16px) / 4)' }}
        />
        {stepsInfo.map(s => (
          <button
            key={s.id}
            onClick={() => { if (step > s.id) setStep(s.id) }}
            disabled={step < s.id}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-full font-sans text-xs sm:text-sm font-semibold transition-colors duration-300",
              step === s.id ? "text-surface" : step > s.id ? "text-primary" : "text-on-surface-variant",
              step > s.id && "hover:bg-primary/10"
            )}
          >
            <s.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{s.name}</span>
          </button>
        ))}
      </div>

      <div ref={stepContentRef}>
      {step === 1 && (
        <Card className="rounded-[1.5rem] border border-outline-subtle bg-surface-card text-on-surface shadow-none">
          <CardHeader>
            <CardTitle className="font-vogue text-2xl text-on-surface">Paso 1: Elige tus servicios</CardTitle>
            <CardDescription className="font-sans text-on-surface-secondary">Selecciona uno o más tratamientos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                const selectedData = selectedServices.find(s => s.id === service.id);
                const serviceImg = getServiceImage(service);

                return (
                  <div key={service.id} className="h-full">
                    <div
                      onClick={(e) => { pulsePress(e.currentTarget); handleServiceToggle(service); }}
                      className={cn(
                        "relative overflow-hidden p-6 border rounded-[1.5rem] cursor-pointer transition-all duration-300 flex flex-col h-full group",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(241,201,125,0.12)]"
                          : "border-outline-subtle hover:border-primary/50 bg-surface hover:bg-surface-hover"
                      )}
                    >
                      {/* Imagen de fondo de costado faded */}
                      {serviceImg && (
                        <div className="absolute right-0 top-0 bottom-0 w-7/12 pointer-events-none overflow-hidden rounded-r-[1.5rem] z-0">
                          <img
                            src={serviceImg}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover object-center opacity-25 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                          />
                          {/* Gradientes de desvanecido hacia el fondo del card */}
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-r via-transparent to-transparent transition-colors duration-300",
                            isSelected
                              ? "from-[#181611] via-[#181611]/80"
                              : "from-surface via-surface/85 group-hover:from-surface-hover group-hover:via-surface-hover/85"
                          )} />
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-90 transition-colors duration-300",
                            isSelected
                              ? "from-[#181611]"
                              : "from-surface group-hover:from-surface-hover"
                          )} />
                        </div>
                      )}

                      {/* Contenido interactivo en capa superior */}
                      <div className="relative z-10 flex flex-col h-full flex-grow">
                        <div className='flex justify-between items-start'>
                          <div className="flex-grow pr-2">
                            <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-vogue text-on-surface text-lg font-bold">{service.name}</h4>
                              {typeof service.price === 'object' && selectedData?.largo && isSelected ?
                                <p className="font-sans text-primary font-bold text-sm bg-surface/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-primary/20">≈ {formatPrice(getServicePrice(selectedData).from)}</p> :
                                typeof service.price === 'number' && <p className="font-sans text-primary font-bold text-sm bg-surface/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-outline-subtle">{formatPrice(service.price)}</p>
                              }
                            </div>
                            <div className="font-sans text-xs text-on-surface-secondary flex items-center gap-1.5 mt-1">
                              <Clock className="h-3 w-3 text-primary" />
                              <span>{formatDuration(service.durationMinutes)}</span>
                            </div>
                          </div>
                          <Checkbox checked={isSelected} className="rounded-full h-5 w-5 pointer-events-none data-[state=checked]:bg-primary shrink-0 ml-2" />
                        </div>

                        <div className="mt-4 flex-grow flex flex-col justify-end">
                          {isSelected && service.requiresLengthSelection && (
                            <div className="mt-4 pt-4 border-t border-dashed border-outline-subtle">
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
                                    className={cn(
                                      "capitalize flex-col h-auto py-1 font-sans text-xs",
                                      selectedData?.largo === largo
                                        ? "bg-primary text-surface hover:bg-primary-dark"
                                        : "border-outline-subtle text-on-surface hover:bg-surface-hover"
                                    )}
                                  >
                                    {largo}
                                  </Button>
                                ))}
                              </div>
                              <div className="font-sans text-xs text-on-surface-secondary text-center mt-3 flex items-center justify-center bg-surface/90 backdrop-blur-sm rounded-full py-1">
                                Precio desde. Se confirma en el local.
                                <LengthPopoverTrigger />
                              </div>
                              {showLengthError && !selectedData?.largo && <p className="font-sans text-xs text-danger font-semibold text-center mt-2 animate-pulse">Elegí un largo para continuar.</p>}
                            </div>
                          )}
                          {isSelected && (
                            <div className="pt-3 text-center text-primary text-xs tracking-wider uppercase font-sans font-bold mt-auto flex items-center justify-center gap-1.5">
                              <CheckCircle className="h-4 w-4" /> Seleccionado
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4 md:flex-row md:justify-between border-t border-outline-subtle bg-surface p-6 rounded-b-[1.5rem]">
            {selectedServices.length > 0 ? (
              <div className='font-sans text-sm w-full space-y-1.5 bg-surface-card p-4 rounded-[1.5rem] border border-outline-subtle'>
                <p className="flex justify-between items-center"><span className="font-semibold text-on-surface-secondary">Total estimado:</span> <span className="font-bold text-base text-on-surface">{canGoNextFromStep1 ? (hasRange ? `${formatPrice(totalFrom)} - ${formatPrice(totalTo)}` : formatPrice(totalFrom)) : '--'}</span></p>
                <p className="flex justify-between items-center"><span className="font-semibold text-on-surface-secondary">Tiempo total:</span> <span className="text-on-surface">{canGoNextFromStep1 ? formatDuration(totalDuration) : '--'}</span></p>
                <p className="truncate text-on-surface-secondary text-xs"><span className="font-semibold">Items:</span> {servicesSummary}</p>
                <p className="text-[10px] text-on-surface-variant mt-1 italic">Estimación sujeta a diagnóstico en caja local.</p>
              </div>
            ) : (
              <div className='p-4 border border-dashed border-outline-subtle rounded-[1.5rem] bg-surface-card font-sans text-sm text-center text-on-surface-secondary w-full'>
                Aún no has seleccionado ningún servicio.
              </div>
            )}
            <div className='flex items-center justify-end w-full md:w-auto mt-2 md:mt-0'>
              <Button size="lg" className="w-full md:w-auto bg-primary text-surface hover:bg-primary-dark rounded-full font-sans uppercase tracking-widest text-xs font-semibold shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 active:scale-95" onClick={() => { if (canGoNextFromStep1) { posthog?.capture('booking_step_completed', { step: 1, step_name: 'services', tenant_slug: tenantSlug, services_count: selectedServices.length }); setStep(2); } else { setShowLengthError(true); } }} disabled={selectedServices.length === 0}> Continuar a Profesional </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="rounded-[1.5rem] border border-outline-subtle bg-surface-card text-on-surface shadow-none">
          <CardHeader>
            <CardTitle className="font-vogue text-2xl text-on-surface">Paso 2: Elige a tu profesional</CardTitle>
            <CardDescription className="font-sans text-on-surface-secondary">Nuestras expertas están listas para atenderte.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {staff.map(prof => (
              <div
                key={prof.id}
                role="button"
                tabIndex={0}
                aria-pressed={selectedStaff?.id === prof.id}
                onClick={(e) => { pulsePress(e.currentTarget); handleStaffSelect(prof); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStaffSelect(prof); } }}
                className={cn("p-3 border rounded-[1.5rem] cursor-pointer transition-colors flex flex-col items-center gap-3 text-center bg-surface",
                  selectedStaff?.id === prof.id ? "border-primary bg-primary/5" : "border-outline-subtle hover:border-primary/50"
                )}>
                <div className="relative w-full aspect-[3/4] rounded-xl bg-surface-hover overflow-hidden flex items-center justify-center border border-outline-subtle">
                  {prof.avatarUrl ? (
                     <Image src={prof.avatarUrl} alt={prof.name} fill className="object-cover" />
                  ) : <User className="h-8 w-8 text-on-surface-variant"/>}
                </div>
                <div>
                  <h4 className="font-vogue text-on-surface text-sm line-clamp-1">{prof.name}</h4>
                  <p className="font-sans text-[10px] sm:text-xs text-primary uppercase tracking-wider">{prof.role}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-outline-subtle bg-surface p-6 rounded-b-[1.5rem]">
            <Button variant="outline" className="rounded-full border-outline-subtle text-on-surface hover:bg-surface-hover font-sans" onClick={() => setStep(1)}>Volver a Servicios</Button>
            <Button className="rounded-full bg-primary text-surface hover:bg-primary-dark font-sans uppercase tracking-widest text-xs font-semibold shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 active:scale-95" onClick={() => { posthog?.capture('booking_step_completed', { step: 2, step_name: 'staff', tenant_slug: tenantSlug, staff_id: selectedStaff?.id }); setStep(3); }} disabled={!selectedStaff}>Siguiente Paso</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="rounded-[1.5rem] border border-outline-subtle bg-surface-card text-on-surface shadow-none">
          <CardHeader>
            <CardTitle className="font-vogue text-2xl text-on-surface">Paso 3: Elige fecha y hora</CardTitle>
            <CardDescription className="font-sans text-on-surface-secondary">Selecciona el día de tu cita e infórmate de los horarios disponibles con {selectedStaff?.name.split(' ')[0]}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 md:p-6 items-center md:items-start px-4 py-2">
            <div className="flex justify-center w-full max-w-xs bg-surface rounded-[1.5rem] p-2 md:p-4 border border-outline-subtle">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || date.getDay() === 0}
                className="bg-transparent self-start"
                locale={es}
              />
            </div>
            <div className="bg-surface rounded-[1.5rem] p-4 flex-1 w-full border border-dashed border-outline-subtle text-center min-h-[300px] flex flex-col justify-center">
              {loadingSlots ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                  <p className="font-sans text-sm text-on-surface-secondary">Consultando disponibilidad en tiempo real...</p>
                </div>
              ) : !selectedDate ? (
                   <p className="font-sans text-on-surface-secondary text-sm flex items-center justify-center gap-2 py-10"><CalendarIcon className="w-5 h-5 opacity-50"/>Toca un día en el calendario para ver los horarios disponibles.</p>
              ) : (
                <div ref={slotsContainerRef} className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto p-1.5 w-full styling-scrollbar items-start content-start">
                   {ALL_TIME_SLOTS.map(time => {
                     const isOccupied = occupiedSlots.includes(time);
                     const isSelected = selectedTime === time;
                     return (
                      <Button
                        key={time}
                        disabled={isOccupied}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "h-10 rounded-xl font-sans text-xs transition-colors",
                          isSelected
                            ? "bg-primary text-surface hover:bg-primary-dark"
                            : "border border-outline-subtle bg-surface-card text-on-surface hover:bg-surface-hover",
                          isOccupied && "opacity-30 cursor-not-allowed line-through bg-surface-hover"
                        )}
                      >
                        {time} {isSelected && <CheckCircle className="h-3 w-3 ml-1" />}
                      </Button>
                     )
                   })}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-outline-subtle bg-surface p-6 rounded-b-[1.5rem]">
            <Button variant="outline" className="rounded-full border-outline-subtle text-on-surface hover:bg-surface-hover font-sans" onClick={() => setStep(2)}>Atrás</Button>
            <Button className="rounded-full bg-primary text-surface hover:bg-primary-dark font-sans uppercase tracking-widest text-xs font-semibold shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 active:scale-95" onClick={() => { posthog?.capture('booking_step_completed', { step: 3, step_name: 'datetime', tenant_slug: tenantSlug }); setStep(4); }} disabled={!selectedDate || !selectedTime}>Ver Resumen Final</Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
       <Card className="rounded-[1.5rem] border border-outline-subtle bg-surface-card text-on-surface shadow-none">
       <CardHeader className="text-center md:text-left">
         <CardTitle className="font-vogue text-2xl text-on-surface">Paso 4: Resumen y seña final</CardTitle>
         <CardDescription className="font-sans text-on-surface-secondary">Estás a un paso de confirmar tu cita mágicamente.</CardDescription>
       </CardHeader>
       <CardContent className="space-y-6 md:p-6 p-4">
         <div className="p-8 border border-outline-subtle rounded-[1.5rem] bg-surface space-y-4 font-sans text-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-[1.5rem] opacity-80" />
           <p className="flex items-center gap-3"><User className="h-4 w-4 text-primary shrink-0" /> <span className="text-on-surface-secondary min-w-[100px]">Clienta:</span> <span className="font-semibold text-on-surface">{clientName}</span></p>
           <p className="flex items-center gap-3"><Users className="h-4 w-4 text-primary shrink-0" /> <span className="text-on-surface-secondary min-w-[100px]">Profesional:</span> <span className="font-semibold text-on-surface">{selectedStaff?.name}</span></p>
           <p className="flex items-center gap-3"><CalendarIcon className="h-4 w-4 text-primary shrink-0" /> <span className="text-on-surface-secondary min-w-[100px]">Fecha:</span> <span className="font-semibold capitalize text-on-surface">{selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span></p>
           <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary shrink-0" /> <span className="text-on-surface-secondary min-w-[100px]">Horario:</span> <span className="font-semibold text-on-surface">{selectedTime} hs</span></p>
           <div className="border-t border-outline-subtle py-4 mt-4 text-xs font-mono bg-surface-card px-4 rounded-[1.5rem]">
             <p className="flex justify-between uppercase tracking-wider text-on-surface-variant font-bold mb-3 border-b border-outline-subtle pb-2"><span>Tus Servicios Seleccionados</span> <span>Est. {formatDuration(totalDuration)}</span></p>
             <ul className="space-y-2">
               {selectedServices.map(s => <li key={s.id} className="flex justify-between items-center"><span className="text-on-surface tracking-tight">{s.name}{s.largo ? ` (${s.largo})` : ''}</span></li>)}
             </ul>
           </div>
         </div>

          <div className="space-y-4 max-w-md mx-auto">
            {/* ── Guest: datos de contacto ───────────────────────────── */}
            {!isAuthenticated && (
              <div className="space-y-3 border border-outline-subtle rounded-[1.5rem] p-6">
                <p className="font-sans text-sm font-medium text-on-surface">Tus datos de contacto</p>
                <div>
                  <label className="font-sans text-xs text-on-surface-secondary mb-1.5 block">Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 font-sans text-sm bg-surface text-on-surface placeholder:text-on-surface-variant border border-outline-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs text-on-surface-secondary mb-1.5 block">Email</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 font-sans text-sm bg-surface text-on-surface placeholder:text-on-surface-variant border border-outline-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs text-on-surface-secondary mb-1.5 block">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="9 11 XXXX-XXXX"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 font-sans text-sm bg-surface text-on-surface placeholder:text-on-surface-variant border border-outline-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="font-sans text-on-surface-secondary text-sm font-medium">Tu WhatsApp para la confirmación</label>
              <div className={cn(
                "flex items-center bg-surface border transition-colors duration-300 rounded-xl overflow-hidden px-4 py-2",
                phoneTouched && !isPhoneValid ? "border-danger/50 ring-1 ring-danger/20" :
                isPhoneValid ? "border-success/50 ring-1 ring-success/20" : "border-outline-subtle"
              )}>
                <div className="flex items-center gap-2 pr-4 border-r border-outline-subtle text-on-surface-variant font-medium select-none">
                  <img src="https://flagcdn.com/w20/ar.png" alt="AR" className="w-4 h-auto rounded-sm opacity-50" />
                  <span className="font-sans text-sm">+54</span>
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
                  className="bg-transparent flex-1 px-4 py-1 font-sans text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                />
                <svg className={cn("w-5 h-5 transition-colors", isPhoneValid ? "text-success" : "text-on-surface-variant")} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="flex justify-between items-center">
                <p className={cn("font-sans text-xs transition-colors", isPhoneValid ? "text-success" : "text-on-surface-variant")}>
                  {(session?.user as any)?.phone && clientPhone === (session?.user as any)?.phone ? "Usamos el número de tu cuenta" : "Vas a recibir la confirmación por acá"}
                </p>
                {phoneTouched && !isPhoneValid && (
                  <p className="font-sans text-danger text-[10px] font-semibold animate-pulse">Tu número es necesario para confirmar</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
           <div className="p-8 border border-outline-subtle rounded-[1.5rem] text-center bg-surface relative overflow-hidden">
             <div className="absolute top-3 right-3 opacity-10"><CheckCircle className="w-24 h-24 text-primary"/></div>
             <p className="font-sans text-sm font-semibold text-on-surface-secondary uppercase tracking-widest mb-1">Seña para confirmar turno</p>
             <p className="font-vogue text-5xl text-primary my-2">{formatPrice(depositAmount)}</p>
             <p className="font-sans text-xs text-on-surface-secondary mt-4 max-w-sm mx-auto leading-relaxed">El remanente estimado de <span className="font-semibold text-on-surface">{hasRange ? `${formatPrice(totalFrom)} - ${formatPrice(totalTo)}` : formatPrice(totalFrom)}</span> se abona directo en el salón. Valores sujetos al diagnóstico en persona de {selectedStaff?.name.split(' ')[0]}.</p>
           </div>
           <div className="items-top flex space-x-3 p-4 bg-surface border border-outline-subtle rounded-[1.5rem] hover:bg-surface-hover transition-colors">
             <Checkbox id="terms1" checked={finalConfirmation} onCheckedChange={(checked) => setFinalConfirmation(checked as boolean)} className="mt-0.5 data-[state=checked]:bg-primary"/>
             <div className="grid gap-1.5 leading-none">
               <label
                 htmlFor="terms1"
                 className="font-sans text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-on-surface-secondary"
               >
                 Confirmo que mi cabello actual coincide cercanamente con el <span className="text-on-surface font-semibold">largo declarado</span>, previniendo sorpresas de cobro adicional o carencia de tiempo técnico disponible hoy.
               </label>
             </div>
           </div>
         </div>
       </CardContent>
       <CardFooter className="flex flex-col sm:flex-row justify-between border-t border-outline-subtle bg-surface p-4 sm:p-6 rounded-b-[1.5rem] gap-3">
         <Button variant="outline" className="w-full sm:w-auto rounded-full border-outline-subtle text-on-surface hover:bg-surface-hover font-sans" onClick={() => setStep(3)}>Modificar Detalles</Button>
         <Button size="lg" className="w-full sm:w-auto rounded-full bg-primary text-surface hover:bg-primary-dark font-sans uppercase tracking-widest text-xs font-semibold shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 active:scale-95" onClick={handleSubmit} disabled={isPending || !finalConfirmation}>
           {isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Confirmar Cita Exacta'}
         </Button>
       </CardFooter>
     </Card>
      )}
      </div>
    </div>
  );
}
