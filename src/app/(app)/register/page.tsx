'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { authService } from "@/lib/services/auth.service";
import { useTenant } from "@/contexts/TenantContext";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { tenantId } = useTenant(); // Should be 'demo-salon' or dynamic

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast({ variant: "destructive", title: "Error", description: "Las contraseñas no coinciden." });
            setIsLoading(false);
            return;
        }

        try {
            await authService.registerUser({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone,
                tenantId: tenantId
            });

            toast({ title: "Cuenta creada", description: "Te registraste con éxito. ¡Bienvenida!" });
            // Redirect handled by layout/auth state change, but push just in case
            router.push('/mis-turnos');
        } catch (error: any) {
            console.error("Error al registrar:", error);
            let msg = "No se pudo crear la cuenta. Intenta nuevamente.";
            if (error.code === 'auth/email-already-in-use') msg = "El email ya está registrado.";
            if (error.code === 'auth/weak-password') msg = "La contraseña es muy débil (mínimo 6 caracteres).";

            toast({ variant: "destructive", title: "Error", description: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Logo />
                </div>
                <Card className="shadow-lg">
                    <CardHeader className="text-center p-8">
                        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                        <CardDescription>
                            Regístrate para reservar tus turnos fácilmente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nombre Completo</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Tu nombre"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Para confirmaciones"
                                    required // Optional? Better required for business
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full py-6 mt-2" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Registrarme"}
                            </Button>
                        </form>
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="underline hover:text-primary font-medium">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
