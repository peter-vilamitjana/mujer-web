'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SalonProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [salonId, setSalonId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        slug: ""
    });
    const { toast } = useToast();

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchSalon = async () => {
            try {
                // Get salonId from user doc
                const user = session.user as any;
                const userDoc = await getDoc(doc(db, "users", user.id));
                if (userDoc.exists()) {
                    const sId = userDoc.data().salonId;
                    setSalonId(sId);

                    if (sId) {
                        const salonDoc = await getDoc(doc(db, "salons", sId));
                        if (salonDoc.exists()) {
                            const data = salonDoc.data();
                            setFormData({
                                name: data.name || "",
                                address: data.address || "",
                                phone: data.phone || "",
                                slug: data.slug || ""
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSalon();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!salonId) return;

        setSaving(true);
        try {
            await updateDoc(doc(db, "salons", salonId), {
                ...formData,
                updatedAt: new Date()
            });
            toast({
                title: "Perfil actualizado",
                description: "Los datos de tu salón se han guardado correctamente.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!salonId) return <div className="p-10 text-center">No tienes un salón registrado.</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Perfil del Salón</h1>
                <p className="text-muted-foreground">Administra la información pública de tu negocio.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Datos Generales</CardTitle>
                    <CardDescription>Esta información será visible para tus clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Salón</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Personalizada (slug)</Label>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">mujerapp.com/</span>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono de Contacto</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
