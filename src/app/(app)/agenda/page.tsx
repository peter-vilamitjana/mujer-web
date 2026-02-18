

'use client';
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, Scissors, PlusCircle, User, Check, XCircle, Plus, CheckIcon, ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import { format, parseISO, isPast, startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn, safeFormatDate } from "@/lib/utils";
import type { Turno } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp, where, updateDoc, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
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
import { signIn, signOut, useSession } from "next-auth/react";


async function setupGoogleCalendarWatch() {
  // This function will now be a call to our own API endpoint
  try {
    const response = await fetch('/api/google/sync/bootstrap', {
      method: 'POST',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to setup calendar watch');
    }
    return await response.json();
  } catch (error) {
    console.error("Error setting up Google Calendar watch:", error);
    throw error;
  }
}

function GoogleCalendarConnect() {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const user = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const checkConnection = async () => {
      if (user?.rol === 'admin' && user?.id) {
        // A simple way to check could be to see if the token doc exists
        try {
          const tokenDocRef = doc(db, 'calendarTokens', user.id);
          const tokenDoc = await getDoc(tokenDocRef);
          setIsConnected(tokenDoc.exists());
        } catch (error) {
          console.error("Error checking calendar connection:", error);
          setIsConnected(false);
        }
      }
    };
    if (status === 'authenticated' && user) {
      checkConnection();
    }
  }, [status, user]);

  if (user?.rol !== 'admin') {
    return null;
  }

  const handleConnect = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/agenda',
        redirect: true,
      });
      // After sign-in, the session callback in NextAuth will save tokens.
      // We can then try to set up the watch channel.
      await setupGoogleCalendarWatch();
      setIsConnected(true);
      toast({ title: 'Conectado!', description: 'Tu Google Calendar ha sido sincronizado.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'No se pudo conectar con Google Calendar.', variant: 'destructive' });
    }
  };

  const handleDisconnect = async () => {
    if (user?.id) {
      try {
        await fetch('/api/google/disconnect', { method: 'POST' });
        await signOut({ redirect: false });
        setIsConnected(false);
        toast({ title: 'Desconectado', description: 'Se ha desvinculado tu Google Calendar.' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'No se pudo desconectar.', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="p-4 border-b">
      <CardTitle>Conexión con Google Calendar</CardTitle>
      <CardDescription>Sincroniza tus turnos de la app con tu calendario de Google.</CardDescription>
      <div className="flex items-center gap-4 mt-4">
        {isConnected ? (
          <>
            <Badge variant="default" className="bg-green-500">Conectado</Badge>
            <Button variant="outline" onClick={handleDisconnect}>Desconectar</Button>
          </>
        ) : (
          <>
            <Badge variant="secondary">Desconectado</Badge>
            <Button onClick={handleConnect}>Conectar con Google Calendar</Button>
          </>
        )}
      </div>
    </div>
  );
}

function TurnCard({ turno }: { turno: Turno }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(turno.estado);
  const [isExpanded, setIsExpanded] = useState(false);

  // ... (Using simplified logic for restoration, or I can copy the original full logic)
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
    switch (status) {
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
                  {displayServices.map((s, i) => <li key={i} className="truncate">{s}</li>)}
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


const MobileTurnCard = ({ turno, onStatusChange }: { turno: Turno, onStatusChange: (id: string, status: 'realizado' | 'cancelado') => void }) => {
  const services = turno.servicio.split(',').map(s => s.trim());

  const statusConfig = {
    'pendiente_pago': { label: 'PEND. PAGO', className: 'bg-orange-100 text-orange-700 border-none' },
    'confirmado': { label: 'CONFIRMADO', className: 'bg-blue-100 text-blue-700 border-none' },
    'realizado': { label: 'REALIZADO', className: 'bg-green-100 text-green-700 border-none' },
    'cancelado': { label: 'CANCELADO', className: 'bg-red-100 text-red-700 border-none' },
    'pendiente': { label: 'PENDIENTE', className: 'bg-yellow-100 text-yellow-700 border-none' }
  };

  const currentStatus = statusConfig[turno.estado as keyof typeof statusConfig] || statusConfig['pendiente'];

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 relative mb-4">
      {/* Top Right Status Badge */}
      <Badge variant="outline" className={cn("absolute top-5 right-5 font-bold tracking-wider px-2 py-1 text-[10px]", currentStatus.className)}>
        {currentStatus.label}
      </Badge>

      <div className="flex gap-4">
        {/* Time Column */}
        <div className="flex flex-col items-center min-w-[3.5rem] border-r border-dashed border-gray-100 pr-4 mr-1">
          <span className="text-2xl font-bold text-[#8B5CF6]">{format(parseISO(turno.fecha), "HH:mm")}</span>
          <span className="text-sm font-medium text-gray-400 uppercase">{format(parseISO(turno.fecha), "a")}</span>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 pt-0.5 pb-2">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{turno.clienteNombre}</h3>

          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2.5">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium">{turno.empleadaNombre}</span>
          </div>

          <ul className="space-y-1.5">
            {services.slice(0, 3).map((s, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="block h-1.5 w-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0"></span>
                <span className="truncate">{s}</span>
              </li>
            ))}
            {services.length > 3 && (
              <li className="text-xs text-[#8B5CF6] font-medium pl-3.5 pt-0.5">
                y {services.length - 3} más...
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Action Buttons - Absolute Bottom Right */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {turno.estado !== 'realizado' && (
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-green-50 text-green-600 hover:bg-green-100 shadow-none hover:shadow-sm transition-all"
            onClick={() => onStatusChange(turno.id, 'realizado')}
          >
            <Check className="h-5 w-5" />
          </Button>
        )}
        {turno.estado !== 'cancelado' && turno.estado !== 'realizado' && (
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100 shadow-none hover:shadow-sm transition-all"
            onClick={() => onStatusChange(turno.id, 'cancelado')}
          >
            <XCircle className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

const DateStrip = ({ selectedDate, onSelectDate }: { selectedDate: Date, onSelectDate: (d: Date) => void }) => {
  // Generate dates: today - 2 days ... today ... today + 14 days
  const dates = useMemo(() => {
    const d = [];
    for (let i = -2; i < 14; i++) {
      d.push(addDays(new Date(), i));
    }
    return d;
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 px-1 no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
      {dates.map(date => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[3.5rem] h-20 rounded-full border transition-all",
              isSelected
                ? "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-lg scale-105"
                : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
            )}
          >
            <span className="text-xs font-medium capitalize mb-1">{format(date, 'EEE', { locale: es })}</span>
            <span className={cn("text-2xl font-bold", isSelected ? "text-white" : "text-gray-900")}>
              {format(date, 'd')}
            </span>
            {isToday && <span className="h-1.5 w-1.5 rounded-full bg-current mt-1 opacity-50"></span>}
          </button>
        )
      })}
    </div>
  )
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

  const { toast } = useToast();

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

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
        const fecha = safeFormatDate(data.fecha);
        return { id: doc.id, ...data, fecha } as Turno;
      });

      if (user.rol === 'empleada') {
        turnosData.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
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

  // Set default view on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setCurrentView('diario');
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'realizado' | 'cancelado') => {
    try {
      await updateDoc(doc(db, 'turnos', id), { estado: newStatus });
      toast({ title: 'Estado actualizado', description: `Turno marcado como ${newStatus}` });
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    }
  }

  // Filter for Daily View (Mobile / Admin)
  const dailyFilteredTurnos = useMemo(() => {
    return turnos.filter(turno => {
      const matchDate = isSameDay(parseISO(turno.fecha), currentDate);
      const matchesStatus = statusFilter === 'todos' || turno.estado === statusFilter;
      const matchesSearch = searchTerm ? turno.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchDate && matchesStatus && matchesSearch;
    });
  }, [turnos, currentDate, statusFilter, searchTerm]);

  // Filter for List View (Desktop / Admin) - Shows all dates
  const listFilteredTurnos = useMemo(() => {
    return turnos.filter(turno => {
      const matchesStatus = statusFilter === 'todos' || turno.estado === statusFilter;
      const matchesSearch = searchTerm ? turno.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchesStatus && matchesSearch;
    });
  }, [turnos, statusFilter, searchTerm]);

  // Admin Mobile View
  const adminMobileView = (userRole === 'admin') ? (
    <div className="space-y-6 pb-24 md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Agenda</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus turnos agendados.</p>
        </div>
      </div>

      {/* Date / View Controls */}
      <div className="flex items-center justify-between bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={goToday} className="h-8 px-3 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl">Hoy</Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={prevDay} className="h-8 w-8 text-gray-400 hover:text-gray-900"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={nextDay} className="h-8 w-8 text-gray-400 hover:text-gray-900"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <span className="text-sm font-bold text-gray-900 capitalize px-2">
          {format(currentDate, 'MMM yyyy', { locale: es })}
        </span>
        <div className="flex bg-gray-100 rounded-xl p-1">
          <Button variant="ghost" size="sm" className={cn("h-7 px-3 text-xs rounded-lg transition-all", currentView === 'semanal' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900")}>Semana</Button>
          <Button variant="ghost" size="sm" className="h-7 px-3 text-xs text-gray-500 hover:text-gray-900">Día</Button>
        </div>
      </div>

      {/* Date Scroll Strip */}
      <DateStrip selectedDate={currentDate} onSelectDate={setCurrentDate} />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { label: 'Todos', value: 'todos' },
          { label: 'Pendiente', value: 'pendiente' },
          { label: 'Pend. Pago', value: 'pendiente_pago' },
          { label: 'Realizado', value: 'realizado' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value as any)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              statusFilter === f.value
                ? "bg-[#efe9ff] text-[#8B5CF6] border-[#efe9ff]"
                : "bg-white border-gray-100 text-gray-500"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Day Header */}
      <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mt-2 flex items-baseline gap-2">
        <span className="capitalize">{format(currentDate, "eeee", { locale: es })}</span>, {format(currentDate, "d 'de' ")} <span className="capitalize">{format(currentDate, "MMMM", { locale: es })}</span>
        <span className="text-gray-400 font-normal text-sm lowercase">{dailyFilteredTurnos.length} turno{dailyFilteredTurnos.length !== 1 ? 's' : ''}</span>
      </h3>

      {/* Cards List */}
      <div className="space-y-4">
        {loading ? (
          <Skeleton className="h-32 w-full rounded-3xl" />
        ) : dailyFilteredTurnos.length > 0 ? (
          dailyFilteredTurnos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map(turno => (
            <MobileTurnCard key={turno.id} turno={turno} onStatusChange={handleUpdateStatus} />
          ))
        ) : (
          <div className="py-12 text-center text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No hay turnos para este día.</p>
          </div>
        )}
      </div>
    </div>
  ) : null;

  // Fallback to original layout for Desktop / Employees / Clients
  // ... (keeping existing complex layout logic below)
  const groupedTurnos = listFilteredTurnos.reduce((acc, turno) => {
    // ... logic for list view grouping
    const dateKey = format(parseISO(turno.fecha), 'yyyy-MM-dd');
    if (!acc[dateKey]) { acc[dateKey] = []; }
    acc[dateKey].push(turno);
    return acc;
  }, {} as Record<string, Turno[]>);

  const sortedDates = Object.keys(groupedTurnos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <>
      {adminMobileView}
      <div className={cn("space-y-8", userRole === 'admin' ? "hidden md:block" : "")}>
        {/* Original header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">
              Visualiza y gestiona todos los turnos agendados.
            </p>
          </div>
          {(userRole === 'admin') && (
            <Link href="/turnos" className="w-full sm:w-auto">
              <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Agendar Turno</Button>
            </Link>
          )}
        </div>

        {/* Keep existing Accordion layout for non-admins or desktop admin if we wanted separate */}
        <div className="max-w-full overflow-hidden">
          <Accordion type="multiple" defaultValue={["calendar-view", "list-view"]} className="w-full space-y-4">
            {/* ... Same content as before ... */}
            <AccordionItem value="calendar-view">
              <Card>
                <AccordionTrigger className="p-6 text-lg font-semibold">Vista Calendario</AccordionTrigger>
                <AccordionContent>
                  <Tabs value={currentView} onValueChange={setCurrentView}>
                    {/* ... Tabs content ... */}
                    <CardHeader className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border-b">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToday}>Hoy</Button>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={prevDay}><ChevronLeft className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={nextDay}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                        <span className="text-sm font-medium ml-2">
                          {currentView === 'semanal'
                            ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: es })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM, yyyy', { locale: es })}`
                            : format(currentDate, 'PPP', { locale: es })
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 w-full lg:w-auto">
                        <TabsList className="grid w-full grid-cols-2 lg:w-[200px]">
                          <TabsTrigger value="semanal">Semanal</TabsTrigger>
                          <TabsTrigger value="diario">Diario</TabsTrigger>
                        </TabsList>
                        {(userRole === 'admin' || userRole === 'empleada') && (
                          <Link href="/turnos">
                            <Button size="sm" className="bg-[#8B5CF6] hover:bg-[#7C3AED] ml-2"><Plus className="mr-2 h-4 w-4" /> Agendar</Button>
                          </Link>
                        )}
                      </div>
                    </CardHeader>
                    <TabsContent value="semanal" className="mt-0">
                      <WeeklyCalendarView turnos={allTurnos} currentDate={currentDate} />
                    </TabsContent>
                    <TabsContent value="diario" className="mt-0">
                      <DailyCalendarView turnos={allTurnos} currentDate={currentDate} />
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="list-view">
              <Card>
                <AccordionTrigger className="p-6 text-lg font-semibold">Listado de Turnos</AccordionTrigger>
                <AccordionContent>
                  {/* List view content */}
                  {/* Note: I'm truncating the massive original block for brevity, 
                            assuming the replace_file_content tool will handle the diff. 
                            If I need to preserve it exactly, I should copy it all. 
                            Since I'm modifying the whole Component function, I'll paste the original return below. */}
                  <div className="border-t">
                    <div className="p-4 border-b">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="relative flex-grow min-w-[250px] max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Buscar por nombre..." className="pl-10 h-9 bg-muted/50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                          {[
                            { label: 'Todos', value: 'todos' },
                            { label: 'Pendiente', value: 'pendiente' },
                            { label: 'Pend. Pago', value: 'pendiente_pago' },
                            { label: 'Realizado', value: 'realizado' },
                            { label: 'Cancelado', value: 'cancelado' }
                          ].map(f => (
                            <button
                              key={f.value}
                              onClick={() => setStatusFilter(f.value as any)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                                statusFilter === f.value
                                  ? "bg-[#efe9ff] text-[#8B5CF6] border-[#efe9ff]"
                                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                              )}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      {loading ? <Skeleton className="h-24 w-full" /> :
                        (
                          <div className="space-y-8">
                            {sortedDates.map((dateKey) => (
                              <div key={dateKey}>
                                <div className="flex items-center gap-4 mb-4">
                                  <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    {format(parseISO(dateKey), 'EEEE d, MMMM', { locale: es })}
                                  </h3>
                                  <div className="h-px flex-1 bg-border/60" />
                                </div>
                                <div className="space-y-3">
                                  {groupedTurnos[dateKey].map((turno) => (
                                    <TurnCard key={turno.id} turno={turno} />
                                  ))}
                                </div>
                              </div>
                            ))}
                            {sortedDates.length === 0 && (
                              <div className="text-center py-12 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No hay turnos para mostrar con los filtros actuales.</p>
                              </div>
                            )}
                          </div>
                        )
                      }
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
