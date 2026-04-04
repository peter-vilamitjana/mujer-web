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

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [photoBase64, setPhotoBase64] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
                tenantId: tenantId ?? '',
                photo: selectedFile || undefined,
                photoBase64: photoBase64 || undefined
            });

            toast({ title: "Cuenta creada", description: "Te registraste con éxito. ¡Bienvenida!" });
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

    // Helper for compression
    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Resize to max 500px width (sufficient for avatar)
                const MAX_WIDTH = 500;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error("No context")); return; }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error("Canvas blob error"));
                    }
                }, 'image/jpeg', 0.8); // 80% quality
            };
            img.onerror = (e) => reject(e);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Basic validation
            if (file.size > 10 * 1024 * 1024) {
                toast({ variant: "destructive", title: "Archivo muy grande", description: "La imagen debe pesar menos de 10MB." });
                return;
            }

            // Client-side visual preview (immediate)
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // Simple compression/resize logic
            try {
                let fileToUse = file;
                // If larger than 500KB, compress
                if (file.size > 500 * 1024) {
                    fileToUse = await compressImage(file);
                }

                setSelectedFile(fileToUse);

                // Convert to Base64 for fallback
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoBase64(reader.result as string);
                };
                reader.readAsDataURL(fileToUse);

            } catch (err) {
                console.error("Compression warning:", err);
                setSelectedFile(file); // Fallback to original
            }
        }
    };

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
                            <div className="flex flex-col items-center gap-2 mb-6">
                                <Label htmlFor="photo" className="cursor-pointer group relative">
                                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/30 group-hover:border-primary transition-colors bg-muted/30 flex items-center justify-center relative">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                            </div>
                                        )}
                                        {!previewUrl && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                        )}
                                    </div>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isLoading}
                                        className="hidden"
                                    />
                                </Label>
                                <p className="text-xs text-muted-foreground">Toca para subir tu foto</p>
                            </div>

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
