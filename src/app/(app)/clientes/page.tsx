'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import type { Cliente } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import NewClientForm from "@/components/NewClientForm";
import { Input } from "@/components/ui/input";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const userRole = 'admin'; // TODO: Get role from user auth state

  useEffect(() => {
    const clientesQuery = query(collection(db, 'clientes'), orderBy('nombre'));
    const unsubClientes = onSnapshot(clientesQuery, (snapshot) => {
      const clientesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
              id: doc.id, 
              ...data,
              ultimaVisita: data.ultimaVisita,
              fechaRegistro: data.fechaRegistro,
          } as Cliente;
      });
      setClientes(clientesData);
      setLoading(false);
    });

    return () => unsubClientes();
  }, []);

  const filteredClientes = clientes.filter(cliente =>
    `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información y el historial de tus clientes.
          </p>
        </div>
        {userRole === 'admin' && (
          <NewClientForm />
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <div className="flex justify-between items-center">
            {loading ? <Skeleton className="h-4 w-48 mt-2" /> : <CardDescription>Un total de {filteredClientes.length} clientes encontrados.</CardDescription>}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Última Visita</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.length > 0 ? filteredClientes.map(cliente => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nombre} {cliente.apellido}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{cliente.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{cliente.telefono}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                      {cliente.ultimaVisita ? format(cliente.ultimaVisita.toDate(), "d MMM yyyy", { locale: es }) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/clientes/${cliente.id}`} passHref>
                        <Button variant="outline" size="sm">
                          Ver Ficha
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron clientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
