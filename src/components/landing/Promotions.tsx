import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const promotions = [
  {
    title: 'Alisado de Keratina',
    description: 'Cabello liso, brillante y sin frizz por semanas.',
    price: 'Desde $18.000',
    image: 'https://placehold.co/600x400.png',
    hint: 'hair treatment',
    badge: 'Oferta del Mes',
  },
  {
    title: 'Coloración Balayage',
    description: 'Un look natural y luminoso con reflejos hechos a mano.',
    price: 'Desde $25.000',
    image: 'https://placehold.co/600x400.png',
    hint: 'balayage hair',
    badge: 'Tendencia',
  },
  {
    title: 'Kit de Mantenimiento',
    description: 'Shampoo y acondicionador post-tratamiento.',
    price: '$9.500',
    image: 'https://placehold.co/600x400.png',
    hint: 'hair products',
    badge: 'Producto Destacado',
  },
    {
    title: 'Corte y Nutrición',
    description: 'Renová tu estilo y dale vida a tu cabello.',
    price: 'Desde $7.000',
    image: 'https://placehold.co/600x400.png',
    hint: 'woman haircut',
    badge: 'Clásico',
  },
];

export default function Promotions() {
  return (
    <section id="promotions" className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Promociones y Servicios Destacados</h2>
          <p className="mt-4 text-lg text-muted-foreground">Descubre nuestras ofertas especiales y los tratamientos más elegidos.</p>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {promotions.map((promo, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Badge variant="destructive" className="absolute top-4 left-4 z-10">{promo.badge}</Badge>
                        <Image
                          src={promo.image}
                          alt={promo.title}
                          width={600}
                          height={400}
                          data-ai-hint={promo.hint}
                          className="object-cover aspect-[3/2] w-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold">{promo.title}</h3>
                        <p className="mt-2 text-muted-foreground">{promo.description}</p>
                        <div className="flex justify-between items-center mt-6">
                          <span className="text-lg font-semibold text-primary">{promo.price}</span>
                          <Button variant="outline">Ver más</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
