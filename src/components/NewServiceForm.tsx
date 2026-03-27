'use client';

import { useState } from 'react';
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
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, PlusCircle } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  precio: z.coerce.number().positive({ message: 'El precio debe ser mayor a cero.' }),
  duracion: z.coerce.number().positive({ message: 'La duración debe ser mayor a cero.' }),
});

export default function NewServiceForm() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { tenantId } = useTenant();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      precio: 0,
      duracion: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (!tenantId) throw new Error("No hay un salón activo en el contexto.");
      await addDoc(collection(db, 'tenants', tenantId, 'services'), {
        nombre: values.nombre,
        precio: values.precio,
        duracion: values.duracion,
      });
      toast({
        title: '¡Servicio Creado!',
        description: `${values.nombre} ha sido añadido a la lista de servicios.`,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error al crear servicio:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el servicio. Intenta de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Servicio</DialogTitle>
          <DialogDescription>
            Completa los datos para registrar un nuevo servicio en el sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Servicio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Corte y Peinado" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="precio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (ARS)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 5000" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duracion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (minutos)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 60" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar Servicio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
