'use client';
import { CreditCard, MapPin, Percent, Phone } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const infoItems = [
  {
    icon: CreditCard,
    title: 'Pagá online',
    description: 'Reservá tu turno de forma segura.',
  },
  {
    icon: Percent,
    title: '¡Promos!',
    description: 'Conocé nuestras ofertas especiales.',
  },
  {
    icon: MapPin,
    title: 'Ubicación',
    description: 'Guillermo Rawson 3688, La Lucila',
  },
  {
    icon: Phone,
    title: 'Línea directa',
    description: '(011) 1234-5678',
  },
];

export default function InfoBar() {
  return (
    <section className="bg-background py-8 border-y">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left justify-items-center">
          {infoItems.map((item, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="flex flex-col md:flex-row items-center gap-4 group cursor-default">
                <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground uppercase tracking-wider text-sm transition-colors duration-300 group-hover:text-primary">{item.title}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-70">{item.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
