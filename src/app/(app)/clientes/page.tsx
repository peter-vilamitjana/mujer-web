import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockClientes, mockTurnos } from "@/lib/mock-data";
import { PlusCircle, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ClientesPage() {
  // Mock user role
  const userRole = 'admin';

  const getLastVisit = (clienteId: string) => {
    const lastTurno = mockTurnos
      .filter(t => t.clienteId === clienteId && new Date(t.fecha) < new Date())
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
    return lastTurno ? format(new Date(lastTurno.fecha), "d MMM yyyy", { locale: es }) : "N/A";
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
          <CardDescription>Un total de {mockClientes.length} clientes registradas.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {mockClientes.map(cliente => (
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
        </CardContent>
      </Card>
    </div>
  );
}
