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

const mockServices: Omit<Servicio, 'id' | 'duracion' | 'descripcion'>[] = [
  {
    nombre: 'ALISADO FOTÓNICO LASER',
    precio: 34999,
    imagen: 'https://placehold.co/600x800.png',
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
    <section className="py-16 sm:py-24 relative text-white">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Fondo abstracto de tela violeta"
        data-ai-hint="violet fabric abstract"
        fill
        className="object-cover -z-20"
      />
      <div className="absolute inset-0 bg-slate-900/70 -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-widest uppercase text-white/80">
            SERVICIOS DESTACADOS
          </h2>
           <p className="mt-2 text-white/60 max-w-2xl mx-auto">Descubrí nuestros tratamientos estrella, diseñados para realzar tu belleza con las últimas tendencias y la máxima calidad profesional.</p>
        </div>

        {loading ? (
           <div className="flex justify-center gap-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[480px] w-full max-w-sm rounded-2xl bg-white/10" />
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
                    <div className="h-full p-1">
                      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:shadow-2xl hover:shadow-primary/10">
                        <div className="relative mb-6 flex-shrink-0">
                          <div className="overflow-hidden rounded-lg shadow-lg group-hover:shadow-primary/20 transition-shadow">
                            <Image
                              src={service.imagen || 'https://placehold.co/600x800.png'}
                              alt={service.nombre}
                              width={600}
                              height={800}
                              className="object-cover w-full h-60 group-hover:scale-105 transition-transform duration-500"
                              data-ai-hint="woman hair"
                            />
                          </div>
                          {service.badge && <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md">{service.badge}</div>}
                        </div>
                        <div className="flex flex-grow flex-col">
                            <h3 className="flex-grow text-lg font-bold uppercase tracking-wide">{service.nombre}</h3>
                            <div className="mt-4 border-t border-dashed border-white/20 pt-4">
                              <p className="text-sm text-white/60">Desde</p>
                              <p className="text-3xl font-bold text-white">{formatPrice(service.precio)}</p>
                            </div>
                            <div className="mt-6">
                              <Link href="/login" className="w-full">
                                <Button variant="outline" className="w-full rounded-full py-5 bg-transparent border-white/50 text-white hover:bg-white/10 hover:border-white/70 transition-colors">Ver más</Button>
                              </Link>
                            </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-[-1rem] md:left-[-2rem] bg-white/10 border-white/20 text-white hover:bg-white/20" />
              <CarouselNext className="right-[-1rem] md:right-[-2rem] bg-white/10 border-white/20 text-white hover:bg-white/20" />
            </Carousel>
          )}
      </div>
    </section>
  );
}
