
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
  const [services] = useState<Servicio[]>(mockServices.sort((a, b) => a.nombre.localeCompare(b.nombre)));

  const [selectedServices, setSelectedServices] = useState<SelectedServiceWithLargo[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<(typeof professionals[0]) | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  
  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      // Logic to pre-select services from params
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
            // For variable price services, don't set a default largo.
            // It must be explicitly chosen by the user.
            const largo = service.precios ? undefined : undefined;
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
    return names.join(', ');
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
  
  const canGoNext = useMemo(() => {
    if (selectedServices.length === 0) return false;
    // Check if every selected service that is variable has a 'largo' selected.
    return selectedServices.every(s => !s.precios || !!s.largo);
  }, [selectedServices]);

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
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                     1
                   </div>
                   <span>Elige tus servicios</span>
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
                                  isSelected ? "border-primary ring-2 ring-primary/20 shadow-lg" : "hover:border-primary/50",
                                  )}>
                                  
                                  <div className='flex justify-between items-start'>
                                      <div>
                                         <h4 className="font-semibold">{service.nombre}</h4>
                                         <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3"/>{service.duracion} min.</p>
                                      </div>
                                      <Checkbox checked={isSelected} className="rounded-full h-5 w-5"/>
                                  </div>
                                  
                                  <div className='mt-4 flex-grow flex flex-col justify-end'>
                                      {service.precios ? (
                                        <>
                                          {isSelected ? (
                                              <div className="space-y-3" onClick={e => e.stopPropagation()}>
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
                                                              selectedData?.largo === largo ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                                                          )}>
                                                              {largo}
                                                          </Label>
                                                      </div>
                                                  ))}
                                                  </RadioGroup>
                                                  <div className="h-6 text-center">
                                                    {selectedData?.largo ? (
                                                        <p className="text-primary font-bold text-sm">≈ {formatPrice(getServicePrice(selectedData))}</p>
                                                    ) : (
                                                       <p className="text-xs text-muted-foreground italic">Elige un largo</p>
                                                    )}
                                                  </div>
                                              </div>
                                          ) : (
                                              <p className="text-muted-foreground text-sm text-center">Precio variable</p>
                                          )}
                                        </>
                                      ) : (
                                          <p className="text-primary font-bold text-lg text-center">{formatPrice(service.precio!)}</p>
                                      )}
                                  </div>
                              </div>
                          )
                          })}
                      </div>
                  </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4 md:flex-row md:justify-between">
                {selectedServices.length > 0 &&
                    <div className='p-3 border rounded-lg bg-muted/50 text-sm w-full'>
                        <p><span className="font-semibold">Total estimado:</span> {canGoNext ? formatPrice(totalAmount) : '...'}</p>
                        <p><span className="font-semibold">Tiempo total:</span> {totalDuration} min.</p>
                        <p className="truncate"><span className="font-semibold">Servicios:</span> {servicesSummary}</p>
                    </div>
                }
                <div className='flex justify-end w-full'>
                    <Button onClick={() => setStep(2)} disabled={!canGoNext}>Siguiente</Button>
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
