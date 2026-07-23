'use client';
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors, Plus, XCircle, RefreshCw, User, CheckCircle, Ban, ChevronDown } from "lucide-react";
import { format, parseISO, isFuture, isPast, subDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, safeFormatDate } from "@/lib/utils";
import { getMyAppointments, type ClientAppointment } from "@/actions/appointments.actions";

function ProximoTurnoCard({ turno, onCancel }: { turno: ClientAppointment, onCancel: (id: string, tenantId: string) => void }) {
  const services = turno.serviceNames.split(',').map(s => s.trim());
  const [isExpanded, setIsExpanded] = useState(false);

  const displayServices = isExpanded ? services : services.slice(0, 3);
  const hasMoreServices = services.length > 3;

  let day = "0";
  let month = "Mes";
  let time = "00:00";

  try {
    const dateObj = parseISO(turno.date);
    day = format(dateObj, "d", { locale: es });
    month = format(dateObj, "MMMM", { locale: es });
    time = format(dateObj, "HH:mm");
  } catch (e) {
    console.error("Invalid date in card:", turno.date);
  }

  return (
    <div key={turno.id} className="p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col sm:flex-row sm:items-stretch gap-4">
      <div className="flex flex-col justify-center items-center text-center p-4 rounded-lg bg-black/10 flex-shrink-0 w-full sm:w-28">
        <p className="font-bold text-3xl sm:text-4xl">{day}</p>
        <h3 className="font-semibold text-base sm:text-lg capitalize">
          {month}
        </h3>
        <p className="font-mono text-lg sm:text-xl mt-2 sm:mt-3 flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
          {time}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm opacity-90"><User className="h-4 w-4" />Con {turno.staffName}</p>
          <p className="font-semibold mt-3 mb-1 text-sm">Servicios:</p>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="space-y-1">
            <ul className="space-y-1 text-xs list-disc list-inside text-white/90">
              {displayServices.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            {hasMoreServices && (
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1 text-xs font-semibold text-primary-foreground/80 hover:text-primary-foreground mt-2">
                  {isExpanded ? '– Ver menos' : `+ Ver todos los servicios`}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
            )}
          </Collapsible>
        </div>
        <div className="pt-3 mt-3 border-t border-white/20 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/20"><XCircle className="h-4 w-4 mr-2" /> Cancelar Turno</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás segura?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El turno será cancelado permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction onClick={() => onCancel(turno.id, turno.tenantId)}>Sí, cancelar turno</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default function MisTurnosPage() {
  const [turnos, setTurnos] = useState<ClientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { toast } = useToast();
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [filter, setFilter] = useState('month');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const savedFilter = localStorage.getItem('historialFiltro');
      if (savedFilter && ['week', 'month', 'quarter', 'all'].includes(savedFilter)) {
        setFilter(savedFilter);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem('historialFiltro', filter);
    }
  }, [filter]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getMyAppointments().then((data) => {
      setTurnos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const handleCancelTurno = async (turnoId: string, turnoTenantId: string) => {
    if (!turnoTenantId) return;
    try {
      const turnoRef = doc(db, 'tenants', turnoTenantId, 'appointments', turnoId);
      await updateDoc(turnoRef, { status: 'cancelled' });
      setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, status: 'cancelled' as const } : t));
      toast({ title: "Turno cancelado", description: "Tu turno ha sido cancelado con éxito." });
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast({ title: "Error", description: "No se pudo cancelar el turno. Intenta de nuevo.", variant: "destructive" });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente', icon: Clock, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'confirmed':
        return { text: 'Confirmado', icon: CheckCircle, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'completed':
      case 'cobrado':
        return { text: 'Realizado', icon: CheckCircle, className: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'cancelled':
      case 'no_show':
        return { text: 'Cancelado', icon: Ban, className: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'pending_payment':
        return { text: 'Pendiente de Seña', icon: Clock, className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      default:
        return { text: 'Desconocido', icon: Clock, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  const proximosTurnos = turnos.filter(t => isFuture(parseISO(t.date)) && (t.status === 'pending' || t.status === 'pending_payment' || t.status === 'confirmed'));

  const historialTurnos = useMemo(() => {
    const allPastTurnos = turnos.filter(t => !proximosTurnos.some(pt => pt.id === t.id));
    if (filter === 'all') return allPastTurnos;
    const daysToSubtract = ({ week: 7, month: 30, quarter: 90 } as Record<string, number>)[filter] ?? 30;
    const startDate = startOfDay(subDays(new Date(), daysToSubtract));
    return allPastTurnos.filter(t => new Date(t.date) >= startDate);
  }, [turnos, proximosTurnos, filter]);

  const visibleHistorial = historialTurnos.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Bienvenida, {user?.nombre}</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Revisá tus próximos turnos y tu historial de visitas.
          </p>
        </div>
        <Link href={`/salones/${tenantSlug}/turnos`}>
          <Button><Plus className="mr-2 h-4 w-4" /> Agendar Turno</Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-40 w-full" />
        </Card>
      ) : proximosTurnos.length > 0 ? (
        <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-2xl shadow-primary/20 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5" />Próximos Turnos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proximosTurnos.map(turno => (
              <ProximoTurnoCard key={turno.id} turno={turno} onCancel={handleCancelTurno} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-16 bg-card border-dashed border-border/80 rounded-2xl">
          <CardContent>
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No tenés próximos turnos</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              ¿Lista para tu próxima transformación? Animate a reservar tu cita y viví la experiencia Ouleeh.
            </p>
            <Button asChild className="mt-6">
              <Link href={`/salones/${tenantSlug}/turnos`}>Agendar un turno</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card shadow-lg dark:shadow-none border dark:border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Historial de Visitas</CardTitle>
          <CardDescription>Aquí podés ver todos tus turnos anteriores.</CardDescription>
        </CardHeader>
        <Tabs value={filter} onValueChange={(value) => { setFilter(value); setVisibleCount(10); }} className="w-full px-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week">Última semana</TabsTrigger>
            <TabsTrigger value="month">Último mes</TabsTrigger>
            <TabsTrigger value="quarter">Últimos 3 meses</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
        <CardContent className="pt-6" aria-live="polite">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : visibleHistorial.length > 0 ? (
            <div className="space-y-4">
              {visibleHistorial.map(turno => {
                const statusInfo = getStatusInfo(turno.status);
                let dateStr = turno.date;
                try {
                  dateStr = format(parseISO(turno.date), "d 'de' MMMM yyyy", { locale: es });
                } catch (e) {
                  console.error("Date error in history:", e);
                }
                return (
                  <Card key={turno.id} className="bg-muted/40 dark:bg-muted/10 border dark:border-border/50 rounded-xl">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold capitalize text-base">{dateStr}</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {turno.serviceNames.split(',').map((s, i) => <li key={i}>{s.trim()}</li>)}
                        </ul>
                      </div>
                      <Badge variant="outline" className={`gap-2 text-xs font-bold ${statusInfo.className}`}>
                        <statusInfo.icon className="h-3.5 w-3.5" />
                        <span>{statusInfo.text}</span>
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}
              {historialTurnos.length > visibleCount && (
                <div className="text-center pt-4">
                  <Button variant="secondary" onClick={() => setVisibleCount(prev => prev + 10)}>
                    Ver más visitas
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center pt-4">
                Los valores finales de cada visita se ajustaron según diagnóstico en el local.
              </p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay visitas en este período.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
