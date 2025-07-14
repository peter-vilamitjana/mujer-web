'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const promoData = [
  {
    id: 1,
    subtitle: 'TRADICIONAL',
    price: 29999,
    services: ['CORTE', 'LAVADO ESPECIAL', 'BOTOX CAPILAR', 'PEINADO', 'PLANCHITA'],
    badge: null,
    type: 'standard',
  },
  {
    id: 2,
    subtitle: 'TENDENCIA',
    price: 44999,
    services: ['CORTE', 'LAVADO ESPECIAL', 'COLOR DE RAÍZ', 'BRUSHING', 'PLANCHITA'],
    badge: null,
    type: 'standard',
  },
  {
    id: 3,
    subtitle: 'RENOVADA',
    price: 34999,
    services: ['CORTE', 'LAVADO ESPECIAL', 'SHOCK DE KERATINA', 'BRUSHING', 'PLANCHITA'],
    badge: 'MÁS POPULAR',
    type: 'popular',
  },
  {
    id: 4,
    subtitle: 'PREMIUM',
    price: 49999,
    services: ['BALAYAGE', 'BAÑO DE LUZ', 'LAVADO ESPECIAL', 'NUTRICIÓN CAPILAR', 'BRUSHING'],
    badge: 'Premium',
    type: 'premium',
  },
];

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
}

export default function PromoSection() {
    return (
        <section id="promotions" className="py-20 sm:py-28 bg-muted/30">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-16">
                    <div className="inline-block text-primary">
                        <Scissors className="h-8 w-8" />
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mt-4">Nuestros Combos Especiales</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Combos pensados para darte una experiencia completa de renovación y cuidado, a un precio especial que te va a encantar.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                    {promoData.sort((a,b) => a.id - b.id).map((promo) => (
                        <Card key={promo.id} className={cn(
                            "relative flex flex-col rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-2 group",
                            {
                                'bg-card shadow-lg hover:shadow-primary/10': promo.type === 'standard',
                                'bg-card shadow-lg ring-1 ring-primary/20 hover:shadow-primary/20': promo.type === 'popular',
                                'bg-gradient-to-br from-[#2c1f4a] to-[#1a1a22] text-gray-200 shadow-2xl shadow-primary/20 border border-primary/30 hover:shadow-primary/30': promo.type === 'premium'
                            }
                        )}>
                            {promo.type === 'premium' && (
                                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/50 transition-all duration-300 [box-shadow:inset_0_0_15px_rgba(121,87,214,0.3)] group-hover:[box-shadow:inset_0_0_25px_rgba(121,87,214,0.5)]" />
                            )}
                            
                            {promo.badge && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className={cn(
                                        "text-xs font-bold uppercase px-4 py-1.5 rounded-full shadow-lg",
                                        {
                                            'bg-accent text-accent-foreground': promo.type === 'popular',
                                            'bg-primary/90 backdrop-blur-sm border border-white/10 text-primary-foreground shadow-primary/40': promo.type === 'premium'
                                        }
                                    )}>
                                        {promo.badge}
                                    </div>
                                </div>
                            )}
                            <CardContent className="p-8 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <p className={cn(
                                        "font-serif text-2xl font-normal tracking-wide uppercase mt-1",
                                        promo.type === 'premium' ? 'text-white' : 'text-foreground'
                                    )}>{promo.subtitle}</p>
                                    <p className={cn(
                                        "font-serif text-5xl font-bold my-4",
                                        promo.type === 'premium' ? 'text-white' : 'text-primary'
                                    )}>{formatPrice(promo.price)}</p>
                                    <ul className="space-y-3 text-left my-8">
                                        {promo.services.map((service, index) => (
                                            <li key={index} className="flex items-center gap-3">
                                                <div className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", promo.type === 'premium' ? 'bg-primary/70' : 'bg-muted-foreground')} />
                                                <span className={cn(
                                                    "text-sm uppercase font-medium",
                                                     promo.type === 'premium' ? 'text-gray-300' : 'text-muted-foreground'
                                                )}>{service}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-auto pt-8">
                                    <Link href="/login" className="w-full">
                                        <Button 
                                            size="lg" 
                                            variant={promo.type === 'popular' || promo.type === 'premium' ? 'default' : 'outline'} 
                                            className={cn("w-full uppercase tracking-wider rounded-full py-7 font-bold",
                                            {'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 group-hover:shadow-primary/40': promo.type === 'premium'}
                                            )}>
                                            Seleccionar
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
