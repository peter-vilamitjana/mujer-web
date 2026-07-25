import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSalonBySlug, getSalonServices, getSalonStaff } from '@/lib/services/marketplace.service';
import { notFound } from 'next/navigation';
import BookingFlowClient from './BookingFlowClient';
import InfoBar from '@/components/landing/InfoBar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Store } from 'lucide-react';

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
    <div className="min-h-screen bg-surface relative overflow-x-hidden">
      {/* ── Background Atmospheric Imagery ──────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <Image
          src={coverBg}
          alt={salon.name}
          fill
          priority
          className="object-cover object-center filter brightness-[0.22] contrast-[1.1] saturate-[0.85]"
        />
        {/* Ambient Dark Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050504]/90 via-[#050504]/80 to-[#050504]" />
        {/* Gold Ambient Spotlight Orb */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(circle, rgba(241,201,125,0.08) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      {/* ── Page Content ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Main Booking Container */}
        <main className="flex-1 container mx-auto max-w-6xl px-4 pt-28 md:pt-36 pb-20">
          
          {/* Back to Salon Link Pill */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href={`/salones/${tenantSlug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-sans font-medium text-on-surface-secondary hover:text-primary transition-all duration-300 backdrop-blur-md group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Volver a {salon.name}</span>
            </Link>

            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-sans uppercase tracking-widest text-primary font-semibold backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>Reserva Directa</span>
            </div>
          </div>

          {/* Page Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 text-primary text-xs uppercase font-sans tracking-[0.25em] font-semibold mb-3">
              <Store className="w-3.5 h-3.5" />
              <span>{salon.name}</span>
            </div>
            <h1 className="font-vogue text-4xl md:text-5xl text-on-surface tracking-tight uppercase mb-3">
              Reservar Turno
            </h1>
            <p className="font-sans text-sm text-on-surface-secondary max-w-md mx-auto leading-relaxed">
              Seleccioná tus tratamientos preferidos, tu estilista de confianza y el horario que mejor se adapte a vos.
            </p>
          </div>

          {/* Elevated Floating Booking Card Container */}
          <div className="relative rounded-[2.5rem] p-4 sm:p-8 bg-[#0a0a09]/85 border border-[#f1c97d]/20 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <BookingFlowClient
              tenantId={salon.id}
              tenantSlug={tenantSlug}
              services={services}
              staff={staff}
              isAuthenticated={!!session}
            />
          </div>
        </main>

        {/* ── InfoBar & Footer ──────────────────────────────────────── */}
        <InfoBar salon={salon} />
        <Footer tenantSlug={tenantSlug} salon={salon} />
      </div>
    </div>
  );
}
