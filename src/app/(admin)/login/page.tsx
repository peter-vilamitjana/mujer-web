'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Credenciales inválidas");
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    let title = "Error de inicio de sesión";
    let description = "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.";

    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        title = "Credenciales Inválidas";
        description = "El email o la contraseña son incorrectos. Por favor, verifica tus datos.";
        break;
      case 'auth/network-request-failed':
        title = "Error de Red";
        description = "No se pudo conectar con Firebase. Revisa tu conexión.";
        break;
      case 'auth/api-key-not-valid':
        title = "API Key de Firebase Inválida";
        description = "La clave API de Firebase no es válida. Revisa tus credenciales.";
        break;
      case 'auth/invalid-email':
        title = "Email Inválido";
        description = "El formato del email no es válido.";
        break;
      case 'auth/email-already-in-use':
        title = "Email en uso";
        description = "Este email ya está registrado. Intenta iniciar sesión.";
        break;
    }
    if (error?.message) {
      if (error.message.includes("Credenciales")) {
        title = "Credenciales Inválidas";
        description = "El email o la contraseña son incorrectos. Por favor, verifica tus datos.";
      }
    }

    toast({
      variant: "destructive",
      title: title,
      description: description,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo />
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center p-8">
            <CardTitle className="text-2xl">Bienvenida de nuevo</CardTitle>
            <CardDescription>
              Ingresa a tu cuenta para gestionar tu salón.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="py-6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="py-6"
                />
              </div>
              <Button type="submit" size="lg" className="w-full py-6" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Ingresar"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/" className="underline hover:text-primary">
                Volver al inicio
              </Link>
              <span className="mx-2 text-muted-foreground/30">|</span>
              <Link href="/register" className="underline hover:text-primary font-medium">
                ¿No tienes cuenta? Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
