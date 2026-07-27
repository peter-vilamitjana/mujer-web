import Link from 'next/link';
import type { Tenant } from '@/lib/schema';
import { Store, Star } from 'lucide-react';

export default function PublicSalonCard({ salon }: { salon: Tenant }) {
  return (
    <Link href={`/salones/${salon.slug}`} className="group relative bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow transition-transform duration-500 hover:-translate-y-2 block border-none cursor-pointer">
      <div className="h-64 overflow-hidden relative m-4 rounded-lg bg-surface-container-high flex flex-col items-center justify-center">
        {salon.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            alt={salon.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            src={salon.logoUrl} 
          />
        ) : (
          <Store className="w-12 h-12 text-outline/30" />
        )}

        <div className="absolute top-4 left-4 h-12 w-12 rounded-lg bg-white/90 glass-effect p-2 shadow-sm flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{salon.name.substring(0,2).toUpperCase()}</span>
        </div>
      </div>

      <div className="p-6 pt-2">
        <h3 className="font-headline text-xl font-semibold mb-2 truncate pr-2">{salon.name}</h3>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-secondary">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4" fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span className="text-xs font-body text-outline">5.0 (56)</span>
          <span className="ml-auto text-sm font-semibold text-primary">$$$</span>
        </div>

        <button className="w-full py-3 rounded-full bg-on-surface text-surface text-sm font-semibold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Ver más
        </button>
      </div>
    </Link>
  );
}
