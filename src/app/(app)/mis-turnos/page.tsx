'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors, Plus, XCircle, RefreshCw, User } from "lucide-react";
import { format, parseISO, isFuture } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp, where, doc, updateDoc } from "firebase/firestore";
import type { Turno } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
      where('clienteId', '==', user.id), 
      orderBy('fecha', 'desc')
    );

    const unsubscribe = onSnapshot(turnosQuery, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();
        return { id: doc.id, ...data, fecha } as Turno;
      });
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
    if (!confirm("¿Estás segura de que quieres cancelar este turno?")) return;

    try {
      const turnoRef = doc(db, 'turnos', turnoId);
      await updateDoc(turnoRef, { estado: 'cancelado' });
      toast({ title: "Turno cancelado", description: "Tu turno ha sido cancelado con éxito." });
    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast({ title: "Error", description: "No se pudo cancelar el turno.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: Turno['estado']) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'realizado':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Realizado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'pendiente_pago':
         return <Badge variant="outline">Pendiente de Seña</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const proximosTurnos = turnos.filter(t => isFuture(parseISO(t.fecha)) && (t.estado === 'pendiente' || t.estado === 'pendiente_pago'));
  const historialTurnos = turnos.filter(t => !proximosTurnos.some(pt => pt.id === t.id));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Turnos</h1>
          <p className="text-muted-foreground">
            Revisá tus próximos turnos y tu historial de visitas.
          </p>
        </div>
        <Link href="/turnos">
          <Button><Plus className="mr-2 h-4 w-4"/> Agendar Nuevo Turno</Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      ) : proximosTurnos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Próximo Turno</CardTitle>
            <CardDescription>Estos son los detalles de tu próxima visita al salón.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {proximosTurnos.map(turno => (
              <div key={turno.id} className="p-4 rounded-lg border bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {format(parseISO(turno.fecha), "eeee, d 'de' MMMM", { locale: es })}
                  </h3>
                  <p className="font-mono font-semibold text-lg flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(parseISO(turno.fecha), "HH:mm 'hs'")}
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground"><Scissors className="h-4 w-4 text-primary" />{turno.servicio}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4 text-primary" />Con {turno.empleadaNombre}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {getStatusBadge(turno.estado)}
                  <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" disabled><RefreshCw className="h-4 w-4 mr-2"/> Reprogramar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleCancelTurno(turno.id)}><XCircle className="h-4 w-4 mr-2"/> Cancelar</Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
         <Card className="text-center py-12">
            <CardContent>
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No tenés próximos turnos</h3>
                <p className="text-muted-foreground mt-2">
                   ¿Lista para tu próxima transformación?
                </p>
                <Button asChild className="mt-4">
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
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : historialTurnos.length > 0 ? (
            <div className="space-y-3">
              {historialTurnos.map(turno => (
                <div key={turno.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div>
                        <p className="font-semibold capitalize">{format(parseISO(turno.fecha), "d MMM yyyy", { locale: es })}</p>
                        <p className="text-sm text-muted-foreground">{turno.servicio}</p>
                    </div>
                    {getStatusBadge(turno.estado)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aún no tenés un historial de turnos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
