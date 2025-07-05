'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag, Clock, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import type { Servicio } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import NewServiceForm from "@/components/NewServiceForm";
import { useUser } from "@/contexts/UserContext";

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const userRole = user?.rol;

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
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
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
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                 <Skeleton className="h-4 w-1/3" />
                 <Skeleton className="h-4 w-1/4 mt-2" />
              </CardContent>
              <CardFooter>
                 <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : servicios.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map(servicio => (
            <Card key={servicio.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{servicio.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-lg text-foreground">{formatPrice(servicio.precio)}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Duración: {servicio.duracion} min.</span>
                </p>
              </CardContent>
              <CardFooter>
                {userRole === 'clienta' ? (
                  <Link href={`/turnos?servicioId=${servicio.id}`} className="w-full">
                    <Button className="w-full group">
                      Reservar
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : userRole === 'admin' ? (
                   <Button variant="outline" className="w-full">
                      Editar Servicio
                    </Button>
                ): null}
              </CardFooter>
            </Card>
          ))}
        </div>
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
