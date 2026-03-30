import BusinessHero from '@/components/business/BusinessHero';
import BusinessFeatures from '@/components/business/BusinessFeatures';
import BusinessDashboardMock from '@/components/business/BusinessDashboardMock';
import BusinessCTA from '@/components/business/BusinessCTA';
import LandingHeader from '@/components/landing/LandingHeader';

export const metadata = {
  title: 'Para Salones | MujerApp',
  description: 'La plataforma de gestión para peluquerías y salones de belleza.',
};

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <LandingHeader />
      <BusinessHero />
      <BusinessFeatures />
      <BusinessDashboardMock />
      <BusinessCTA />
    </div>
  );
}
