import { getPublicSalons } from '@/lib/services/marketplace.service';
import Hero from '@/components/landing/Hero';
import Categorias from '@/components/landing/Categorias';
import SalonesDestacados from '@/components/landing/SalonesDestacados';
import CTABusiness from '@/components/landing/CTABusiness';
import LandingFooter from '@/components/landing/LandingFooter';

export default async function GlobalLandingPage() {
  // Server-side: obtener salones públicos de Firestore
  const salones = await getPublicSalons();

  return (
    <>
      <Hero />
      <Categorias />
      <SalonesDestacados salones={salones} />
      <CTABusiness />
      <LandingFooter />
    </>
  );
}
