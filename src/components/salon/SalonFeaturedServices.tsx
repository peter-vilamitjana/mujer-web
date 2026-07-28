'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getServices } from '@/actions/services.actions';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedServiceUI {
  id: string;
  name: string;
  price: number;
  image?: string;
  badge?: string;
}

// CAMBIO 1: Props del tenant
interface SalonFeaturedServicesProps {
  tenantId: string;
  tenantSlug: string;
}

export default function SalonFeaturedServices({ tenantId, tenantSlug }: SalonFeaturedServicesProps) {
  const [services, setServices] = useState<FeaturedServiceUI[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const dbServices = await getServices(tenantId, true); // true = onlyActive

        // Mapeo de campos schema nuevo → tipo UI
        const servicesData: FeaturedServiceUI[] = dbServices.map(s => {
          // price puede ser number (precio fijo) o objeto {corto, mediano, largo}
          const price = typeof s.price === 'number'
            ? s.price
            : (s.price?.corto ?? s.price?.mediano ?? s.price?.largo ?? 0);

          return {
            id: s.id,
            name: s.name,
            price,
            image: s.image,
            badge: s.badge ?? undefined,
          };
        });

        setServices(servicesData.slice(0, 6));
      } catch (error: any) {
        console.error('[SalonFeaturedServices] fetch failed:', error?.message || error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [tenantId]); // tenantId en deps para refetch si cambia

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  // Header: fade-up simple al entrar en viewport.
  useGSAP(() => {
    if (!headerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });
    return () => mm.revert();
  }, []);

  // Tarjetas: coreografía en cascada coordinada por sección (ScrollTrigger.batch)
  // en vez de un ScrollReveal individual por tarjeta. Sin animación si el
  // usuario prefiere menos movimiento — las tarjetas quedan visibles directo.
  useGSAP(() => {
    if (loading || services.length === 0 || !sectionRef.current) return;
    const cards = gsap.utils.toArray<HTMLElement>('[data-reveal="service-card"]', sectionRef.current);
    if (cards.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(cards, { autoAlpha: 0, y: 28 });
      const triggers = ScrollTrigger.batch(cards, {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', overwrite: true }),
        onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 28 }),
      });
      return () => triggers.forEach((t) => t.kill());
    });

    return () => mm.revert();
  }, [loading, services]);

  const getServiceImage = (name: string, image?: string) => {
    if (image) return image;
    const normalized = name.toLowerCase();
    if (normalized.includes('alisado')) return '/services/alisados.png';
    if (normalized.includes('baño') || normalized.includes('crema')) return '/services/bano_crema.png';
    if (normalized.includes('botox')) return '/services/botox_capilar.png';
    return '/services/alisados.png';
  };

  if (!loading && services.length === 0) return null;

  return (
    <section id="servicios" ref={sectionRef} className="py-20 sm:py-28 relative z-0 overflow-hidden bg-surface">
      <div className="container mx-auto px-4 relative z-10">
        {/* Mobile Header — idéntico al original */}
        <div className="flex items-end justify-between mb-8 md:hidden">
          <h2 className="font-vogue text-3xl font-bold tracking-tight text-on-surface">
            Servicios
          </h2>
          <Link href={`/salones/${tenantSlug}/turnos`} className="font-sans text-[10px] font-bold uppercase tracking-widest text-primary">
            RESERVAR
          </Link>
        </div>

        {/* Desktop Header — idéntico al original */}
        <div ref={headerRef} className="hidden md:block text-center mb-16 px-4">
          <h2 className="font-vogue text-4xl md:text-5xl font-bold tracking-tight uppercase text-on-surface mb-6">
            Servicios Destacados
          </h2>
          <p className="font-sans text-on-surface-secondary text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Descubrí nuestros tratamientos estrella, diseñados para realzar tu belleza con las últimas tendencias y la máxima calidad profesional.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[380px] w-full rounded-2xl bg-surface-card" />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile Vertical List */}
            <div className="flex flex-col gap-4 md:hidden">
              {services.slice(0, 3).map((service) => (
                <div key={service.id} data-reveal="service-card" className="bg-surface-card rounded-2xl p-5 border border-outline-subtle">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-5">
                    <img
                      src={getServiceImage(service.name, service.image)}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                    {service.badge && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-surface-card/90 backdrop-blur-sm rounded-full border border-outline-subtle">
                        <span className="font-sans text-[8px] font-bold text-primary uppercase tracking-widest leading-none block">{service.badge}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-vogue text-lg font-bold text-on-surface">
                      {service.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                    </h3>
                    <p className="font-sans text-xs text-on-surface-secondary line-clamp-2 leading-relaxed">
                      Asesoramiento personalizado de nuestros expertos styling final para un look moderno renovado.
                    </p>
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full rounded-full py-4 font-sans text-[10px] font-bold uppercase tracking-widest border-outline-subtle hover:bg-surface-hover transition-all text-on-surface">
                        <Link href={`/salones/${tenantSlug}/turnos`}>
                          Ver más detalles
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Carousel */}
            <Carousel
              plugins={[Autoplay({ delay: 8000, stopOnInteraction: true })]}
              className="w-full hidden md:block"
              opts={{ align: 'start', loop: true }}
            >
              <CarouselContent className="-ml-6">
                {services.map((service) => (
                  <CarouselItem key={service.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
                    <div data-reveal="service-card" className="h-full pb-8">
                      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-500 p-5 bg-surface-card border border-outline-subtle hover:border-outline">
                        <div className="relative mb-5 flex-shrink-0">
                          <div className="overflow-hidden rounded-xl aspect-[4/3]">
                            <img
                              src={getServiceImage(service.name, service.image)}
                              alt={service.name}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          {service.badge && (
                            <div className="absolute top-3 right-3 px-4 py-1.5 rounded-full bg-primary">
                              <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-surface">{service.badge}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-grow flex-col">
                          <h3 className="flex-grow text-lg font-medium uppercase tracking-wide text-on-surface font-vogue">{service.name}</h3>
                          <div className="mt-4 pt-4 border-t border-dotted border-outline-subtle">
                            <p className="font-sans text-[10px] uppercase tracking-wider text-on-surface-secondary mb-1">Desde</p>
                            <p className="font-vogue text-2xl font-bold text-primary">{formatPrice(service.price || 0)}</p>
                          </div>
                          <div className="mt-6">
                            <Button asChild variant="secondary" className="w-full rounded-full py-4 bg-surface-hover hover:bg-surface-active text-on-surface font-sans font-medium text-xs transition-all duration-300">
                              <Link href={`/salones/${tenantSlug}/turnos`}>
                                Ver más
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 border-none bg-surface-card/50 backdrop-blur-sm hover:bg-surface-card" />
              <CarouselNext className="hidden md:flex -right-12 border-none bg-surface-card/50 backdrop-blur-sm hover:bg-surface-card" />
            </Carousel>
          </>
        )}
      </div>
    </section>
  );
}
