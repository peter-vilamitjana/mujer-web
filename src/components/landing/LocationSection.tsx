'use client';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import Link from 'next/link';
import type { Tenant } from '@/lib/schema';

interface LocationSectionProps {
  salon: Pick<Tenant, 'name' | 'address' | 'lat' | 'lng'>;
}

// Bounding box alrededor del pin — ~600m de lado, buen nivel de zoom para una dirección puntual.
const BBOX_DELTA = 0.006;

// OSM/Google embeds renderizan su propio mapa claro y brillante — no hay
// key/billing para un estilo dark nativo, así que se invierte con CSS
// (truco estándar cuando no hay Maps API pagada con estilo custom).
const MAP_DARK_FILTER = 'invert hue-rotate-180 brightness-90 contrast-125';

export default function LocationSection({ salon }: LocationSectionProps) {
  const hasCoords = typeof salon.lat === 'number' && typeof salon.lng === 'number';

  const mapEmbedUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${salon.lng! - BBOX_DELTA}%2C${salon.lat! - BBOX_DELTA}%2C${salon.lng! + BBOX_DELTA}%2C${salon.lat! + BBOX_DELTA}&layer=mapnik&marker=${salon.lat}%2C${salon.lng}`
    : salon.address
      ? `https://www.google.com/maps?q=${encodeURIComponent(salon.address)}&output=embed`
      : null;

  // El botón "Cómo llegar" es solo un link saliente (sin API ni billing de por medio),
  // así que conviene mandar a Google Maps: mejor soporte de navegación turn-by-turn en el celular.
  const directionsUrl = salon.address
    ? `https://www.google.com/maps/dir//${encodeURIComponent(salon.address)}`
    : hasCoords
      ? `https://www.google.com/maps/dir//${salon.lat}%2C${salon.lng}`
      : null;

  return (
    <section className="py-20 sm:py-28 bg-surface">
      <div className="container mx-auto px-4">
        {/* Mobile View */}
        <div className="md:hidden">
          <ScrollReveal>
            <h2 className="font-vogue text-3xl font-bold tracking-tight text-on-surface mb-8">Ubicación</h2>
            <div className="rounded-[2.5rem] overflow-hidden bg-surface-card border border-outline-subtle">
              <div className="relative aspect-[4/3] w-full">
                {mapEmbedUrl ? (
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className={MAP_DARK_FILTER}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-sans text-sm text-on-surface-secondary">
                    Ubicación no disponible
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-sans font-bold text-sm text-on-surface">{salon.name}</h3>
                {salon.address && (
                  <p className="font-sans text-xs text-on-surface-secondary mt-1 mb-6">{salon.address}</p>
                )}
                {directionsUrl && (
                  <Link href={directionsUrl} target="_blank" className="w-full inline-block">
                    <Button className="w-full border border-primary/50 text-primary bg-transparent hover:bg-primary/10 rounded-full px-8 py-3 font-sans uppercase tracking-widest text-xs font-medium transition-colors flex items-center justify-center gap-3">
                      <Navigation className="h-4 w-4" />
                      Cómo llegar
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-vogue text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
                Visítanos y Comprobalo
              </h2>
              <p className="font-sans mt-4 text-on-surface-secondary max-w-2xl mx-auto">
                {salon.address
                  ? `Te esperamos en ${salon.address}, en un espacio pensado para tu comodidad y bienestar.`
                  : 'Un espacio pensado para tu comodidad y bienestar.'}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal className="max-w-4xl mx-auto">
            <div className="rounded-[2.5rem] overflow-hidden bg-surface-card border border-outline-subtle hover:border-outline transition-colors duration-500">
              <div className="relative group h-[400px]">
                {mapEmbedUrl ? (
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className={`${MAP_DARK_FILTER} transition-all duration-1000 ease-in-out`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-sans text-sm text-on-surface-secondary">
                    Ubicación no disponible
                  </div>
                )}
                {salon.address && (
                  <div className="absolute top-6 left-6 z-10">
                    <div className="bg-surface-card/80 backdrop-blur-xl border border-outline-subtle px-5 py-2.5 rounded-full flex items-center gap-2 group-hover:bg-surface-card/95 transition-all duration-500">
                      <div className="bg-primary/20 p-1.5 rounded-full">
                        <MapPin className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <span className="font-sans text-xs font-bold uppercase tracking-widest text-on-surface opacity-90">{salon.address}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h3 className="font-vogue text-xl text-on-surface">{salon.name}</h3>
                  {salon.address && (
                    <p className="font-sans text-sm text-on-surface-secondary mt-1">{salon.address}</p>
                  )}
                </div>
                {directionsUrl && (
                  <Link href={directionsUrl} target="_blank" className="shrink-0">
                    <Button className="border border-primary/50 text-primary bg-transparent hover:bg-primary/10 rounded-full px-8 py-3 font-sans uppercase tracking-widest text-xs font-medium transition-colors flex items-center justify-center gap-3">
                      <Navigation className="h-4 w-4" />
                      Cómo llegar
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
