import { CreditCard, MapPin, Percent, Phone } from 'lucide-react';

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
    description: 'Av. Siempre Viva 123, Springfield',
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
            <div key={index} className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
