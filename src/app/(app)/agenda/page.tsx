'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, Scissors, PlusCircle, User, Check, XCircle, Plus, CheckIcon } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Turno } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp, where, updateDoc, doc } from "firebase/firestore";
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
import { useToast } from "@/hooks/use-toast";

function TurnCard({ turno }: { turno: Turno }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(turno.estado);

  const handleUpdateStatus = async (newStatus: 'realizado' | 'cancelado') => {
    if (!turno.id) return;
    const turnoRef = doc(db, 'turnos', turno.id);
    try {
      await updateDoc(turnoRef, { estado: newStatus });
      setStatus(newStatus);
      toast({
        title: "Estado actualizado",
        description: `El turno de ${turno.clienteNombre} ha sido marcado como ${newStatus}.`
      });
    } catch (error) {
      console.error("Error updating status: ", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del turno.",
        variant: "destructive"
      });
    }
  };

  const stateStyles = {
    pendiente: 'bg-card border-border',
    realizado: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
    cancelado: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
    pendiente_pago: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
  } as const;

  const statusBadgeStyles = {
      pendiente: 'bg-muted text-muted-foreground',
      realizado: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100',
      cancelado: 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100',
      pendiente_pago: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center border rounded-lg p-4 transition-colors',
        stateStyles[status]
      )}
    >
      <div className="flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
        <Calendar className="w-8 h-8 text-primary flex-shrink-0" />
        <div className="ml-2 flex-1 min-w-0">
            <h4 className="font-medium text-base truncate">{turno.clienteNombre}</h4>
            <p className="text-muted-foreground text-sm line-clamp-1 flex items-center gap-1.5 sm:hidden mt-1">
              <Scissors className="inline w-4 h-4 text-muted-foreground" />
              {turno.servicio}
            </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
        <div className="flex-1 text-muted-foreground text-sm line-clamp-1 hidden sm:flex items-center gap-1.5">
          <Scissors className="inline w-4 h-4 mr-1 text-muted-foreground flex-shrink-0" />
          {turno.servicio}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
           <span className={cn('rounded-full px-2.5 py-0.5 font-semibold', statusBadgeStyles[status])}>
                {status === 'pendiente' ? 'Pendiente' 
                    : status === 'realizado' ? 'Realizado' 
                    : status === 'cancelado' ? 'Cancelado' 
                    : 'Pendiente Pago'}
            </span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">{format(parseISO(turno.fecha), "HH:mm 'hs'")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{turno.empleadaNombre}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2 sm:mt-0 justify-end">
          <Button
            onClick={() => handleUpdateStatus('realizado')}
            variant="outline"
            size="icon"
            className="bg-card hover:bg-green-50 dark:hover:bg-green-900/30 border-border"
            aria-label="Marcar realizado"
            disabled={status === 'realizado'}
          >
            <CheckIcon className="w-5 h-5 text-green-600" />
          </Button>
          <Button
            onClick={() => handleUpdateStatus('cancelado')}
            variant="outline"
            size="icon"
            className="bg-card hover:bg-red-50 dark:hover:bg-red-900/30 border-border"
            aria-label="Cancelar turno"
            disabled={status === 'cancelado'}
          >
            <XCircle className="w-5 h-5 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}


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
      
      if(user.rol === 'empleada') {
          turnosData.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      }

      setTurnos(turnosData);
      setLoading(false);
    }, (error) => {
        console.error("Error al obtener los turnos para la lista:", error);
        setLoading(false);
    });

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
                            <div className="space-y-3">
                              {groupedTurnos[date]
                                .sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                                .map(turno => (
                                  <TurnCard key={turno.id} turno={turno} />
                                ))}
                            </div>
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
