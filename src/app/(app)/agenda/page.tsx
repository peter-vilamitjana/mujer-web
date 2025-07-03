'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Scissors, PlusCircle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Turno } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = 'admin';

  useEffect(() => {
    const turnosQuery = query(collection(db, 'turnos'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(turnosQuery, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha);
        return { id: doc.id, ...data, fecha: fecha.toISOString() } as Turno;
      });
      setTurnos(turnosData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight">Agenda de Turnos</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona todos los turnos agendados.
          </p>
        </div>
        {userRole === 'admin' && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agendar Turno
          </Button>
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
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {format(parseISO(date), "eeee, d 'de' MMMM", { locale: es })}
              </h2>
              <div className="space-y-4">
                {groupedTurnos[date].map(turno => {
                  const isPast = new Date(turno.fecha) < new Date();
                  return (
                    <div key={turno.id} className={`p-4 rounded-lg border ${isPast ? 'bg-muted/50' : 'bg-card'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isPast ? 'bg-muted-foreground/20' : 'bg-primary/10'}`}>
                            <Calendar className={`h-6 w-6 ${isPast ? 'text-muted-foreground' : 'text-primary'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{turno.clienteNombre}</h3>
                            <p className={cn("text-sm", isPast ? "text-muted-foreground" : "text-primary")}>{turno.servicio}</p>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right">
                          <p className="font-medium text-sm flex items-center justify-end gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(parseISO(turno.fecha), "HH:mm 'hs'", { locale: es })}
                          </p>
                          {turno.tonoColor && (
                            <p className="text-xs text-muted-foreground flex items-center justify-end gap-2">
                              <Scissors className="h-3 w-3" /> Tono: {turno.tonoColor}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
