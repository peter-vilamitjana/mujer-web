'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import type { Servicio } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button } from '../ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';

const mockServices: Omit<Servicio, 'id' | 'duracion' | 'descripcion'>[] = [
  {
    nombre: 'ALISADO FOTÓNICO LASER',
    precio: 34999,
    imagen: 'https://firebasestorage.googleapis.com/v0/b/ai-prototyper-scratch.appspot.com/o/1b59c7a7-195c-4d81-8051-5369c4f4d1e2.png?alt=media&token=e93a7d4d-fb84-4ce6-a6c3-98282df581b7',
    badge: 'NOVEDAD',
    destacado: true,
  },
  {
    nombre: 'PERMANENTE',
    precio: 34999,
    imagen: 'https://placehold.co/600x800.png',
    badge: 'TENDENCIA',
    destacado: true,
  },
  {
    nombre: 'BALAYAGE',
    precio: 29999,
    imagen: 'https://placehold.co/600x800.png',
    badge: 'MÁS BUSCADOS',
    destacado: true,
  },
];

export default function FeaturedServices() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const plugin = useRef(
      Autoplay({ delay: 10000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesQuery = query(
          collection(db, 'servicios'),
          where('destacado', '==', true),
          orderBy('nombre')
        );
        const querySnapshot = await getDocs(servicesQuery);
        let servicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Servicio);
        
        if (servicesData.length === 0) {
          console.log("No featured services found, using mock data.");
          servicesData = mockServices.map((s, i) => ({ ...s, id: `mock-${i}`, duracion: 60, descripcion: '' }));
        }
        
        setServices(servicesData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching services: ", error);
        setServices(mockServices.map((s, i) => ({ ...s, id: `mock-${i}`, duracion: 60, descripcion: '' })));
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);
  }

  return (
    <section 
      className="py-20 sm:py-28 relative z-0"
    >
       <div 
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #ffffff, #f2f2f7, #e9e6f9)'
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight uppercase text-foreground">
            Servicios Destacados
          </h2>
           <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Descubrí nuestros tratamientos estrella, diseñados para realzar tu belleza con las últimas tendencias y la máxima calidad profesional.</p>
        </div>

        {loading ? (
           <div className="flex justify-center gap-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[520px] w-full max-w-sm rounded-3xl bg-muted" />
            ))}
           </div>
          ) : (
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{ align: 'start', loop: true }}
            >
              <CarouselContent className="-ml-4">
                {services.map((service) => (
                  <CarouselItem key={service.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="h-full">
                      <div 
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 p-6 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 20px rgba(163, 127, 255, 0.1)',
                        }}
                      >
                        <div className="relative mb-6 flex-shrink-0">
                          <div className="overflow-hidden rounded-xl shadow-lg shadow-black/10 group-hover:shadow-primary/20 transition-shadow duration-500">
                            <Image
                              src={service.imagen || 'https://placehold.co/600x800.png'}
                              alt={service.nombre}
                              width={600}
                              height={800}
                              className="object-cover w-full h-72 group-hover:scale-105 transition-transform duration-500"
                              data-ai-hint="woman hair"
                            />
                          </div>
                          {service.badge && 
                            <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-primary/80 backdrop-blur-sm border border-white/10 shadow-lg shadow-primary/30">
                              <span className="text-xs font-bold uppercase tracking-wider text-white">{service.badge}</span>
                            </div>
                          }
                        </div>
                        <div className="flex flex-grow flex-col">
                            <h3 className="flex-grow text-xl font-bold uppercase tracking-wider text-foreground min-h-[56px]">{service.nombre}</h3>
                            <div className="mt-4 border-t border-dashed border-border/50 pt-4">
                              <p className="text-sm text-muted-foreground">Desde</p>
                              <p className="text-4xl font-bold text-primary">{formatPrice(service.precio)}</p>
                            </div>
                            <div className="mt-8">
                              <Link href="/login" className="w-full">
                                <Button size="lg" variant="secondary" className="w-full rounded-full py-6 font-semibold">Ver más</Button>
                              </Link>
                            </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-[-1rem] md:left-[-2rem]" />
              <CarouselNext className="right-[-1rem] md:right-[-2rem]" />
            </Carousel>
          )}
      </div>
    </section>
  );
}
