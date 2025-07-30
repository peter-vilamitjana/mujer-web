'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, Scissors, PlusCircle, User, Check, XCircle, Plus } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Turno } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

export default function AgendaPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const userRole = user?.rol;

  useEffect(() => {
    if (!user) return;

    let turnosQuery;
    const baseQuery = collection(db, 'turnos');
    
    if (user.rol === 'admin') {
      turnosQuery = query(baseQuery, orderBy('fecha', 'desc'));
    } else if (user.rol === 'empleada') {
      // Querying by employee name and then sorting client-side
      turnosQuery = query(baseQuery, where('empleadaNombre', '==', user.nombre));
    } else {
      // No access for other roles on this page
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(turnosQuery, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();
        return { id: doc.id, ...data, fecha } as Turno;
      });
      
      // Sort client-side for employee role to avoid composite index requirement
      if(user.rol === 'empleada') {
          turnosData.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      }

      setTurnos(turnosData);
      setLoading(false);
    }, (error) => {
        console.error("Error al obtener los turnos:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusBadge = (status: Turno['estado']) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'realizado':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Realizado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };


  const groupedTurnos = turnos.reduce((acc, turno) => {
    const dateKey = format(parseISO(turno.fecha), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(turno);
    return acc;
  }, {} as Record<string, Turno[]>);

  const sortedDates = Object.keys(groupedTurnos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Completa</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona todos los turnos agendados.
          </p>
        </div>
        {(userRole === 'admin') && (
          <Link href="/turnos">
            <Button><Plus className="mr-2 h-4 w-4"/> Agendar Turno</Button>
          </Link>
        )}
      </div>
      
      {loading ? (
         <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : sortedDates.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {format(parseISO(date), "eeee, d 'de' MMMM", { locale: es })}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                  {groupedTurnos[date]
                    .sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                    .map(turno => (
                      <div key={turno.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", isPast(parseISO(turno.fecha)) ? 'bg-muted' : 'bg-primary/10')}>
                            <Calendar className={cn("h-6 w-6", isPast(parseISO(turno.fecha)) ? 'text-muted-foreground' : 'text-primary')} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{turno.clienteNombre}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Scissors className="h-4 w-4" />{turno.servicio}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                           <div className="flex items-center gap-4">
                            {getStatusBadge(turno.estado)}
                            <p className="font-mono font-semibold text-lg flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {format(parseISO(turno.fecha), "HH:mm 'hs'")}
                            </p>
                           </div>
                           <p className="text-sm text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" />{turno.empleadaNombre}</p>
                        </div>
                         { userRole === 'admin' &&
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm"><Check className="h-4 w-4"/> Marcar Realizado</Button>
                            <Button variant="destructive" size="sm"><XCircle className="h-4 w-4"/> Cancelar</Button>
                          </div>
                         }
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">No hay turnos agendados</h3>
              <p className="mt-1 text-sm">Empieza por agendar un nuevo turno para una clienta.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
