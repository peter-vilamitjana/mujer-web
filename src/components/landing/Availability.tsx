'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

type Inputs = {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
};

export default function Availability() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Faltan datos",
        description: "Por favor, selecciona una fecha y una hora.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const [hour, minute] = selectedTime.split(':').map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hour, minute, 0, 0);

      await addDoc(collection(db, 'turnos'), {
        clienteNombre: `${data.nombre} ${data.apellido}`,
        clienteEmail: data.email,
        clienteTelefono: data.telefono,
        fecha: appointmentDateTime,
        servicio: "Solicitud desde la web",
        estado: 'pendiente',
        empleadaNombre: 'A asignar',
        fechaSolicitud: serverTimestamp(),
      });
      
      toast({
        title: "¡Solicitud Enviada!",
        description: "Gracias por tu interés. Nos pondremos en contacto contigo pronto para confirmar tu turno.",
      });
      reset();
      setSelectedDate(new Date());
      setSelectedTime(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="horarios" className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Agenda tu Turno</h2>
          <p className="mt-4 text-lg text-muted-foreground">Selecciona una fecha y hora, y déjanos tus datos para ponernos en contacto.</p>
        </div>
        <Card className="max-w-4xl mx-auto shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">1. Elige Fecha y Hora</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                    className="rounded-md border mx-auto"
                    locale={es}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(time => (
                      <Button 
                        key={time}
                        type="button"
                        variant={selectedTime === time ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time} hs
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">2. Completa tus Datos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" {...register("nombre", { required: true })} placeholder="Tu nombre" />
                    {errors.nombre && <p className="text-xs text-destructive">El nombre es requerido.</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" {...register("apellido", { required: true })} placeholder="Tu apellido" />
                     {errors.apellido && <p className="text-xs text-destructive">El apellido es requerido.</p>}
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email", { required: true })} placeholder="tu@email.com" />
                  {errors.email && <p className="text-xs text-destructive">El email es requerido.</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" type="tel" {...register("telefono", { required: true })} placeholder="11 2233 4455" />
                  {errors.telefono && <p className="text-xs text-destructive">El teléfono es requerido.</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-6">
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar Solicitud de Turno'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </section>
  );
}
