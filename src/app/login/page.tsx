'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerCustomer } from '@/actions/auth.actions';

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Spinner() {
  return <span className="block w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const FIELD = cn(
  'w-full rounded-xl px-4 py-3 text-[13px] font-light tracking-[0.12em] uppercase',
  'placeholder:text-white/20 text-white',
  'outline-none transition-all duration-200',
  'border focus:ring-1 focus:ring-white/20',
  'bg-white/[0.06] border-white/[0.10] focus:bg-white/[0.10] focus:border-white/25'
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Password strength 0–4
  const strength = (() => {
    const p = registerPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const strengthLabels = ['', 'DÉBIL', 'REGULAR', 'BUENA', 'FUERTE'];

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginEmail) e.email = 'REQUERIDO';
    if (!loginPassword) e.password = 'REQUERIDO';
    setFieldErrors(e);
    return !Object.keys(e).length;
  };

  const validateRegister = () => {
    const e: Record<string, string> = {};
    if (!registerName) e.name = 'REQUERIDO';
    if (!registerEmail) e.email = 'REQUERIDO';
    else if (!/\S+@\S+\.\S+/.test(registerEmail)) e.email = 'INVÁLIDO';
    if (!registerPassword) e.password = 'REQUERIDO';
    else if (registerPassword.length < 8) e.password = 'MÍN. 8 CARACTERES';
    if (!registerPhone) e.phone = 'REQUERIDO';
    setFieldErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateLogin()) return;
    setIsLoading(true);
    const result = await signIn('credentials', { email: loginEmail, password: loginPassword, redirect: false });
    setIsLoading(false);
    if (result?.error) { setError('CREDENCIALES INCORRECTAS'); return; }
    if (result?.ok) {
      setSuccess(true);
      const session = await getSession();
      setTimeout(() => router.push(session?.user?.role === 'customer' ? '/perfil' : '/dashboard'), 1400);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateRegister()) return;
    setIsLoading(true);
    const result = await registerCustomer({ name: registerName, email: registerEmail, password: registerPassword, phone: registerPhone });
    if (!result.success) { setIsLoading(false); setError(result.error); return; }
    const signInResult = await signIn('credentials', { email: registerEmail, password: registerPassword, redirect: false });
    setIsLoading(false);
    if (signInResult?.ok) { setSuccess(true); setTimeout(() => router.push('/perfil'), 1400); }
    else { setError('CUENTA CREADA. INICIÁ SESIÓN.'); setMode('login'); setLoginEmail(registerEmail); }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setFieldErrors({});
    setError(null);
    setSuccess(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    // Root: full screen, no scroll
    <div className="h-screen w-screen overflow-hidden bg-[#030303] text-white font-inter antialiased flex flex-col select-none">

      {/* ── Background ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {/* Photo */}
        <img
          alt="Editorial fashion portrait"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjS9LSsGTPztQ9TCUsdN8xwWCiNJFUWAnLy5UEvWNIFarfFXo-7NKfdu8AoD2AqIlaB9O9zr__02G2eCSCxbmxnAMCpfJqTaRd6qqLEBxV8D9Z3tMBhLRjU_CJlO_wiFsHvWR0LQM6IAGZQljwE7QUXvXg-WY_XRiquIX1MU7pBcr9VTKOKv1K3Ubmy5j91LNPmfX3qq-LqEti5GU93_GOR3qflFnXP0TBMSpFA9PeDHOaL9-fz2EoGU06tmJPAy-AGff8hkVWd6wz"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.58) saturate(0.85) contrast(1.05)' }}
        />

        {/* Depth vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Ambient orb — warm neutral depth, no color tint */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '20%', left: '15%',
            width: '40vw', height: '40vw',
            background: 'radial-gradient(circle, rgba(255,240,220,0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-8 pt-7 pb-0 shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-vogue text-[26px] font-black tracking-tighter uppercase leading-none">Ouleeh</span>
          <div className="w-px h-5 bg-white/15" />
          <span className="text-[9px] tracking-[0.55em] uppercase text-white/35 font-semibold">Editorial Access</span>
        </div>
        <Link
          href="/"
          className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/40 hover:text-white/80 border-b border-white/15 hover:border-white/50 pb-px transition-all duration-200 cursor-pointer"
        >
          ← Volver
        </Link>
      </header>

      {/* ── Main — centered card ─────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full"
            style={{ maxWidth: '420px' }}
          >
            {/* ── Liquid Glass Card ─────────────────────────────────────── */}
            <div
              className="relative rounded-[28px] overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.065)',
                backdropFilter: 'blur(48px) saturate(200%)',
                WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.18),
                  inset 0 -1px 0 rgba(0,0,0,0.25),
                  0 0 0 0.5px rgba(255,255,255,0.06),
                  0 8px 24px rgba(0,0,0,0.45),
                  0 32px 80px rgba(0,0,0,0.38),
                  0 64px 120px rgba(0,0,0,0.22)
                `,
              }}
            >
              {/* Specular highlight strip at top */}
              <div
                className="absolute top-0 left-6 right-6 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
              />

              <div className="px-9 pt-8 pb-7">

                {/* ── Brand + Mode Heading ─────────────────────────────── */}
                <div className="mb-6">
                  {mode === 'login' ? (
                    <div>
                      <p className="text-[8px] tracking-[0.65em] uppercase text-white/35 font-bold mb-2">
                        L&apos;Art de Vivre
                      </p>
                      <h1 className="font-vogue text-[42px] leading-[1.05] mb-1.5">
                        <span className="italic text-white/90">Membres</span>
                        <br />
                        <span className="not-italic text-white">Privés</span>
                      </h1>
                      <p className="text-white/35 text-[10px] tracking-[0.25em] uppercase">
                        Ingrese a su santuario de estilo
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[8px] tracking-[0.65em] uppercase text-white/35 font-bold mb-2">
                        L&apos;Art de Créer
                      </p>
                      <h1 className="font-vogue text-[42px] leading-[1.05] mb-1.5">
                        <span className="italic text-white/90">Nouvelle</span>
                        <br />
                        <span className="not-italic text-white">Présence</span>
                      </h1>
                      <p className="text-white/35 text-[10px] tracking-[0.25em] uppercase">
                        Una cuenta. Todos los ateliers
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Divider ──────────────────────────────────────────── */}
                <div
                  className="h-px mb-5"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
                />

                {/* ── Forms ────────────────────────────────────────────── */}
                {mode === 'login' ? (
                  <form onSubmit={handleLogin} noValidate className="space-y-3">
                    {/* Email */}
                    <div>
                      <label htmlFor="l-email" className="block text-[8px] tracking-[0.4em] uppercase font-bold text-white/30 mb-1.5 ml-1">
                        Email
                      </label>
                      <input
                        id="l-email"
                        type="email"
                        autoComplete="email"
                        placeholder="CORREO ELECTRÓNICO"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        aria-invalid={!!fieldErrors.email}
                        className={cn(FIELD, fieldErrors.email && 'border-red-500/50 focus:border-red-400/60')}
                      />
                      {fieldErrors.email && (
                        <p role="alert" className="mt-1 ml-1 text-red-400/80 text-[8px] tracking-widest uppercase">{fieldErrors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="l-pass" className="text-[8px] tracking-[0.4em] uppercase font-bold text-white/30 ml-1">
                          Contraseña
                        </label>
                        <button type="button" className="text-[8px] tracking-[0.2em] uppercase text-white/25 hover:text-white/55 transition-colors duration-200 cursor-pointer">
                          ¿Olvidó su clave?
                        </button>
                      </div>
                      <input
                        id="l-pass"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        aria-invalid={!!fieldErrors.password}
                        className={cn(FIELD, fieldErrors.password && 'border-red-500/50 focus:border-red-400/60')}
                      />
                      {fieldErrors.password && (
                        <p role="alert" className="mt-1 ml-1 text-red-400/80 text-[8px] tracking-widest uppercase">{fieldErrors.password}</p>
                      )}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          role="alert"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-[9px] tracking-widest uppercase text-center font-bold pt-1"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <div className="pt-2 space-y-2.5">
                      {/* Primary CTA — Apple-style pill button */}
                      <button
                        type="submit"
                        disabled={isLoading || success}
                        aria-busy={isLoading}
                        className={cn(
                          'w-full h-[52px] flex items-center justify-center gap-2',
                          'text-[10px] font-black tracking-[0.35em] uppercase rounded-xl',
                          'transition-all duration-200 active:scale-[0.98] cursor-pointer',
                          'disabled:opacity-55 disabled:cursor-not-allowed',
                          success
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-black hover:bg-white/90'
                        )}
                      >
                        {isLoading ? <Spinner /> : success ? (<><CheckIcon />BIENVENIDA</>) : 'ENTRAR AL ATELIER'}
                      </button>

                      {/* Divider */}
                      <div className="flex items-center gap-3 py-0.5">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[8px] tracking-[0.4em] uppercase text-white/20 font-bold">o</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      {/* Secondary — ghost glass */}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className={cn(
                          'w-full h-[46px] flex items-center justify-center',
                          'text-[9px] font-bold tracking-[0.35em] uppercase rounded-xl',
                          'border border-white/12 text-white/60',
                          'hover:bg-white/[0.07] hover:border-white/22 hover:text-white/80',
                          'transition-all duration-200 cursor-pointer'
                        )}
                      >
                        CREAR UNA CUENTA
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} noValidate className="space-y-2.5">
                    {/* Name */}
                    <div>
                      <label htmlFor="r-name" className="block text-[8px] tracking-[0.4em] uppercase font-bold text-white/30 mb-1.5 ml-1">Nombre</label>
                      <input
                        id="r-name" type="text" autoComplete="name" placeholder="NOMBRE COMPLETO"
                        value={registerName} onChange={(e) => setRegisterName(e.target.value)}
                        aria-invalid={!!fieldErrors.name}
                        className={cn(FIELD, fieldErrors.name && 'border-red-500/50')}
                      />
                      {fieldErrors.name && <p role="alert" className="mt-1 ml-1 text-red-400/80 text-[8px] tracking-widest uppercase">{fieldErrors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="r-email" className="block text-[8px] tracking-[0.4em] uppercase font-bold text-white/30 mb-1.5 ml-1">Email</label>
                      <input
                        id="r-email" type="email" autoComplete="email" placeholder="CORREO ELECTRÓNICO"
                        value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)}
                        aria-invalid={!!fieldErrors.email}
                        className={cn(FIELD, fieldErrors.email && 'border-red-500/50')}
                      />
                      {fieldErrors.email && <p role="alert" className="mt-1 ml-1 text-red-400/80 text-[8px] tracking-widest uppercase">{fieldErrors.email}</p>}
                    </div>

                    {/* Password + strength */}
                    <div>
                      <label htmlFor="r-pass" className="block text-[8px] tracking-[0.4em] uppercase font-bold text-white/30 mb-1.5 ml-1">Contraseña</label>
                      <div className="relative">
                        <input
                          id="r-pass" type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password" placeholder="••••••••••••"
                          value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)}
                          aria-invalid={!!fieldErrors.password}
                          className={cn(FIELD, 'pr-10', fieldErrors.password && 'border-red-500/50')}
                        />
                        <button
                          type="button" aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors duration-200 cursor-pointer p-1"
                        >
                          <EyeIcon off={showPassword} />
                        </button>
                      </div>
                      {registerPassword && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex gap-0.5 flex-1">
                            {[1,2,3,4].map((n) => (
                              <div key={n} className={cn('h-0.5 flex-1 rounded-full transition-all duration-300', n <= strength ? strengthColors[strength] : 'bg-white/10')} />
                            ))}
                          </div>
                          <span className="text-[7px] tracking-[0.3em] uppercase text-white/30 whitespace-nowrap">{strengthLabels[strength]}</span>
                        </div>
                      )}
                      {fieldErrors.password && <p role="alert" className="mt-1 ml-1 text-red-400/80 text-[8px] tracking-widest uppercase">{fieldErrors.password}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="r-phone" className="block text-[8px] tracking-[0.4em] uppercase font-bold text-white/30 mb-1.5 ml-1">WhatsApp</label>
                      <div className="flex gap-2">
                        <div
                          className="shrink-0 flex items-center justify-center px-3 rounded-xl text-[11px] text-white/35 tracking-widest"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                        >
                          +54
                        </div>
                        <input
                          id="r-phone" type="tel" autoComplete="tel" placeholder="9 11 XXXX-XXXX"
                          value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)}
                          aria-invalid={!!fieldErrors.phone}
                          className={cn(FIELD, 'flex-1', fieldErrors.phone && 'border-red-500/50')}
                        />
                      </div>
                      {fieldErrors.phone && <p role="alert" className="mt-1 ml-1 text-red-400/80 text-[8px] tracking-widest uppercase">{fieldErrors.phone}</p>}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          role="alert"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-[9px] tracking-widest uppercase text-center font-bold pt-0.5"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <div className="pt-1.5 space-y-2.5">
                      <button
                        type="submit"
                        disabled={isLoading || success}
                        aria-busy={isLoading}
                        className={cn(
                          'w-full h-[52px] flex items-center justify-center gap-2',
                          'text-[10px] font-black tracking-[0.35em] uppercase rounded-xl',
                          'transition-all duration-200 active:scale-[0.98] cursor-pointer',
                          'disabled:opacity-55 disabled:cursor-not-allowed',
                          success ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-white/90'
                        )}
                      >
                        {isLoading ? <Spinner /> : success ? (<><CheckIcon />BIENVENIDA</>) : 'CREAR MI CUENTA'}
                      </button>

                      <div className="flex items-center gap-3 py-0.5">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[8px] tracking-[0.4em] uppercase text-white/20 font-bold">o</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className={cn(
                          'w-full h-[46px] flex items-center justify-center',
                          'text-[9px] font-bold tracking-[0.35em] uppercase rounded-xl',
                          'border border-white/12 text-white/60',
                          'hover:bg-white/[0.07] hover:border-white/22 hover:text-white/80',
                          'transition-all duration-200 cursor-pointer'
                        )}
                      >
                        YA TENGO UNA CUENTA
                      </button>
                    </div>
                  </form>
                )}

                {/* ── Legal ────────────────────────────────────────────── */}
                <p className="mt-5 text-[8px] tracking-[0.18em] text-white/20 text-center leading-relaxed">
                  Al continuar acepta los{' '}
                  <Link href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors duration-200 cursor-pointer">
                    términos
                  </Link>{' '}
                  y la{' '}
                  <Link href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors duration-200 cursor-pointer">
                    política de privacidad
                  </Link>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <footer className="relative z-20 flex items-center justify-between px-8 py-5 shrink-0">
        {/* Edition stamp */}
        <p className="text-[8px] tracking-[0.45em] uppercase text-white/18 font-bold">
          © 2025 Ouleeh — No. 01
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-[8px] tracking-[0.3em] uppercase text-white/20 hover:text-white/55 transition-colors duration-200 cursor-pointer">Instagram</a>
          <a href="#" className="text-[8px] tracking-[0.3em] uppercase text-white/20 hover:text-white/55 transition-colors duration-200 cursor-pointer">Archives</a>
        </div>
      </footer>
    </div>
  );
}
