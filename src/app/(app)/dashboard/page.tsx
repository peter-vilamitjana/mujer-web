'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp, getCountFromServer } from 'firebase/firestore';
import type { Turno } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { isToday, parseISO } from 'date-fns';
import WeeklyCalendarView from '@/components/WeeklyCalendarView';

export default function DashboardPage() {
  const [totalClientes, setTotalClientes] = useState(0);
  const [turnosHoy, setTurnosHoy] = useState(0);
  const [allTurnos, setAllTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchCounts = async () => {
      const clientesColl = collection(db, 'clientes');
      const clientesSnapshot = await getCountFromServer(clientesColl);
      if (active) {
        setTotalClientes(clientesSnapshot.data().count);
      }
    };

    fetchCounts();

    const turnosQuery = query(collection(db, 'turnos'), orderBy('fecha'));
    const unsubTurnos = onSnapshot(turnosQuery, (snapshot) => {
        const turnosData = snapshot.docs.map(doc => {
            const data = doc.data();
            const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha);
            return { id: doc.id, ...data, fecha: fecha.toISOString() } as Turno;
        });

        if (active) {
            setAllTurnos(turnosData);
            const turnosDeHoy = turnosData.filter(t => isToday(parseISO(t.fecha)));
            setTurnosHoy(turnosDeHoy.length);
            setLoading(false);
        }
    }, (error) => {
        console.error("Error fetching turnos:", error);
        if (active) {
          setLoading(false);
        }
    });
    
    return () => {
      active = false;
      unsubTurnos();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenida de nuevo, aquí tienes un resumen de tu salón.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos de Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{turnosHoy}</div>}
            <p className="text-xs text-muted-foreground">
              Turnos programados para hoy.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{totalClientes}</div>}
            <p className="text-xs text-muted-foreground">
              Clientes registrados en el sistema.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3 mb-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <WeeklyCalendarView turnos={allTurnos} />
        )}
      </div>
    </div>
  );
}
