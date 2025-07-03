'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, ArrowRight, Loader2 } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Turno, Cliente } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [totalClientes, setTotalClientes] = useState(0);
  const [turnosHoy, setTurnosHoy] = useState(0);
  const [proximosTurnos, setProximosTurnos] = useState<Turno[]>([]);
  const [clientesRecientes, setClientesRecientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientesQuery = query(collection(db, 'clientes'), orderBy('nombre'), limit(5));
    const unsubClientes = onSnapshot(clientesQuery, (snapshot) => {
      setTotalClientes(snapshot.size);
      const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[];
      setClientesRecientes(clientesData);
      setLoading(false);
    });

    const turnosQuery = query(collection(db, 'turnos'), where('fecha', '>=', new Date()));
    const unsubTurnos = onSnapshot(turnosQuery, (snapshot) => {
        const now = new Date();
        const turnosData = snapshot.docs.map(doc => {
            const data = doc.data();
            // Firestore timestamps need to be converted to JS Dates
            const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha);
            return { id: doc.id, ...data, fecha: fecha.toISOString() } as Turno;
        });

        const turnosDeHoy = turnosData.filter(t => isToday(parseISO(t.fecha)));
        setTurnosHoy(turnosDeHoy.length);
        
        const proximos = turnosData
            .filter(t => new Date(t.fecha) > now)
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
            .slice(0, 5);
        setProximosTurnos(proximos);
        setLoading(false);
    });

    return () => {
      unsubClientes();
      unsubTurnos();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenida de nuevo, aquí tienes un resumen de tu salón.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Próximos Turnos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : proximosTurnos.length > 0 ? (
              proximosTurnos.map(turno => (
                <div key={turno.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="woman portrait" />
                      <AvatarFallback>{turno.clienteNombre.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{turno.clienteNombre}</p>
                      <p className="text-sm text-muted-foreground">{turno.servicio}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{format(parseISO(turno.fecha), "d MMM, HH:mm'hs'", { locale: es })}</p>
                    <p className="text-xs text-muted-foreground capitalize">{format(parseISO(turno.fecha), "eeee", { locale: es })}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay próximos turnos agendados.</p>
            )}
            <Link href="/agenda" className="mt-4 block">
              <Button variant="outline" className="w-full">
                Ver Agenda Completa <ArrowRight className="ml-2 h-4 w-4"/>
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Clientes Recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
               Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : clientesRecientes.map(cliente => (
              <Link href={`/clientes/${cliente.id}`} key={cliente.id} className="flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="woman face" />
                    <AvatarFallback>{cliente.nombre.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{cliente.nombre} {cliente.apellido}</p>
                    <p className="text-sm text-muted-foreground">{cliente.email}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
              </Link>
            ))}
             <Link href="/clientes" className="mt-4 block">
              <Button variant="outline" className="w-full">
                Ver Todos los Clientes <ArrowRight className="ml-2 h-4 w-4"/>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
