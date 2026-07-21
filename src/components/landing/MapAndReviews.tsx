'use client';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Navigation } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import Link from 'next/link';
import type { Tenant } from '@/lib/schema';
import type { ReviewData } from '@/actions/reviews.actions';

interface MapAndReviewsProps {
  salon: Pick<Tenant, 'name' | 'address' | 'lat' | 'lng'>;
  reviews: ReviewData[];
}

// Bounding box alrededor del pin — ~600m de lado, buen nivel de zoom para una dirección puntual.
const BBOX_DELTA = 0.006;

export default function MapAndReviews({ salon, reviews }: MapAndReviewsProps) {
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
            {mapEmbedUrl ? (
              <div className="relative aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden border border-outline-subtle mb-6">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-outline-subtle p-8 text-center font-sans text-sm text-on-surface-secondary mb-6">
                Ubicación no disponible
              </div>
            )}
            <div className="mb-8">
              <h3 className="font-sans font-bold text-sm text-on-surface">{salon.name}</h3>
              {salon.address && (
                <p className="font-sans text-xs text-on-surface-secondary mt-1">{salon.address}</p>
              )}
            </div>
            {directionsUrl && (
              <Link href={directionsUrl} target="_blank" className="w-full inline-block">
                <Button className="w-full bg-primary hover:bg-primary-dark text-surface rounded-full py-7 font-sans text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                  <Navigation className="h-4 w-4" />
                  CÓMO LLEGAR
                </Button>
              </Link>
            )}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <ScrollReveal direction="right" className="w-full min-h-[450px]">
              <div className="relative group h-full rounded-[2.5rem] overflow-hidden border border-outline-subtle hover:border-outline transition-all duration-700">
                {mapEmbedUrl ? (
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="transition-all duration-1000 ease-in-out"
                  />
                ) : (
                  <div className="w-full h-full min-h-[450px] flex items-center justify-center font-sans text-sm text-on-surface-secondary">
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
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-outline-subtle rounded-[2.5rem]" />
              </div>
            </ScrollReveal>
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.slice(0, 3).map((review, index) => (
                  <ScrollReveal key={review.id} delay={index * 0.1} direction="left">
                    <Card className="bg-surface-card border border-outline-subtle hover:border-outline transition-all duration-300 hover:translate-y-[-4px]">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < review.rating ? 'text-primary fill-primary' : 'text-on-surface-variant/30 fill-transparent'}`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="font-sans text-on-surface italic">"{review.comment}"</p>
                        )}
                        <div className="flex items-center mt-4">
                          <Avatar className="h-9 w-9 ring-1 ring-outline-subtle">
                            <AvatarFallback>{review.clientName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="font-sans ml-3 font-semibold text-sm text-on-surface">{review.clientName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))
              ) : (
                <p className="font-sans text-on-surface-secondary text-sm">
                  Este salón todavía no tiene reseñas.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
