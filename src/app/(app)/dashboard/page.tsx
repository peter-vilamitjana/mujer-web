'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Scissors } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import type { Turno } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfToday, endOfToday } from 'date-fns';
import { useUser } from '@/contexts/UserContext';


export default function DashboardPage() {
  const user = useUser();
  const [totalClientes, setTotalClientes] = useState(0);
  const [turnosHoyCount, setTurnosHoyCount] = useState(0);
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
      
      let turnosHoyQuery;
      const baseTurnosQuery = collection(db, 'turnos');
      
      // Build query based on user role
      if (user?.rol === 'empleada') {
        turnosHoyQuery = query(
          baseTurnosQuery,
          where('fecha', '>=', todayStart),
          where('fecha', '<=', todayEnd),
          where('empleadaNombre', '==', user.nombre)
        );
      } else { // Admin sees all
         turnosHoyQuery = query(
          baseTurnosQuery,
          where('fecha', '>=', todayStart),
          where('fecha', '<=', todayEnd)
        );
      }
      
      const turnosHoySnapshot = await getCountFromServer(turnosHoyQuery);
      setTurnosHoyCount(turnosHoySnapshot.data().count);
      
      setLoading(false);
    };

    if(user) {
        fetchData();
    }

    // Live subscription for popular service calculation (admin only)
    if(user?.rol === 'admin') {
        const turnosQuery = query(collection(db, 'turnos'));
        const unsubTurnos = onSnapshot(turnosQuery, (snapshot) => {
            const turnosData = snapshot.docs.map(doc => doc.data() as Turno);

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
            console.error("Error fetching turnos for popular service:", error);
        });
        
        return () => unsubTurnos();
    } else {
        setPopularService('N/A')
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenida, {user?.nombre || 'Administradora'}!</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de la actividad de tu salón.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos de Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{turnosHoyCount}</div>}
            <p className="text-xs text-muted-foreground">
              Turnos programados para tu jornada.
            </p>
          </CardContent>
        </Card>
        { user?.rol === 'admin' &&
          <>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
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
             <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Servicio Popular</CardTitle>
                <Scissors className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{popularService || 'Calculando...'}</div>}
                <p className="text-xs text-muted-foreground">
                  El servicio más solicitado.
                </p>
              </CardContent>
            </Card>
          </>
        }
      </div>

      
    </div>
  );
}
