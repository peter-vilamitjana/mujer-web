'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Servicio } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

export default function Promotions() {
  const [promotions, setPromotions] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <section id="promotions" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Servicios y Promociones</h2>
          <p className="mt-4 text-lg text-muted-foreground">Descubre nuestras ofertas especiales y los tratamientos más elegidos.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
             [...Array(2)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 flex flex-col justify-center">
                             <Skeleton className="h-4 w-1/4 mb-2" />
                             <Skeleton className="h-8 w-3/4 mb-4" />
                             <Skeleton className="h-4 w-full mb-6" />
                             <Skeleton className="h-10 w-1/2" />
                        </div>
                        <div className="hidden md:block">
                            <Skeleton className="h-full w-full aspect-square" />
                        </div>
                    </div>
                </Card>
            ))
          ) : promotions.length > 0 ? (
            promotions.slice(0, 2).map((promo, index) => (
                <Card key={promo.id + index} className="overflow-hidden group transition-all duration-300 hover:shadow-xl flex flex-col bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 flex-grow">
                        <div className="p-8 flex flex-col justify-center order-2 md:order-1">
                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">{promo.badge || 'Promoción'}</span>
                            <h3 className="text-2xl lg:text-3xl font-bold mt-2">{promo.nombre}</h3>
                            <p className="mt-4 text-muted-foreground min-h-[60px]">{promo.descripcion}</p>
                            <Link href="/turnos" className="mt-6">
                                <Button variant="outline">
                                    Reservar Ahora <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="relative min-h-[300px] md:min-h-0 order-1 md:order-2">
                             <Image
                                src={promo.imagen || 'https://placehold.co/600x600.png'}
                                alt={promo.nombre}
                                fill
                                data-ai-hint="hair treatment"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                        </div>
                    </div>
                </Card>
            ))
          ) : (
            <div className="lg:col-span-2 text-center py-10 text-muted-foreground">
                No hay promociones destacadas en este momento.
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold">¿Lista para tu cambio de look?</h3>
            <p className="mt-2 text-muted-foreground">Explora todos nuestros servicios y agenda tu cita fácilmente.</p>
            <Link href="/servicios" className="mt-6 inline-block">
                <Button size="lg">Ver todos los servicios</Button>
            </Link>
        </div>

      </div>
    </section>
  );
}
