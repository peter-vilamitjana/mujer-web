import PublicHeader from '@/components/marketplace/PublicHeader';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
