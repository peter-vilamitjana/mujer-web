'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Calendar as CalendarIcon, Clock, User, Tag } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import type { Cliente, Servicio } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

const professionals = [
  { id: 'carolina_espranda', name: 'Carolina Espranda' },
  { id: 'laura_bortolaso', name: 'Laura Bortolaso' },
  { id: 'fabiana_estilista', name: 'Fabiana' },
];

const MONTO_SEÑA = 3000;

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

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

  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const servicesQuery = query(collection(db, 'servicios'), orderBy('nombre'));
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Servicio));
        setServices(servicesData);

        const serviceIdParam = searchParams.get('servicioId');
        if (serviceIdParam) {
          const preSelectedService = servicesData.find(s => s.id === serviceIdParam);
          if (preSelectedService) {
            setSelectedService(preSelectedService);
            setStep(isAdmin ? 2 : 2);
          }
        }

        if (isAdmin) {
          const clientsQuery = query(collection(db, 'clientes'), orderBy('nombre'));
          const clientsSnapshot = await getDocs(clientsQuery);
          const clientsData = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente));
          setClients(clientsData);

          const clientIdParam = searchParams.get('clienteId');
          if (clientIdParam) {
            const preSelectedClient = clientsData.find(c => c.id === clientIdParam);
            if(preSelectedClient) {
                setSelectedClient(preSelectedClient);
                setStep(2);
            }
          }
        } else if (user) {
            const userAsClient: Cliente = { id: user.id, nombre: user.nombre, apellido: '', email: user.email, telefono: '', fechaRegistro: new Date() as any };
            setSelectedClient(userAsClient);
            if(searchParams.get('servicioId')) setStep(2);
            else setStep(1);
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

  const handleNextStep = () => setStep(prev => prev + 1);
  const goToStep = (stepNumber: number) => setStep(stepNumber);

  const onSubmit = async () => {
    if (!selectedClient || !selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
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
          servicio: selectedService.nombre,
          servicioId: selectedService.id,
          precio: selectedService.precio,
          empleadaNombre: selectedProfessional,
          empleadaAsignadaId: professionals.find(p => p.name === selectedProfessional)?.id,
          fecha: appointmentDateTime,
          estado: isAdmin ? 'pendiente' : 'pendiente_pago',
          señaPagada: false,
          montoSeña: MONTO_SEÑA,
        });

        toast({
          title: "¡Turno agendado!",
          description: `El turno para ${selectedClient.nombre} ha sido creado exitosamente.`,
        });
        router.push('/agenda');
    } catch (error) {
        console.error("Error al agendar turno:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo agendar el turno. Intenta de nuevo.",
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

  if (loadingData) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const CurrentStepCard: React.FC<{
      stepNumber: number;
      title: string;
      children: React.ReactNode;
  }> = ({ stepNumber, title, children }) => {
      const isCurrent = step === stepNumber;
      const isCompleted = step > stepNumber;

      let statusStyles = "bg-muted-foreground";
      if(isCurrent) statusStyles = "bg-primary";
      if(isCompleted) statusStyles = "bg-green-500";
      
      return (
        <Card className={cn(!isCurrent && !isCompleted && "opacity-50 pointer-events-none")}>
            <CardHeader>
                <button
                    onClick={() => isCompleted && goToStep(stepNumber)}
                    disabled={!isCompleted}
                    className="w-full text-left disabled:cursor-not-allowed"
                >
                    <CardTitle className="flex items-center gap-3">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors", statusStyles)}>
                            {isCompleted ? '✓' : stepNumber}
                        </div>
                        <span>{title}</span>
                    </CardTitle>
                </button>
            </CardHeader>
            {isCurrent && <CardContent>{children}</CardContent>}
        </Card>
      );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendar Turno</h1>
        <p className="text-muted-foreground">
          Sigue los pasos para confirmar tu cita en nuestro salón.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <CurrentStepCard stepNumber={1} title="Elige tu Servicio">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); handleNextStep(); }}
                  className={cn(
                    "p-4 border rounded-lg text-left hover:border-primary transition-all",
                    selectedService?.id === service.id && "border-primary ring-2 ring-primary"
                  )}
                >
                  <h4 className="font-semibold">{service.nombre}</h4>
                  <p className="text-sm text-muted-foreground">{service.duracion} min</p>
                  <p className="font-bold text-primary mt-2">{formatPrice(service.precio)}</p>
                </button>
              ))}
            </div>
        </CurrentStepCard>
        
        <CurrentStepCard stepNumber={2} title="Elige tu Profesional">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {professionals.map(prof => (
                    <button
                        key={prof.id}
                        onClick={() => { setSelectedProfessional(prof.name); handleNextStep(); }}
                        className={cn(
                            "p-4 border rounded-lg text-left hover:border-primary transition-all",
                            selectedProfessional === prof.name && "border-primary ring-2 ring-primary"
                        )}
                    >
                        <h4 className="font-semibold">{prof.name}</h4>
                    </button>
                ))}
            </div>
        </CurrentStepCard>

        <CurrentStepCard stepNumber={3} title="Elige Fecha y Hora">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="rounded-md border"
                        locale={es}
                    />
                </div>
                <div className="grid grid-cols-3 gap-2 self-start max-h-72 overflow-y-auto">
                    {timeSlots.map(time => (
                        <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => { setSelectedTime(time); handleNextStep(); }}
                            disabled={!selectedDate}
                        >
                            {time} hs
                        </Button>
                    ))}
                </div>
            </div>
        </CurrentStepCard>

        {step === 4 && (
            <Card>
                <CardHeader>
                    <CardTitle>Resumen y Confirmación</CardTitle>
                    <CardDescription>Revisa los detalles de tu turno antes de confirmar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-2 text-sm">
                        {isAdmin && selectedClient && <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Clienta: <span className="font-semibold">{selectedClient.nombre} {selectedClient.apellido}</span></p>}
                        <p className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary"/> Servicio: <span className="font-semibold">{selectedService?.nombre}</span></p>
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Profesional: <span className="font-semibold">{selectedProfessional}</span></p>
                        <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary"/> Fecha: <span className="font-semibold">{selectedDate && format(selectedDate, "PPP", { locale: es })}</span></p>
                        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Hora: <span className="font-semibold">{selectedTime} hs</span></p>
                    </div>

                    <div className="p-4 border rounded-lg text-center">
                        <p className="font-semibold">{isAdmin ? "Precio del Servicio" : "Seña para confirmar"}</p>
                        <p className="text-2xl font-bold text-primary">{formatPrice(isAdmin && selectedService ? selectedService.precio : MONTO_SEÑA)}</p>
                        {!isAdmin && <p className="text-xs text-muted-foreground">La seña se descontará del total en tu visita.</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={onSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (isAdmin ? 'Confirmar Turno' : 'Pagar Seña y Confirmar')}
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
        <Suspense fallback={<div>Cargando...</div>}>
            <TurnosContent />
        </Suspense>
    )
}
