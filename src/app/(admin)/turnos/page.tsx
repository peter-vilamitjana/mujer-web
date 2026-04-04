
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, setDoc, Timestamp, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Calendar as CalendarIcon, Clock, User, Tag, ArrowLeft, Check, CheckCircle, Users, Scissors, Info, Search } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import type { Cliente, Servicio, LargoPelo, Turno } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NewClientForm from '@/components/NewClientForm';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { useCatalog } from '@/hooks/useCatalog';
import type { Staff } from '@/lib/schema';


const MONTO_SEÑA_PORCENTAJE = 0.15; // 15%

async function getDefaultBranchId(tenantId: string): Promise<string> {
  const branchesRef = collection(db, 'tenants', tenantId, 'branches');
  const q = query(branchesRef, where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  const allSnap = await getDocs(query(branchesRef, limit(1)));
  return allSnap.empty ? 'default' : allSnap.docs[0].id;
}

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

type SelectedServiceWithLargo = Servicio & { largo?: LargoPelo };

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

function formatDuration(minutes: number) {
  if (!minutes || minutes <= 0) return `0min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes === 0) {
    return `${hours}h`;
  }
  if (hours === 0 && remainingMinutes > 0) {
    return `${remainingMinutes}min`;
  }
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${minutes}min`;
}

import { notificationService } from '@/lib/services/notification.service';
import { useTenant } from '@/contexts/TenantContext';

function TurnosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const { tenantId } = useTenant();
  const { data: session } = useSession();
  const { toast } = useToast();

  const { services: catalogServices, staff: catalogStaff, loading: catalogLoading } = useCatalog();

  const isAdmin = user?.rol === 'admin';
  const initialStep = isAdmin ? 0 : 1;
  const [step, setStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = useMemo(() => {
    return catalogServices.map(s => ({
      id: s.id,
      nombre: s.name,
      descripcion: s.description || '',
      precio: typeof s.price === 'number' ? s.price : undefined,
      precios: typeof s.price === 'object' ? s.price : undefined,
      duracion: s.durationMinutes,
      requiereLargo: s.requiresLengthSelection,
      variable: s.variablePrice,
      preciosHasta: s.priceHasta
    } as Servicio));
  }, [catalogServices]);

  const professionals = useMemo(() => {
    return catalogStaff.map(s => ({
      id: s.id,
      name: s.name,
      avatar: s.avatarUrl || '/professionals/default.png', // Fallback
      hint: 'professional' // Default hint
    }));
  }, [catalogStaff]);

  const [clients, setClients] = useState<Cliente[]>([]);

  const [selectedServices, setSelectedServices] = useState<SelectedServiceWithLargo[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<(typeof professionals[0]) | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [showLengthError, setShowLengthError] = useState(false);
  const [finalConfirmation, setFinalConfirmation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const serviceIdParams = searchParams.getAll('servicioId');
        if (serviceIdParams.length > 0 && services.length > 0) {
          const preSelectedServices = services
            .filter(s => serviceIdParams.includes(s.id))
            .map(s => {
              const largo = searchParams.get(`largo_${s.id}`) as LargoPelo | null;
              return { ...s, largo: s.requiereLargo ? largo || undefined : undefined };
            });
          setSelectedServices(preSelectedServices);
          setStep(isAdmin ? 1 : 2);
        }

        if (isAdmin && tenantId) {
          const clientsQuery = query(collection(db, 'tenants', tenantId, 'customers'), orderBy('firstName'));
          const clientsSnapshot = await getDocs(clientsQuery);
          const clientsData = clientsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              nombre: data.firstName || data.nombre,
              apellido: data.lastName || data.apellido,
              email: data.email,
              telefono: data.phone || data.telefono,
              fechaRegistro: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
            } as unknown as Cliente;
          });
          setClients(clientsData);

          const clientIdParam = searchParams.get('clienteId');
          if (clientIdParam) {
            const client = clientsData.find(c => c.id === clientIdParam);
            if (client) {
              setSelectedClient(client);
              setStep(1);
            }
          }
        } else if (user) {
          const userAsClient: Cliente = { id: user.id, nombre: user.nombre, apellido: '', email: user.email, telefono: '', fechaRegistro: new Date() as any };
          setSelectedClient(userAsClient);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (!catalogLoading && tenantId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user, services, catalogLoading, searchParams, tenantId]);


  const goToStep = (stepNumber: number) => {
    if (step > stepNumber) {
      setStep(stepNumber);
    }
  };

  const handleServiceToggle = (service: Servicio) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, { ...service, largo: undefined }];
      }
    });
    setShowLengthError(false);
  };

  const handleLargoChange = (serviceId: string, largo: LargoPelo) => {
    setSelectedServices(prev => prev.map(s => s.id === serviceId ? { ...s, largo } : s));
    setShowLengthError(false);
  };

  const getServicePrice = (service: SelectedServiceWithLargo): { from: number; to?: number } => {
    if (service.requiereLargo && !service.largo) return { from: 0, to: 0 };
    if (service.precios && service.largo) {
      const fromPrice = service.precios[service.largo];
      const toPrice = service.variable && service.preciosHasta ? service.preciosHasta[service.largo] : undefined;
      return { from: fromPrice, to: toPrice };
    }
    return { from: service.precio || 0 };
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  const canGoNextFromStep1 = useMemo(() => {
    if (selectedServices.length === 0) return false;
    return selectedServices.every(s => !s.requiereLargo || (s.requiereLargo && !!s.largo));
  }, [selectedServices]);

  const { totalFrom, totalTo, hasRange } = useMemo(() => {
    let from = 0;
    let to = 0;
    let range = false;
    selectedServices.forEach(s => {
      const price = getServicePrice(s);
      from += price.from;
      if (price.to) {
        to += price.to;
        range = true;
      } else {
        to += price.from;
      }
    });
    return { totalFrom: from, totalTo: to, hasRange: range && to > from };
  }, [selectedServices]);

  const totalDuration = useMemo(() => selectedServices.reduce((acc, s) => {
    if (s.requiereLargo && !s.largo) return acc;
    return acc + (s.duracion || 0);
  }, 0), [selectedServices]);

  const depositAmount = useMemo(() => Math.round(totalFrom * MONTO_SEÑA_PORCENTAJE), [totalFrom]);

  const servicesSummary = useMemo(() => {
    if (selectedServices.length === 0) return 'Ninguno';
    const names = selectedServices.map(s => s.nombre);
    const limit = 3;
    let summary = names.slice(0, limit).join(', ');
    if (names.length > limit) {
      summary += ` +${names.length - limit} más`;
    }
    return summary;
  }, [selectedServices]);

  const onSubmit = async () => {
    if (!selectedClient || selectedServices.length === 0 || !selectedProfessional || !selectedDate || !selectedTime) {
      toast({ title: "Faltan datos", description: "Por favor completa todos los pasos.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const [hour, minute] = selectedTime.split(':').map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hour, minute, 0, 0);

      const selectedServicesNames = selectedServices.map(s => {
        let name = s.nombre;
        if (s.precios && s.largo) {
          name += ` (${s.largo})`
        }
        return name;
      }).join(', ');

      const newTurnoRef = doc(collection(db, 'tenants', tenantId!, 'appointments'));

      // Create appointment object matching schema
      const newAppointmentData = {
        id: newTurnoRef.id,
        tenantId,
        branchId: await getDefaultBranchId(tenantId!),
        clientId: selectedClient.id,
        clientName: `${selectedClient.nombre} ${selectedClient.apellido || ''}`.trim(),
        staffId: selectedProfessional.id,
        staffName: selectedProfessional.name,
        serviceIds: selectedServices.map(s => s.id),
        serviceNames: selectedServicesNames,
        date: Timestamp.fromDate(appointmentDateTime),
        durationMinutes: totalDuration,
        status: 'pending_payment',
        priceEstimated: totalFrom,
        priceFinal: totalTo, // Using priceFinal as upper bound for range? Or just leave undefined. Schema says priceFinal number. Let's put totalTo or maybe undefined. totalFrom is better as estimated.
        // Schema: priceFinal optional.
        depositAmount: depositAmount,
        depositPaid: false,
        createdAt: serverTimestamp(),
        createdBy: user?.id || 'system',
        source: 'app', // extra field not in schema but useful?
        notes: ''
      };

      // Create appointment in our DB
      await setDoc(newTurnoRef, newAppointmentData);

      // If admin is connected to Google Calendar, create event there too
      if (isAdmin && session?.accessToken) {
        try {
          const response = await fetch('/api/google/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: newTurnoRef.id,
              summary: `Turno: ${newAppointmentData.clientName}`,
              description: `Servicios: ${newAppointmentData.serviceNames}\nProfesional: ${newAppointmentData.staffName}`,
              startTime: appointmentDateTime.toISOString(), // API likely expects ISO string
              duration: newAppointmentData.durationMinutes,
            })
          });
          if (response.ok) {
            const { eventId } = await response.json();
            await setDoc(newTurnoRef, { googleEventId: eventId }, { merge: true });
          } else {
            const error = await response.json();
            console.warn("Could not create Google Calendar event:", error.message);
            toast({ variant: "default", title: "Advertencia", description: "El turno se creó en la app, pero no se pudo sincronizar con Google Calendar." });
          }
        } catch (e) {
          console.error("Error calling /api/google/events", e);
        }
      }

      toast({
        title: "¡Turno confirmado!",
        description: `Tu cita para ${selectedServicesNames} quedó agendada.`,
      });

      // Send Confirmation Email
      if (user && user.email) {
        await notificationService.sendEmail({
          to: user.email,
          subject: 'Confirmación de Turno - Mujer',
          type: 'confirmation',
          data: {
            clientName: user.nombre,
            serviceName: selectedServicesNames,
            date: format(selectedDate, "EEEE d 'de' MMMM", { locale: es }),
            time: selectedTime,
            location: 'Sucursal Centro'
          }
        });
      }

      // Reset selection and redirect
      setSelectedServices([]);
      setSelectedDate(undefined);
      setSelectedTime(null);

      router.push(isAdmin ? '/agenda' : '/mis-turnos');
    } catch (error) {
      console.error("Error al agendar turno:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo agendar el turno. Intenta de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (catalogLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const adminSteps = [
    { id: 0, name: 'Busca o crea la clienta', icon: User },
    { id: 1, name: 'Elige tus servicios', icon: Scissors },
    { id: 2, name: 'Elige tu profesional', icon: Users },
    { id: 3, name: 'Elige fecha y hora', icon: CalendarIcon },
    { id: 4, name: 'Resumen y seña', icon: CheckCircle },
  ];

  const clientSteps = adminSteps.slice(1);
  const steps = isAdmin ? adminSteps : clientSteps;

  const currentStepConfig = steps.find(s => s.id === step);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendar Turno</h1>
          <p className="text-muted-foreground">
            {currentStepConfig?.name ?? 'Sigue los pasos para confirmar tu cita.'}
          </p>
        </div>
        <Link href={isAdmin ? "/agenda" : "/servicios"} passHref>
          <Button variant="outline"><ArrowLeft className="mr-2" /> Volver</Button>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-2 bg-muted rounded-full flex items-center justify-between">
          {steps.map(s => (
            <button
              key={s.id}
              onClick={() => { if (step > s.id) setStep(s.id) }}
              disabled={step < s.id}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300",
                step === s.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground",
                step > s.id && "hover:bg-primary/10"
              )}
            >
              <s.icon className="h-5 w-5" />
              <span className="hidden md:inline">{s.name}</span>
            </button>
          ))}
        </div>

        {/* STEP 0: Client (Admin only) */}
        {isAdmin && step === 0 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Paso 0: Busca o crea la clienta</CardTitle>
              <CardDescription>Selecciona una clienta existente o registra una nueva para continuar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedClient
                      ? `${selectedClient.nombre} ${selectedClient.apellido}`
                      : "Seleccionar clienta existente..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar por nombre o apellido..." />
                    <CommandList>
                      <CommandEmpty>No se encontró ninguna clienta.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.nombre} ${client.apellido}`}
                            onSelect={() => {
                              setSelectedClient(client);
                              setClientSearchOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedClient?.id === client.id ? "opacity-100" : "opacity-0")} />
                            {client.nombre} {client.apellido}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t"></div>
                <span className="text-xs text-muted-foreground">O</span>
                <div className="flex-1 border-t"></div>
              </div>
              <NewClientForm />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!selectedClient}>Siguiente</Button>
            </CardFooter>
          </Card>
        )}


        {/* STEP 1: Services */}
        {step === 1 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Paso 1: Elige tus servicios</CardTitle>
              <CardDescription>Puedes seleccionar uno o más tratamientos.</CardDescription>
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
                          isSelected ? "border-primary ring-2 ring-primary/20 shadow-lg" : "hover:border-primary/50 dark:border-border/50",
                        )}
                      >
                        <div className='flex justify-between items-start'>
                          <div className="flex-grow pr-2">
                            <div className="flex justify-between items-baseline">
                              <h4 className="font-semibold">{service.nombre}</h4>
                              {service.precios && selectedData?.largo && isSelected ?
                                <p className="text-primary font-bold text-sm">≈ {formatPrice(getServicePrice(selectedData).from)}</p> :
                                !service.precios && <p className="text-primary font-bold text-sm">{formatPrice(service.precio!)}</p>
                              }
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(service.duracion)}</span>
                            </div>
                          </div>
                          <Checkbox checked={isSelected} className="rounded-full h-5 w-5" />
                        </div>

                        <div className="mt-4 flex-grow flex flex-col justify-end">
                          {isSelected && service.requiereLargo && (
                            <div className="mt-4 pt-4 border-t border-dashed">
                              <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(service.precios!) as LargoPelo[]).map(largo => (
                                  <Button
                                    key={largo}
                                    variant={selectedData?.largo === largo ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLargoChange(service.id, largo)
                                    }}
                                    className="capitalize flex-col h-auto py-1.5"
                                  >
                                    {largo}
                                  </Button>
                                ))}
                              </div>
                              <div className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center">
                                Precio desde. Se confirma en el local.
                                <LengthPopoverTrigger />
                              </div>
                              {showLengthError && !selectedData?.largo && <p className="text-xs text-red-500 font-semibold text-center mt-1">Elegí un largo para continuar.</p>}
                            </div>
                          )}
                          {isSelected && (
                            <div className="pt-3 text-center text-primary text-sm font-semibold mt-auto flex items-center justify-center gap-2">
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
            <CardFooter className="flex-col items-stretch gap-4 md:flex-row md:justify-between">
              {selectedServices.length > 0 ? (
                <div className='p-3 border rounded-lg bg-muted/50 text-sm w-full'>
                  <p><span className="font-semibold">Total estimado:</span> {canGoNextFromStep1 ? (hasRange ? `${formatPrice(totalFrom)} - ${formatPrice(totalTo)}` : formatPrice(totalFrom)) : 'Selecciona el largo...'}</p>
                  <p><span className="font-semibold">Tiempo total:</span> {canGoNextFromStep1 ? formatDuration(totalDuration) : '...'}</p>
                  <p className="truncate"><span className="font-semibold">Servicios:</span> {servicesSummary}</p>
                  <p className="text-xs text-muted-foreground mt-1">Estimado. Puede variar según diagnóstico (+ insumos).</p>
                </div>
              ) : (
                <div className='p-3 border rounded-lg bg-muted/50 text-sm text-center text-muted-foreground w-full'>
                  Selecciona un servicio para comenzar.
                </div>
              )}
              <div className='flex justify-end w-full md:w-auto mt-4 md:mt-0'>
                <Button onClick={() => { canGoNextFromStep1 ? setStep(2) : setShowLengthError(true) }} disabled={selectedServices.length === 0}>Siguiente</Button>
              </div>
            </CardFooter>
          </Card>
        )}


        {/* STEP 2: Professional */}
        {step === 2 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Paso 2: Elige tu profesional</CardTitle>
              <CardDescription>Nuestras expertas están listas para atenderte.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {professionals.map(prof => (
                <div key={prof.id} onClick={() => setSelectedProfessional(prof)}
                  className={cn("p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center gap-4 text-center",
                    selectedProfessional?.id === prof.id ? "border-primary ring-2 ring-primary/20 shadow-lg" : "hover:border-primary/50 dark:border-border/50"
                  )}>
                  <Image src={prof.avatar} alt={prof.name} data-ai-hint={prof.hint} width={80} height={80} className="rounded-full border-2 border-muted object-cover object-top aspect-square" />
                  <h4 className="font-semibold">{prof.name}</h4>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Anterior</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedProfessional}>Siguiente</Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 3: Date and Time */}
        {step === 3 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Paso 3: Elige fecha y hora</CardTitle>
              <CardDescription>Selecciona el día y la hora que más te convenga.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 md:gap-6 md:p-6 items-center md:items-start px-3">
              <div className="flex justify-center w-full max-w-xs">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md self-start"
                  locale={es}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1 max-h-96 overflow-y-auto p-1 w-full mt-4 md:mt-0">
                {timeSlots.map(time => (
                  <Button key={time} variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)}>
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setStep(2)}>Anterior</Button>
              <Button onClick={() => setStep(4)} disabled={!selectedDate || !selectedTime}>Siguiente</Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 4: Confirmation */}
        {step === 4 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Paso 4: Resumen y seña</CardTitle>
              <CardDescription>Revisa los detalles de tu turno antes de confirmar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border dark:border-border/50 rounded-xl bg-muted/50 dark:bg-muted/20 space-y-3 text-sm">
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Clienta: <span className="font-semibold">{selectedClient?.nombre} {selectedClient?.apellido}</span></p>
                <p className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Profesional: <span className="font-semibold">{selectedProfessional?.name}</span></p>
                <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /> Fecha: <span className="font-semibold">{selectedDate && format(selectedDate, "PPP", { locale: es })}</span></p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Hora: <span className="font-semibold">{selectedTime} hs</span></p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Duración estimada total: <span className="font-semibold">{formatDuration(totalDuration)}</span></p>
                <div className="border-t dark:border-border/50 pt-3 mt-3">
                  <p className="flex items-center gap-2 font-semibold text-base"><Scissors className="h-4 w-4 text-primary" /> Servicios seleccionados (con largo declarado por cliente):</p>
                  <ul className="list-disc list-inside pl-2 font-medium text-muted-foreground">
                    {selectedServices.map(s => <li key={s.id}>{s.nombre}{s.largo ? ` (${s.largo})` : ''}</li>)}
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 border dark:border-border/50 rounded-xl text-center bg-muted/25 dark:bg-muted/10">
                  <p className="text-sm font-semibold text-muted-foreground">Seña para confirmar ({MONTO_SEÑA_PORCENTAJE * 100}%)</p>
                  <p className="text-5xl font-bold text-primary my-2">{formatPrice(depositAmount)}</p>
                  <p className="text-sm text-muted-foreground">La seña se descontará del total estimado de <span className="font-semibold text-foreground">{hasRange ? `${formatPrice(totalFrom)} - ${formatPrice(totalTo)}` : formatPrice(totalFrom)}</span> al momento de tu visita. El valor final se confirmará según diagnóstico en el local.</p>
                </div>
                <div className="items-top flex space-x-3 p-1">
                  <Checkbox id="terms1" checked={finalConfirmation} onCheckedChange={(checked) => setFinalConfirmation(checked as boolean)} />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms1"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Confirmo que el largo seleccionado coincide con mi cabello actual y acepto que el precio puede variar según diagnóstico.
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">Este acuerdo evita ajustes posteriores en caja.</p>
                    <LengthPopoverTrigger asChild={true} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>Anterior</Button>
              <Button onClick={onSubmit} disabled={isSubmitting || !finalConfirmation}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar y Pagar Seña'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TurnosPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <TurnosContent />
    </Suspense>
  )
}

