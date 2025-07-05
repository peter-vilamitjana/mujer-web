'use client';
import { useState, useEffect } from 'react';
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
import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Servicio } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Promotions() {
  const [promotions, setPromotions] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We fetch services that have a "badge" to feature them as promotions
    const q = query(collection(db, 'servicios'), where('badge', '!=', ''));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const servicesData: Servicio[] = [];
      querySnapshot.forEach((doc) => {
        servicesData.push({ id: doc.id, ...doc.data() } as Servicio);
      });
      setPromotions(servicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
  }

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
            loop: promotions.length > 2,
          }}
          className="w-full"
        >
          <CarouselContent>
            {loading ? (
              [...Array(3)].map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <Skeleton className="aspect-[3/2] w-full" />
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                           <Skeleton className="h-6 w-1/4" />
                           <Skeleton className="h-10 w-1/3" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            ) : promotions.length > 0 ? (
               promotions.map((promo) => (
                <CarouselItem key={promo.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl">
                      <CardContent className="p-0">
                        <div className="relative">
                          {promo.badge && <Badge variant="destructive" className="absolute top-4 left-4 z-10">{promo.badge}</Badge>}
                          <Image
                            src={promo.imagen || 'https://placehold.co/600x400.png'}
                            alt={promo.nombre}
                            width={600}
                            height={400}
                            data-ai-hint="hair treatment"
                            className="object-cover aspect-[3/2] w-full transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold">{promo.nombre}</h3>
                          <p className="mt-2 text-muted-foreground min-h-[40px]">{promo.descripcion}</p>
                          <div className="flex justify-between items-center mt-6">
                            <span className="text-lg font-semibold text-primary">
                              Desde {formatPrice(promo.precio)}
                            </span>
                            <Link href="/login">
                              <Button variant="outline">Ver más</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            ) : (
                <CarouselItem>
                   <div className="text-center py-10 text-muted-foreground">
                      No hay promociones destacadas en este momento.
                   </div>
                </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
