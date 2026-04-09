'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerCustomer } from '@/actions/auth.actions';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Formulario login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulario registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  const router = useRouter();

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateLogin = () => {
    const newErrors: { [key: string]: string } = {};
    if (!loginEmail) newErrors.loginEmail = 'REQUERIDO';
    if (!loginPassword) newErrors.loginPassword = 'REQUERIDO';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: { [key: string]: string } = {};
    if (!registerName) newErrors.registerName = 'REQUERIDO';
    if (!registerEmail) {
      newErrors.registerEmail = 'REQUERIDO';
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      newErrors.registerEmail = 'FORMATO INVÁLIDO';
    }
    if (!registerPassword) {
      newErrors.registerPassword = 'REQUERIDO';
    } else if (registerPassword.length < 8) {
      newErrors.registerPassword = 'MÍNIMO 8 CARACTERES';
    }
    if (!registerPhone) newErrors.registerPhone = 'REQUERIDO PARA WHATSAPP';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateLogin()) return;

    setIsLoading(true);

    const result = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError('CREDENCIALES INCORRECTAS');
      return;
    }

    if (result?.ok) {
      setSuccess(true);
      const session = await getSession();
      setTimeout(() => {
        if (session?.user?.role === 'customer') {
          router.push('/explore');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateRegister()) return;

    setIsLoading(true);

    // 1. Registrar en Firebase Auth + Firestore
    const result = await registerCustomer({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
      phone: registerPhone,
    });

    if (!result.success) {
      setIsLoading(false);
      setError(result.error);
      return;
    }

    // 2. Login automático después del registro
    const signInResult = await signIn('credentials', {
      email: registerEmail,
      password: registerPassword,
      redirect: false,
    });

    setIsLoading(false);

    if (signInResult?.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/explore');
      }, 1500);
    } else {
      // Registro exitoso pero login falló
      setError('CUENTA CREADA. INICIÁ SESIÓN MANUALMENTE.');
      setMode('login');
      setLoginEmail(registerEmail);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setError(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden font-inter text-white selection:bg-white selection:text-black">
      {/* Background Image with Treatment */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=2000"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: 'contrast(1.1) brightness(0.7) grayscale(0.2)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/60" />
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full z-50 p-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-vogue text-2xl font-black tracking-tighter uppercase">Mujer</span>
          <div className="w-px h-6 bg-white/20" />
          <span className="text-[10px] tracking-[1.2em] uppercase text-white/40">Editorial Access</span>
        </div>
        <Link 
          href="/" 
          className="text-[10px] tracking-[0.4em] uppercase hover:text-white/60 transition-colors"
        >
          Volver
        </Link>
      </header>

      {/* Rotating Background Text */}
      <div className="absolute left-10 bottom-24 rotate-[-90deg] origin-left z-10 hidden lg:block">
        <p className="text-[10px] tracking-[1.5em] uppercase text-white/20 whitespace-nowrap">
          EDITION NO. 01 — PRIMAVERA 2025
        </p>
      </div>

      {/* Main Content Split */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side (Empty on Desktop, Hidden on Mobile) */}
        <div className="hidden lg:flex flex-1" />

        {/* Right Side (Form) */}
        <div className="w-full lg:w-[650px] flex items-center justify-end">
          <motion.div 
            layout
            className="w-full h-full lg:h-auto lg:max-w-xl liquid-glass p-8 lg:p-20 flex flex-col justify-center gap-8 lg:gap-12"
            style={{
              background: 'rgba(10, 10, 10, 0.45)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)'
            }}
          >
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <span className="text-[10px] tracking-[0.7em] uppercase block text-white/60">
                      L'Art de Vivre
                    </span>
                    <h1 className="font-vogue text-6xl leading-[1]">
                      <span className="italic">Membres</span><br />
                      <span>Privés</span>
                    </h1>
                    <p className="text-white/40 text-[11px] tracking-widest uppercase">
                      "Ingrese a su santuario personal"
                    </p>
                  </div>

                  <div className="h-px bg-white/10" />

                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] tracking-[0.4em] uppercase text-white/40 block">
                        IDENTIFIANT
                      </label>
                      <input 
                        type="email"
                        placeholder="CORREO ELECTRÓNICO"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={cn(
                          "w-full bg-white/5 border border-white/10 p-4 text-[13px] font-light tracking-[0.35em] uppercase placeholder:text-white/20 transition-all focus:bg-white/10 focus:border-white/30 focus:outline-none rounded-none",
                          errors.loginEmail && "border-red-500/50"
                        )}
                      />
                      {errors.loginEmail && (
                        <p className="text-red-400 text-[9px] tracking-widest uppercase mt-1">{errors.loginEmail}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] tracking-[0.4em] uppercase text-white/40">
                          MOT DE PASSE
                        </label>
                        <button type="button" className="text-[9px] tracking-[0.2em] uppercase text-white/20 hover:text-white/40">
                          Olvidó su clave?
                        </button>
                      </div>
                      <input 
                        type="password"
                        placeholder="••••••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={cn(
                          "w-full bg-white/5 border border-white/10 p-4 text-[13px] font-light tracking-[0.35em] uppercase placeholder:text-white/20 transition-all focus:bg-white/10 focus:border-white/30 focus:outline-none rounded-none",
                          errors.loginPassword && "border-red-500/50"
                        )}
                      />
                      {errors.loginPassword && (
                        <p className="text-red-400 text-[9px] tracking-widest uppercase mt-1">{errors.loginPassword}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "w-full bg-white text-black p-5 text-[10px] font-black tracking-[0.4em] uppercase transition-all active:scale-[0.98] hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center h-[60px] rounded-none",
                        success && "bg-green-500 text-white hover:bg-green-500"
                      )}
                    >
                      {isLoading ? (
                        <span className="border-2 border-black/20 border-t-black animate-spin w-4 h-4" />
                      ) : success ? (
                        "✓ BIENVENIDA"
                      ) : (
                        "ENTRAR AL ATELIER"
                      )}
                    </button>

                    {error && (
                      <p className="text-red-400 text-[10px] tracking-widest uppercase text-center">{error}</p>
                    )}
                  </form>

                  <div className="flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] text-white/20">o</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    onClick={toggleMode}
                    className="w-full border border-white/10 p-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white/5 transition-all active:scale-[0.98] rounded-none"
                  >
                    CREAR UNA CUENTA
                  </button>

                  <div className="pt-4">
                    <p className="text-[9px] tracking-widest text-white/20 text-center leading-relaxed">
                      AL CONTINUAR ACEPTA LOS TÉRMINOS Y CONDICIONES<br />Y LA POLÍTICA DE PRIVACIDAD.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <span className="text-[10px] tracking-[0.7em] uppercase block text-white/60">
                      L'Art de Créer
                    </span>
                    <h1 className="font-vogue text-6xl leading-[1]">
                      <span className="italic">Nouvelle</span><br />
                      <span>Présence</span>
                    </h1>
                    <p className="text-white/40 text-[11px] tracking-widest uppercase">
                      "Una cuenta. Todos los ateliers."
                    </p>
                  </div>

                  <div className="h-px bg-white/10" />

                  <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] tracking-[0.4em] uppercase text-white/40 block">
                        NOM COMPLET
                      </label>
                      <input 
                        type="text"
                        placeholder="NOMBRE COMPLETO"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className={cn(
                          "w-full bg-white/5 border border-white/10 p-4 text-[13px] font-light tracking-[0.35em] uppercase placeholder:text-white/20 transition-all focus:bg-white/10 focus:border-white/30 focus:outline-none rounded-none",
                          errors.registerName && "border-red-500/50"
                        )}
                      />
                      {errors.registerName && (
                        <p className="text-red-400 text-[9px] tracking-widest uppercase mt-1">{errors.registerName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] tracking-[0.4em] uppercase text-white/40 block">
                        IDENTIFIANT
                      </label>
                      <input 
                        type="email"
                        placeholder="CORREO ELECTRÓNICO"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className={cn(
                          "w-full bg-white/5 border border-white/10 p-4 text-[13px] font-light tracking-[0.35em] uppercase placeholder:text-white/20 transition-all focus:bg-white/10 focus:border-white/30 focus:outline-none rounded-none",
                          errors.registerEmail && "border-red-500/50"
                        )}
                      />
                      {errors.registerEmail && (
                        <p className="text-red-400 text-[9px] tracking-widest uppercase mt-1">{errors.registerEmail}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] tracking-[0.4em] uppercase text-white/40 block">
                        MOT DE PASSE
                      </label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className={cn(
                            "w-full bg-white/5 border border-white/10 p-4 text-[13px] font-light tracking-[0.35em] uppercase placeholder:text-white/20 transition-all focus:bg-white/10 focus:border-white/30 focus:outline-none rounded-none",
                            errors.registerPassword && "border-red-500/50"
                          )}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"
                        >
                          {showPassword ? (
                            <span className="material-symbols-outlined text-sm">visibility_off</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          )}
                        </button>
                      </div>
                      {errors.registerPassword && (
                        <p className="text-red-400 text-[9px] tracking-widest uppercase mt-1">{errors.registerPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] tracking-[0.4em] uppercase text-white/40 block">
                        WHATSAPP
                      </label>
                      <div className="flex gap-2">
                        <div className="bg-white/5 border border-white/10 p-4 text-[13px] font-light tracking-[0.35em] text-white/40 w-24 flex items-center justify-center rounded-none">
                          +54
                        </div>
                        <input 
                          type="tel"
                          placeholder="9 11 XXXX-XXXX"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className={cn(
                            "flex-1 bg-white/5 border border-white/10 p-4 text-[13px] font-light tracking-[0.35em] uppercase placeholder:text-white/20 transition-all focus:bg-white/10 focus:border-white/30 focus:outline-none rounded-none",
                            errors.registerPhone && "border-red-500/50"
                          )}
                        />
                      </div>
                      {errors.registerPhone && (
                        <p className="text-red-400 text-[9px] tracking-widest uppercase mt-1">{errors.registerPhone}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "w-full bg-white text-black p-5 text-[10px] font-black tracking-[0.4em] uppercase transition-all active:scale-[0.98] hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center h-[60px] rounded-none",
                        success && "bg-green-500 text-white hover:bg-green-500"
                      )}
                    >
                      {isLoading ? (
                        <span className="border-2 border-black/20 border-t-black animate-spin w-4 h-4" />
                      ) : success ? (
                        "✓ BIENVENIDA"
                      ) : (
                        "CREAR MI CUENTA"
                      )}
                    </button>

                    {error && (
                      <p className="text-red-400 text-[10px] tracking-widest uppercase text-center">{error}</p>
                    )}
                  </form>

                  <div className="flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] text-white/20">o</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    onClick={toggleMode}
                    className="w-full border border-white/10 p-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white/5 transition-all active:scale-[0.98] rounded-none"
                  >
                    YA TENGO UNA CUENTA
                  </button>

                  <div className="pt-4">
                    <p className="text-[9px] tracking-widest text-white/20 text-center leading-relaxed">
                      AL CONTINUAR ACEPTA LOS TÉRMINOS Y CONDICIONES<br />Y LA POLÍTICA DE PRIVACIDAD.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-50 p-8 flex justify-between items-center text-[9px] tracking-[0.3em] uppercase text-white/20 font-bold">
        <div>© 2025 MujerApp</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Archives</a>
        </div>
      </footer>
    </main>
  );
}
