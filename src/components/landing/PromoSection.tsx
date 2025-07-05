import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Asterisk, Scissors } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const promoData = [
  {
    id: 1,
    number: '01',
    title: 'PROMO',
    subtitle: 'TRADICIONAL',
    price: 29999,
    services: ['CORTE', 'LAVADO ESPECIAL', 'BOTOX CAPILAR', 'PEINADO', 'PLANCHITA'],
    badge: null,
    highlightBorder: false,
    highlightButton: false,
  },
  {
    id: 3,
    number: '03',
    title: 'PROMO',
    subtitle: 'RENOVADA',
    price: 34999,
    services: ['CORTE', 'LAVADO ESPECIAL', 'SHOCK DE KERATINA', 'BRUSHING', 'PLANCHITA'],
    badge: 'MÁS POPULARES',
    highlightBorder: false,
    highlightButton: true,
  },
  {
    id: 2,
    number: '02',
    title: 'PROMO',
    subtitle: 'TENDENCIA',
    price: 44999,
    services: ['CORTE', 'LAVADO ESPECIAL', 'COLOR DE RAÍZ', 'BRUSHING', 'PLANCHITA'],
    badge: null,
    highlightBorder: false,
    highlightButton: false,
  },
  {
    id: 4,
    number: '04',
    title: 'PROMO',
    subtitle: 'EXCLUSIVA',
    price: 49999,
    services: ['BALAYAGE', 'BAÑO DE LUZ', 'LAVADO ESPECIAL', 'NUTRICIÓN CAPILAR', 'BRUSHING'],
    badge: null,
    highlightBorder: true,
    highlightButton: true,
  },
];

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
}

export default function PromoSection() {
    return (
        <section id="promotions" className="py-16 sm:py-24 bg-muted/50">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <div className="inline-block text-primary">
                        <Scissors className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">Nuestros Combos Especiales</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Combos pensados para darte una experiencia completa de renovación y cuidado, a un precio especial.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                    {promoData.map((promo) => (
                        <Card key={promo.id} className={cn(
                            "relative flex flex-col bg-card rounded-xl text-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl pt-8",
                            promo.highlightBorder ? "border-2 border-solid border-primary" : "border border-dashed border-gray-300 dark:border-gray-700"
                        )}>
                            {promo.badge && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-1.5 rounded-full shadow-lg">
                                        {promo.badge}
                                    </div>
                                </div>
                            )}
                            <CardContent className="p-6 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-light tracking-[0.2em] uppercase">{promo.number}. {promo.title}</h3>
                                    <p className="text-2xl font-normal tracking-wide uppercase mt-1">{promo.subtitle}</p>
                                    <p className="text-sm text-muted-foreground mt-2">Desde</p>
                                    <p className="font-serif text-5xl font-bold text-primary my-4">{formatPrice(promo.price)}</p>
                                    <ul className="space-y-3 text-left">
                                        {promo.services.map((service, index) => (
                                            <li key={index} className="flex items-center gap-3 text-muted-foreground">
                                                <Asterisk className="h-4 w-4 text-primary/80 flex-shrink-0" />
                                                <span className="text-sm uppercase font-medium">{service}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-auto pt-8">
                                    <Link href="/login" className="w-full">
                                        <Button size="lg" variant={promo.highlightButton ? 'default' : 'outline'} className="w-full uppercase tracking-wider py-6">
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
