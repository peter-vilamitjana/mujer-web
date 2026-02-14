import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const testimonials = [
  {
    name: "Laura G.",
    text: "El trato es increíble y los resultados siempre superan mis expectativas. Carolina es una verdadera artista.",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman portrait"
  },
  {
    name: "Martina S.",
    text: "¡Mi pelo nunca se vio tan sano y brillante! El balayage quedó perfecto, súper natural. ¡Volveré sin dudas!",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman smiling"
  },
  {
    name: "Sofía R.",
    text: "Un ambiente súper relajante y profesional. Salgo renovada cada vez que voy. ¡Lo recomiendo al 100%!",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman happy"
  },
]

export default function Testimonials() {
  return (
    <section id="testimonios" className="relative overflow-hidden border-y border-white/5 bg-black md:bg-black">
      {/* Mobile-only view */}
      <div className="md:hidden relative py-20 bg-[#F2F2F7]/80">
        <ScrollReveal>
          <div className="container mx-auto px-8 text-center flex flex-col items-center">
            <div className="text-primary mb-8">
              <span className="text-6xl font-serif">“</span>
            </div>
            <p className="font-serif text-xl leading-relaxed text-black italic mb-10">
              "{testimonials[1].text}"
            </p>
            <div className="flex flex-col items-center">
              <Avatar className="h-12 w-12 mb-4 border border-primary/20">
                <AvatarImage src={testimonials[1].avatar} alt={testimonials[1].name} />
                <AvatarFallback>{testimonials[1].name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h4 className="font-bold text-sm text-black uppercase tracking-widest">{testimonials[1].name}</h4>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Clienta Frecuente</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Desktop-only view */}
      <div className="hidden md:block relative py-32 sm:py-48">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale brightness-[0.15] scale-105"
          style={{
            backgroundImage: "url('/landing/testimonials-bg.png')",
            backgroundAttachment: 'fixed'
          }}
        />

        {/* Subtle Overlay and Radial Highlight */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />

        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-32">
              <h2 className="font-serif text-4xl md:text-6xl font-extralight tracking-tight text-white/80">
                Lo que dicen nuestras clientas
              </h2>
              <div className="mt-12 w-20 h-[1px] bg-white/10 mx-auto" />
              <p className="mt-10 text-xs text-white/30 font-medium tracking-[0.4em] uppercase">
                Confianza • Estilo • Bienestar
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-24">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="flex flex-col h-full group">
                  <div className="flex items-center mb-10 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-white fill-white mr-2" />
                    ))}
                  </div>

                  <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light tracking-wide flex-1 italic">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center mt-16 pt-12 border-t border-white/[0.03]">
                    <Avatar className="h-10 w-10 grayscale brightness-75 opacity-60 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 transition-all duration-1000">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                      <AvatarFallback className="bg-white/5 text-white/40 font-light text-xs">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-5">
                      <p className="text-white/60 font-light tracking-tight text-sm uppercase">
                        {testimonial.name}
                      </p>
                      <p className="text-[9px] text-white/20 font-medium tracking-[0.3em] uppercase mt-2">
                        Clienta Mujer
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
