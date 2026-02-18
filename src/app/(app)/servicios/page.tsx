'use client';
import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Info, Search, MoreHorizontal, Plus } from "lucide-react";
import NewServiceForm from "@/components/NewServiceForm";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
  { id: 'peinado', nombre: 'Peinado', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 12, requiereLargo: true, variable: false, descripcion: '' },
  { id: 'mechas', nombre: 'Mechas', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 25, requiereLargo: true, variable: true, preciosHasta: { corto: 22000, mediano: 30000, largo: 35000 }, descripcion: '' },
  { id: 'reflejos', nombre: 'Reflejos', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 20, requiereLargo: true, variable: false, descripcion: '' },
  { id: 'color', nombre: 'Color', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 45, requiereLargo: true, variable: true, preciosHasta: { corto: 22000, mediano: 30000, largo: 35000 }, descripcion: '' },
  { id: 'bano_crema', nombre: 'Baño de Crema', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 30, requiereLargo: true, variable: false, descripcion: '' },
  { id: 'botox', nombre: 'Botox Capilar', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 40, requiereLargo: true, variable: false, descripcion: '' },
  { id: 'alisados', nombre: 'Alisados', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 60, requiereLargo: true, variable: false, descripcion: '' },
  { id: 'nutricion', nombre: 'Nutrición Capilar', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 35, requiereLargo: true, variable: false, descripcion: '' },
];

const LengthPopoverContent = () => (
  <PopoverContent className="w-64 text-sm" onClick={(e) => e.stopPropagation()}>
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
);

const LengthPopoverTrigger = () => (
  <Popover>
    <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground ml-1" aria-label="Información sobre largo">
        <Info className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <LengthPopoverContent />
  </Popover>
);


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
    if (service.requiereLargo && !service.largo) return { from: 0, to: 0 };
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
    if (s.requiereLargo && !s.largo) return acc;
    return acc + (s.duracion || 0);
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

  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = useMemo(() => {
    return mockServices.filter(s =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  if (userRole === 'admin') {
    return (
      <div className="space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
            <p className="text-muted-foreground">Gestiona tu catálogo</p>
          </div>
          <div className="bg-background rounded-full p-2 border shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar servicio..."
            className="pl-10 h-12 rounded-full bg-white border-gray-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <NewServiceForm trigger={
          <Button className="w-full h-12 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-md text-base font-medium">
            <Plus className="mr-2 h-5 w-5" /> Nuevo Servicio
          </Button>
        } />

        <div className="space-y-4">
          {filteredServices.map(servicio => (
            <div key={servicio.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">{servicio.nombre}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 -mr-2 -mt-2">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                <Clock className="h-4 w-4" />
                <span>{servicio.duracion} min</span>
              </div>

              {servicio.requiereLargo ? (
                <div className="space-y-3">
                  <p className="text-sm italic text-gray-500">Precio variable <Info className="h-3 w-3 inline ml-1" /></p>
                  <div className="flex gap-2 text-sm">
                    <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1 text-center">
                      <span className="block text-xs text-gray-500 mb-1">Corto</span>
                      <span className="font-bold text-gray-900">${servicio.precios?.corto && (servicio.precios.corto / 1000)}k</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1 text-center">
                      <span className="block text-xs text-gray-500 mb-1">Medio</span>
                      <span className="font-bold text-gray-900">${servicio.precios?.mediano && (servicio.precios.mediano / 1000)}k</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1 text-center">
                      <span className="block text-xs text-gray-500 mb-1">Largo</span>
                      <span className="font-bold text-gray-900">${servicio.precios?.largo && (servicio.precios.largo / 1000)}k</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <span>Se confirma en el local</span>
                  </div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-[#8B5CF6] mt-2">
                  {formatPrice(servicio.precio || 0)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Client View remains mostly unchanged
  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            Paso 1: Elige uno o más servicios para tu turno.
          </p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {mockServices.map(servicio => {
          const isSelected = selectedServices.some(s => s.id === servicio.id);
          const selectedData = selectedServices.find(s => s.id === servicio.id);
          const price = getServicePrice(selectedData || servicio);

          return (
            <div
              key={servicio.id}
              onClick={() => handleServiceToggle(servicio)}
              className={cn(
                "flex flex-col rounded-2xl bg-card shadow-sm border-2 cursor-pointer transition-all duration-300 h-full p-6",
                "hover:shadow-lg dark:hover:shadow-primary/10",
                isSelected
                  ? "border-primary shadow-lg ring-2 ring-primary/20 dark:ring-primary/40 dark:border-primary/50"
                  : "border-border/50 dark:border-border/30"
              )}
            >
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2 text-foreground">{servicio.nombre}</h3>
                <p className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{servicio.duracion} min.</span>
                </p>

                <div className="my-4 flex items-center justify-center min-h-[56px]">
                  {servicio.requiereLargo && !isSelected ? (
                    <div className="flex items-center gap-1 text-lg text-center text-muted-foreground/80 italic">
                      <span>Precio variable</span>
                      <LengthPopoverTrigger />
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
                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center">
                    Precio desde. Se confirma en el local según diagnóstico.
                    <LengthPopoverTrigger />
                  </p>
                  {showLengthError && isSelected && !selectedData?.largo && <p className="text-xs text-red-500 font-semibold text-center mt-1">Elegí un largo para continuar.</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-background/80 backdrop-blur-lg border-t dark:border-border/50">
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
    </div>
  );
}
