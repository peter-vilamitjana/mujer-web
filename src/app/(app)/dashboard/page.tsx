'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Scissors } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import type { Turno } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfToday, endOfToday } from 'date-fns';
import WeeklyCalendarView from '@/components/WeeklyCalendarView';

export default function DashboardPage() {
  const [totalClientes, setTotalClientes] = useState(0);
  const [turnosHoyCount, setTurnosHoyCount] = useState(0);
  const [allTurnos, setAllTurnos] = useState<Turno[]>([]);
  const [popularService, setPopularService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch total clients
      const clientesColl = collection(db, 'clientes');
      const clientesSnapshot = await getCountFromServer(clientesColl);
      setTotalClientes(clientesSnapshot.data().count);

      // Fetch today's appointments count
      const todayStart = Timestamp.fromDate(startOfToday());
      const todayEnd = Timestamp.fromDate(endOfToday());
      const turnosHoyQuery = query(
        collection(db, 'turnos'),
        where('fecha', '>=', todayStart),
        where('fecha', '<=', todayEnd)
      );
      const turnosHoySnapshot = await getCountFromServer(turnosHoyQuery);
      setTurnosHoyCount(turnosHoySnapshot.data().count);
      
      setLoading(false);
    };

    fetchData();

    // Live subscription for all appointments for the calendar
    const turnosQuery = query(collection(db, 'turnos'));
    const unsubTurnos = onSnapshot(turnosQuery, (snapshot) => {
        const turnosData = snapshot.docs.map(doc => {
            const data = doc.data();
            // Firestore timestamps need to be converted to serializable strings for components
            const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();
            return { id: doc.id, ...data, fecha } as Turno;
        });
        setAllTurnos(turnosData);

        // Calculate popular service
        if (turnosData.length > 0) {
          const serviceCounts = turnosData.reduce((acc, turno) => {
            acc[turno.servicio] = (acc[turno.servicio] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const mostPopular = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
          setPopularService(mostPopular[0]);
        } else {
          setPopularService('N/A');
        }

    }, (error) => {
        console.error("Error fetching turnos:", error);
    });
    
    return () => {
      unsubTurnos();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenida, aquí tienes un resumen de tu salón.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos de Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{turnosHoyCount}</div>}
            <p className="text-xs text-muted-foreground">
              Turnos programados para la jornada.
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
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicio Popular</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{popularService || 'Calculando...'}</div>}
            <p className="text-xs text-muted-foreground">
              El servicio más agendado este mes.
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
