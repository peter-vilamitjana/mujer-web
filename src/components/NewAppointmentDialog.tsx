'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Plus, ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, User, Scissors, CheckCircle, Search } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import type { Cliente, Servicio } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Hardcoded professionals as requested
const professionals = [
  { id: 'carolina_espranda', name: 'Carolina Espranda' },
  { id: 'laura_bortolaso', name: 'Laura Bortolaso' },
  { id: 'fabiana_estilista', name: 'Fabiana' },
];

const MONTO_SEÑA = 3000; // Fixed deposit amount

export default function NewAppointmentDialog() {
  const user = useUser();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  
  // Data from Firestore
  const [clients, setClients] = useState<Cliente[]>([]);
  const [services, setServices] = useState<Servicio[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isAdmin = user?.rol === 'admin';

  // Fetch initial data for the form
  useEffect(() => {
    if (!open) return; // Only fetch when dialog opens

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch clients if admin
        if (isAdmin) {
          const clientsQuery = query(collection(db, 'clientes'), orderBy('nombre'));
          const clientsSnapshot = await getDocs(clientsQuery);
          setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente)));
        }
        // Fetch services
        const servicesQuery = query(collection(db, 'servicios'), orderBy('nombre'));
        const servicesSnapshot = await getDocs(servicesQuery);
        setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Servicio)));
      } catch (error) {
        console.error("Error fetching data for appointment:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios.",
          variant: "destructive"
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [open, isAdmin, toast]);
  
  const resetForm = useCallback(() => {
    setStep(1);
    setSelectedClient(null);
    setSelectedService(null);
    setSelectedProfessional(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
    setIsSubmitting(false);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        resetForm();
    }
  }

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const handleSaveAppointment = async () => {
      if (!selectedService || !selectedDate || !selectedTime || !selectedProfessional) {
        toast({ title: "Faltan datos", description: "Por favor completa todos los campos.", variant: "destructive" });
        return;
      }
      
      let finalClient = selectedClient;
      if (!finalClient && !isAdmin) { // If clienta is logged in
        finalClient = { id: user.id, nombre: user.nombre, apellido: '', email: user.email, telefono: '', fechaRegistro: new Date() as any };
      }

      if(!finalClient) {
        toast({ title: "Clienta no seleccionada", description: "Por favor, selecciona una clienta.", variant: "destructive" });
        return;
      }

      setIsSubmitting(true);
      try {
          const [hour, minute] = selectedTime.split(':').map(Number);
          const appointmentDateTime = new Date(selectedDate);
          appointmentDateTime.setHours(hour, minute, 0, 0);

          await addDoc(collection(db, 'turnos'), {
            clienteId: finalClient.id,
            clienteNombre: `${finalClient.nombre} ${finalClient.apellido || ''}`.trim(),
            servicio: selectedService.nombre,
            servicioId: selectedService.id,
            precio: selectedService.precio,
            empleadaNombre: selectedProfessional,
            empleadaAsignadaId: professionals.find(p => p.name === selectedProfessional)?.id,
            fecha: serverTimestamp(),
            estado: isAdmin ? 'pendiente' : 'pendiente_pago',
            señaPagada: false,
            montoSeña: MONTO_SEÑA,
          });
          toast({
            title: "¡Turno agendado!",
            description: `El turno para ${finalClient.nombre} ha sido creado.`,
          });
          handleOpenChange(false);
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
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

  const timeSlots = useMemo(() => {
    return ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  }, []);

  const renderContent = () => {
    if (loadingData) return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin" /></div>;

    const adminStepOffset = isAdmin ? 1 : 0;

    // Step 1: Select Client (Admin only)
    if (isAdmin && step === 1) {
      return (
        <div className="space-y-4">
          <h4 className="font-semibold">Paso 1: Seleccionar Clienta</h4>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {selectedClient ? `${selectedClient.nombre} ${selectedClient.apellido}` : "Buscar clienta..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar por nombre..." />
                <CommandList>
                  <CommandEmpty>No se encontraron clientas.</CommandEmpty>
                  <CommandGroup>
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={`${client.nombre} ${client.apellido} ${client.email}`}
                        onSelect={() => {
                          setSelectedClient(client);
                          handleNextStep();
                        }}
                      >
                        <CheckCircle className={cn("mr-2 h-4 w-4", selectedClient?.id === client.id ? "opacity-100" : "opacity-0")} />
                        {client.nombre} {client.apellido}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      );
    }
    
    // Step 2: Select Service
    if (step === 1 + adminStepOffset) {
        return (
            <div className="space-y-4">
                <h4 className="font-semibold">Paso {step}: Seleccionar Servicio</h4>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                    {services.map(service => (
                        <Button key={service.id} variant={selectedService?.id === service.id ? 'default' : 'outline'} className="h-auto py-2 flex flex-col items-start text-left" onClick={() => setSelectedService(service)}>
                            <span className="font-bold">{service.nombre}</span>
                            <span className="text-xs">{formatPrice(service.precio)}</span>
                        </Button>
                    ))}
                </div>
            </div>
        )
    }

    // Step 3: Select Professional
    if (step === 2 + adminStepOffset) {
        return (
            <div className="space-y-4">
                <h4 className="font-semibold">Paso {step}: Seleccionar Profesional</h4>
                <div className="grid grid-cols-1 gap-2">
                    {professionals.map(prof => (
                        <Button key={prof.id} variant={selectedProfessional === prof.name ? 'default' : 'outline'} onClick={() => setSelectedProfessional(prof.name)}>
                            {prof.name}
                        </Button>
                    ))}
                </div>
            </div>
        )
    }

    // Step 4: Select Date & Time
    if (step === 3 + adminStepOffset) {
      return (
        <div className="space-y-4">
          <h4 className="font-semibold">Paso {step}: Seleccionar Fecha y Hora</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
              className="rounded-md border"
              locale={es}
            />
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                {timeSlots.map(time => (
                    <Button key={time} variant={selectedTime === time ? 'default' : 'outline'} onClick={() => setSelectedTime(time)}>
                        {time}
                    </Button>
                ))}
            </div>
          </div>
        </div>
      )
    }

    // Step 5: Confirmation
    if (step === 4 + adminStepOffset) {
        return (
            <div className="space-y-4">
                <h4 className="font-semibold">Paso {step}: Confirmar Turno</h4>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-2 text-sm">
                    {isAdmin && selectedClient && <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Clienta: <span className="font-semibold">{selectedClient.nombre} {selectedClient.apellido}</span></p>}
                    <p className="flex items-center gap-2"><Scissors className="h-4 w-4 text-primary"/> Servicio: <span className="font-semibold">{selectedService?.nombre} ({formatPrice(selectedService?.precio || 0)})</span></p>
                    <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Profesional: <span className="font-semibold">{selectedProfessional}</span></p>
                    <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary"/> Fecha: <span className="font-semibold">{selectedDate && format(selectedDate, "PPP", { locale: es })}</span></p>
                    <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Hora: <span className="font-semibold">{selectedTime} hs</span></p>
                </div>
                 {!isAdmin && (
                    <div className="p-4 border rounded-lg text-center">
                        <p className="font-semibold">Seña para confirmar</p>
                        <p className="text-2xl font-bold text-primary">{formatPrice(MONTO_SEÑA)}</p>
                        <p className="text-xs text-muted-foreground">La seña se descontará del total en tu visita.</p>
                    </div>
                )}
            </div>
        )
    }

    return null;
  }
  
  const canGoNext = () => {
    const adminOffset = isAdmin ? 1 : 0;
    if (isAdmin && step === 1) return !!selectedClient;
    if (step === 1 + adminOffset) return !!selectedService;
    if (step === 2 + adminOffset) return !!selectedProfessional;
    if (step === 3 + adminOffset) return !!selectedDate && !!selectedTime;
    return false;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agendar Turno
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Turno</DialogTitle>
          <DialogDescription>
            {user?.rol === 'admin' ? 'Completa los datos para agendar un turno a una clienta.' : 'Sigue los pasos para reservar tu turno.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            {renderContent()}
        </div>

        <DialogFooter className="flex justify-between w-full">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
              )}
            </div>
            <div>
              {step < (isAdmin ? 5 : 4) ? (
                  <Button onClick={handleNextStep} disabled={!canGoNext()}>
                      Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              ) : (
                  <Button onClick={handleSaveAppointment} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" /> : (isAdmin ? 'Confirmar Turno' : 'Pagar Seña y Confirmar')}
                  </Button>
              )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
