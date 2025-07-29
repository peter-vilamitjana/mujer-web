'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors, Plus, XCircle, RefreshCw, User, CheckCircle, Ban } from "lucide-react";
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
} from "@/components/ui/alert-dialog"

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
        return { text: 'Pendiente', icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'realizado':
        return { text: 'Realizado', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200' };
      case 'cancelado':
        return { text: 'Cancelado', icon: Ban, className: 'bg-red-100 text-red-800 border-red-200' };
      case 'pendiente_pago':
         return { text: 'Pendiente de Seña', icon: Clock, className: 'bg-orange-100 text-orange-800 border-orange-200' };
      default:
        return { text: 'Desconocido', icon: Clock, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const proximosTurnos = turnos.filter(t => isFuture(parseISO(t.fecha)) && (t.estado === 'pendiente' || t.estado === 'pendiente_pago'));
  const historialTurnos = turnos.filter(t => !proximosTurnos.some(pt => pt.id === t.id));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenida, {user?.nombre}</h1>
          <p className="text-muted-foreground">
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
          <Skeleton className="h-28 w-full" />
        </Card>
      ) : proximosTurnos.length > 0 ? (
        <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/>Próximo Turno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proximosTurnos.map(turno => (
              <div key={turno.id} className="p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-2xl capitalize">
                    {format(parseISO(turno.fecha), "eeee, d 'de' MMMM", { locale: es })}
                  </h3>
                  <p className="font-mono text-xl flex items-center gap-2">
                    <Clock className="h-5 w-5 opacity-80" />
                    {format(parseISO(turno.fecha), "HH:mm 'hs'")}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="flex items-center justify-end gap-2"><Scissors className="h-4 w-4 opacity-80" />{turno.servicio}</p>
                  <p className="flex items-center justify-end gap-2"><User className="h-4 w-4 opacity-80" />Con {turno.empleadaNombre}</p>
                   <div className="pt-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/20"><XCircle className="h-4 w-4 mr-2"/> Cancelar Turno</Button>
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
                            <AlertDialogAction onClick={() => handleCancelTurno(turno.id)}>Sí, cancelar turno</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
         <Card className="text-center py-16 bg-muted/50 border-dashed">
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

      <Card>
        <CardHeader>
          <CardTitle>Historial de Visitas</CardTitle>
          <CardDescription>Aquí podés ver todos tus turnos anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : historialTurnos.length > 0 ? (
            <div className="space-y-3">
              {historialTurnos.map(turno => {
                const statusInfo = getStatusInfo(turno.estado);
                return (
                  <div key={turno.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                          <p className="font-semibold capitalize">{format(parseISO(turno.fecha), "d 'de' MMMM yyyy", { locale: es })}</p>
                          <p className="text-sm text-muted-foreground">{turno.servicio}</p>
                      </div>
                       <Badge variant="outline" className={`gap-2 ${statusInfo.className}`}>
                          <statusInfo.icon className="h-3.5 w-3.5" />
                          <span>{statusInfo.text}</span>
                       </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aún no tenés un historial de turnos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
