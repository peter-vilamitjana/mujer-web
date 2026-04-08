'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Navigation } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import Link from 'next/link';

const reviews = [
  {
    name: "Valeria M.",
    text: "Increíble el nivel de detalle y profesionalismo. Es la primera vez que salgo de una peluquería sintiendo que realmente entendieron lo que quería. ¡El local es hermoso!",
    avatar: "",
    hint: "woman portrait",
    rating: 5,
  },
  {
    name: "Julieta L.",
    text: "Un lugar increíble con una energía única. Me sentí súper cómoda y el resultado fue espectacular. La ubicación es muy conveniente.",
    avatar: "",
    hint: "woman smiling",
    rating: 5,
  },
  {
    name: "Carla P.",
    text: "El mejor color que me han hecho en años. Se nota que usan productos de primera calidad. ¡Súper recomendado!",
    avatar: "",
    hint: "woman happy",
    rating: 5,
  },
]

export default function MapAndReviews() {
  return (
    <section className="py-20 sm:py-28 bg-white md:bg-background">
      <div className="container mx-auto px-4">
        {/* Mobile View */}
        <div className="md:hidden">
          <ScrollReveal>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground mb-8">Ubicación</h2>
            <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden border border-black/5 shadow-xl mb-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10962.61053075249!2d-58.491372551465245!3d-34.48866753040445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb16be99e9095%3A0x6191c95e54d35e5d!2sGuillermo%20Rawson%203688%2C%20B1636%20La%20Lucila%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1sen!2sar!4v1718134762514!5m2!1sen!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className=""
              />
            </div>
            <div className="mb-8">
              <h3 className="font-bold text-sm text-black">MUJER Studio</h3>
              <p className="text-xs text-muted-foreground mt-1">Guillermo Rawson 3688, La Lucila.</p>
            </div>
            <Link href="https://www.google.com/maps/dir//Guillermo+Rawson+3688,+B1636+La+Lucila,+Provincia+de+Buenos+Aires/@-34.4886675,-58.4913726,15z" target="_blank" className="w-full inline-block">
              <Button className="w-full bg-[#9D6EFE] hover:bg-[#8B5CF6] text-white rounded-full py-7 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                <Navigation className="h-4 w-4" />
                CÓMO LLEGAR
              </Button>
            </Link>
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
                Estamos en el corazón de La Lucila, en un espacio pensado para tu comodidad y bienestar.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <ScrollReveal direction="right" className="w-full min-h-[450px]">
              <div className="relative group h-full rounded-3xl overflow-hidden border border-border/50 shadow-2xl transition-all duration-700 hover:shadow-primary/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10962.61053075249!2d-58.491372551465245!3d-34.48866753040445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb16be99e9095%3A0x6191c95e54d35e5d!2sGuillermo%20Rawson%203688%2C%20B1636%20La%20Lucila%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1sen!2sar!4v1718134762514!5m2!1sen!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="transition-all duration-1000 ease-in-out"
                />
                <div className="absolute top-6 left-6 z-10">
                  <div className="bg-background/80 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 group-hover:bg-background/95 transition-all duration-500">
                    <div className="bg-primary/20 p-1.5 rounded-full">
                      <MapPin className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-90">Guillermo Rawson 3688, La Lucila</span>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl" />
              </div>
            </ScrollReveal>
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <ScrollReveal key={index} delay={index * 0.1} direction="left">
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
                      <p className="text-card-foreground italic">"{review.text}"</p>
                      <div className="flex items-center mt-4">
                        <Avatar className="h-9 w-9 ring-1 ring-border">
                          <AvatarImage src={review.avatar} alt={review.name} data-ai-hint={review.hint} />
                          <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="ml-3 font-semibold text-sm">{review.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
