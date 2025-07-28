'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag, Clock, PlusCircle, Check } from "lucide-react";
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import type { Servicio } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import NewServiceForm from "@/components/NewServiceForm";
import { useUser } from "@/contexts/UserContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const userRole = user?.rol;
  const router = useRouter();

  useEffect(() => {
    const serviciosQuery = query(collection(db, 'servicios'), orderBy('nombre'));
    const unsubscribe = onSnapshot(serviciosQuery, (snapshot) => {
      const serviciosData = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }) as Servicio);
      setServicios(serviciosData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };
  
  const handleContinue = () => {
    const params = new URLSearchParams();
    selectedServices.forEach(id => params.append('servicioId', id));
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
              ? 'Conocé todo lo que tenemos para ofrecerte.' 
              : 'Gestioná los servicios ofrecidos en el salón.'
            }
          </p>
        </div>
        {userRole === 'admin' && <NewServiceForm />}
      </div>
      
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2" />
               <Skeleton className="h-4 w-1/3 mt-2" />
               <Skeleton className="h-10 w-full mt-6" />
            </Card>
          ))}
        </div>
      ) : servicios.length > 0 ? (
        <>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map(servicio => {
            const isSelected = selectedServices.includes(servicio.id);
            return (
              <Label
                key={servicio.id}
                htmlFor={`service-${servicio.id}`}
                className={cn(
                  "block rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 cursor-pointer",
                   isSelected ? "border-primary ring-2 ring-primary" : "hover:shadow-md"
                )}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl mb-4">{servicio.nombre}</CardTitle>
                    {userRole === 'clienta' && 
                      <Checkbox 
                        id={`service-${servicio.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleServiceToggle(servicio.id)}
                        className="h-5 w-5 rounded-full"
                      />
                    }
                  </div>
                  <div className="flex-grow space-y-2">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-lg text-foreground">{formatPrice(servicio.precio)}</span>
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Duración: {servicio.duracion} min.</span>
                    </p>
                  </div>
                  <div className="mt-6">
                     {userRole === 'admin' ? (
                       <Button variant="outline" className="w-full">Editar Servicio</Button>
                    ): userRole === 'empleada' ? null : null}
                  </div>
                </div>
              </Label>
            )
          })}
        </div>
         {userRole === 'clienta' && selectedServices.length > 0 && (
            <div className="sticky bottom-6 mt-8 flex justify-center">
              <Button size="lg" onClick={handleContinue} className="shadow-2xl shadow-primary/30">
                Continuar con {selectedServices.length} servicio{selectedServices.length > 1 && 's'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
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
