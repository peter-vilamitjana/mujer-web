'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function RegisterSalonPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        slug: ""
    });

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl: "/business/register" });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        setIsLoading(true);

        try {
            // 1. Create Tenant Document
            // Use slug as ID if possible for cleaner URLs, or auto-id
            const tenantId = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const tenantRef = doc(db, "tenants", tenantId);

            await setDoc(tenantRef, {
                id: tenantId,
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                slug: tenantId,
                ownerId: session.user.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                email: session.user.email,
                image: session.user.image,
                settings: { currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires' }
            });

            // 2. Update User Profile with salonId (tenantId)
            // Note: register page logic used 'salonRef' from addDoc. Now we use tenantId string.
            await setDoc(doc(db, "users", session.user.id), {
                salonId: tenantId, // Keeping 'salonId' field for compatibility, but value is tenantId
                role: 'owner'
            }, { merge: true });

            // Create Owner Membership
            await setDoc(doc(db, "users", session.user.id, "memberships", tenantId), {
                role: 'owner',
                tenantId: tenantId
            });

            // 3. Redirect to Dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error("Error registering salon:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Crea tu cuenta</CardTitle>
                        <CardDescription className="text-center">
                            Para registrar tu salón, primero inicia sesión o regístrate
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-6">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                            )}
                            Continuar con Google
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Registra tu Salón</CardTitle>
                    <CardDescription>Completa los datos de tu negocio para comenzar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Salón</Label>
                            <Input
                                id="name"
                                required
                                placeholder="Ej: Bella Studio"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                required
                                placeholder="Calle 123, Ciudad"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                placeholder="+54 9 11 ..."
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">URL de tu sitio (opcional)</Label>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">mujerapp.com/</span>
                                <Input
                                    id="slug"
                                    placeholder="bella-studio"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="flex-1"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Esta será la dirección web que compartirás con tus clientas.</p>
                        </div>


                        <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Salón
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
