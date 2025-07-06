'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Valeria M.",
    text: "Increíble el nivel de detalle y profesionalismo. Es la primera vez que salgo de una peluquería sintiendo que realmente entendieron lo que quería. ¡El local es hermoso!",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman portrait",
    rating: 5,
  },
  {
    name: "Julieta L.",
    text: "Un lugar increíble con una energía única. Me sentí súper cómoda y el resultado fue espectacular. La ubicación es muy conveniente.",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman smiling",
    rating: 5,
  },
  {
    name: "Carla P.",
    text: "El mejor color que me han hecho en años. Se nota que usan productos de primera calidad. ¡Súper recomendado!",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman happy",
    rating: 5,
  },
]

export default function MapAndReviews() {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Visítanos y Comprobalo
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Estamos en el corazón de La Lucila, en un espacio pensado para tu comodidad y bienestar.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="w-full h-[400px] lg:h-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3288.620095874415!2d-58.48429482342084!3d-34.48722894877233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb16be99e9095%3A0x6191c95e54d35e5d!2sRawson%203688%2C%20B1636AET%20La%20Lucila%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1sen!2sar!4v1718134762514!5m2!1sen!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-2xl shadow-lg"
            ></iframe>
          </div>
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <Card key={index} className="bg-card border border-border/80">
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
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={review.avatar} alt={review.name} data-ai-hint={review.hint} />
                      <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="ml-3 font-semibold text-sm">{review.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
