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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyCalendarView from "@/components/WeeklyCalendarView";
import DailyCalendarView from "@/components/DailyCalendarView";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function AgendaPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const userRole = user?.rol;

  // State for the calendar views
  const [allTurnos, setAllTurnos] = useState<Turno[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setLoadingCalendar(true);

    let turnosQuery;
    const baseQuery = collection(db, 'turnos');
    
    if (user.rol === 'admin') {
      turnosQuery = query(baseQuery, orderBy('fecha', 'desc'));
    } else if (user.rol === 'empleada') {
      // Firestore limitation: cannot have inequality filter on one field and order by another.
      // We will filter and sort client-side for employees.
      turnosQuery = query(baseQuery, where('empleadaNombre', '==', user.nombre));
    } else {
      setLoading(false);
      setLoadingCalendar(false);
      return;
    }

    const unsubscribe = onSnapshot(turnosQuery, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();
        return { id: doc.id, ...data, fecha } as Turno;
      });
      
      // Client-side sorting for 'empleada' to avoid composite index requirement
      if(user.rol === 'empleada') {
          turnosData.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      }

      setTurnos(turnosData);
      setLoading(false);
    }, (error) => {
        console.error("Error al obtener los turnos para la lista:", error);
        setLoading(false);
    });

    // Live subscription for all appointments for the calendar views
    const allTurnosQuery = query(collection(db, 'turnos'));
    const unsubAllTurnos = onSnapshot(allTurnosQuery, (snapshot) => {
        const turnosData = snapshot.docs.map(doc => {
            const data = doc.data();
            const duracion = data.duracion || 30; 
            const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();
            return { id: doc.id, ...data, fecha, duracion } as Turno;
        });
        setAllTurnos(turnosData);
        setLoadingCalendar(false);
    }, (error) => {
        console.error("Error fetching all turnos for calendar:", error);
        setLoadingCalendar(false);
    });


    return () => {
      unsubscribe();
      unsubAllTurnos();
    }
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona todos los turnos agendados.
          </p>
        </div>
        {(userRole === 'admin') && (
          <Link href="/turnos" className="w-full sm:w-auto">
            <Button className="w-full"><Plus className="mr-2 h-4 w-4"/> Agendar Turno</Button>
          </Link>
        )}
      </div>

       <div className="max-w-full overflow-hidden">
        <Accordion type="multiple" defaultValue={["calendar-view", "list-view"]} className="w-full space-y-4">
          <AccordionItem value="calendar-view">
             <Card>
               <AccordionTrigger className="p-6 text-lg font-semibold">
                  Vista Calendario
               </AccordionTrigger>
               <AccordionContent>
                  {loadingCalendar ? (
                    <div className="p-6 pt-0">
                      <Skeleton className="h-[400px] w-full" />
                    </div>
                  ) : (
                    <Tabs defaultValue="semanal" className="w-full border-t">
                       <CardHeader className="flex-col items-start md:flex-row md:items-center justify-between gap-4">
                         <div className="flex-grow"></div>
                        <TabsList>
                          <TabsTrigger value="semanal">Semanal</TabsTrigger>
                          <TabsTrigger value="diario">Diario</TabsTrigger>
                        </TabsList>
                      </CardHeader>
                      <TabsContent value="semanal">
                          <WeeklyCalendarView turnos={allTurnos} />
                      </TabsContent>
                      <TabsContent value="diario">
                          <DailyCalendarView turnos={allTurnos} />
                      </TabsContent>
                    </Tabs>
                  )}
              </AccordionContent>
            </Card>
          </AccordionItem>
          
          <AccordionItem value="list-view">
             <Card>
                <AccordionTrigger className="p-6 text-lg font-semibold">
                  Listado de Turnos
                </AccordionTrigger>
                 <AccordionContent>
                   <div className="p-6 pt-0 border-t">
                    {loading ? (
                      <div className="pt-6 space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ) : sortedDates.length > 0 ? (
                      <div className="pt-6">
                        {sortedDates.map(date => (
                          <div key={date} className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 capitalize">
                              {format(parseISO(date), "eeee, d 'de' MMMM", { locale: es })}
                            </h3>
                            <Card className="bg-muted/50">
                              <CardContent className="p-0">
                                <div className="divide-y">
                                {groupedTurnos[date]
                                  .sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                                  .map(turno => (
                                    <div key={turno.id} className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                      <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0", isPast(parseISO(turno.fecha)) ? 'bg-muted' : 'bg-primary/10')}>
                                          <Calendar className={cn("h-6 w-6", isPast(parseISO(turno.fecha)) ? 'text-muted-foreground' : 'text-primary')} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-lg truncate">{turno.clienteNombre}</h4>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2 sm:truncate"><Scissors className="h-4 w-4 flex-shrink-0" />{turno.servicio}</p>
                                        </div>
                                      </div>
                                      <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:ml-4">
                                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                            {getStatusBadge(turno.estado)}
                                            <p className="font-mono font-semibold flex items-center gap-2">
                                              <Clock className="h-4 w-4 text-muted-foreground" />
                                              {format(parseISO(turno.fecha), "HH:mm 'hs'")}
                                            </p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" />{turno.empleadaNombre}</p>
                                          </div>
                                          
                                          { userRole === 'admin' &&
                                            <div className="flex flex-row gap-2 justify-start lg:justify-end">
                                              <Button variant="outline" size="icon"><Check className="h-4 w-4"/></Button>
                                              <Button variant="destructive" size="icon"><XCircle className="h-4 w-4"/></Button>
                                            </div>
                                          }
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground pt-12">
                        <Calendar className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No hay turnos agendados</h3>
                        <p className="mt-1 text-sm">Empieza por agendar un nuevo turno para una clienta.</p>
                      </div>
                    )}
                   </div>
                </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
