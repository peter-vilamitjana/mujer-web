'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import type { Cliente, Turno } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = 'admin';

  useEffect(() => {
    const clientesQuery = query(collection(db, 'clientes'), orderBy('nombre'));
    const unsubClientes = onSnapshot(clientesQuery, (snapshot) => {
      const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[];
      setClientes(clientesData);
      if(turnos.length > 0) setLoading(false);
    });

    const turnosQuery = query(collection(db, 'turnos'));
    const unsubTurnos = onSnapshot(turnosQuery, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => {
          const data = doc.data();
          const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha);
          return { id: doc.id, ...data, fecha: fecha.toISOString() } as Turno;
      });
      setTurnos(turnosData);
      if(clientes.length > 0 || snapshot.empty) setLoading(false);
    });

    return () => {
      unsubClientes();
      unsubTurnos();
    };
  }, []);

  const getLastVisit = (clienteId: string) => {
    const lastTurno = turnos
      .filter(t => t.clienteId === clienteId && new Date(t.fecha) < new Date())
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
    return lastTurno ? format(parseISO(lastTurno.fecha), "d MMM yyyy", { locale: es }) : "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información y el historial de tus clientes.
          </p>
        </div>
        {userRole === 'admin' && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Cliente
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
           {loading ? <Skeleton className="h-4 w-48" /> : <CardDescription>Un total de {clientes.length} clientes registradas.</CardDescription>}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="text-right">Última Visita</TableHead>
                  <TableHead className="sr-only">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map(cliente => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nombre} {cliente.apellido}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{cliente.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{cliente.telefono}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{getLastVisit(cliente.id)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/clientes/${cliente.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Ficha
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
