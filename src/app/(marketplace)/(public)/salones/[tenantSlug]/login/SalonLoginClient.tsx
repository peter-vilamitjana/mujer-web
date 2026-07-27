'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SalonLoginClient({ salon, tenantSlug }: { salon: any; tenantSlug: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setErrorMsg("Credenciales inválidas o error de inicio de sesión.");
      } else {
        router.push(`/salones/${tenantSlug}/dashboard/mis-turnos`);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Error inesperado en el inicio de sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-6">
          <div className="text-center">
             <Link href={`/salones/${tenantSlug}`}>
               <h1 className="font-serif text-4xl font-bold text-[#9D6EFE] tracking-tight transition-colors uppercase">
                 {salon.name}
               </h1>
             </Link>
          </div>
          <Card className="shadow-lg">
            <CardHeader className="text-center p-8">
              <CardTitle className="text-2xl">Bienvenida de nuevo</CardTitle>
              <CardDescription>
                Ingresa a tu cuenta para gestionar tus turnos en {salon.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <form onSubmit={handleLogin} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded-md">
                    {errorMsg}
                  </div>
                )}
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
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Ingresar"}
                </Button>
              </form>
               <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link href={`/salones/${tenantSlug}`} className="underline hover:text-primary">
                  Volver a la vitrina del salón
                </Link>
              </p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
