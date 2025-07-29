'use client';
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import NewServiceForm from "@/components/NewServiceForm";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import type { Servicio, PreciosPorLargo } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

const mockServices: Servicio[] = allServices.map((s, i) => ({ ...s, id: `servicio-mock-${i}`, descripcion: '' }));

export default function ServiciosPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const user = useUser();
  const userRole = user?.rol;
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedServiceId) return;
    const params = new URLSearchParams();
    params.append('servicioId', selectedServiceId);
    router.push(`/turnos?${params.toString()}`);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            {userRole === 'clienta'
              ? 'Paso 1: Elige un servicio para tu turno.'
              : 'Gestioná los servicios ofrecidos en el salón.'
            }
          </p>
        </div>
        {userRole === 'admin' && <NewServiceForm />}
      </div>

      <RadioGroup
        name="servicio"
        value={selectedServiceId || ''}
        onValueChange={setSelectedServiceId}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {mockServices.map(servicio => {
          const isSelected = selectedServiceId === servicio.id;

          return (
            <div key={servicio.id}>
              <RadioGroupItem value={servicio.id} id={servicio.id} className="sr-only" />
              <Label htmlFor={servicio.id} className="cursor-pointer">
                <Card
                  className={cn(
                    "flex flex-col rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full",
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
                    </div>

                    <div className="flex-grow space-y-4 my-4 flex items-center justify-center">
                       <p className="text-3xl font-bold text-primary text-center my-4">{formatPrice(servicio.precio || 0)}</p>
                    </div>
                     {servicio.precios && (
                      <p className="text-xs text-muted-foreground text-center mt-auto">Precio base. Varía según el largo.</p>
                     )}
                  </CardContent>
                </Card>
              </Label>
            </div>
          )
        })}
      </RadioGroup>
      
      {userRole === 'clienta' && (
        <div className="sticky bottom-6 mt-8 flex justify-center z-20">
          <div className="w-full max-w-md">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedServiceId}
              className="w-full rounded-full py-6 text-lg"
            >
              Siguiente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
