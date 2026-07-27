import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSalonBySlug, getSalonServices, getSalonStaff } from '@/lib/services/marketplace.service';
import { notFound } from 'next/navigation';
import BookingFlowClient from './BookingFlowClient';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Sparkles, User } from 'lucide-react';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { tenantSlug } = await params;
  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) return { title: 'Salón no encontrado' };

  return {
    title: `Reservar Turno | ${salon.name}`,
    description: `Agendá tu turno online en ${salon.name}. Seleccioná servicios, profesional y horario de forma simple y rápida.`,
  };
}

export default async function TurnosPage({ params }: Props) {
  const { tenantSlug } = await params;

  // Sesión opcional — guest checkout habilitado
  const session = await getServerSession(authOptions);

  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  const [services, staff] = await Promise.all([
    getSalonServices(salon.id),
    getSalonStaff(salon.id),
  ]);

  const coverBg = salon.coverImageUrl || '/hero-salon.png';

  return (
    <div className="min-h-screen bg-[#050504] text-on-surface flex flex-col lg:flex-row overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* COLUMNA IZQUIERDA (Inmersiva / Sticky en Desktop)                */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <aside className="relative lg:w-[34%] xl:w-[30%] shrink-0 lg:h-screen lg:sticky lg:top-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 select-none">
        
        {/* Foto Hero del Salón con Gradiente de Degradado */}
        <div className="absolute inset-0 z-0">
          <Image
            src={coverBg}
            alt={salon.name}
            fill
            priority
            className="object-cover object-center filter brightness-[0.7] contrast-[1.05] saturate-[0.95]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050504]/90 via-[#050504]/40 to-[#050504]/30" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(241,201,125,0.12) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        {/* Zona Superior: Marca + Botón Volver */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/salones/${tenantSlug}`}
              className="font-vogue text-2xl font-bold tracking-wider text-on-surface uppercase hover:text-primary transition-colors"
            >
              {salon.name}
            </Link>
            
            <Link
              href={`/salones/${tenantSlug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-sans text-on-surface-secondary hover:text-primary transition-all backdrop-blur-md group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver</span>
            </Link>
          </div>
        </div>

        {/* Zona Central: Tagline Editorial */}
        <div className="relative z-10 my-8 lg:my-auto space-y-3 max-w-sm">
          <div className="inline-flex items-center gap-2 text-primary/90 text-[10.5px] uppercase font-outfit tracking-[0.25em] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Reserva Online</span>
          </div>
          <h2 className="font-outfit text-3xl sm:text-4xl lg:text-[40px] text-on-surface font-extrabold tracking-tight leading-[1.1]">
            Reserva tu <span className="font-vogue italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#f1c97d] via-[#fff0cf] to-[#e4b562] drop-shadow-sm pr-1">momento.</span>
          </h2>
          <p className="font-sans text-sm text-on-surface-secondary/85 leading-relaxed font-normal">
            Descubre nuestra selección de servicios premium y elige el tratamiento perfecto para ti.
          </p>
        </div>

        {/* Zona Inferior: Tarjeta de Ubicación / Sede */}
        <div className="relative z-10 pt-4">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs uppercase tracking-widest font-bold text-on-surface">
                SEDE CENTRAL
              </p>
              <p className="font-sans text-xs text-on-surface-secondary/80 truncate mt-0.5">
                {salon.address || 'Guillermo Rawson 3688, B1636 La Lucila'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* COLUMNA DERECHA (Flujo de Reserva Scrollable)                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-h-screen flex flex-col justify-between bg-[#070706] relative z-10">

        {/* Header superior de navegación / usuario */}
        <div className="px-6 py-5 md:px-10 lg:px-12 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-sans text-on-surface-secondary">
            <span className="font-semibold text-on-surface">{salon.name}</span>
            <span>/</span>
            <span className="text-primary font-medium">Turnos</span>
          </div>

          {session ? (
            <div className="flex items-center gap-3.5 p-2 sm:px-4 sm:py-2.5 rounded-[1.5rem] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] shadow-[0_10px_30px_rgba(0,0,0,0.4)] select-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 border border-white/20 flex items-center justify-center text-white font-outfit font-extrabold text-base shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] shrink-0 overflow-hidden">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-white/50">
                  Bienvenida
                </span>
                <span className="text-lg sm:text-xl font-extrabold font-outfit text-white tracking-tight capitalize">
                  {session.user?.name || session.user?.email?.split('@')[0] || 'Usuario'}
                </span>
              </div>
            </div>
          ) : (
            <Link
              href={`/login?redirect=/salones/${tenantSlug}/turnos`}
              className="inline-flex items-center gap-2 text-xs font-sans text-on-surface-secondary hover:text-primary transition-colors font-medium"
            >
              <User className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase">INICIAR SESIÓN</span>
            </Link>
          )}
        </div>

        {/* Área del formulario actual */}
        <div className="p-6 md:p-10 lg:p-12 flex-1 max-w-5xl w-full mx-auto">
          <BookingFlowClient
            tenantId={salon.id}
            tenantSlug={tenantSlug}
            services={services}
            staff={staff}
            isAuthenticated={!!session}
          />
        </div>

        {/* Pie de página minimalista */}
        <footer className="px-6 py-6 md:px-12 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-on-surface-secondary/70">
          <div className="flex items-center gap-4">
            <span className="font-vogue text-sm font-bold text-on-surface uppercase tracking-wider">{salon.name}</span>
            <span>© {new Date().getFullYear()} MUJER. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href={`/salones/${tenantSlug}`} className="hover:text-primary transition-colors">Vitrina</Link>
            <span className="hover:text-primary transition-colors cursor-pointer">Términos</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Privacidad</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
