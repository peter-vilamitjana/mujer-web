'use client';
import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Info } from "lucide-react";
import NewServiceForm from "@/components/NewServiceForm";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import type { Servicio, LargoPelo } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

type SelectedServiceWithLargo = Servicio & { largo?: LargoPelo };

const mockServices: Servicio[] = [
    { id: 'corte', nombre: 'Corte', descripcion: '', precio: 30000, duracion: 15, requiereLargo: false, variable: false },
    { id: 'lavado', nombre: 'Lavado', descripcion: '', precio: 9000, duracion: 10, requiereLargo: false, variable: false },
    { id: 'peinado', nombre: 'Peinado', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 12, requiereLargo: true, variable: false },
    { id: 'mechas', nombre: 'Mechas', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 25, requiereLargo: true, variable: false },
    { id: 'reflejos', nombre: 'Reflejos', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 20, requiereLargo: true, variable: false },
    { id: 'color', nombre: 'Color', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 45, requiereLargo: true, variable: true, preciosHasta: { corto: 22000, mediano: 30000, largo: 35000 } },
    { id: 'bano_crema', nombre: 'Baño de Crema', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 30, requiereLargo: true, variable: false },
    { id: 'botox', nombre: 'Botox Capilar', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 40, requiereLargo: true, variable: false },
    { id: 'alisados', nombre: 'Alisados', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 60, requiereLargo: true, variable: false },
    { id: 'nutricion', nombre: 'Nutrición Capilar', descripcion: '', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 35, requiereLargo: true, variable: false },
];


export default function ServiciosPage() {
  const [selectedServices, setSelectedServices] = useState<SelectedServiceWithLargo[]>([]);
  const [showLengthError, setShowLengthError] = useState(false);
  const user = useUser();
  const userRole = user?.rol;
  const router = useRouter();

  const handleServiceToggle = (service: Servicio) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        // Al seleccionar, no pre-definimos un largo. El usuario debe elegir.
        return [...prev, { ...service, largo: undefined }];
      }
    });
    setShowLengthError(false); // Reset error on change
  };
  
  const handleLargoChange = (serviceId: string, largo: LargoPelo) => {
    setSelectedServices(prev => prev.map(s => s.id === serviceId ? { ...s, largo } : s));
    setShowLengthError(false); // Reset error on change
  };

  const getServicePrice = (service: SelectedServiceWithLargo): { from: number; to?: number } => {
    if (service.precios && service.largo) {
        const fromPrice = service.precios[service.largo];
        const toPrice = service.variable && service.preciosHasta ? service.preciosHasta[service.largo] : undefined;
        return { from: fromPrice, to: toPrice };
    }
    return { from: service.precio || 0 };
  }

  const isContinueDisabled = useMemo(() => {
    if (selectedServices.length === 0) return true;
    return selectedServices.some(s => s.requiereLargo && !s.largo);
  }, [selectedServices]);

  const handleContinue = () => {
    if (isContinueDisabled) {
      setShowLengthError(true);
      return;
    }
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

  const { totalFrom, totalTo, hasRange } = useMemo(() => {
    let from = 0;
    let to = 0;
    let range = false;
    selectedServices.forEach(s => {
        if (s.requiereLargo && !s.largo) return; // No sumar si no se ha elegido largo
        const price = getServicePrice(s);
        from += price.from;
        if (price.to) {
            to += price.to;
            range = true;
        } else {
            to += price.from;
        }
    });
    return { totalFrom: from, totalTo: to, hasRange: range && to > from };
  }, [selectedServices]);

  const totalDuration = useMemo(() => selectedServices.reduce((acc, s) => {
    if(s.requiereLargo && !s.largo) return acc;
    return acc + s.duracion;
  }, 0), [selectedServices]);
  
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

  const LengthPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground" aria-label="Información sobre largo">
          <Info className="h-4 w-4"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm">
        <h4 className="font-bold mb-2">Cómo definimos el largo</h4>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li><span className="font-semibold text-foreground">Corto:</span> hasta el mentón</li>
          <li><span className="font-semibold text-foreground">Mediano:</span> hasta los hombros</li>
          <li><span className="font-semibold text-foreground">Largo:</span> por debajo de los hombros</li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          <span className="font-bold">Nota:</span> El precio mostrado es a partir de según diagnóstico al llegar.
        </p>
      </PopoverContent>
    </Popover>
  );


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
          const price = getServicePrice(selectedData || servicio);
          
          return (
            <div
              key={servicio.id}
              onClick={() => handleServiceToggle(servicio)}
              className={cn(
                "flex flex-col rounded-2xl bg-card shadow-sm border-2 cursor-pointer transition-all duration-200 h-full p-6",
                 "hover:shadow-md",
                 isSelected 
                    ? "border-primary shadow-lg ring-2 ring-primary/20 dark:ring-primary/40 dark:border-primary/50" 
                    : "dark:border-gray-700"
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
                        <div className="flex items-center gap-1 text-lg text-center text-muted-foreground/80 italic">
                          <span>Precio variable</span>
                          <LengthPopover />
                        </div>
                     ) : (
                        <p className="text-4xl font-bold text-primary text-center">{formatPrice(price.from)}</p>
                     )}
                  </div>
                </div>
                 
                 {servicio.requiereLargo && (
                   <div 
                      className="mt-auto space-y-3"
                      onClick={(e) => e.stopPropagation()}
                   >
                     <RadioGroup
                        value={selectedData?.largo}
                        onValueChange={(value) => handleLargoChange(servicio.id, value as LargoPelo)}
                        className="grid grid-cols-3 gap-2"
                        disabled={!isSelected}
                      >
                       {(Object.keys(servicio.precios!) as LargoPelo[]).map(largo => (
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
                      <p className="text-xs text-muted-foreground text-center">Precio desde. Se confirma en el local según diagnóstico.</p>
                      {showLengthError && isSelected && !selectedData?.largo && <p className="text-xs text-red-500 font-semibold text-center mt-1">Elegí un largo para continuar.</p>}
                   </div>
                 )}
            </div>
          )
        })}
      </div>
      
      {userRole !== 'admin' && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-background/80 backdrop-blur-lg border-t">
          <div className="container mx-auto flex items-center justify-between">
            <div className="max-w-md">
              {selectedServices.length > 0 ? (
                  <div>
                      <p className="text-sm font-semibold">
                        Total estimado: 
                        <span className="text-2xl font-bold text-primary ml-2">
                          {hasRange ? `${formatPrice(totalFrom)} - ${formatPrice(totalTo)}` : formatPrice(totalFrom)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedServices.length} servicio(s) seleccionado(s) - {totalDuration} min.</p>
                       <p className="text-sm text-foreground mt-2 truncate">
                          <span className="font-semibold">Serv:</span> {servicesSummary}
                       </p>
                       <p className="text-xs text-muted-foreground mt-1">Estimado. Puede variar según diagnóstico (+ insumos).</p>
                  </div>
              ) : (
                  <div>
                      <p className="font-bold">Selecciona un servicio</p>
                      <p className="text-sm text-muted-foreground">Elige uno o más servicios para continuar.</p>
                  </div>
              )}
               {showLengthError && <p className="text-sm text-red-500 font-semibold mt-2">Elegí un largo para continuar.</p>}
            </div>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={isContinueDisabled}
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
