'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { notFound, useParams } from "next/navigation";
import { Calendar, Palette, FileText, User, MessageSquare, Plus, ArrowLeft, Save, Trash2, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, Timestamp, addDoc, serverTimestamp, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { Cliente, Turno, FichaTecnica, UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { safeFormatDate } from '@/lib/utils';

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [fichas, setFichas] = useState<FichaTecnica[]>([]);
  const [newFicha, setNewFicha] = useState({ servicioRealizado: '', tono: '', observaciones: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // TODO: Replace with actual role from user authentication
  const userRole = 'admin' as UserRole;
  const isReadOnly = userRole === 'clienta';
  const canEditFicha = userRole === 'admin';

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    const unsubCliente = onSnapshot(doc(db, "clientes", id),
      (doc) => {
        if (doc.exists()) {
          const clienteData = { id: doc.id, ...doc.data() } as Cliente;
          setCliente(clienteData);
          setFormData(clienteData);
        } else {
          setCliente(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener cliente: ", error);
        setLoading(false);
        toast({ title: "Error", description: "No se pudo cargar la información del cliente.", variant: "destructive" });
      }
    );

    const qTurnos = query(collection(db, "turnos"), where("clienteId", "==", id), orderBy("fecha", "desc"));
    const unsubTurnos = onSnapshot(qTurnos,
      (snapshot) => {
        const turnosData = snapshot.docs.map(doc => {
          const data = doc.data();
          const fecha = safeFormatDate(data.fecha);
          return { id: doc.id, ...data, fecha } as Turno;
        });
        setTurnos(turnosData);
      },
      (error) => {
        console.error("Error al obtener turnos: ", error);
        toast({ title: "Error", description: "No se pudo cargar el historial de turnos.", variant: "destructive" });
      }
    );

    const qFichas = query(collection(db, `clientes/${id}/fichas_tecnicas`), orderBy("fecha", "desc"));
    const unsubFichas = onSnapshot(qFichas,
      (snapshot) => {
        const fichasData = snapshot.docs.map(doc => {
          const data = doc.data();
          const fecha = safeFormatDate(data.fecha);
          return { id: doc.id, ...data, fecha } as FichaTecnica;
        });
        setFichas(fichasData);
      },
      (error) => {
        console.error("Error al obtener fichas técnicas: ", error);
        toast({ title: "Error", description: "No se pudo cargar la ficha técnica.", variant: "destructive" });
      }
    );

    return () => {
      unsubCliente();
      unsubTurnos();
      unsubFichas();
    };
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleFichaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFicha(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (userRole !== 'admin') return;
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

  const handleAddFicha = async () => {
    if (isReadOnly || !newFicha.servicioRealizado.trim()) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, `clientes/${id}/fichas_tecnicas`), {
        clienteId: id,
        ...newFicha,
        fecha: serverTimestamp(),
        empleadaNombre: "Admin/Empleada" // TODO: Get current user name
      });
      setNewFicha({ servicioRealizado: '', tono: '', observaciones: '' });
      toast({ title: "Ficha agregada", description: "La nueva entrada de la ficha técnica ha sido guardada." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo agregar la ficha.", variant: "destructive" });
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
              <Input id="nombre" value={formData.nombre || ''} onChange={handleInputChange} readOnly={userRole !== 'admin'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" value={formData.apellido || ''} onChange={handleInputChange} readOnly={userRole !== 'admin'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} readOnly={userRole !== 'admin'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" type="tel" value={formData.telefono || ''} onChange={handleInputChange} readOnly={userRole !== 'admin'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (solo admin)</Label>
              <Textarea id="observaciones" value={formData.observaciones || ''} onChange={handleInputChange} readOnly={userRole !== 'admin'} placeholder="Alergias, preferencias, etc." />
            </div>
          </CardContent>
          {userRole === 'admin' &&
            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Link href={`/turnos?clienteId=${id}`} passHref className="w-full">
                <Button variant="secondary" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Turno
                </Button>
              </Link>
            </CardFooter>
          }
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="ficha_tecnica">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ficha_tecnica"><MessageSquare className="mr-2 h-4 w-4" />Ficha Técnica</TabsTrigger>
              <TabsTrigger value="historial"><Calendar className="mr-2 h-4 w-4" />Historial de Turnos</TabsTrigger>
            </TabsList>
            <TabsContent value="ficha_tecnica" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ficha Técnica</CardTitle>
                  <CardDescription>Historial de servicios, tonos y observaciones.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isReadOnly && (
                    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-semibold">Agregar Nueva Entrada</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="servicioRealizado">Servicio Realizado</Label>
                          <Input id="servicioRealizado" name="servicioRealizado" placeholder="Ej: Color y corte" value={newFicha.servicioRealizado} onChange={handleFichaChange} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tono">Tono y Sobretón</Label>
                          <Input id="tono" name="tono" placeholder="Ej: 7.1 + matiz ceniza" value={newFicha.tono} onChange={handleFichaChange} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="ficha_observaciones">Observaciones del trabajo</Label>
                        <Textarea id="ficha_observaciones" name="observaciones" placeholder="Anotaciones sobre el trabajo realizado..." value={newFicha.observaciones} onChange={handleFichaChange} />
                      </div>
                      <Button size="sm" onClick={handleAddFicha} disabled={isSaving}><Plus className="mr-2 h-4 w-4" />Agregar a Ficha</Button>
                    </div>
                  )}
                  <div className="space-y-4 pt-4">
                    {fichas.length > 0 ? fichas.map(ficha => (
                      <div key={ficha.id} className="p-4 border rounded-md bg-muted/50 relative group">
                        <div className="flex justify-between items-start text-xs text-muted-foreground mb-2">
                          <p className="font-medium flex items-center gap-1.5"><User className="h-3 w-3" />{ficha.empleadaNombre}</p>
                          <p>{format(parseISO(ficha.fecha), "d MMM yyyy, HH:mm", { locale: es })}</p>
                        </div>
                        <p className="font-semibold text-primary flex items-center gap-2"><FileText className="h-4 w-4" />Servicio: <span className="text-foreground">{ficha.servicioRealizado}</span></p>
                        <p className="font-semibold text-primary flex items-center gap-2"><Palette className="h-4 w-4" />Tono: <span className="text-foreground">{ficha.tono}</span></p>
                        <p className="mt-2 text-sm">{ficha.observaciones}</p>

                        {canEditFicha && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </div>
                    )) : <p className="text-center text-muted-foreground py-8">No hay entradas en la ficha técnica.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="historial" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Turnos</CardTitle>
                  <CardDescription>Turnos agendados anteriormente para esta clienta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {turnos.length > 0 ? turnos.map(turno => (
                    <div key={turno.id} className="p-4 border rounded-md">
                      <p className="font-semibold">{format(parseISO(turno.fecha), "d 'de' MMMM yyyy 'a las' HH:mm 'hs'", { locale: es })}</p>
                      <p className="text-muted-foreground text-sm flex items-center gap-2">Estado: {turno.estado}</p>
                      <p className="text-primary font-medium flex items-center gap-2 mt-1"><FileText className="h-4 w-4" />Servicio: {turno.servicio}</p>
                    </div>
                  )) : <p className="text-center text-muted-foreground py-8">No hay turnos en el historial.</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
