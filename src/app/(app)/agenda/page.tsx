'use client';
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, Scissors, PlusCircle, User, Check, XCircle, Plus, CheckIcon, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format, parseISO, isPast, startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks, isSameDay } from "date-fns";
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
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


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

  const statusInfo = useMemo(() => {
    switch(status) {
      case 'realizado': return { text: 'Realizado', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 ring-green-600/20' };
      case 'cancelado': return { text: 'Cancelado', className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 ring-red-600/20' };
      case 'pendiente_pago': return { text: 'Pend. Pago', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 ring-orange-600/20' };
      default: return { text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 ring-yellow-600/20' };
    }
  }, [status]);
  
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center rounded-xl p-4 transition-all duration-200 bg-card hover:shadow-md border min-h-[84px]">
        
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="text-center w-16 flex-shrink-0">
            <p className="text-xl font-bold text-primary">{format(parseISO(turno.fecha), "HH:mm")}</p>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base truncate">{turno.clienteNombre}</h4>
            <Tooltip>
                <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5" title={turno.servicio}>
                      <Scissors className="inline w-3.5 h-3.5 flex-shrink-0" />
                      {turno.servicio}
                    </p>
                </TooltipTrigger>
                <TooltipContent align="start"><p>{turno.servicio}</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:ml-4">
            <div className='text-right hidden sm:block'>
              <p className="text-sm font-medium text-muted-foreground truncate flex items-center justify-end gap-1.5" title={turno.empleadaNombre}>
                  <User className="inline w-3.5 h-3.5 flex-shrink-0" />
                  {turno.empleadaNombre}
              </p>
            </div>
             <Badge className={cn("text-xs font-bold w-24 justify-center py-1 ring-1 ring-inset hidden lg:inline-flex", statusInfo.className)}>
                {statusInfo.text}
            </Badge>
            <div className="flex gap-1.5">
               <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleUpdateStatus('realizado')}
                    variant="outline"
                    size="icon"
                    className="bg-card hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full h-9 w-9"
                    aria-label="Marcar como realizado"
                    disabled={status === 'realizado'}
                  >
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Marcar como realizado</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleUpdateStatus('cancelado')}
                    variant="outline"
                    size="icon"
                    className="bg-card hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full h-9 w-9"
                    aria-label="Cancelar turno"
                    disabled={status === 'cancelado'}
                  >
                    <XCircle className="w-5 h-5 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Cancelar turno</p></TooltipContent>
              </Tooltip>
            </div>
        </div>
      </div>
    </TooltipProvider>
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('semanal');
  
  // State for list filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Turno['estado'] | 'todos'>('todos');


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
  
  const filteredTurnos = useMemo(() => {
      return turnos.filter(turno => {
        const matchesSearch = turno.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || turno.estado === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [turnos, searchTerm, statusFilter]);

  const groupedTurnos = filteredTurnos.reduce((acc, turno) => {
    const dateKey = format(parseISO(turno.fecha), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(turno);
    return acc;
  }, {} as Record<string, Turno[]>);

  const sortedDates = Object.keys(groupedTurnos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  // Calendar controls logic
  const handleDateChange = (direction: 'prev' | 'next') => {
    if (currentView === 'semanal') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    }
  };
  
  const getRangeText = () => {
      if (currentView === 'semanal') {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM, yyyy", { locale: es })}`;
      }
      return format(currentDate, "eeee, d 'de' MMMM, yyyy", { locale: es });
  }
  
  const filterOptions: { label: string, value: Turno['estado'] | 'todos' }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Pend. Pago', value: 'pendiente_pago' },
    { label: 'Realizado', value: 'realizado' },
    { label: 'Cancelado', value: 'cancelado' },
  ];

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
                    <Tabs value={currentView} onValueChange={setCurrentView} className="w-full border-t">
                      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                          <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
                             <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                             <Button variant="outline" size="icon" onClick={() => handleDateChange('next')}><ChevronRight className="h-4 w-4" /></Button>
                          </div>
                          <div className="font-semibold text-center capitalize text-sm sm:text-base flex-grow">
                            {getRangeText()}
                          </div>
                          <div className="flex items-center gap-2">
                             <TabsList>
                               <TabsTrigger value="semanal">Semanal</TabsTrigger>
                               <TabsTrigger value="diario">Diario</TabsTrigger>
                             </TabsList>
                             {(userRole === 'admin' || userRole === 'clienta') && (
                                <Link href="/turnos" className="hidden sm:block">
                                  <Button size="sm"><Plus className="mr-2 h-4 w-4"/>Agendar</Button>
                                </Link>
                              )}
                          </div>
                      </div>
                      <TabsContent value="semanal">
                          <WeeklyCalendarView turnos={allTurnos} currentDate={currentDate} />
                      </TabsContent>
                      <TabsContent value="diario">
                          <DailyCalendarView turnos={allTurnos} currentDate={currentDate} />
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
                   <div className="border-t">
                      <div className="sticky top-16 bg-card/80 backdrop-blur-sm z-10 py-4 px-6 border-b">
                         <div className="flex flex-col sm:flex-row gap-4">
                           <div className="relative flex-grow">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input
                               placeholder="Buscar por nombre de clienta..."
                               className="pl-10 h-11"
                               value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}
                             />
                           </div>
                           <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 relative">
                              <div className="flex gap-2">
                                {filterOptions.map(option => (
                                  <Button 
                                    key={option.value}
                                    variant="outline"
                                    onClick={() => setStatusFilter(option.value)}
                                    className={cn(
                                        "rounded-full whitespace-nowrap h-9 px-4 text-sm font-semibold border-transparent",
                                        statusFilter === option.value 
                                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                  >
                                    {option.label}
                                  </Button>
                                ))}
                              </div>
                              <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-card to-transparent" />
                           </div>
                         </div>
                      </div>
                    <div className="px-6 pb-6">
                    {loading ? (
                      <div className="pt-6 space-y-3">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                      </div>
                    ) : sortedDates.length > 0 ? (
                      <div className="pt-6">
                        {sortedDates.map(date => (
                          <div key={date} className="mb-8 last:mb-0">
                            <h3 className="text-base font-semibold mb-3 capitalize sticky top-[138px] bg-card/80 backdrop-blur-sm z-10 py-2 -my-2 border-b">
                              {isSameDay(parseISO(date), new Date()) 
                                ? "Hoy" 
                                : format(parseISO(date), "eeee, d 'de' MMMM", { locale: es })
                              }
                            </h3>
                            <div className="space-y-3 pt-4">
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
                      <div className="text-center text-muted-foreground py-16">
                        <Calendar className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No hay turnos que coincidan</h3>
                        <p className="mt-1 text-sm">Prueba a cambiar los filtros o el término de búsqueda.</p>
                      </div>
                    )}
                    </div>
                   </div>
                </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
