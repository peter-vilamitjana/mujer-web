import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/Logo";
import { Calendar, History, Palette } from "lucide-react";
import { format, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Cliente, Turno } from "@/lib/types";

async function getClienteData(token: string) {
  const clientesRef = collection(db, "clientes");
  const q = query(clientesRef, where("token", "==", token));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const clienteDoc = querySnapshot.docs[0];
  const cliente = { id: clienteDoc.id, ...clienteDoc.data() } as Cliente;

  const turnosRef = collection(db, "turnos");
  const qTurnos = query(turnosRef, where("clienteId", "==", cliente.id), orderBy("fecha", "desc"));
  const turnosSnapshot = await getDocs(qTurnos);
  
  const turnos = turnosSnapshot.docs.map(doc => {
    const data = doc.data();
    const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha);
    return { id: doc.id, ...data, fecha: fecha.toISOString() } as Turno;
  });

  return { cliente, turnos };
}

export default async function ClienteTokenPage({ params }: { params: { token: string } }) {
  const data = await getClienteData(params.token);
  
  if (!data) {
    notFound();
  }

  const { cliente, turnos } = data;
  
  const now = new Date();
  const proximoTurno = turnos
    .filter(t => isAfter(parseISO(t.fecha), now))
    .sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];

  const historialTurnos = turnos.filter(t => !isAfter(parseISO(t.fecha), now));

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

        <Card className="border-primary/50 border-2 shadow-lg">
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
                <p className="text-lg font-semibold mt-2 capitalize">
                  {format(parseISO(proximoTurno.fecha), "eeee d 'de' MMMM 'a las' HH:mm 'hs'", { locale: es })}
                </p>
                {proximoTurno.tonoColor && <p className="text-muted-foreground flex items-center gap-2 mt-1"><Palette className="h-4 w-4" />Tono: {proximoTurno.tonoColor}</p>}
                {proximoTurno.observaciones && <p className="text-muted-foreground mt-1">Obs: {proximoTurno.observaciones}</p>}
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
                  <p className="font-semibold">{format(parseISO(turno.fecha), "d MMMM yyyy", { locale: es })}</p>
                  <p className="font-medium">{turno.servicio}</p>
                  {turno.tonoColor && <p className="text-sm text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" />Tono: {turno.tonoColor}</p>}
                  {turno.observaciones && <p className="text-sm text-muted-foreground mt-1">Obs: {turno.observaciones}</p>}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Aún no tienes un historial de turnos.</p>
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
