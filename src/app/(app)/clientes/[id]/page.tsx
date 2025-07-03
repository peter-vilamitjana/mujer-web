import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { mockClientes, mockTurnos, mockComentarios } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Calendar, Palette, FileText, User, MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ClienteDetailPage({ params }: { params: { id: string } }) {
  const cliente = mockClientes.find(c => c.id === params.id);
  const turnos = mockTurnos.filter(t => t.clienteId === params.id).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const comentarios = mockComentarios.filter(c => c.clienteId === params.id).sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  if (!cliente) {
    notFound();
  }

  // Mock user role to control editability
  const userRole = 'admin'; // Change to 'empleada' to see read-only view
  const isReadOnly = userRole !== 'admin';

  return (
    <div className="space-y-6">
       <Link href="/clientes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Volver a Clientes
       </Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{cliente.nombre} {cliente.apellido}</h1>
          <p className="text-muted-foreground">Ficha completa de la clienta.</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Datos de contacto de la clienta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" defaultValue={cliente.nombre} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" defaultValue={cliente.apellido} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={cliente.email} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" type="tel" defaultValue={cliente.telefono} readOnly={isReadOnly} />
            </div>
            {!isReadOnly && <Button className="w-full">Guardar Cambios</Button>}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="historial">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="historial"><Calendar className="mr-2 h-4 w-4" />Historial de Turnos</TabsTrigger>
              <TabsTrigger value="notas"><MessageSquare className="mr-2 h-4 w-4" />Notas Internas</TabsTrigger>
            </TabsList>
            <TabsContent value="historial" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Turnos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {turnos.length > 0 ? turnos.map(turno => (
                    <div key={turno.id} className="p-4 border rounded-md">
                      <p className="font-semibold">{format(new Date(turno.fecha), "d 'de' MMMM yyyy", { locale: es })}</p>
                      <p className="text-primary font-medium flex items-center gap-2 mt-1"><FileText className="h-4 w-4" />Servicio: {turno.servicio}</p>
                      {turno.tonoColor && <p className="text-muted-foreground text-sm flex items-center gap-2"><Palette className="h-4 w-4" />Tono: {turno.tonoColor}</p>}
                      <p className="text-muted-foreground text-sm mt-2">{turno.observaciones}</p>
                    </div>
                  )) : <p className="text-muted-foreground">No hay turnos en el historial.</p>}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notas" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notas Internas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isReadOnly && (
                    <div className="space-y-2">
                      <Label htmlFor="new-note">Agregar nueva nota</Label>
                      <Textarea id="new-note" placeholder="Escribe un comentario interno..." />
                      <Button size="sm"><Plus className="mr-2 h-4 w-4" />Agregar Nota</Button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {comentarios.length > 0 ? comentarios.map(comentario => (
                      <div key={comentario.id} className="p-4 border rounded-md bg-muted/50">
                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                          <p className="font-medium flex items-center gap-1"><User className="h-3 w-3" />{comentario.empleadaNombre}</p>
                          <p>{format(new Date(comentario.fecha), "d MMM yy, HH:mm", { locale: es })}</p>
                        </div>
                        <p className="text-sm">{comentario.comentario}</p>
                      </div>
                    )) : <p className="text-muted-foreground">No hay notas internas para esta clienta.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
