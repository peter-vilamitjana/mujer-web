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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@mujer.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error);
      
      let title = "Error de inicio de sesión";
      let description = "Credenciales incorrectas o el usuario no existe. Asegúrate de haberlo creado en tu consola de Firebase.";

      if (error.code === 'auth/network-request-failed') {
        title = "Error de Red con Firebase";
        description = "ACCIÓN REQUERIDA: Ve a tu consola de Firebase > Authentication > Settings > Authorized domains y AÑADE 'localhost' a la lista.";
      } else if (error.code === 'auth/api-key-not-valid') {
        title = "API Key de Firebase Inválida";
        description = "La clave de API de Firebase no es válida. Revisa el archivo src/lib/firebase.ts.";
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Acceso del Personal</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Ingresar"}
            </Button>
          </form>
          <Alert variant="destructive" className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle className="font-bold">¡Configuración Requerida!</AlertTitle>
            <AlertDescription>
             <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>Reemplaza las credenciales de ejemplo en <strong>src/lib/firebase.ts</strong>.</li>
                <li>Crea el usuario <strong>admin@mujer.com</strong> en tu consola de Firebase (en la sección de Authentication).</li>
                <li><strong>Para evitar errores de red:</strong> Ve a Authentication &gt; Settings &gt; Authorized domains y <strong>añade `localhost`</strong> a la lista de dominios.</li>
             </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
