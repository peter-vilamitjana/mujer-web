import LandingHeader from '@/components/landing/LandingHeader';
import BusinessHero from '@/components/business/BusinessHero';
import DolorSection from '@/components/business/DolorSection';
import ComoFuncionaSection from '@/components/business/ComoFuncionaSection';
import FeaturesSection from '@/components/business/FeaturesSection';
import PricingSection4 from '@/components/ui/pricing-section-4';
import SocialProofSection from '@/components/business/SocialProofSection';
import CTAFinalSection from '@/components/business/CTAFinalSection';

export const metadata = {
  title: 'Para Salones | Ouleeh',
  description: 'La plataforma de gestión para peluquerías y salones de belleza.',
};

export default function BusinessPage() {
  return (
    <div className="bg-[#09090b] min-h-screen">
      <LandingHeader />
      <main>
        <BusinessHero />
        <DolorSection />
        <ComoFuncionaSection />
        <FeaturesSection />
        <PricingSection4 />
        <SocialProofSection />
        <CTAFinalSection />
      </main>
    </div>
  );
}
