
'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors, Plus, XCircle, RefreshCw, User, CheckCircle, Ban, ChevronDown } from "lucide-react";
import { format, parseISO, isFuture, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp, where, doc, updateDoc } from "firebase/firestore";
import type { Turno } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import { cn } from "@/lib/utils";


function ProximoTurnoCard({ turno, onCancel }: { turno: Turno, onCancel: (id: string) => void }) {
  const services = turno.servicio.split(',').map(s => s.trim());
  const [isExpanded, setIsExpanded] = useState(false);
  const displayServices = isExpanded ? services : services.slice(0, 3);
  const hasMoreServices = services.length > 3;

  return (
    <div key={turno.id} className="p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col sm:flex-row sm:items-stretch gap-4">
      <div className="flex flex-col justify-center items-center text-center p-4 rounded-lg bg-black/10 flex-shrink-0 w-full sm:w-28">
        <p className="font-bold text-3xl sm:text-4xl">{format(parseISO(turno.fecha), "d", { locale: es })}</p>
        <h3 className="font-semibold text-base sm:text-lg capitalize">
          {format(parseISO(turno.fecha), "MMMM", { locale: es })}
        </h3>
        <p className="font-mono text-lg sm:text-xl mt-2 sm:mt-3 flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
          {format(parseISO(turno.fecha), "HH:mm")}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm opacity-90"><User className="h-4 w-4" />Con {turno.empleadaNombre}</p>
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
                <AlertDialogAction onClick={() => onCancel(turno.id)}>Sí, cancelar turno</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}


export default function MisTurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const turnosQuery = query(
      collection(db, 'turnos'), 
      where('clienteId', '==', user.id)
    );

    const unsubscribe = onSnapshot(turnosQuery, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();
        return { id: doc.id, ...data, fecha } as Turno;
      });
      turnosData.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setTurnos(turnosData);
      setLoading(false);
    }, (error) => {
        console.error("Error al obtener turnos: ", error);
        setLoading(false);
        toast({ title: "Error", description: "No se pudieron cargar tus turnos.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleCancelTurno = async (turnoId: string) => {
    try {
      const turnoRef = doc(db, 'turnos', turnoId);
      await updateDoc(turnoRef, { estado: 'cancelado' });
      toast({ title: "Turno cancelado", description: "Tu turno ha sido cancelado con éxito." });
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast({ title: "Error", description: "No se pudo cancelar el turno. Intenta de nuevo.", variant: "destructive" });
    }
  };
  
  const getStatusInfo = (status: Turno['estado']) => {
    switch (status) {
      case 'pendiente':
        return { text: 'Pendiente', icon: Clock, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'realizado':
        return { text: 'Realizado', icon: CheckCircle, className: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'cancelado':
        return { text: 'Cancelado', icon: Ban, className: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'pendiente_pago':
         return { text: 'Pendiente de Seña', icon: Clock, className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      default:
        return { text: 'Desconocido', icon: Clock, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  const proximosTurnos = turnos.filter(t => isFuture(parseISO(t.fecha)) && (t.estado === 'pendiente' || t.estado === 'pendiente_pago'));
  const historialTurnos = turnos.filter(t => !proximosTurnos.some(pt => pt.id === t.id));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Bienvenida, {user?.nombre}</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Revisá tus próximos turnos y tu historial de visitas.
          </p>
        </div>
        <Link href="/turnos">
          <Button><Plus className="mr-2 h-4 w-4"/> Agendar Turno</Button>
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
            <CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5"/>Próximos Turnos</CardTitle>
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
                   ¿Lista para tu próxima transformación? Animate a reservar tu cita y viví la experiencia Mujer.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/turnos">Agendar un turno</Link>
                </Button>
            </CardContent>
        </Card>
      )}

      <Card className="bg-card shadow-lg dark:shadow-none border dark:border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Historial de Visitas</CardTitle>
          <CardDescription>Aquí podés ver todos tus turnos anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : historialTurnos.length > 0 ? (
            <div className="space-y-4">
              {historialTurnos.map(turno => {
                const statusInfo = getStatusInfo(turno.estado);
                return (
                  <Card key={turno.id} className="bg-muted/40 dark:bg-muted/10 border dark:border-border/50 rounded-xl">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                          <p className="font-semibold capitalize text-base">{format(parseISO(turno.fecha), "d 'de' MMMM yyyy", { locale: es })}</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                             {turno.servicio.split(',').map((s, i) => <li key={i}>{s.trim()}</li>)}
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
               <p className="text-xs text-muted-foreground text-center pt-4">
                Los valores finales de cada visita se ajustaron según diagnóstico en el local.
              </p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aún no tenés un historial de turnos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
