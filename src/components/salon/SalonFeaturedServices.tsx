'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getServices } from '@/actions/services.actions';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ScrollReveal } from './ScrollReveal';

interface FeaturedServiceUI {
  id: string;
  name: string;
  price: number;
  image?: string;
  badge?: string;
}

// Mock data — fallback idéntico al original
const mockServices: Omit<FeaturedServiceUI, 'id'>[] = [
  { name: 'ALISADO FOTÓNICO LASER', price: 34999, image: '/images/services/alisado.png', badge: 'NOVEDAD' },
  { name: 'PERMANENTE', price: 34999, image: '/images/services/permanente.png', badge: 'TENDENCIA' },
  { name: 'BALAYAGE', price: 29999, image: '/images/services/balayage.png', badge: 'MÁS BUSCADOS' },
  { name: 'CORTE & ESTILO', price: 15999, image: '/images/services/corte.png', badge: 'CLÁSICO' },
  { name: 'COLORACIÓN PROFESIONAL', price: 24999, image: '/images/services/coloracion.png', badge: 'PREMIUM' },
  { name: 'KERATINA PROFESIONAL', price: 39999, image: '/images/services/keratina.png', badge: 'TRATAMIENTO' },
];

// CAMBIO 1: Props del tenant
interface SalonFeaturedServicesProps {
  tenantId: string;
  tenantSlug: string;
}

export default function SalonFeaturedServices({ tenantId, tenantSlug }: SalonFeaturedServicesProps) {
  const [services, setServices] = useState<FeaturedServiceUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const dbServices = await getServices(tenantId, true); // true = onlyActive

        // Mapeo de campos schema nuevo → tipo UI
        let servicesData: FeaturedServiceUI[] = dbServices.map(s => {
          // price puede ser number (precio fijo) o objeto {corto, mediano, largo}
          const price = typeof s.price === 'number'
            ? s.price
            : (s.price?.corto ?? s.price?.mediano ?? s.price?.largo ?? 0);

          return {
            id: s.id,
            name: s.name,
            price,
            image: s.image,
            badge: undefined,
          };
        });

        if (servicesData.length === 0) {
          console.log("No services found in tenant, using mock data.");
          servicesData = mockServices.map((s, i) => ({ ...s, id: `mock-${i}` }));
        }

        setServices(servicesData.slice(0, 6));
      } catch (error: any) {
        console.warn("Fetch de servicios falló, usando datos de prueba.", error?.message || error);
        setServices(mockServices.map((s, i) => ({ ...s, id: `mock-${i}` })));
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [tenantId]); // tenantId en deps para refetch si cambia

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  return (
    <section className="py-20 sm:py-28 relative z-0 overflow-hidden bg-[#F2F2F7]/30">
      <div className="container mx-auto px-4 relative z-10">
        {/* Mobile Header — idéntico al original */}
        <div className="flex items-end justify-between mb-8 md:hidden">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Servicios
          </h2>
          {/* CAMBIO 3: /servicios → /salones/{tenantSlug}/book */}
          <Link href={`/salones/${tenantSlug}/book`} className="text-[10px] font-bold uppercase tracking-widest text-[#9D6EFE]">
            RESERVAR
          </Link>
        </div>

        {/* Desktop Header — idéntico al original */}
        <ScrollReveal>
          <div className="hidden md:block text-center mb-16 px-4">
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight uppercase text-foreground mb-6">
              Servicios Destacados
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Descubrí nuestros tratamientos estrella, diseñados para realzar tu belleza con las últimas tendencias y la máxima calidad profesional.
            </p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[520px] w-full rounded-[2.5rem] bg-muted/50" />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile Vertical List — idéntico al original */}
            <div className="flex flex-col gap-6 md:hidden">
              {services.slice(0, 3).map((service, index) => (
                <ScrollReveal key={service.id} delay={index * 0.1}>
                  <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.03]">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-700" />
                      )}
                      {service.badge && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                          <span className="text-[8px] font-bold text-[#9D6EFE] uppercase tracking-widest leading-none block">{service.badge}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-serif text-xl font-bold text-foreground">
                        {service.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        Asesoramiento personalizado de nuestros expertos styling final para un look moderno renovado.
                      </p>
                      {/* CAMBIO 3: /login → /salones/{tenantSlug}/book */}
                      <Link href={`/salones/${tenantSlug}/book`} className="inline-block pt-2">
                        <Button variant="outline" className="rounded-full px-6 py-5 text-[10px] font-bold uppercase tracking-widest border-black/10 hover:bg-black/5 transition-all text-foreground">
                          Ver más detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Desktop Carousel — idéntico al original */}
            <Carousel
              plugins={[Autoplay({ delay: 8000, stopOnInteraction: true })]}
              className="w-full hidden md:block"
              opts={{ align: 'start', loop: true }}
            >
              <CarouselContent className="-ml-6">
                {services.map((service, index) => (
                  <CarouselItem key={service.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                    <ScrollReveal delay={index * 0.1}>
                      <div className="h-full pb-8">
                        <div className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] transition-all duration-500 p-8 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(163,127,255,0.12)] border border-black/5">
                          <div className="relative mb-8 flex-shrink-0">
                            <div className="overflow-hidden rounded-3xl transition-all duration-500">
                              {service.image ? (
                                <img
                                  src={service.image}
                                  alt={service.name}
                                  className="object-cover w-full h-80 group-hover:scale-105 transition-transform duration-700"
                                />
                              ) : (
                                <div className="w-full h-80 bg-gradient-to-br from-zinc-800 to-zinc-700 group-hover:scale-105 transition-transform duration-700" />
                              )}
                            </div>
                            {service.badge && (
                              <div className="absolute top-4 right-4 px-5 py-2 rounded-full bg-[#9D6EFE] shadow-[0_0_20px_rgba(157,110,254,0.4)]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white">{service.badge}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-grow flex-col">
                            <h3 className="flex-grow text-2xl font-normal uppercase tracking-wide text-foreground font-serif">{service.name}</h3>
                            <div className="mt-6 pt-6 border-t border-dotted border-black/10">
                              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Desde</p>
                              <p className="text-4xl font-bold text-[#9D6EFE]">{formatPrice(service.price || 0)}</p>
                            </div>
                            <div className="mt-8">
                              {/* CAMBIO 3: /login → /salones/{tenantSlug}/book */}
                              <Link href={`/salones/${tenantSlug}/book`} className="w-full">
                                <Button variant="secondary" className="w-full rounded-full py-7 bg-[#E9E9EB] hover:bg-[#DDE0E3] text-foreground font-medium text-sm transition-all duration-300">
                                  Ver más
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 border-none bg-white/50 backdrop-blur-sm hover:bg-white" />
              <CarouselNext className="hidden md:flex -right-12 border-none bg-white/50 backdrop-blur-sm hover:bg-white" />
            </Carousel>
          </>
        )}
      </div>
    </section>
  );
}
