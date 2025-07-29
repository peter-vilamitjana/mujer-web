'use client';
import { useState, useEffect, useMemo, useRef } from "react";
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

const mockServices: Omit<Servicio, 'id' | 'descripcion'>[] = [
    { nombre: 'Corte', precio: 30000, duracion: 15 },
    { nombre: 'Lavado', precio: 9000, duracion: 10 },
    { nombre: 'Peinado', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 12 },
    { nombre: 'Mechas', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 25 },
    { nombre: 'Reflejos', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 20 },
    { nombre: 'Color', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 45 },
    { nombre: 'Baño de Crema', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 30 },
    { nombre: 'Botox Capilar', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 40 },
    { nombre: 'Alisados', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 60 },
    { nombre: 'Nutrición Capilar', precios: { corto: 18000, mediano: 25000, largo: 30000 }, duracion: 35 },
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
            console.log("No services found in Firestore, using mock data.");
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

  const formatPrice = (price: number, approx: boolean = false) => {
    const prefix = approx ? 'aprox. ' : '';
    return prefix + new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="rounded-2xl">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : servicios.length > 0 ? (
        <>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicios.map(servicio => {
            const selectedState = selectedServices.find(s => s.id === servicio.id);
            const isSelected = !!selectedState;
            const currentLargo = selectedState?.largo || 'corto';
            const currentPrice = servicio.precios ? (servicio.precios[currentLargo] || 0) : (servicio.precio || 0);

            return (
              <Card 
                key={servicio.id} 
                className={cn(
                    "flex flex-col rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1", 
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

                    <div className="flex-grow space-y-4 my-4">
                      {servicio.precios ? (
                        <>
                          <RadioGroup
                              value={currentLargo}
                              onValueChange={(value) => handleLargoChange(servicio.id, value as LargoPelo)}
                              className="space-y-2"
                              disabled={!isSelected}
                          >
                              {(Object.keys(servicio.precios) as LargoPelo[]).map(largo => (
                                  <Label key={largo} className="flex items-center justify-between cursor-pointer text-sm p-3 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">
                                      <span className="capitalize font-medium">{largo}</span>
                                      <div className="flex items-center gap-3">
                                        <span className="font-semibold text-muted-foreground">{formatPrice(servicio.precios![largo], true)}</span>
                                        <RadioGroupItem value={largo} id={`${servicio.id}-${largo}`} />
                                      </div>
                                  </Label>
                              ))}
                          </RadioGroup>
                          <p className="text-xs text-muted-foreground text-center pt-1">Precios aproximados según largo de pelo.</p>
                          <p className="text-3xl font-bold text-primary text-center pt-2">{formatPrice(currentPrice)}</p>
                        </>
                      ) : (
                        <p className="text-3xl font-bold text-primary text-center my-4">{formatPrice(servicio.precio || 0)}</p>
                      )}
                    </div>
                 </CardContent>
                 <CardFooter className="p-6 pt-0 mt-auto">
                    {userRole === 'admin' ? (
                        <Button variant="outline" className="w-full">Editar Servicio</Button>
                    ) : (
                       <Button className="w-full" onClick={() => handleServiceToggle(servicio.id)}>
                           {isSelected ? <><Check className="mr-2"/> Seleccionado</> : 'Pedir Turno'}
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
                  <p className="text-sm font-medium">Total estimado</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(totalAmount)}</p>
                </div>
                <Button size="lg" onClick={handleContinue} className="rounded-full">
                  Continuar ({selectedServices.length})
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
