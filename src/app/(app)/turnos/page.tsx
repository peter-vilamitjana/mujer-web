
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
  { id: 'carolina_spranda', name: 'Carolina Spranda', avatar: 'https://placehold.co/100x100.png', hint: 'woman professional' },
  { id: 'laura_bortolazo', name: 'Laura Bortolazo', avatar: 'https://placehold.co/100x100.png', hint: 'woman smiling' },
  { id: 'fabiana_estilista', name: 'Fabiana', avatar: 'https://placehold.co/100x100.png', hint: 'woman portrait' },
];

const MONTO_SEÑA_PORCENTAJE = 0.15; // 15%

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

type SelectedServiceWithLargo = Servicio & { largo?: LargoPelo };

const mockServices: Servicio[] = [
    { id: 'alisados', nombre: 'Alisados', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 60 },
    { id: 'bano_crema', nombre: 'Baño de Crema', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 30 },
    { id: 'botox', nombre: 'Botox Capilar', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 40 },
    { id: 'color', nombre: 'Color', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 45 },
    { id: 'corte', nombre: 'Corte', descripcion: '', precio: 30000, duracion: 15 },
    { id: 'lavado', nombre: 'Lavado', descripcion: '', precio: 9000, duracion: 10 },
    { id: 'mechas', nombre: 'Mechas', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 25 },
    { id: 'nutricion', nombre: 'Nutrición Capilar', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 35 },
    { id: 'peinado', nombre: 'Peinado', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 12 },
    { id: 'reflejos', nombre: 'Reflejos', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 20 },
];


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
      // Logic from previous version to pre-select services from params and fetch clients for admin
      if (searchParams.getAll('servicioId').length > 0 && services.length > 0) {
        const serviceIdParams = searchParams.getAll('servicioId');
        const preSelectedServices = services
          .filter(s => serviceIdParams.includes(s.id))
          .map(s => {
              const largo = searchParams.get(`largo_${s.id}`) as LargoPelo | null;
              return { ...s, largo: (s.precios && largo) ? largo : (s.precios ? 'corto' : undefined) };
          });
        setSelectedServices(preSelectedServices);
        if(!isAdmin) setStep(2); 
      }

      if (isAdmin) {
        setLoadingData(true);
        const clientsQuery = query(collection(db, 'clientes'), orderBy('nombre'));
        const clientsSnapshot = await getDocs(clientsQuery);
        setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente)));
        setLoadingData(false);
      } else if (user) {
        const userAsClient: Cliente = { id: user.id, nombre: user.nombre, apellido: '', email: user.email, telefono: '', fechaRegistro: new Date() as any };
        setSelectedClient(userAsClient);
      }
    };
    fetchData();
  }, [searchParams, isAdmin, user, services]);

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
            const largo = service.precios ? 'corto' : undefined;
            return [...prev, { ...service, largo }];
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

  const totalAmount = useMemo(() => selectedServices.reduce((acc, s) => acc + getServicePrice(s), 0), [selectedServices]);
  const totalDuration = useMemo(() => selectedServices.reduce((acc, s) => acc + s.duracion, 0), [selectedServices]);
  const depositAmount = useMemo(() => Math.round(totalAmount * MONTO_SEÑA_PORCENTAJE), [totalAmount]);

  const servicesSummary = useMemo(() => {
    if (selectedServices.length === 0) return 'Ninguno';
    const names = selectedServices.map(s => s.nombre);
    const limit = 3;
    let summary = names.slice(0, limit).join(', ');
    if (names.length > limit) {
        summary += ` y ${names.length - limit} más`;
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

  const formatPrice = (price: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  if (loadingData && isAdmin) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const steps = [
      { id: 1, name: 'Elige tus servicios', icon: Scissors, completed: selectedServices.length > 0 && selectedServices.every(s => !s.precios || s.largo) },
      { id: 2, name: 'Elige tu profesional', icon: Users, completed: !!selectedProfessional },
      { id: 3, name: 'Elige fecha y hora', icon: CalendarIcon, completed: !!selectedDate && !!selectedTime },
      { id: 4, name: 'Resumen y seña', icon: CheckCircle, completed: false },
  ]
  
  const currentStepInfo = steps[step - 1];
  const canGoNext = selectedServices.length > 0 && selectedServices.every(s => !s.precios || !!s.largo);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendar Turno</h1>
          <p className="text-muted-foreground">
            Sigue los pasos para confirmar tu cita en nuestro salón.
          </p>
        </div>
         <Link href="/servicios">
             <Button variant="outline"><ArrowLeft className="mr-2"/> Volver a Servicios</Button>
         </Link>
      </div>
       <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between p-2 border rounded-full">
            {steps.map((s) => (
                <button
                    key={s.id}
                    onClick={() => goToStep(s.id)}
                    disabled={!s.completed && step < s.id}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300",
                        step === s.id ? "bg-primary text-primary-foreground" : (s.completed ? "bg-primary/10 text-primary" : "text-muted-foreground")
                    )}
                >
                    {s.completed && step !== s.id ? <Check className="h-5 w-5"/> : <s.icon className="h-5 w-5" />}
                    <span className="hidden md:inline">{s.name}</span>
                </button>
            ))}
         </div>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                     {step}
                   </div>
                   <span>{currentStepInfo.name}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {step === 1 && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {services.map(service => {
                            const isSelected = selectedServices.some(s => s.id === service.id);
                            const selectedData = selectedServices.find(s => s.id === service.id);
                            
                            return (
                                <div key={service.id} onClick={() => handleServiceToggle(service)}
                                    className={cn("p-4 border rounded-lg cursor-pointer transition-all flex flex-col", 
                                    isSelected ? "border-primary ring-2 ring-primary/50 shadow-lg" : "hover:border-primary/50",
                                    !service.precios && 'justify-between'
                                    )}>
                                    
                                    <div className='flex justify-between items-start'>
                                        <div>
                                           <h4 className="font-semibold">{service.nombre}</h4>
                                           <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4"/>{service.duracion} min.</p>
                                        </div>
                                        <Checkbox checked={isSelected} className="rounded-full h-5 w-5"/>
                                    </div>
                                    
                                    <div className='mt-4'>
                                    {service.precios ? (
                                        isSelected ? (
                                             <div className="space-y-3">
                                                 <RadioGroup
                                                    value={selectedData?.largo}
                                                    onValueChange={(value) => handleLargoChange(service.id, value as LargoPelo)}
                                                    className="grid grid-cols-3 gap-2"
                                                >
                                                 {(Object.keys(service.precios) as LargoPelo[]).map(largo => (
                                                     <div key={largo}>
                                                         <RadioGroupItem value={largo} id={`${service.id}-${largo}`} className="sr-only" />
                                                         <Label htmlFor={`${service.id}-${largo}`} className={cn(
                                                            "block p-2 text-center text-xs font-semibold border rounded-md cursor-pointer transition-all capitalize",
                                                            selectedData?.largo === largo ? "border-primary bg-primary/10 text-primary" : "border-border"
                                                         )}>
                                                            {largo}
                                                         </Label>
                                                     </div>
                                                 ))}
                                                 </RadioGroup>
                                                 <p className="text-xs text-muted-foreground text-center flex items-center gap-1.5 justify-center"><Info className="h-3 w-3"/>Precios aproximados.</p>
                                             </div>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">Precio variable</p>
                                        )
                                    ) : (
                                        <p className="text-primary font-bold text-lg">{formatPrice(service.precio!)}</p>
                                    )}
                                    </div>
                                </div>
                            )
                            })}
                        </div>
                    </div>
                )}
                 {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {professionals.map(prof => {
                            const isSelected = selectedProfessional?.id === prof.id;
                            return (
                               <div key={prof.id} onClick={() => setSelectedProfessional(prof)}
                                className={cn("p-4 border rounded-lg cursor-pointer transition-all text-center", isSelected ? "border-primary ring-2 ring-primary" : "hover:border-primary/50")}>
                                  <Image src={prof.avatar} alt={prof.name} data-ai-hint={prof.hint} width={80} height={80} className="rounded-full mx-auto mb-4" />
                                  <h4 className="font-semibold">{prof.name}</h4>
                               </div>
                            )
                        })}
                    </div>
                )}
                {step === 3 && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="flex justify-center">
                            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) || date.getDay() === 0}
                                className="rounded-md border" locale={es}
                            />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 self-start max-h-72 overflow-y-auto p-1">
                            {timeSlots.map(time => (
                                <Button key={time} variant={selectedTime === time ? "default" : "outline"}
                                    onClick={() => setSelectedTime(time)} disabled={!selectedDate}>
                                    {time}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                {step === 4 && (
                     <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h3 className="font-semibold">Resumen del Turno</h3>
                             <div className="p-4 border rounded-lg bg-muted/50 space-y-3 text-sm">
                                {isAdmin && selectedClient && <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Clienta: <span className="font-semibold">{selectedClient.nombre} {selectedClient.apellido}</span></p>}
                                <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Profesional: <span className="font-semibold">{selectedProfessional?.name}</span></p>
                                <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary"/> Fecha: <span className="font-semibold">{selectedDate && format(selectedDate, "PPP", { locale: es })}</span></p>
                                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Hora: <span className="font-semibold">{selectedTime} hs</span></p>
                                <div className="border-t pt-3 mt-3">
                                    <h4 className="font-medium mb-2">Servicios:</h4>
                                    <ul className="space-y-1">
                                        {selectedServices.map(s => (
                                            <li key={s.id} className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-primary"/> 
                                                <span>{s.nombre} {s.largo ? `(${s.largo})` : ''}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h3 className="font-semibold">Detalle de Pago</h3>
                            <div className="p-6 border rounded-lg text-center bg-muted/50">
                                <p className="text-muted-foreground">{isAdmin ? "Precio Total del Servicio" : "Seña para confirmar (15%)"}</p>
                                <p className="text-4xl font-bold text-primary my-2">{formatPrice(isAdmin ? totalAmount : depositAmount)}</p>
                                {!isAdmin && <p className="text-sm text-muted-foreground">La seña se descontará del total de <span className="font-bold">{formatPrice(totalAmount)}</span> en tu visita.</p>}
                            </div>
                            {!isAdmin && <p className="text-xs text-center text-muted-foreground">Para asegurar tu turno se cobrará una seña del 15% del valor total. Luego se descontará del precio final.</p>}
                         </div>
                     </div>
                )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4 md:flex-row md:justify-between">
                { step === 1 && selectedServices.length > 0 &&
                    <div className='p-3 border rounded-lg bg-muted/50 text-sm w-full'>
                        <p><span className="font-semibold">Total estimado:</span> {formatPrice(totalAmount)}</p>
                        <p><span className="font-semibold">Tiempo total:</span> {totalDuration} min.</p>
                        <p className="truncate"><span className="font-semibold">Servicios:</span> {servicesSummary}</p>
                    </div>
                }
                <div className='flex justify-between w-full'>
                    <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}><ArrowLeft className="mr-2"/> Anterior</Button>
                    {step < 4 ? (
                        <Button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !canGoNext) || (step === 2 && !selectedProfessional) || (step === 3 && !selectedTime)}>Siguiente</Button>
                    ) : (
                        <Button onClick={onSubmit} size="lg" disabled={isSubmitting || selectedServices.length === 0}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Turno'}
                        </Button>
                    )}
                </div>
            </CardFooter>
          </Card>
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

    