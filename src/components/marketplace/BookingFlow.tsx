'use client';

import { useState, useMemo, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Calendar as CalendarIcon, Clock, User, Scissors, Users, CheckCircle, Info, Sparkles } from 'lucide-react';
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
        <button className="font-sans text-xs text-on-surface-secondary underline hover:text-primary cursor-pointer outline-none">
          Ver cómo definimos el largo
        </button>
      ) : (
        <button
          className="inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:outline-none hover:bg-white/10 h-4 w-4 text-primary/80 shrink-0 cursor-pointer outline-none"
          aria-label="Información sobre largo"
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
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

  const getFormattedPriceBadge = (service: Service, isSelected: boolean, selectedData?: SelectedServiceWithLargo): string => {
    if (typeof service.price === 'number') {
      return formatPrice(service.price);
    }
    if (typeof service.price === 'object') {
      const priceObj = service.price as ServicePriceByLength;
      if (isSelected && selectedData?.largo && priceObj[selectedData.largo]) {
        return `≈ ${formatPrice(priceObj[selectedData.largo])}`;
      }
      if (priceObj.corto) {
        return `Desde ${formatPrice(priceObj.corto)}`;
      }
    }
    return '';
  };

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
  const clientName = isAuthenticated ? (session?.user?.name || session?.user?.email?.split('@')[0] || session?.user?.email || 'Usuario') : (guestName || 'Invitada');

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
        <Card className="rounded-[2.5rem] border border-outline-subtle bg-surface-card text-on-surface shadow-none overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="font-outfit text-2xl font-bold tracking-tight text-on-surface">Paso 1: Elige tus servicios</CardTitle>
            <CardDescription className="font-sans text-xs text-on-surface-secondary/80">Selecciona uno o más tratamientos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                const selectedData = selectedServices.find(s => s.id === service.id);
                const serviceImg = getServiceImage(service);
                const priceBadge = getFormattedPriceBadge(service, isSelected, selectedData);

                return (
                  <div key={service.id} className="h-full">
                    <div
                      onClick={(e) => { pulsePress(e.currentTarget); handleServiceToggle(service); }}
                      className={cn(
                        "relative overflow-hidden p-5 sm:p-6 border rounded-[1.5rem] cursor-pointer transition-all duration-300 flex flex-col h-full group select-none",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(241,201,125,0.12)]"
                          : "border-outline-subtle hover:border-primary/50 bg-surface hover:bg-surface-hover"
                      )}
                    >
                      {/* Imagen de fondo de costado faded sin bordes duros */}
                      {serviceImg && (
                        <div
                          className="absolute right-0 top-0 bottom-0 w-3/4 pointer-events-none overflow-hidden rounded-[1.5rem] z-0"
                          style={{
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.85) 65%, black 100%)',
                            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.85) 65%, black 100%)',
                          }}
                        >
                          <img
                            src={serviceImg}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500"
                          />
                        </div>
                      )}

                      {/* Contenido interactivo en capa superior */}
                      <div className="relative z-10 flex flex-col h-full flex-grow">

                        {/* Top Header: Nombre + Duración + Precio + Checkbox con simetría perfecta */}
                        <div className="flex items-start justify-between gap-2.5 min-h-[3.25rem]">
                          <div className="flex-1 min-w-0 pr-1">
                            <h4 className="font-outfit text-on-surface text-lg font-bold leading-tight tracking-tight">
                              {service.name}
                            </h4>
                            <div className="font-sans text-xs text-on-surface-secondary flex items-center gap-1.5 mt-1.5">
                              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>{formatDuration(service.durationMinutes)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 pt-0.5">
                            {priceBadge && (
                              <span className="whitespace-nowrap font-sans text-primary font-bold text-xs bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-primary/30 shadow-sm select-none">
                                {priceBadge}
                              </span>
                            )}
                            <Checkbox checked={isSelected} className="rounded-full h-5 w-5 pointer-events-none data-[state=checked]:bg-primary shrink-0" />
                          </div>
                        </div>

                        {/* Sección inferior y selección de largo */}
                        <div className="mt-4 flex-grow flex flex-col justify-end">
                          {isSelected && service.requiresLengthSelection && (
                            <div className="mt-4 pt-4 border-t border-dashed border-outline-subtle/70 space-y-3">
                              <div className="text-[10px] font-sans uppercase tracking-[0.15em] font-semibold text-primary/80 flex items-center justify-between">
                                <span>Largo del cabello</span>
                              </div>

                              {/* Segment Control Frosted Glass */}
                              <div className="p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 grid grid-cols-3 gap-1 shadow-inner">
                                {(['corto', 'mediano', 'largo'] as LargoPelo[]).map(largo => {
                                  const active = selectedData?.largo === largo;
                                  return (
                                    <button
                                      key={largo}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleLargoChange(service.id, largo);
                                      }}
                                      className={cn(
                                        "py-1.5 px-2 rounded-full font-sans text-xs capitalize transition-all duration-300 font-medium cursor-pointer text-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none",
                                        active
                                          ? "bg-primary text-surface font-bold shadow-[0_0_15px_rgba(241,201,125,0.4)] scale-[1.02]"
                                          : "text-on-surface-secondary hover:text-on-surface hover:bg-white/10"
                                      )}
                                    >
                                      {largo}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Pill Informativo Frosted Glass sin desbordes */}
                              <div className="font-sans text-[10px] sm:text-[10.5px] leading-tight text-on-surface-secondary/90 flex items-center justify-between gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full py-1.5 px-3.5 select-none w-full max-w-full overflow-hidden">
                                <span className="truncate">Precio desde. Se confirma en el local.</span>
                                <LengthPopoverTrigger />
                              </div>
                              {showLengthError && !selectedData?.largo && (
                                <p className="font-sans text-xs text-danger font-semibold text-center animate-pulse">
                                  Elegí un largo para continuar.
                                </p>
                              )}
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
        <Card className="rounded-[2.5rem] border border-outline-subtle bg-surface-card text-on-surface shadow-none overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="font-outfit text-2xl font-bold tracking-tight text-on-surface">Paso 2: Elige a tu profesional</CardTitle>
            <CardDescription className="font-sans text-xs text-on-surface-secondary/80">Nuestras expertas están listas para atenderte.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {staff.map(prof => {
                const isSelected = selectedStaff?.id === prof.id;
                return (
                  <div
                    key={prof.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={(e) => { pulsePress(e.currentTarget); handleStaffSelect(prof); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStaffSelect(prof); } }}
                    className={cn(
                      "relative overflow-hidden p-4 sm:p-5 rounded-[2rem] cursor-pointer transition-all duration-300 flex flex-col items-center gap-3 text-center group select-none",
                      isSelected
                        ? "border-2 border-primary bg-primary/10 shadow-[0_0_30px_rgba(241,201,125,0.25)] scale-[1.02]"
                        : "border border-white/10 hover:border-primary/40 bg-black/40 hover:bg-black/60 backdrop-blur-xl"
                    )}
                  >
                    {/* Badge de Selección con Checkmark estilo Apple */}
                    <div className={cn(
                      "absolute top-3 right-3 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                      isSelected
                        ? "bg-primary text-surface shadow-md scale-100"
                        : "bg-black/40 border border-white/20 text-transparent opacity-0 group-hover:opacity-100 scale-90"
                    )}>
                      <CheckCircle className="w-4 h-4 fill-current" />
                    </div>

                    {/* Marco de Foto Retrato (Aspecto 4/5 Redondeado) */}
                    <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-black/60 border border-white/10 shadow-inner transition-all duration-300">
                      {prof.avatarUrl ? (
                        <Image
                          src={prof.avatarUrl}
                          alt={prof.name}
                          fill
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <User className="h-10 w-10 text-on-surface-secondary/60" />
                        </div>
                      )}
                      {/* Gradiente sutil de viñeta en la base de la imagen */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Nombre y Rol con Tipografía Apple OS */}
                    <div className="space-y-1 w-full px-1">
                      <h4 className="font-outfit text-on-surface text-base font-semibold tracking-tight truncate">
                        {prof.name}
                      </h4>
                      <span className="inline-block font-sans text-[10px] uppercase tracking-[0.18em] font-semibold text-primary/90 bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                        {prof.role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-outline-subtle bg-surface p-6 rounded-b-[2.5rem]">
            <Button variant="outline" className="rounded-full border-white/10 text-on-surface hover:bg-white/10 font-sans text-xs" onClick={() => setStep(1)}>Volver a Servicios</Button>
            <Button className="rounded-full bg-primary text-surface hover:bg-primary-dark font-sans uppercase tracking-widest text-xs font-semibold shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 active:scale-95" onClick={() => { posthog?.capture('booking_step_completed', { step: 2, step_name: 'staff', tenant_slug: tenantSlug, staff_id: selectedStaff?.id }); setStep(3); }} disabled={!selectedStaff}>Siguiente Paso</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="rounded-[2.5rem] border border-outline-subtle bg-surface-card text-on-surface shadow-none overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="font-outfit text-2xl font-bold tracking-tight text-on-surface">Paso 3: Elige fecha y hora</CardTitle>
            <CardDescription className="font-sans text-xs text-on-surface-secondary/80">Selecciona el día de tu cita e infórmate de los horarios disponibles con {selectedStaff?.name.split(' ')[0]}.</CardDescription>
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
       <Card className="rounded-[2.5rem] border border-outline-subtle bg-surface-card text-on-surface shadow-none overflow-hidden">
       <CardHeader className="text-center md:text-left pb-4">
         <CardTitle className="font-outfit text-2xl font-bold tracking-tight text-on-surface">Paso 4: Resumen y seña final</CardTitle>
         <CardDescription className="font-sans text-xs text-on-surface-secondary/80">Estás a un paso de confirmar tu cita de forma simple y segura.</CardDescription>
       </CardHeader>
       <CardContent className="space-y-6 md:p-6 p-4">
         
         {/* ── Ticket Resumen de la Cita (Estilo Apple Wallet) ───────────────── */}
         <div className="p-6 sm:p-8 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-5 select-none">
           <div className="flex items-center justify-between border-b border-white/10 pb-4">
             <div className="flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-primary" />
               <span className="font-outfit text-base font-bold text-on-surface">Resumen de tu Cita</span>
             </div>
             <span className="font-sans text-xs text-primary font-semibold uppercase tracking-wider bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
               {selectedTime} hs
             </span>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-sans">
             <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
               <User className="h-4 w-4 text-primary shrink-0" />
               <div className="min-w-0">
                 <p className="text-[10px] text-on-surface-secondary/70 uppercase tracking-widest font-semibold">Clienta</p>
                 <p className="font-semibold text-on-surface truncate">{clientName}</p>
               </div>
             </div>

             <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
               <Users className="h-4 w-4 text-primary shrink-0" />
               <div className="min-w-0">
                 <p className="text-[10px] text-on-surface-secondary/70 uppercase tracking-widest font-semibold">Profesional</p>
                 <p className="font-semibold text-on-surface truncate">{selectedStaff?.name}</p>
               </div>
             </div>

             <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 sm:col-span-2">
               <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
               <div className="min-w-0">
                 <p className="text-[10px] text-on-surface-secondary/70 uppercase tracking-widest font-semibold">Fecha Reservada</p>
                 <p className="font-semibold capitalize text-on-surface">
                   {selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                 </p>
               </div>
             </div>
           </div>

           {/* Lista de Servicios Seleccionados */}
           <div className="pt-1">
             <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
               <div className="flex items-center justify-between text-xs font-sans text-on-surface-secondary uppercase tracking-wider border-b border-white/5 pb-2">
                 <span className="font-semibold">Servicios Seleccionados ({selectedServices.length})</span>
                 <span className="font-semibold text-primary">Duración: {formatDuration(totalDuration)}</span>
               </div>
               <ul className="space-y-2">
                 {selectedServices.map(s => (
                   <li key={s.id} className="flex justify-between items-center text-sm font-sans">
                     <span className="font-medium text-on-surface">{s.name}{s.largo ? <span className="text-primary/90 text-xs ml-1 font-sans">({s.largo})</span> : ''}</span>
                     <span className="text-xs text-on-surface-secondary font-sans">{formatDuration(s.durationMinutes)}</span>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
         </div>

         {/* ── Formulario de Contacto (Único / Sin duplicados) ───────────── */}
         <div className="space-y-4 max-w-lg mx-auto">
           {!isAuthenticated ? (
             <div className="p-6 sm:p-8 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
               <div className="space-y-1">
                 <h4 className="font-outfit text-base font-bold text-on-surface">Datos de contacto para tu reserva</h4>
                 <p className="font-sans text-xs text-on-surface-secondary/80">Necesarios para enviar tu confirmación y comprobante.</p>
               </div>

               <div className="space-y-3.5 pt-1">
                 <div>
                   <label className="font-sans text-xs text-on-surface-secondary/90 mb-1.5 block font-medium">Nombre completo</label>
                   <input
                     type="text"
                     placeholder="Ej: María González"
                     value={guestName}
                     onChange={(e) => setGuestName(e.target.value)}
                     className="w-full rounded-2xl px-4 py-3 font-sans text-sm bg-white/[0.04] text-on-surface placeholder:text-on-surface-secondary/40 border border-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all"
                   />
                 </div>

                 <div>
                   <label className="font-sans text-xs text-on-surface-secondary/90 mb-1.5 block font-medium">Email (comprobante)</label>
                   <input
                     type="email"
                     placeholder="tu@email.com"
                     value={guestEmail}
                     onChange={(e) => setGuestEmail(e.target.value)}
                     className="w-full rounded-2xl px-4 py-3 font-sans text-sm bg-white/[0.04] text-on-surface placeholder:text-on-surface-secondary/40 border border-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all"
                   />
                 </div>

                 <div>
                   <label className="font-sans text-xs text-on-surface-secondary/90 mb-1.5 block font-medium">WhatsApp (confirmación directa)</label>
                   <div className={cn(
                     "flex items-center bg-white/[0.04] border transition-all duration-300 rounded-2xl overflow-hidden px-4 py-2.5",
                     phoneTouched && !isPhoneValid ? "border-danger/50 ring-1 ring-danger/20" :
                     isPhoneValid ? "border-success/50 ring-1 ring-success/20" : "border-white/10 focus-within:border-primary/50"
                   )}>
                     <div className="flex items-center gap-2 pr-3.5 border-r border-white/10 text-on-surface-secondary font-medium select-none shrink-0">
                       <img src="https://flagcdn.com/w20/ar.png" alt="AR" className="w-4 h-auto rounded-sm opacity-80" />
                       <span className="font-sans text-sm">+54</span>
                     </div>
                     <input
                       type="tel"
                       value={clientPhone}
                       onChange={(e) => {
                         const val = e.target.value.replace(/[^\d]/g, '');
                         setClientPhone(val);
                         setGuestPhone(val);
                         if (!phoneTouched) setPhoneTouched(true);
                       }}
                       onBlur={() => setPhoneTouched(true)}
                       placeholder="9 11 XXXX-XXXX"
                       className="bg-transparent flex-1 px-3.5 py-0.5 font-sans text-sm text-on-surface placeholder:text-on-surface-secondary/40 focus:outline-none"
                     />
                     {isPhoneValid && <CheckCircle className="w-4 h-4 text-success shrink-0 ml-1" />}
                   </div>
                   {phoneTouched && !isPhoneValid && (
                     <p className="font-sans text-danger text-[10px] font-semibold mt-1 ml-1 animate-pulse">Tu WhatsApp es necesario para enviarte los detalles del turno.</p>
                   )}
                 </div>
               </div>
             </div>
           ) : (
             <div className="p-6 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 space-y-3">
               <div className="flex items-center justify-between">
                 <span className="font-outfit text-sm font-semibold text-on-surface">Confirmación vía WhatsApp</span>
                 <span className="text-xs text-success font-sans font-medium flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verificado</span>
               </div>
               <div className={cn(
                 "flex items-center bg-white/[0.04] border transition-all duration-300 rounded-2xl overflow-hidden px-4 py-2.5",
                 isPhoneValid ? "border-success/50" : "border-white/10"
               )}>
                 <div className="flex items-center gap-2 pr-3.5 border-r border-white/10 text-on-surface-secondary font-medium select-none shrink-0">
                   <img src="https://flagcdn.com/w20/ar.png" alt="AR" className="w-4 h-auto rounded-sm opacity-80" />
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
                   className="bg-transparent flex-1 px-3.5 py-0.5 font-sans text-sm text-on-surface placeholder:text-on-surface-secondary/40 focus:outline-none"
                 />
               </div>
             </div>
           )}

           {/* ── Badge de Seña e Información de Pago ────────────────────── */}
           <div className="p-8 border border-primary/30 rounded-[2.5rem] text-center bg-gradient-to-b from-[#181510] to-[#0d0c0a] relative overflow-hidden shadow-[0_0_40px_rgba(241,201,125,0.15)] space-y-4">
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
             
             <div className="space-y-1">
               <p className="font-sans text-[10.5px] font-semibold text-primary/90 uppercase tracking-[0.2em]">
                 Seña para congelar turno
               </p>
               <div className="font-outfit text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f1c97d] via-[#fff0cf] to-[#e4b562] drop-shadow-sm pt-1">
                 {formatPrice(depositAmount)}
               </div>
             </div>

             <div className="pt-3 border-t border-white/10 text-xs font-sans text-on-surface-secondary/90 max-w-sm mx-auto leading-relaxed space-y-1">
               <p>
                 Remanente estimado en salón: <strong className="text-on-surface font-semibold">{hasRange ? `${formatPrice(totalFrom)} - ${formatPrice(totalTo)}` : formatPrice(totalFrom)}</strong>
               </p>
               <p className="text-[11px] opacity-75">
                 Valores sujetos a diagnóstico final en persona con {selectedStaff?.name.split(' ')[0]}.
               </p>
             </div>
           </div>

           {/* Checkbox de acuerdo en vidrio esmerilado */}
           <div className="flex items-start space-x-3 p-4 bg-black/40 border border-white/10 rounded-2xl hover:bg-black/60 transition-colors select-none cursor-pointer" onClick={() => setFinalConfirmation(!finalConfirmation)}>
             <Checkbox id="terms1" checked={finalConfirmation} onCheckedChange={(checked) => setFinalConfirmation(checked as boolean)} className="mt-0.5 data-[state=checked]:bg-primary shrink-0" />
             <label htmlFor="terms1" className="font-sans text-xs text-on-surface-secondary/90 leading-relaxed cursor-pointer select-none">
               Confirmo que mi cabello actual coincide cercanamente con el <strong className="text-on-surface font-semibold">largo declarado</strong>, previniendo sorpresas de cobro adicional o carencia de tiempo técnico disponible hoy.
             </label>
           </div>
         </div>
       </CardContent>
       <CardFooter className="flex flex-col sm:flex-row justify-between border-t border-outline-subtle bg-surface p-4 sm:p-6 rounded-b-[2.5rem] gap-3">
         <Button variant="outline" className="w-full sm:w-auto rounded-full border-white/10 text-on-surface hover:bg-white/10 font-sans text-xs" onClick={() => setStep(3)}>Modificar Detalles</Button>
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
