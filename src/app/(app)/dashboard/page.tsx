import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockTurnos, mockClientes } from "@/lib/mock-data";
import { Calendar, Users, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const proximosTurnos = mockTurnos
    .filter(t => new Date(t.fecha) > new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  const clientesRecientes = mockClientes.slice(0, 5);

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
            <div className="text-2xl font-bold">
              {mockTurnos.filter(t => new Date(t.fecha).toDateString() === new Date().toDateString()).length}
            </div>
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
            <div className="text-2xl font-bold">{mockClientes.length}</div>
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
            {proximosTurnos.length > 0 ? (
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
                    <p className="text-sm font-medium">{format(new Date(turno.fecha), "d MMM, HH:mm'hs'", { locale: es })}</p>
                    <p className="text-xs text-muted-foreground capitalize">{format(new Date(turno.fecha), "eeee", { locale: es })}</p>
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
            {clientesRecientes.map(cliente => (
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
