import { mockClientes, mockTurnos } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/Logo";
import { Calendar, History, Palette } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ClienteTokenPage({ params }: { params: { token: string } }) {
  const cliente = mockClientes.find(c => c.token === params.token);
  
  if (!cliente) {
    notFound();
  }

  const turnos = mockTurnos.filter(t => t.clienteId === cliente.id).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const proximoTurno = turnos.find(t => new Date(t.fecha) > new Date());
  const historialTurnos = turnos.filter(t => new Date(t.fecha) <= new Date());

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <header className="mx-auto max-w-4xl mb-8">
        <Logo />
      </header>
      <main className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="woman smiling" />
            <AvatarFallback>{cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">¡Hola, {cliente.nombre}!</h1>
            <p className="text-muted-foreground">Aquí tienes la información de tus turnos.</p>
          </div>
        </div>

        <Card className="border-primary border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Tu Próximo Turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximoTurno ? (
              <div>
                <p className="text-2xl font-bold text-primary">{proximoTurno.servicio}</p>
                <p className="text-lg font-semibold mt-2">
                  {format(new Date(proximoTurno.fecha), "eeee d 'de' MMMM 'a las' HH:mm 'hs'", { locale: es })}
                </p>
                {proximoTurno.tonoColor && <p className="text-muted-foreground flex items-center gap-2 mt-1"><Palette className="h-4 w-4" />Tono: {proximoTurno.tonoColor}</p>}
                <p className="text-muted-foreground mt-1">Obs: {proximoTurno.observaciones}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No tienes próximos turnos agendados.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Historial de Turnos
            </CardTitle>
            <CardDescription>Tus visitas anteriores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {historialTurnos.length > 0 ? (
              historialTurnos.map(turno => (
                <div key={turno.id} className="p-4 rounded-lg border bg-muted/50">
                  <p className="font-semibold">{format(new Date(turno.fecha), "d MMMM yyyy", { locale: es })}</p>
                  <p className="font-medium">{turno.servicio}</p>
                  {turno.tonoColor && <p className="text-sm text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" />Tono: {turno.tonoColor}</p>}
                  <p className="text-sm text-muted-foreground mt-1">Obs: {turno.observaciones}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Aún no tienes un historial de turnos.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="text-center text-sm text-muted-foreground mt-12">
        © {new Date().getFullYear()} Mujer Web
      </footer>
    </div>
  );
}
