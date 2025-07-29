
'use client';
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Check } from "lucide-react";
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import type { Servicio, LargoPelo } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import NewServiceForm from "@/components/NewServiceForm";
import { useUser } from "@/contexts/UserContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Mock data as a fallback or for development
const mockServices: Omit<Servicio, 'id' | 'descripcion'>[] = [
    { nombre: 'Corte', precio: 8000, duracion: 60 },
    { nombre: 'Lavado', precio: 5000, duracion: 30 },
    { nombre: 'Peinado', precios: { corto: 7000, mediano: 9000, largo: 11000 }, duracion: 45 },
    { nombre: 'Mechas', precios: { corto: 20000, mediano: 25000, largo: 30000 }, duracion: 180 },
    { nombre: 'Reflejos', precios: { corto: 18000, mediano: 22000, largo: 26000 }, duracion: 150 },
    { nombre: 'Color', precios: { corto: 15000, mediano: 18000, largo: 21000 }, duracion: 120 },
    { nombre: 'Baño de Crema', precios: { corto: 10000, mediano: 12000, largo: 14000 }, duracion: 60 },
    { nombre: 'Botox Capilar', precios: { corto: 16000, mediano: 20000, largo: 24000 }, duracion: 90 },
    { nombre: 'Alisados', precios: { corto: 25000, mediano: 30000, largo: 35000 }, duracion: 240 },
    { nombre: 'Nutrición Capilar', precios: { corto: 12000, mediano: 15000, largo: 18000 }, duracion: 75 },
];


type SelectedService = {
  id: string;
  largo?: LargoPelo;
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const userRole = user?.rol;
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const servicesQuery = query(collection(db, 'servicios'), orderBy('nombre'));
        const servicesSnapshot = await getDocs(servicesQuery);
        let servicesData: Servicio[];
        
        if (servicesSnapshot.empty) {
            servicesData = mockServices.map((s, i) => ({ ...s, id: `mock-${i}`, descripcion: '' }));
        } else {
            servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Servicio);
        }
        
        setServicios(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServicios(mockServices.map((s, i) => ({ ...s, id: `mock-${i}`, descripcion: '' })));
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
        const isSelected = prev.some(s => s.id === serviceId);
        if (isSelected) {
            return prev.filter(s => s.id !== serviceId);
        } else {
            const service = servicios.find(s => s.id === serviceId);
            const initialLargo = service?.precios ? 'corto' : undefined;
            return [...prev, { id: serviceId, largo: initialLargo }];
        }
    });
  };

  const handleLargoChange = (serviceId: string, largo: LargoPelo) => {
      setSelectedServices(prev => prev.map(s => s.id === serviceId ? { ...s, largo } : s));
  };
  
  const handleContinue = () => {
    const params = new URLSearchParams();
    selectedServices.forEach(s => {
      params.append('servicioId', s.id)
      if (s.largo) {
          params.append(`largo_${s.id}`, s.largo);
      }
    });
    router.push(`/turnos?${params.toString()}`);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  }

  const getServicePrice = (service: SelectedService): number => {
    const serviceData = servicios.find(s => s.id === service.id);
    if (!serviceData) return 0;

    if (serviceData.precios && service.largo) {
        return serviceData.precios[service.largo];
    }
    return serviceData.precio || 0;
  }
  
  const totalAmount = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + getServicePrice(s), 0);
  }, [selectedServices, servicios]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            {userRole === 'clienta' 
              ? 'Conocé todo lo que tenemos para ofrecerte.' 
              : 'Gestioná los servicios ofrecidos en el salón.'
            }
          </p>
        </div>
        {userRole === 'admin' && <NewServiceForm />}
      </div>
      
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-6 rounded-2xl">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2" />
               <Skeleton className="h-4 w-1/3 mt-2" />
               <Skeleton className="h-10 w-full mt-6" />
            </Card>
          ))}
        </div>
      ) : servicios.length > 0 ? (
        <>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {servicios.map(servicio => {
            const selectedState = selectedServices.find(s => s.id === servicio.id);
            const isSelected = !!selectedState;
            const currentLargo = selectedState?.largo || 'corto';
            const currentPrice = servicio.precios ? servicio.precios[currentLargo] : servicio.precio;

            return (
              <Card 
                key={servicio.id} 
                className={cn(
                    "flex flex-col rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1", 
                    isSelected && "ring-2 ring-primary"
                )}
               >
                 <div className="p-6 flex-grow flex flex-col">
                     <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold">{servicio.nombre}</h3>
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

                    <div className="flex-grow space-y-4">
                      {servicio.precios ? (
                        <>
                          <p className="text-3xl font-bold text-primary">{formatPrice(currentPrice || 0)}</p>
                          <RadioGroup
                              value={currentLargo}
                              onValueChange={(value) => handleLargoChange(servicio.id, value as LargoPelo)}
                              className="space-y-2"
                              disabled={!isSelected}
                          >
                              {(Object.keys(servicio.precios) as LargoPelo[]).map(largo => (
                                  <Label key={largo} className="flex items-center justify-between cursor-pointer text-sm p-3 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                                      <span className="capitalize font-medium">{largo}</span>
                                      <div className="flex items-center gap-3">
                                        <span className="font-semibold text-muted-foreground">≈ {formatPrice(servicio.precios![largo])}</span>
                                        <RadioGroupItem value={largo} id={`${servicio.id}-${largo}`} />
                                      </div>
                                  </Label>
                              ))}
                          </RadioGroup>
                          <p className="text-xs text-muted-foreground text-center pt-2">Precios aproximados según largo de pelo.</p>
                        </>
                      ) : (
                        <p className="text-3xl font-bold text-primary">{formatPrice(servicio.precio || 0)}</p>
                      )}
                    </div>
                 </div>
                 <CardFooter className="p-6 pt-0 mt-auto">
                    {userRole === 'admin' ? (
                        <Button variant="outline" className="w-full">Editar Servicio</Button>
                    ) : (
                       <Button className="w-full" onClick={() => !isSelected && handleServiceToggle(servicio.id)}>
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
              <Card className="p-4 shadow-2xl shadow-primary/20 flex items-center gap-6 rounded-full">
                <div>
                  <p className="text-sm font-medium">Total estimado</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(totalAmount)}</p>
                </div>
                <Button size="lg" onClick={handleContinue} className="rounded-full">
                  Pedir Turno ({selectedServices.length})
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
            <CardContent>
                <h3 className="text-xl font-semibold">No hay servicios cargados</h3>
                <p className="text-muted-foreground mt-2">
                    {userRole === 'admin' 
                        ? 'Agrega tu primer servicio para que aparezca aquí.' 
                        : 'Los servicios se mostrarán aquí pronto.'
                    }
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
