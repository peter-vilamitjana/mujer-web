
'use client';
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, Scissors, PlusCircle, User, Check, XCircle, Plus, CheckIcon, ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


function TurnCard({ turno }: { turno: Turno }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(turno.estado);
  const [isExpanded, setIsExpanded] = useState(false);

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
  
  const services = turno.servicio.split(',').map(s => s.trim());
  const displayServices = services.slice(0, 3);
  const hasMoreServices = services.length > 3;

  return (
    <TooltipProvider delayDuration={150}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex flex-col sm:flex-row items-start rounded-2xl p-4 transition-all duration-300 bg-card hover:shadow-md border min-h-[90px]">
          <div className="flex items-start gap-4 flex-1 w-full">
            <div className="text-center w-16 flex-shrink-0 pt-1">
              <p className="text-xl font-bold text-primary">{format(parseISO(turno.fecha), "HH:mm")}</p>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base">{turno.clienteNombre}</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1" title={turno.empleadaNombre}>
                  <User className="inline w-3.5 h-3.5 flex-shrink-0" />
                  {turno.empleadaNombre}
              </p>
              <div className="mt-3 text-sm text-muted-foreground">
                 <ul className="space-y-1 list-disc list-inside">
                    {displayServices.map((s,i) => <li key={i} className="truncate">{s}</li>)}
                 </ul>
                 <CollapsibleContent asChild>
                    <ul className="space-y-1 list-disc list-inside mt-1">
                        {services.slice(3).map((s, i) => <li key={`extra-${i}`} className="truncate">{s}</li>)}
                    </ul>
                 </CollapsibleContent>

                 {hasMoreServices && (
                    <CollapsibleTrigger asChild>
                       <button className="flex items-center gap-1 text-xs font-semibold text-primary/80 hover:text-primary mt-2">
                        {isExpanded ? 'Ver menos' : `y ${services.length - 3} más...`}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                      </button>
                    </CollapsibleTrigger>
                 )}
              </div>
            </div>
          </div>
          
          <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-4 w-full sm:w-auto mt-4 sm:mt-0 pl-0 sm:pl-4">
              <Badge className={cn("text-xs font-bold w-24 justify-center py-1 ring-1 ring-inset", statusInfo.className)}>
                  {statusInfo.text}
              </Badge>
              <div className="flex gap-1.5 mt-0 sm:mt-2">
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
      </Collapsible>
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
                 <Tabs value={currentView} onValueChange={setCurrentView}>
                   <CardHeader className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border-b">
                       <div className="flex items-center gap-2">
                           <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
                           <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleDateChange('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                           <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleDateChange('next')}><ChevronRight className="h-4 w-4" /></Button>
                       </div>
                       <div className="font-semibold text-center capitalize text-sm sm:text-base flex-grow">
                         {getRangeText()}
                       </div>
                       <div className="flex items-center gap-4">
                           <TabsList>
                             <TabsTrigger value="semanal">Semanal</TabsTrigger>
                             <TabsTrigger value="diario">Diario</TabsTrigger>
                           </TabsList>
                           {(userRole === 'admin' || userRole === 'clienta') && (
                             <Link href="/turnos" className="hidden md:block">
                               <Button size="sm"><Plus className="mr-2 h-4 w-4"/>Agendar</Button>
                             </Link>
                           )}
                       </div>
                   </CardHeader>
                   <TabsContent value="semanal" className="mt-0">
                       {loadingCalendar ? (
                         <div className="p-6 pt-0">
                           <Skeleton className="h-[400px] w-full" />
                         </div>
                       ) : (
                         <WeeklyCalendarView turnos={allTurnos} currentDate={currentDate} />
                       )}
                   </TabsContent>
                   <TabsContent value="diario" className="mt-0">
                      {loadingCalendar ? (
                         <div className="p-6 pt-0">
                           <Skeleton className="h-[400px] w-full" />
                         </div>
                       ) : (
                         <DailyCalendarView turnos={allTurnos} currentDate={currentDate} />
                       )}
                   </TabsContent>
                 </Tabs>
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
                      <div className="p-4 border-b">
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                           <div className="relative flex-grow min-w-[250px] max-w-xs">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input
                               placeholder="Buscar por nombre de clienta..."
                               className="pl-10 h-10 w-full"
                               value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}
                             />
                           </div>
                           <div className="flex flex-wrap gap-2 items-center">
                              {filterOptions.map(option => (
                                <Button 
                                  key={option.value}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setStatusFilter(option.value)}
                                  className={cn(
                                      "rounded-full whitespace-nowrap h-9 px-4 text-sm font-semibold",
                                      statusFilter === option.value 
                                        ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent"
                                  )}
                                >
                                  {option.label}
                                </Button>
                              ))}
                           </div>
                         </div>
                      </div>
                    <div className="px-6 pb-6">
                    {loading ? (
                      <div className="pt-6 space-y-3">
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                      </div>
                    ) : sortedDates.length > 0 ? (
                      <div className="flow-root">
                        {sortedDates.map(date => (
                          <div key={date}>
                            <div className="sticky top-16 bg-card z-10 py-3 border-b">
                                <h3 className="text-base font-semibold capitalize">
                                  {isSameDay(parseISO(date), new Date()) 
                                    ? "Hoy" 
                                    : format(parseISO(date), "eeee, d 'de' MMMM", { locale: es })
                                  }
                                </h3>
                            </div>
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
