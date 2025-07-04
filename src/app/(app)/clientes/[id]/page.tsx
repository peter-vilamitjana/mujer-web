'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { notFound, useParams } from "next/navigation";
import { Calendar, Palette, FileText, User, MessageSquare, Plus, ArrowLeft, Save } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, Timestamp, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { Cliente, Turno, ComentarioInterno, UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioInterno[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // TODO: Replace with actual role from user authentication
  const userRole: UserRole = 'admin'; 
  const isReadOnly = userRole !== 'admin';

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    const unsubCliente = onSnapshot(doc(db, "clientes", id), (doc) => {
      if (doc.exists()) {
        const clienteData = { id: doc.id, ...doc.data() } as Cliente;
        setCliente(clienteData);
        setFormData(clienteData);
      } else {
        setCliente(null);
      }
      setLoading(false);
    });

    const qTurnos = query(collection(db, "turnos"), where("clienteId", "==", id), orderBy("fecha", "desc"));
    const unsubTurnos = onSnapshot(qTurnos, (snapshot) => {
      const turnosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();
        return { id: doc.id, ...data, fecha } as Turno;
      });
      setTurnos(turnosData);
    });

    const qComentarios = query(collection(db, "comentarios"), where("clienteId", "==", id), orderBy("fecha", "desc"));
    const unsubComentarios = onSnapshot(qComentarios, (snapshot) => {
      const comentariosData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date(data.fecha).toISOString();
        return { id: doc.id, ...data, fecha } as ComentarioInterno;
      });
      setComentarios(comentariosData);
    });

    return () => {
      unsubCliente();
      unsubTurnos();
      unsubComentarios();
    };
  }, [id]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  }

  const handleSaveChanges = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    try {
      const clienteRef = doc(db, 'clientes', id);
      await updateDoc(clienteRef, formData);
      toast({ title: "¡Éxito!", description: "Los datos de la clienta se han actualizado." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar los cambios.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (isReadOnly || !newComment.trim()) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'comentarios'), {
        clienteId: id,
        comentario: newComment,
        fecha: serverTimestamp(),
        empleadaNombre: "Admin" // TODO: Get current user name
      });
      setNewComment("");
      toast({ title: "Nota agregada", description: "El comentario interno ha sido guardado." });
    } catch(error) {
       console.error(error);
       toast({ title: "Error", description: "No se pudo agregar la nota.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) {
    return <p>Cargando...</p>;
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
            <CardDescription>Datos y observaciones de la clienta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={formData.nombre || ''} onChange={handleInputChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" value={formData.apellido || ''} onChange={handleInputChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} readOnly={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" type="tel" value={formData.telefono || ''} onChange={handleInputChange} readOnly={isReadOnly} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (solo admin)</Label>
              <Textarea id="observaciones" value={formData.observaciones || ''} onChange={handleInputChange} readOnly={isReadOnly} placeholder="Alergias, preferencias, etc." />
            </div>
          </CardContent>
          {!isReadOnly && 
            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button variant="secondary" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Agendar Turno
              </Button>
            </CardFooter>
          }
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
                      {turno.observaciones && <p className="text-muted-foreground text-sm mt-2">Obs: {turno.observaciones}</p>}
                    </div>
                  )) : <p className="text-center text-muted-foreground py-8">No hay turnos en el historial.</p>}
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
                      <Textarea id="new-note" placeholder="Escribe un comentario interno..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                      <Button size="sm" onClick={handleAddComment} disabled={isSaving}><Plus className="mr-2 h-4 w-4" />Agregar Nota</Button>
                    </div>
                  )}
                  <div className="space-y-4 pt-4">
                    {comentarios.length > 0 ? comentarios.map(comentario => (
                      <div key={comentario.id} className="p-4 border rounded-md bg-muted/50">
                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                          <p className="font-medium flex items-center gap-1"><User className="h-3 w-3" />{comentario.empleadaNombre}</p>
                          <p>{format(parseISO(comentario.fecha), "d MMM yy, HH:mm", { locale: es })}</p>
                        </div>
                        <p className="text-sm">{comentario.comentario}</p>
                      </div>
                    )) : <p className="text-center text-muted-foreground py-8">No hay notas internas para esta clienta.</p>}
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
