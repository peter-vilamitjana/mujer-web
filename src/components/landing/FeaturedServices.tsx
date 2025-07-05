'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Servicio } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

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
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-widest uppercase text-foreground/80">
            SERVICIOS DESTACADOS
          </h2>
          <Link href="/servicios">
            <span className="mt-2 inline-block text-primary hover:text-primary/80 transition-colors cursor-pointer">
              Ver más
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[450px] w-full rounded-lg" />
            ))
          ) : (
            services.map((service) => (
              <Link href={`/turnos?servicioId=${service.id}`} key={service.id} className="block">
                <Card className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <Image
                    src={service.imagen || 'https://placehold.co/600x800.png'}
                    alt={service.nombre}
                    width={600}
                    height={800}
                    className="object-cover w-full h-[450px] group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint="woman hair"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                     <div className="flex items-end gap-4">
                        <Image 
                            src={service.imagen || 'https://placehold.co/80x80.png'}
                            alt={service.nombre}
                            width={80}
                            height={80}
                            className="object-cover rounded-md border-2 border-white/50 flex-shrink-0"
                            data-ai-hint="hair style"
                        />
                        <div className="flex-1">
                            {service.badge && <p className="text-xs font-bold uppercase tracking-wider text-white/90">{service.badge}</p>}
                            <h3 className="text-xl font-semibold uppercase tracking-wide leading-tight">{service.nombre}</h3>
                            <p className="text-lg font-bold text-primary mt-1">Desde {formatPrice(service.precio)}</p>
                        </div>
                     </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
