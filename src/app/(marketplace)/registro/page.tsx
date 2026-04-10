'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerCustomer } from '@/actions/auth.actions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegistroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    phone: ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pass: string) => pass.length >= 8;
  const validatePhone = (phone: string) => /^\d{8,15}$/.test(phone.replace(/\s/g, ''));

  const errors = {
    nombre: touched.nombre && !formData.nombre ? 'El nombre es obligatorio' : null,
    email: touched.email && !validateEmail(formData.email) ? 'Ingresá un email válido' : null,
    password: touched.password && !validatePassword(formData.password) ? 'Mínimo 8 caracteres' : null,
    phone: touched.phone && !validatePhone(formData.phone) ? 'Ingresá tu número de WhatsApp' : null,
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nombre: true, email: true, password: true, phone: true });

    if (!formData.nombre || !validateEmail(formData.email) || !validatePassword(formData.password) || !validatePhone(formData.phone)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await registerCustomer({
      displayName: formData.nombre,
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      setError(result.error ?? 'No se pudo crear la cuenta.');
      setIsLoading(false);
      return;
    }

    // Auto sign-in after registration
    await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-8 text-center">
        {/* Header */}
        <div>
          <h1 className="font-vogue italic text-2xl text-white tracking-tight">✦ MujerApp</h1>
          <h2 className="font-vogue text-4xl text-white mt-8 tracking-tighter">Creá tu cuenta</h2>
          <p className="text-zinc-400 text-base mt-2 font-inter">Reservá en los mejores salones</p>
        </div>

        {/* Card Formulario */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <form className="space-y-6 text-left" onSubmit={handleRegister}>
            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full h-12 bg-white text-zinc-950 hover:bg-zinc-100 border-none rounded-full flex items-center justify-center gap-3 font-semibold transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </Button>

            {/* Separador */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-zinc-600 font-inter text-sm">o</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Campos */}
            <div className="space-y-4">
              {/* Nombre */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-sm font-inter ml-1">Nombre completo</Label>
                <div className="relative group">
                  <Input 
                    placeholder="Ej. Carolina Müller"
                    className={cn(
                      "bg-zinc-900 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-white/30 transition-all font-inter",
                      errors.nombre && "border-red-400/50"
                    )}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    onBlur={() => setTouched({ ...touched, nombre: true })}
                  />
                </div>
                {errors.nombre && <p className="text-red-400 text-xs mt-1 ml-1 font-inter">{errors.nombre}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-sm font-inter ml-1">Email</Label>
                <Input 
                  type="email"
                  placeholder="tu@email.com"
                  className={cn(
                    "bg-zinc-900 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-white/30 transition-all font-inter",
                    errors.email && "border-red-400/50"
                  )}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => setTouched({ ...touched, email: true })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-inter">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-sm font-inter ml-1">Contraseña</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className={cn(
                      "bg-zinc-900 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-white/30 pr-12 transition-all font-inter",
                      errors.password && "border-red-400/50"
                    )}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onBlur={() => setTouched({ ...touched, password: true })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1 ml-1 font-inter">{errors.password}</p>}
              </div>

              {/* Celular */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-sm font-inter ml-1">Tu celular (para WhatsApp)</Label>
                <div className={cn(
                  "flex items-center bg-zinc-900 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/30 transition-all",
                  errors.phone && "border-red-400/50"
                )}>
                  <div className="bg-zinc-800 border-r border-white/10 px-4 h-12 flex items-center text-zinc-500 font-inter text-sm select-none">
                    +54
                  </div>
                  <Input 
                    type="tel"
                    placeholder="9 11 XXXX-XXXX"
                    className="bg-transparent border-none h-12 text-white placeholder:text-zinc-600 focus-visible:ring-0 font-inter no-ring"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d]/g, '') })}
                    onBlur={() => setTouched({ ...touched, phone: true })}
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1 font-inter">{errors.phone}</p>}
              </div>
            </div>

            {/* Error Genérico Mock */}
            {error && (
              <div className="bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">
                <p className="text-red-400 text-sm font-inter">{error}</p>
              </div>
            )}

            {/* Botón Principal */}
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-white text-zinc-950 hover:bg-zinc-100 rounded-full font-semibold text-lg transition-all shadow-lg active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                "Crear mi cuenta"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-zinc-500 font-inter text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-white hover:underline transition-all">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
