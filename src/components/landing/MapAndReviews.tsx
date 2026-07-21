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
  salon: Pick<Tenant, 'name' | 'address'>;
  reviews: ReviewData[];
}

export default function MapAndReviews({ salon, reviews }: MapAndReviewsProps) {
  const mapEmbedUrl = salon.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(salon.address)}&output=embed`
    : null;

  const directionsUrl = salon.address
    ? `https://www.google.com/maps/dir//${encodeURIComponent(salon.address)}`
    : null;

  return (
    <section className="py-20 sm:py-28 bg-white md:bg-background">
      <div className="container mx-auto px-4">
        {/* Mobile View */}
        <div className="md:hidden">
          <ScrollReveal>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground mb-8">Ubicación</h2>
            {mapEmbedUrl ? (
              <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden border border-black/5 shadow-xl mb-6">
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
              <div className="rounded-[2rem] border border-black/5 p-8 text-center text-sm text-muted-foreground mb-6">
                Ubicación no disponible
              </div>
            )}
            <div className="mb-8">
              <h3 className="font-bold text-sm text-black">{salon.name}</h3>
              {salon.address && (
                <p className="text-xs text-muted-foreground mt-1">{salon.address}</p>
              )}
            </div>
            {directionsUrl && (
              <Link href={directionsUrl} target="_blank" className="w-full inline-block">
                <Button className="w-full bg-[#9D6EFE] hover:bg-[#8B5CF6] text-white rounded-full py-7 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3">
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
              <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Visítanos y Comprobalo
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                {salon.address
                  ? `Te esperamos en ${salon.address}, en un espacio pensado para tu comodidad y bienestar.`
                  : 'Un espacio pensado para tu comodidad y bienestar.'}
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <ScrollReveal direction="right" className="w-full min-h-[450px]">
              <div className="relative group h-full rounded-3xl overflow-hidden border border-border/50 shadow-2xl transition-all duration-700 hover:shadow-primary/10">
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
                  <div className="w-full h-full min-h-[450px] flex items-center justify-center text-sm text-muted-foreground">
                    Ubicación no disponible
                  </div>
                )}
                {salon.address && (
                  <div className="absolute top-6 left-6 z-10">
                    <div className="bg-background/80 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 group-hover:bg-background/95 transition-all duration-500">
                      <div className="bg-primary/20 p-1.5 rounded-full">
                        <MapPin className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-90">{salon.address}</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl" />
              </div>
            </ScrollReveal>
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.slice(0, 3).map((review, index) => (
                  <ScrollReveal key={review.id} delay={index * 0.1} direction="left">
                    <Card className="bg-card border border-border/80 hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px]">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-card-foreground italic">"{review.comment}"</p>
                        )}
                        <div className="flex items-center mt-4">
                          <Avatar className="h-9 w-9 ring-1 ring-border">
                            <AvatarFallback>{review.clientName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="ml-3 font-semibold text-sm">{review.clientName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
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
