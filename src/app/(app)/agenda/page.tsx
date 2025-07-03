import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTurnos } from "@/lib/mock-data";
import { Calendar, Clock, Scissors } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgendaPage() {
  const sortedTurnos = [...mockTurnos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Mock user role
  const userRole = 'admin';

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

      <Card>
        <CardHeader>
          <CardTitle>Todos los Turnos</CardTitle>
          <CardDescription>Listado completo de turnos, del más reciente al más antiguo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedTurnos.map(turno => {
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
                      {format(new Date(turno.fecha), "d MMMM yyyy, HH:mm 'hs'", { locale: es })}
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
        </CardContent>
      </Card>
    </div>
  );
}
