'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { notFound, useParams } from "next/navigation";
import { Calendar, Palette, FileText, User, MessageSquare, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Cliente, Turno, ComentarioInterno } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioInterno[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = 'admin';
  const isReadOnly = userRole !== 'admin';

  useEffect(() => {
    if (!id) return;

    const unsubCliente = onSnapshot(doc(db, "clientes", id), (doc) => {
      if (doc.exists()) {
        setCliente({ id: doc.id, ...doc.data() } as Cliente);
      } else {
        notFound();
      }
      setLoading(false);
    });

    const qTurnos = query(collection(db, "turnos"), where("clienteId", "==", id), orderBy("fecha", "desc"));
    const unsubTurnos = onSnapshot(qTurnos, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha);
        return { id: doc.id, ...data, fecha: fecha.toISOString() } as Turno;
      });
      setTurnos(turnosData);
    });

    const qComentarios = query(collection(db, "comentarios"), where("clienteId", "==", id), orderBy("fecha", "desc"));
    const unsubComentarios = onSnapshot(qComentarios, (snapshot) => {
      const comentariosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha);
        return { id: doc.id, ...data, fecha: fecha.toISOString() } as ComentarioInterno;
      });
      setComentarios(comentariosData);
    });

    return () => {
      unsubCliente();
      unsubTurnos();
      unsubComentarios();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-full" />
            <Card className="mt-4">
              <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return notFound();
  }

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
            {!isReadOnly && 
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full">Guardar Cambios</Button>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Turno
                </Button>
              </div>
            }
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
                      <p className="font-semibold">{format(parseISO(turno.fecha), "d 'de' MMMM yyyy", { locale: es })}</p>
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
                          <p>{format(parseISO(comentario.fecha), "d MMM yy, HH:mm", { locale: es })}</p>
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
