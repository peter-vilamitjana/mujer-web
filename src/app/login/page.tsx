'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('clienta@mujer.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect will be handled by the auth state listener in the layout
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error.code);
      
      let title = "Error de inicio de sesión";
      let description = "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.";

      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found': // Legacy
        case 'auth/wrong-password': // Legacy
          title = "Credenciales Inválidas";
          description = "El email o la contraseña son incorrectos. Por favor, verifica tus datos. Asegúrate de haber creado este usuario en tu Consola de Firebase.";
          break;
        case 'auth/network-request-failed':
          title = "Error de Red";
          description = "No se pudo conectar con Firebase. Revisa tu conexión y que 'localhost' esté en los dominios autorizados en la configuración de Authentication.";
          break;
        case 'auth/api-key-not-valid':
          title = "API Key de Firebase Inválida";
          description = "La clave API de Firebase no es válida. Revisa que las credenciales en src/lib/firebase.ts sean las correctas.";
          break;
        case 'auth/invalid-email':
          title = "Email Inválido";
          description = "El formato del email no es válido. Por favor, corrígelo.";
          break;
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    } finally {
      setIsLoading(false);
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
                  Volver a la página principal
                </Link>
              </p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
