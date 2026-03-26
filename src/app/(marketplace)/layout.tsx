import LandingHeader from '@/components/landing/LandingHeader';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
