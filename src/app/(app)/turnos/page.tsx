'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Calendar as CalendarIcon, Clock, User, Tag, ArrowLeft, Check, CheckCircle, Users } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import type { Cliente, Servicio } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

const professionals = [
  { id: 'carolina_espranda', name: 'Carolina Espranda', avatar: 'https://placehold.co/100x100.png', hint: 'woman professional' },
  { id: 'laura_bortolaso', name: 'Laura Bortolaso', avatar: 'https://placehold.co/100x100.png', hint: 'woman smiling' },
  { id: 'fabiana_estilista', name: 'Fabiana', avatar: 'https://placehold.co/100x100.png', hint: 'woman portrait' },
];

const MONTO_SEÑA_PORCENTAJE = 0.15; // 15%

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

function TurnosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [clients, setClients] = useState<Cliente[]>([]);
  const [services, setServices] = useState<Servicio[]>([]);

  const [selectedServices, setSelectedServices] = useState<Servicio[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<(typeof professionals[0]) | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  
  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const servicesQuery = query(collection(db, 'servicios'), orderBy('nombre'));
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Servicio));
        setServices(servicesData);

        const serviceIdParams = searchParams.getAll('servicioId');
        if (serviceIdParams.length > 0) {
          const preSelectedServices = servicesData.filter(s => serviceIdParams.includes(s.id));
          setSelectedServices(preSelectedServices);
          setStep(2); 
        }

        if (isAdmin) {
          const clientsQuery = query(collection(db, 'clientes'), orderBy('nombre'));
          const clientsSnapshot = await getDocs(clientsQuery);
          setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente)));
        } else if (user) {
          const userAsClient: Cliente = { id: user.id, nombre: user.nombre, apellido: '', email: user.email, telefono: '', fechaRegistro: new Date() as any };
          setSelectedClient(userAsClient);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [searchParams, isAdmin, user, toast]);

  const goToStep = (stepNumber: number) => {
    if (step > stepNumber) {
      setStep(stepNumber);
    }
  };

  const handleServiceToggle = (service: Servicio) => {
    setSelectedServices(prev => 
      prev.some(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };
  
  const totalAmount = useMemo(() => selectedServices.reduce((acc, s) => acc + s.precio, 0), [selectedServices]);
  const depositAmount = useMemo(() => totalAmount * MONTO_SEÑA_PORCENTAJE, [totalAmount]);

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

        await addDoc(collection(db, 'turnos'), {
          clienteId: selectedClient.id,
          clienteNombre: `${selectedClient.nombre} ${selectedClient.apellido || ''}`.trim(),
          servicio: selectedServices.map(s => s.nombre).join(', '),
          servicioId: selectedServices.map(s => s.id).join(','),
          precio: totalAmount,
          empleadaNombre: selectedProfessional.name,
          empleadaAsignadaId: selectedProfessional.id,
          fecha: appointmentDateTime,
          estado: isAdmin ? 'pendiente' : 'pendiente_pago',
          señaPagada: false,
          montoSeña: depositAmount,
          fechaCreacion: serverTimestamp(),
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

  if (loadingData) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const steps = [
      { id: 1, name: 'Elige tus servicios', icon: Scissors, completed: selectedServices.length > 0 },
      { id: 2, name: 'Elige tu profesional', icon: Users, completed: !!selectedProfessional },
      { id: 3, name: 'Elige fecha y hora', icon: CalendarIcon, completed: !!selectedDate && !!selectedTime },
      { id: 4, name: 'Resumen y señal', icon: CheckCircle, completed: false },
  ]
  
  const currentStepInfo = steps[step - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendar Turno</h1>
          <p className="text-muted-foreground">
            Sigue los pasos para confirmar tu cita en nuestro salón.
          </p>
        </div>
      </div>
       <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between p-2 border rounded-full">
            {steps.map((s, index) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map(service => {
                           const isSelected = selectedServices.some(s => s.id === service.id);
                           return (
                            <div key={service.id} onClick={() => handleServiceToggle(service)}
                                className={cn("p-4 border rounded-lg cursor-pointer transition-all", isSelected ? "border-primary ring-2 ring-primary" : "hover:border-primary/50")}>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">{service.nombre}</h4>
                                    <Checkbox checked={isSelected} className="rounded-full h-5 w-5"/>
                                </div>
                                <p className="text-sm text-muted-foreground">{formatPrice(service.precio)} - {service.duracion} min</p>
                            </div>
                           )
                        })}
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
                                disabled={(date) => date < new Date() || date.getDay() === 0}
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
                             <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                                {isAdmin && selectedClient && <p className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-primary"/> Clienta: <span className="font-semibold">{selectedClient.nombre} {selectedClient.apellido}</span></p>}
                                <p className="flex items-start gap-2 text-sm"><Tag className="h-4 w-4 text-primary mt-0.5"/> Servicios: <span className="font-semibold flex flex-col">{selectedServices.map(s => s.nombre).map(name => <span key={name}>{name}</span>)}</span></p>
                                <p className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-primary"/> Profesional: <span className="font-semibold">{selectedProfessional?.name}</span></p>
                                <p className="flex items-center gap-2 text-sm"><CalendarIcon className="h-4 w-4 text-primary"/> Fecha: <span className="font-semibold">{selectedDate && format(selectedDate, "PPP", { locale: es })}</span></p>
                                <p className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-primary"/> Hora: <span className="font-semibold">{selectedTime} hs</span></p>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h3 className="font-semibold">Detalle de Pago</h3>
                            <div className="p-6 border rounded-lg text-center bg-muted/50">
                                <p className="text-muted-foreground">{isAdmin ? "Precio Total del Servicio" : "Seña para confirmar"}</p>
                                <p className="text-4xl font-bold text-primary my-2">{formatPrice(isAdmin ? totalAmount : depositAmount)}</p>
                                {!isAdmin && <p className="text-sm text-muted-foreground">La seña se descontará del total de <span className="font-bold">{formatPrice(totalAmount)}</span> en tu visita.</p>}
                            </div>
                            {!isAdmin && <p className="text-xs text-center text-muted-foreground">Para asegurar tu turno se cobrará una seña del 15% del valor total. Luego se descontará del precio final.</p>}
                         </div>
                     </div>
                )}
            </CardContent>
            <CardFooter className="justify-between">
                <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}><ArrowLeft className="mr-2"/> Anterior</Button>
                {step < 4 ? (
                    <Button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && selectedServices.length === 0) || (step === 2 && !selectedProfessional) || (step === 3 && !selectedTime)}>Siguiente</Button>
                ) : (
                    <Button onClick={onSubmit} size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Turno'}
                    </Button>
                )}
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
