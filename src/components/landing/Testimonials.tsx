import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

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
    <section id="testimonios" className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Lo que dicen nuestras clientas</h2>
          <p className="mt-4 text-lg text-muted-foreground">Tu confianza es nuestro mayor orgullo.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-card-foreground">"{testimonial.text}"</p>
                <div className="flex items-center mt-6">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="ml-4 font-semibold">{testimonial.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
