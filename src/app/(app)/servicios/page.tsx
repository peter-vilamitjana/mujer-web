'use client';
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Check } from "lucide-react";
import NewServiceForm from "@/components/NewServiceForm";
import { useUser } from "@/contexts/UserContext";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Servicio, LargoPelo } from "@/lib/types";

const allServices: Omit<Servicio, 'id' | 'descripcion'>[] = [
    { nombre: 'Corte', precio: 30000, duracion: 15 },
    { nombre: 'Lavado', precio: 9000, duracion: 10 },
    { nombre: 'Peinado', precio: 18000, precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 12 },
    { nombre: 'Mechas', precio: 18000, precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 25 },
    { nombre: 'Reflejos', precio: 18000, precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 20 },
    { nombre: 'Color', precio: 18000, precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 45 },
    { nombre: 'Baño de Crema', precio: 18000, precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 30 },
    { nombre: 'Botox Capilar', precio: 18000, precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 40 },
    { nombre: 'Alisados', precio: 18000, precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 60 },
    { nombre: 'Nutrición Capilar', precio: 18000, precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 35 },
];

const mockServices: Servicio[] = allServices.map((s, i) => ({ ...s, id: `mock-${i}`, descripcion: '' }));

type SelectedService = {
  id: string;
  largo?: LargoPelo;
}

export default function ServiciosPage() {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const user = useUser();
  const userRole = user?.rol;
  const router = useRouter();

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
        const isSelected = prev.some(s => s.id === serviceId);
        if (isSelected) {
            return prev.filter(s => s.id !== serviceId);
        } else {
            const service = mockServices.find(s => s.id === serviceId);
            const initialLargo = service?.precios ? 'corto' : undefined;
            return [...prev, { id: serviceId, largo: initialLargo }];
        }
    });
  };
  
  const handleContinue = () => {
    const params = new URLSearchParams();
    selectedServices.forEach(s => {
      params.append('servicioId', s.id);
    });
    router.push(`/turnos?${params.toString()}`);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  }
  
  const totalAmount = useMemo(() => {
    return selectedServices.reduce((sum, s) => {
        const serviceData = mockServices.find(data => data.id === s.id);
        if (!serviceData) return sum;

        if (serviceData.precios && s.largo) {
            return sum + serviceData.precios[s.largo];
        }
        return sum + (serviceData.precio || 0);
    }, 0);
  }, [selectedServices]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            {userRole === 'clienta' 
              ? 'Paso 1: Elige uno o más servicios para tu turno.' 
              : 'Gestioná los servicios ofrecidos en el salón.'
            }
          </p>
        </div>
        {userRole === 'admin' && <NewServiceForm />}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockServices.map(servicio => {
            const isSelected = selectedServices.some(s => s.id === servicio.id);

            return (
              <Card 
                key={servicio.id} 
                onClick={() => userRole === 'clienta' && handleServiceToggle(servicio.id)}
                className={cn(
                    "flex flex-col rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer", 
                    isSelected && "ring-2 ring-primary"
                )}
               >
                 <CardContent className="p-6 flex-grow flex flex-col">
                     <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold">{servicio.nombre}</h3>
                            <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Clock className="h-4 w-4" />
                              <span>{servicio.duracion} min.</span>
                            </p>
                        </div>
                        {userRole === 'clienta' &&
                            <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => handleServiceToggle(servicio.id)}
                                className="h-6 w-6 rounded-full"
                            />
                        }
                     </div>

                    <div className="flex-grow space-y-4 my-4 flex items-center justify-center">
                        <p className="text-3xl font-bold text-primary text-center my-4">{formatPrice(servicio.precio || 0)}</p>
                    </div>
                 </CardContent>
                 <CardFooter className="p-6 pt-0 mt-auto">
                    {userRole === 'admin' ? (
                        <Button variant="outline" className="w-full">Editar Servicio</Button>
                    ) : (
                       <Button className="w-full" onClick={() => handleServiceToggle(servicio.id)} variant={isSelected ? 'default' : 'outline'}>
                           {isSelected ? <><Check className="mr-2"/> Seleccionado</> : 'Seleccionar'}
                        </Button>
                    )}
                 </CardFooter>
              </Card>
            )
          })}
        </div>
         {userRole === 'clienta' && selectedServices.length > 0 && (
            <div className="sticky bottom-6 mt-8 flex justify-center z-20">
              <Card className="p-4 shadow-2xl shadow-primary/20 flex items-center gap-6 rounded-full bg-card/80 backdrop-blur-lg">
                <div>
                  <p className="text-sm font-medium">Total (aprox.)</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(totalAmount)}</p>
                </div>
                <Button size="lg" onClick={handleContinue} className="rounded-full">
                  Siguiente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>
            </div>
          )}
    </div>
  );
}
