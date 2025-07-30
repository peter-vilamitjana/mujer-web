

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Calendar as CalendarIcon, Clock, User, Tag, ArrowLeft, Check, CheckCircle, Users, Scissors, Info } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import type { Cliente, Servicio, LargoPelo } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const professionals = [
  { id: 'carolina_spranda', name: 'Carolina Spranda', avatar: 'https://instagram.fros9-1.fna.fbcdn.net/v/t51.2885-19/165164532_268634798069001_7058218041199102261_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDkuYzIifQ&_nc_ht=instagram.fros9-1.fna.fbcdn.net&_nc_cat=109&_nc_oc=Q6cZ2QHbZkJIT2ni_QHK7SHyg4Gy_4tCbgZSsqMJmoixogGcXhJclAR9u-I1wzGr67hsroM&_nc_ohc=Q-nUGHJTEZcQ7kNvwG6mQx5&_nc_gid=v7HbfF8jYUVra_8ldm7xMw&edm=APoiHPcBAAAA&ccb=7-5&oh=00_AfQnRXEppnKHoiFYgnPK24Mf7SJpzCnG4U6MXWJoEWvNIQ&oe=688EAAEF&_nc_sid=22de04', hint: 'woman professional' },
  { id: 'laura_bortolazo', name: 'Laura Bortolazo', avatar: 'https://instagram.faep14-3.fna.fbcdn.net/v/t51.2885-19/495257400_18329670898165301_5663086207881759788_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.faep14-3.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2QFe0nbw-wQgutrzG-k2xGSsR5KmGiDELtd0Niq6PbQBLgZwiDqWf_sHll4lcxeRvVs&_nc_ohc=FyGTW0_y4wcQ7kNvwGk7MQu&_nc_gid=Yzh7RdC1pAesG_j9Is84gA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfSptaYOHanpNA3Jztb5lxlCEq9naJeZ3KlbDGzn7Le44g&oe=688ECDF6&_nc_sid=7a9f4b', hint: 'woman smiling' },
  { id: 'fabiana_estilista', name: 'Fabiana', avatar: 'https://placehold.co/100x100.png', hint: 'woman portrait' },
];

const MONTO_SEÑA_PORCENTAJE = 0.15; // 15%

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

type SelectedServiceWithLargo = Servicio & { largo?: LargoPelo };

const mockServices: Servicio[] = [
    { id: 'corte', nombre: 'Corte', descripcion: '', precio: 30000, duracion: 15 },
    { id: 'lavado', nombre: 'Lavado', descripcion: '', precio: 9000, duracion: 10 },
    { id: 'peinado', nombre: 'Peinado', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 12 },
    { id: 'mechas', nombre: 'Mechas', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 25 },
    { id: 'reflejos', nombre: 'Reflejos', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 20 },
    { id: 'color', nombre: 'Color', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 45 },
    { id: 'bano_crema', nombre: 'Baño de Crema', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 30 },
    { id: 'botox', nombre: 'Botox Capilar', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 40 },
    { id: 'alisados', nombre: 'Alisados', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 60 },
    { id: 'nutricion', nombre: 'Nutrición Capilar', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 35 },
].sort((a, b) => a.nombre.localeCompare(b.nombre));


function TurnosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [clients, setClients] = useState<Cliente[]>([]);
  const [services] = useState<Servicio[]>(mockServices);

  const [selectedServices, setSelectedServices] = useState<SelectedServiceWithLargo[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<(typeof professionals[0]) | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  
  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      const serviceIdParams = searchParams.getAll('servicioId');
      if (serviceIdParams.length > 0 && services.length > 0) {
        const preSelectedServices = services
          .filter(s => serviceIdParams.includes(s.id))
          .map(s => {
              const largo = searchParams.get(`largo_${s.id}`) as LargoPelo | null;
              const defaultLargo = s.precios ? (largo || 'corto') : undefined;
              return { ...s, largo: defaultLargo };
          });
        setSelectedServices(preSelectedServices);
        setStep(2);
      }

      if (isAdmin) {
        setLoadingData(true);
        const clientsQuery = query(collection(db, 'clientes'), orderBy('nombre'));
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsData = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente))
        setClients(clientsData);
        
        const clientIdParam = searchParams.get('clienteId');
        if (clientIdParam) {
            const client = clientsData.find(c => c.id === clientIdParam);
            if (client) setSelectedClient(client);
        }
        setLoadingData(false);
      } else if (user) {
        const userAsClient: Cliente = { id: user.id, nombre: user.nombre, apellido: '', email: user.email, telefono: '', fechaRegistro: new Date() as any };
        setSelectedClient(userAsClient);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user, services]);


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
            return [...prev, { ...service, largo: service.precios ? undefined : undefined }];
        }
    });
  };

  const handleLargoChange = (serviceId: string, largo: LargoPelo) => {
    setSelectedServices(prev => prev.map(s => s.id === serviceId ? { ...s, largo } : s));
  };
  
  const getServicePrice = (service: SelectedServiceWithLargo): number => {
    if (service.precios && service.largo) {
        return service.precios[service.largo];
    }
    return service.precio || 0;
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  
  const canGoNextFromStep1 = useMemo(() => {
    if (selectedServices.length === 0) return false;
    return selectedServices.every(s => !s.precios || (s.precios && !!s.largo));
  }, [selectedServices]);

  const totalAmount = useMemo(() => selectedServices.reduce((acc, s) => acc + getServicePrice(s), 0), [selectedServices]);
  const totalDuration = useMemo(() => selectedServices.reduce((acc, s) => acc + s.duracion, 0), [selectedServices]);
  const depositAmount = useMemo(() => Math.round(totalAmount * MONTO_SEÑA_PORCENTAJE), [totalAmount]);

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

        const servicioNombres = selectedServices.map(s => {
          let name = s.nombre;
          if (s.precios && s.largo) {
            name += ` (${s.largo})`
          }
          return name;
        }).join(', ');

        await addDoc(collection(db, 'turnos'), {
          clienteId: selectedClient.id,
          clienteNombre: `${selectedClient.nombre} ${selectedClient.apellido || ''}`.trim(),
          servicio: servicioNombres,
          servicioIds: selectedServices.map(s => s.id),
          precio: totalAmount,
          empleadaNombre: selectedProfessional.name,
          empleadaAsignadaId: selectedProfessional.id,
          fecha: appointmentDateTime,
          estado: isAdmin ? 'pendiente' : 'pendiente_pago',
          señaPagada: false,
          montoSeña: depositAmount,
          fechaCreacion: serverTimestamp(),
          duracion: totalDuration
        });

        toast({
          title: "¡Turno agendado!",
          description: `El turno para ${selectedClient.nombre} ha sido creado exitosamente.`,
        });
        router.push(isAdmin ? '/agenda' : '/mis-turnos');
    } catch (error) {
        console.error("Error al agendar turno:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo agendar el turno. Intenta de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingData && isAdmin) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }
  
  const steps = [
      { id: 1, name: 'Elige tus servicios', icon: Scissors },
      { id: 2, name: 'Elige tu profesional', icon: Users },
      { id: 3, name: 'Elige fecha y hora', icon: CalendarIcon },
      { id: 4, name: 'Resumen y seña', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
       <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendar Turno</h1>
          <p className="text-muted-foreground">
            Sigue los pasos para confirmar tu cita en nuestro salón.
          </p>
        </div>
         <Link href={isAdmin ? "/agenda" : "/servicios"} passHref>
            <Button variant="outline"><ArrowLeft className="mr-2"/> Volver</Button>
        </Link>
      </div>

       <div className="max-w-5xl mx-auto space-y-8">
          <div className="p-2 bg-muted rounded-full flex items-center justify-between">
             {steps.map(s => (
                <button
                    key={s.id}
                    onClick={() => { if(step > s.id) setStep(s.id) }}
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

          {/* STEP 1: Services */}
          {step === 1 && (
              <Card>
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
                                            "p-4 border rounded-lg cursor-pointer transition-all flex flex-col h-full", 
                                            isSelected ? "border-primary ring-2 ring-primary/20 shadow-lg" : "hover:border-primary/50",
                                        )}
                                    >
                                        <div className='flex justify-between items-start'>
                                            <div className="flex-grow pr-2">
                                              <div className="flex justify-between items-baseline">
                                                <h4 className="font-semibold">{service.nombre}</h4>
                                                {service.precios && selectedData?.largo && isSelected ?
                                                  <p className="text-primary font-bold text-sm">≈ {formatPrice(getServicePrice(selectedData))}</p> :
                                                  !service.precios && <p className="text-primary font-bold text-sm">{formatPrice(service.precio!)}</p>
                                                }
                                              </div>
                                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                  <Clock className="h-3 w-3"/>
                                                  <span>{service.duracion} min.</span>
                                              </div>
                                            </div>
                                            <Checkbox checked={isSelected} className="rounded-full h-5 w-5"/>
                                        </div>
                                        
                                        <div className="mt-4 flex-grow flex flex-col justify-end">
                                            {isSelected && service.precios && (
                                              <div className="mt-4 pt-4 border-t border-dashed">
                                                  <div className="grid grid-cols-3 gap-2">
                                                      {(Object.keys(service.precios) as LargoPelo[]).map(largo => (
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
                                                  <p className="text-xs text-muted-foreground text-center mt-2">Precios aproximados según largo de pelo.</p>
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
                            <p><span className="font-semibold">Total estimado:</span> {canGoNextFromStep1 ? formatPrice(totalAmount) : 'Selecciona el largo...'}</p>
                            <p><span className="font-semibold">Tiempo total:</span> {totalDuration} min.</p>
                            <p className="truncate"><span className="font-semibold">Servicios:</span> {servicesSummary}</p>
                        </div>
                    ) : (
                         <div className='p-3 border rounded-lg bg-muted/50 text-sm text-center text-muted-foreground w-full'>
                            Selecciona un servicio para comenzar.
                        </div>
                    )}
                    <div className='flex justify-end w-full md:w-auto mt-4 md:mt-0'>
                        <Button onClick={() => setStep(2)} disabled={!canGoNextFromStep1}>Siguiente</Button>
                    </div>
                </CardFooter>
              </Card>
          )}


          {/* STEP 2: Professional */}
          {step === 2 && (
              <Card>
                <CardHeader>
                    <CardTitle>Paso 2: Elige tu profesional</CardTitle>
                    <CardDescription>Nuestras expertas están listas para atenderte.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {professionals.map(prof => (
                        <div key={prof.id} onClick={() => setSelectedProfessional(prof)}
                            className={cn("p-4 border rounded-lg cursor-pointer transition-all flex flex-col items-center gap-4 text-center",
                            selectedProfessional?.id === prof.id ? "border-primary ring-2 ring-primary/20 shadow-lg" : "hover:border-primary/50"
                            )}>
                            <Image src={prof.avatar} alt={prof.name} data-ai-hint={prof.hint} width={80} height={80} className="rounded-full border-2 border-muted" />
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
              <Card>
                 <CardHeader>
                    <CardTitle>Paso 3: Elige fecha y hora</CardTitle>
                    <CardDescription>Selecciona el día y la hora que más te convenga.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 md:gap-6 md:p-6 md:items-start items-center px-3">
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
              <Card>
                <CardHeader>
                    <CardTitle>Paso 4: Resumen y seña</CardTitle>
                    <CardDescription>Revisa los detalles de tu turno antes de confirmar.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-3 text-sm">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Clienta: <span className="font-semibold">{selectedClient?.nombre}</span></p>
                        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-primary"/> Profesional: <span className="font-semibold">{selectedProfessional?.name}</span></p>
                        <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary"/> Fecha: <span className="font-semibold">{selectedDate && format(selectedDate, "PPP", { locale: es })}</span></p>
                        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Hora: <span className="font-semibold">{selectedTime} hs</span></p>
                        <div className="border-t pt-3 mt-3">
                           <p className="flex items-center gap-2"><Scissors className="h-4 w-4 text-primary"/> Servicios:</p>
                           <ul className="list-disc list-inside pl-2 font-semibold">
                             {selectedServices.map(s => <li key={s.id}>{s.nombre}{s.largo ? ` (${s.largo})` : ''}</li>)}
                           </ul>
                        </div>
                    </div>
                    {isAdmin ? (
                        <div className="p-4 border-2 border-dashed rounded-lg text-center">
                            <p className="text-muted-foreground text-sm">Total a pagar en el local</p>
                            <p className="text-3xl font-bold text-primary">{formatPrice(totalAmount)}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-6 border rounded-lg text-center bg-muted/25">
                                <p className="text-sm font-semibold text-muted-foreground">Seña para confirmar ({MONTO_SEÑA_PORCENTAJE * 100}%)</p>
                                <p className="text-5xl font-bold text-primary my-2">{formatPrice(depositAmount)}</p>
                                <p className="text-sm text-muted-foreground">La seña se descontará del total de <span className="font-semibold text-foreground">{formatPrice(totalAmount)}</span> en tu visita.</p>
                            </div>
                            <p className="text-xs text-center text-muted-foreground px-4">
                                Para asegurar tu turno se cobrará una seña del {MONTO_SEÑA_PORCENTAJE * 100}% del valor total. Luego se descontará del precio final.
                            </p>
                        </div>
                    )}
                 </CardContent>
                 <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(3)}>Anterior</Button>
                    <Button onClick={onSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (isAdmin ? 'Confirmar Turno' : 'Confirmar y Pagar Seña')}
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

    

    





