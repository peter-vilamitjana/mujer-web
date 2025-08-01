'use client';
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Minus, Plus } from "lucide-react";
import NewServiceForm from "@/components/NewServiceForm";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import type { Servicio, PreciosPorLargo, LargoPelo } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
];


export default function ServiciosPage() {
  const [selectedServices, setSelectedServices] = useState<SelectedServiceWithLargo[]>([]);
  const user = useUser();
  const userRole = user?.rol;
  const router = useRouter();

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

  const handleContinue = () => {
    if (selectedServices.length === 0) return;
    const params = new URLSearchParams();
    selectedServices.forEach(service => {
        params.append('servicioId', service.id);
        if (service.largo) {
            params.append(`largo_${service.id}`, service.largo);
        }
    });
    router.push(`/turnos?${params.toString()}`);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  }

  const totalAmount = useMemo(() => selectedServices.reduce((acc, s) => acc + getServicePrice(s), 0), [selectedServices]);
  const totalDuration = useMemo(() => selectedServices.reduce((acc, s) => acc + s.duracion, 0), [selectedServices]);
  
  const servicesSummary = useMemo(() => {
    if (selectedServices.length === 0) return '';
    const names = selectedServices.map(s => s.nombre);
    const limit = 3;
    let summary = names.slice(0, limit).join(', ');
    if (names.length > limit) {
        summary += ` +${names.length - limit} más`;
    }
    return summary;
  }, [selectedServices]);


  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            Paso 1: Elige uno o más servicios para tu turno.
          </p>
        </div>
        {userRole === 'admin' && <NewServiceForm />}
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
        {mockServices.map(servicio => {
          const isSelected = selectedServices.some(s => s.id === servicio.id);
          const selectedData = selectedServices.find(s => s.id === servicio.id);
          
          return (
            <div
              key={servicio.id}
              onClick={() => handleServiceToggle(servicio)}
              className={cn(
                "flex flex-col rounded-2xl bg-card shadow-sm border-2 cursor-pointer transition-all duration-200 h-full p-6",
                 "hover:shadow-md",
                 isSelected 
                    ? "border-primary shadow-lg ring-2 ring-primary/20 dark:ring-primary/40 dark:border-primary/50" 
                    : "border-transparent"
              )}
            >
                <div className="flex-grow">
                   <h3 className="text-xl font-semibold mb-2 text-foreground">{servicio.nombre}</h3>
                   <p className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                     <Clock className="h-4 w-4" />
                     <span>{servicio.duracion} min.</span>
                   </p>
                  
                  <div className="my-4 flex items-center justify-center min-h-[56px]">
                     {servicio.precios && !isSelected ? (
                        <p className="text-lg text-center text-muted-foreground/80 italic">Precio variable</p>
                     ) : (
                        <p className="text-4xl font-bold text-primary text-center">{formatPrice(getServicePrice(selectedData || servicio))}</p>
                     )}
                  </div>
                </div>
                 
                 {servicio.precios && (
                   <div 
                      className="mt-auto space-y-3"
                      onClick={(e) => e.stopPropagation()}
                   >
                     <RadioGroup
                        value={selectedData?.largo || 'corto'}
                        onValueChange={(value) => handleLargoChange(servicio.id, value as LargoPelo)}
                        className="grid grid-cols-3 gap-2"
                        disabled={!isSelected}
                      >
                       {(Object.keys(servicio.precios) as LargoPelo[]).map(largo => (
                           <div key={largo}>
                             <RadioGroupItem value={largo} id={`${servicio.id}-${largo}`} className="sr-only" />
                             <Label htmlFor={`${servicio.id}-${largo}`} className={cn(
                               "block p-2 text-center text-xs border rounded-md cursor-pointer transition-all",
                               selectedData?.largo === largo ? "border-primary bg-primary/10 text-primary dark:bg-primary/20" : "border-border",
                               !isSelected && "cursor-not-allowed opacity-50"
                             )}>
                               <span className="font-semibold capitalize">{largo}</span>
                               <span className="block text-muted-foreground">{formatPrice(servicio.precios![largo])}</span>
                             </Label>
                           </div>
                        ))}
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground text-center">Precio base. Varía según el largo.</p>
                   </div>
                 )}
            </div>
          )
        })}
      </div>
      
      {userRole === 'clienta' && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-background/80 backdrop-blur-lg border-t">
          <div className="container mx-auto flex items-center justify-between">
            <div className="max-w-md">
              {selectedServices.length > 0 ? (
                  <div>
                      <p className="text-sm font-semibold">Total Estimado: <span className="text-2xl font-bold text-primary">{formatPrice(totalAmount)}</span></p>
                      <p className="text-xs text-muted-foreground">{selectedServices.length} servicio(s) seleccionado(s) - {totalDuration} min.</p>
                       <p className="text-sm text-foreground mt-2 truncate">
                          <span className="font-semibold">Serv:</span> {servicesSummary}
                       </p>
                  </div>
              ) : (
                  <div>
                      <p className="font-bold">Selecciona un servicio</p>
                      <p className="text-sm text-muted-foreground">Elige uno o más servicios para continuar.</p>
                  </div>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={selectedServices.length === 0}
              className="w-full max-w-xs rounded-full py-6 text-lg"
            >
              Continuar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
