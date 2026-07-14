'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { acceptInvitation } from '@/actions/invitations.actions'

type InvitationState = 'valid' | 'expired' | 'used' | 'revoked' | 'not_found'

interface InvitationData {
  tenantName: string
  staffName: string
  invitedByName: string
  role: 'admin' | 'employee'
}

const EASE = [0.16, 1, 0.3, 1] as const

function GoogleIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function Glow() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(139,92,246,0.08) 0%, transparent 60%)' }}
    />
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 bg-[#09090b] overflow-hidden">
      <Glow />
      <div className="relative z-10 max-w-md w-full text-center">{children}</div>
    </section>
  )
}

function Fade({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

// ── Estados de error/salida — mismo lenguaje visual, siempre con salida ────

function FallbackState({
  icon,
  title,
  message,
  cta,
}: {
  icon: string
  title: string
  message: string
  cta: ReactNode
}) {
  return (
    <Shell>
      <Fade>
        <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <span className="material-symbols-outlined text-zinc-500" style={{ fontSize: '24px' }}>{icon}</span>
        </div>
        <h1 className="font-vogue text-2xl italic font-normal text-white mb-2">{title}</h1>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{message}</p>
        {cta}
      </Fade>
    </Shell>
  )
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 hover:text-white border-b border-white/15 hover:border-white/40 pb-1 transition-colors duration-200"
    >
      {children}
    </Link>
  )
}

export default function AcceptClient({
  token,
  state,
  invitation,
  hasSession,
}: {
  token: string
  state: InvitationState
  invitation: InvitationData | null
  hasSession: boolean
}) {
  const { update } = useSession()
  const router = useRouter()

  const [isAccepting, setIsAccepting] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setIsSigningIn(true)
    await signIn('google', { callbackUrl: `/invitacion/${token}` })
  }

  async function handleAccept() {
    setError(null)
    setIsAccepting(true)
    const result = await acceptInvitation(token)
    if (!result.success) {
      setIsAccepting(false)
      setError(result.error ?? 'No se pudo aceptar la invitación.')
      return
    }

    // Crítico: forzar que el jwt callback re-lea las memberships antes de navegar
    const updated = await update()
    const slug = (updated?.user as any)?.salonSlug || ''

    router.push(slug ? `/${slug}/dashboard` : '/')
    router.refresh()
  }

  if (state === 'not_found') {
    return (
      <FallbackState
        icon="link_off"
        title="No encontramos esta invitación"
        message="El link puede estar mal copiado o ya no existir."
        cta={<OutLink href="/">← Volver al inicio</OutLink>}
      />
    )
  }

  if (state === 'revoked') {
    return (
      <FallbackState
        icon="block"
        title="Esta invitación fue revocada"
        message={invitation ? `${invitation.tenantName} desactivó este link de acceso.` : 'Este link de acceso fue desactivado.'}
        cta={<OutLink href="/">← Volver al inicio</OutLink>}
      />
    )
  }

  if (state === 'used') {
    return (
      <FallbackState
        icon="check_circle"
        title="Esta invitación ya fue usada"
        message="Si ya tenés tu cuenta activada, iniciá sesión normalmente."
        cta={<OutLink href="/login">Ir a iniciar sesión →</OutLink>}
      />
    )
  }

  if (state === 'expired') {
    return (
      <FallbackState
        icon="schedule"
        title="Esta invitación venció"
        message={invitation ? `Pedile una nueva a ${invitation.tenantName}.` : 'Pedile una nueva a tu salón.'}
        cta={<OutLink href="/">← Volver al inicio</OutLink>}
      />
    )
  }

  // state === 'valid'
  if (!invitation) return null

  return (
    <Shell>
      <Fade delay={0}>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.45em] font-bold mb-8">
          Invitación
        </p>
      </Fade>

      <Fade delay={0.08}>
        <p className="text-zinc-400 text-sm mb-3">
          {invitation.invitedByName} te invitó a trabajar en
        </p>
      </Fade>

      <Fade delay={0.16}>
        <h1 className="font-vogue text-[clamp(2.2rem,6vw,3.2rem)] italic font-normal text-white leading-tight mb-6">
          {invitation.tenantName}
        </h1>
      </Fade>

      <Fade delay={0.24}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-400/[0.10] border border-violet-400/25 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-violet-300 text-[11px] font-bold uppercase tracking-[0.2em]">
            {invitation.role === 'admin' ? 'Administradora' : 'Profesional'}
          </span>
        </div>
      </Fade>

      <Fade delay={0.32}>
        {error && (
          <p role="alert" className="text-red-400 text-[11px] tracking-wide text-center mb-4">
            {error}
          </p>
        )}

        {!hasSession ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full h-[52px] flex items-center justify-center gap-3 bg-white text-black hover:bg-white/90 disabled:opacity-60 rounded-xl text-[11px] font-black tracking-[0.25em] uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              {isSigningIn ? (
                <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
              ) : (
                <>
                  <GoogleIcon />
                  Iniciar sesión con Google
                </>
              )}
            </button>
            <p className="text-zinc-500 text-[10px] tracking-[0.15em] uppercase">
              para aceptar la invitación
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full h-[52px] flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-60 text-white rounded-xl text-[11px] font-black tracking-[0.25em] uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-[0_0_24px_rgba(139,92,246,0.25)]"
          >
            {isAccepting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
            ) : (
              'Aceptar invitación'
            )}
          </button>
        )}
      </Fade>
    </Shell>
  )
}
