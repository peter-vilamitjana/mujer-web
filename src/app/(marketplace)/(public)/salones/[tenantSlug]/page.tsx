import { notFound } from 'next/navigation';
import { getSalonBySlug } from '@/lib/services/marketplace.service';

export const revalidate = 1800;
import { getSalonReviews, getSalonRatingStats } from '@/actions/reviews.actions';
import SalonHero from '@/components/salon/SalonHero';
import SalonFeaturedServices from '@/components/salon/SalonFeaturedServices';
import SalonReviews from '@/components/salon/SalonReviews';
import InfoBar from '@/components/landing/InfoBar';
import PromoSection from '@/components/landing/PromoSection';
import LocationSection from '@/components/landing/LocationSection';
import Footer from '@/components/landing/Footer';

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { tenantSlug } = await params;
  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) return { title: 'Salón no encontrado' };

  const title = `${salon.name} | Ouleeh`;
  const description = salon.description
    ? `${salon.description} Reservá tu turno online en ${salon.name}.`
    : `Reservá tu turno online en ${salon.name}. Servicios de belleza y estilismo premium en ${salon.address ?? 'Argentina'}.`;

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://ouleeh.com';
  const canonicalUrl = `${baseUrl}/salones/${tenantSlug}`;
  const ogImage = salon.coverImageUrl ?? `${baseUrl}/og-default.jpg`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Ouleeh',
      images: [{ url: ogImage, width: 1200, height: 630, alt: salon.name }],
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SalonPage({ params }: Props) {
  const { tenantSlug } = await params;
  const salon = await getSalonBySlug(tenantSlug);
  if (!salon) notFound();

  const [salonReviews, salonStats] = await Promise.all([
    getSalonReviews(salon.id, 20),
    getSalonRatingStats(salon.id),
  ]);

  return (
    <div className="min-h-screen">
      <SalonHero
        tenantSlug={tenantSlug}
        salonName={salon.name}
        coverImageUrl={salon.coverImageUrl}
      />
      <InfoBar salon={salon} />
      <SalonFeaturedServices
        tenantId={salon.id}
        tenantSlug={tenantSlug}
      />
      <PromoSection tenantSlug={tenantSlug} />
      <SalonReviews
        tenantSlug={tenantSlug}
        initialReviews={salonReviews}
        stats={salonStats}
      />
      <LocationSection salon={salon} />
      <Footer tenantSlug={tenantSlug} salon={salon} />
    </div>
  );
}
