'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Servicio } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button } from '../ui/button';

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
           <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Descubrí nuestros tratamientos estrella, diseñados para realzar tu belleza con las últimas tendencias y la máxima calidad profesional.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[450px] w-full rounded-lg" />
            ))
          ) : (
            services.map((service) => (
              <Card key={service.id} className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                  <div className="relative">
                     <Image
                      src={service.imagen || 'https://placehold.co/600x800.png'}
                      alt={service.nombre}
                      width={600}
                      height={400}
                      className="object-cover w-full h-60 group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint="woman hair"
                    />
                    {service.badge && <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">{service.badge}</div>}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold uppercase tracking-wide leading-tight flex-grow">{service.nombre}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{service.descripcion}</p>
                      <div className="mt-4 pt-4 border-t border-dashed">
                        <p className="text-sm text-muted-foreground">Desde</p>
                        <p className="text-2xl font-bold text-primary">{formatPrice(service.precio)}</p>
                      </div>
                      <div className="mt-6">
                        <Link href="/login" className="w-full">
                           <Button variant="outline" className="w-full">Ver más</Button>
                        </Link>
                      </div>
                  </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
