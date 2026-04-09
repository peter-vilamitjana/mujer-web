import { SalonCard } from '@/components/marketplace/SalonCard';
import { getPublicSalons } from '@/lib/services/marketplace.service';
import { Map, MapPin } from 'lucide-react';

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; zona?: string }>;
}) {
  const salons = await getPublicSalons();
  const { categoria, zona } = await searchParams;

  let salonCards = salons.map(tenant => ({
    name: tenant.name,
    slug: tenant.slug,
    category: 'Salón de Belleza',
    coverImageUrl: tenant.coverImageUrl ?? '',
    address: tenant.address ?? '',
    rating: 0,
    reviewCount: 0,
    priceFrom: 0,
  }));

  if (categoria) {
    salonCards = salonCards.filter(s =>
      s.category.toLowerCase().includes(categoria.toLowerCase())
    );
  }

  if (zona) {
    salonCards = salonCards.filter(s =>
      s.address.toLowerCase().includes(zona.toLowerCase())
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-inter relative pb-24 lg:pb-0">
      {/* Header & Filters */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 pt-48 lg:pt-40 pb-8 max-w-7xl">
          <h1 className="font-playfair text-4xl lg:text-5xl text-white mb-2">Descubrí tu salón</h1>
          <p className="text-zinc-400 mb-8 max-w-2xl text-lg">Reservá turnos en los mejores salones y spas de la ciudad. Todo en un solo lugar.</p>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/50 border border-white/10 rounded-full min-w-[150px] justify-center text-sm text-zinc-400 shrink-0 cursor-pointer hover:bg-zinc-900 hover:text-white transition-colors">
                <MapPin className="h-4 w-4" />
                <span>Cualquier zona</span>
              </div>
              <div className="flex items-center px-5 py-2.5 bg-zinc-900/50 border border-white/10 rounded-full text-sm text-zinc-400 shrink-0 cursor-pointer hover:bg-zinc-900 hover:text-white transition-colors">
                <span>Precio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Grid + Map */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left List (60%) */}
          <div className="w-full lg:w-[60%]">
            {salonCards.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-900/20 border border-white/5 rounded-3xl">
                <svg className="w-24 h-24 text-zinc-800 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="font-playfair text-2xl text-white mb-2">Próximamente en tu zona</h3>
                <p className="text-zinc-500 text-sm max-w-xs">Estamos sumando los mejores salones para que puedas reservar cerca tuyo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {salonCards.map((salon) => (
                  <SalonCard key={salon.slug} {...salon} />
                ))}
              </div>
            )}
          </div>

          {/* Right Map Placeholder (40%) */}
          <div className="hidden lg:block lg:w-[40%] relative">
            <div className="sticky top-48 h-[calc(100vh-14rem)] bg-zinc-900 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-8 overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <Map className="h-14 w-14 text-zinc-700 mb-5 relative z-10" />
              <h3 className="text-white font-inter font-medium relative z-10 text-lg">Mapa disponible próximamente</h3>
              <p className="text-zinc-500 text-sm text-center mt-2 relative z-10">La integración con Google Maps será realizada en el próximo paso.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Map Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:hidden z-50">
        <button className="flex items-center gap-2 bg-white text-zinc-950 px-8 py-3.5 rounded-full shadow-lg font-medium shadow-black/50 hover:bg-zinc-100 transition-colors">
          Ver mapa 🗺
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
