import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SalonCardProps {
  name: string;
  slug: string;
  category: string;
  coverImageUrl: string;
  address: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
}

export function SalonCard({
  name,
  slug,
  category,
  coverImageUrl,
  address,
  rating,
  reviewCount,
  priceFrom,
}: SalonCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(priceFrom);

  return (
    <Link href={`/salones/${slug}`} className="block group">
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] shadow-card-glow transition-all duration-300">
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageUrl}
            alt={`Portada de ${name}`}
            className="w-full h-full object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
          
          <Badge className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-md border-white/10 text-white font-inter rounded-full px-3 py-1 text-xs">
            {category}
          </Badge>
          
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10 shadow-lg">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-white font-inter mb-[1px]">{rating}</span>
            <span className="text-[10px] text-zinc-400 font-inter mb-[1px]">({reviewCount})</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-zinc-900/50 flex flex-col justify-between" style={{ minHeight: '130px' }}>
          <div className="space-y-1.5">
            <h3 className="font-playfair text-xl text-white line-clamp-1 leading-tight">{name}</h3>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="text-sm font-inter line-clamp-1">{address}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-inter mb-0.5">Servicios desde</span>
              <span className="text-emerald-400 font-semibold font-inter">{formattedPrice}</span>
            </div>
            
            <div className="rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-inter font-medium px-5 py-2 text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center">
              Reservar
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
