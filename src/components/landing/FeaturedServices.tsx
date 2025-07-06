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
    <section className="py-20 sm:py-28 relative bg-[#1A1A1D] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-1/4 left-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,rgba(124,58,237,0)_70%)]" />
        <div className="absolute -bottom-1/4 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,rgba(124,58,237,0)_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 text-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
            Servicios Destacados
          </h2>
           <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Descubrí nuestros tratamientos estrella, diseñados para realzar tu belleza con las últimas tendencias y la máxima calidad profesional.</p>
        </div>

        {loading ? (
           <div className="flex justify-center gap-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[520px] w-full max-w-sm rounded-3xl bg-white/10" />
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
                      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-primary/20">
                        <div className="relative mb-6 flex-shrink-0">
                          <div className="overflow-hidden rounded-xl shadow-2xl shadow-black/30 group-hover:shadow-primary/30 transition-shadow duration-500">
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
                            <h3 className="flex-grow text-xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 min-h-[56px]">{service.nombre}</h3>
                            <div className="mt-4 border-t border-dashed border-white/20 pt-4">
                              <p className="text-sm text-gray-400">Desde</p>
                              <p className="text-4xl font-bold text-white">{formatPrice(service.precio)}</p>
                            </div>
                            <div className="mt-8">
                              <Link href="/login" className="w-full">
                                <Button size="lg" className="w-full rounded-full py-6 bg-white/10 hover:bg-white/20 border-0 text-white font-semibold transition-colors">Ver más</Button>
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
