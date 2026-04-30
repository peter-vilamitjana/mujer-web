import { MessageCircle, Calendar, DollarSign, UserX, Clock, Phone } from 'lucide-react';

const pains = [
  {
    icon: MessageCircle,
    pain: '"Seño, ¿me das turno para el viernes?"',
    description: 'Confirmaciones por WhatsApp que se pierden entre mensajes.',
  },
  {
    icon: Calendar,
    pain: 'Doble turno a la misma hora',
    description: 'Sin sistema, los errores de agenda son inevitables y te hacen quedar mal.',
  },
  {
    icon: DollarSign,
    pain: '¿Cuánto gané este mes?',
    description: 'Sin registros claros, no sabés si tu negocio crece o se estanca.',
  },
  {
    icon: UserX,
    pain: 'Clientas que no vuelven',
    description: 'Sin seguimiento, perdés clientas que simplemente se olvidaron de volver.',
  },
  {
    icon: Clock,
    pain: 'Horas perdidas en admin',
    description: 'Tiempo que podrías dedicar a tu trabajo lo gastás organizando.',
  },
  {
    icon: Phone,
    pain: 'Tu teléfono nunca para',
    description: 'Llamadas para reservar en medio de un servicio. Interrupciones constantes.',
  },
];

export default function DolorSection() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold mb-3">
          El problema
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          ¿Te suena familiar?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pains.map(({ icon: Icon, pain, description }) => (
          <div
            key={pain}
            className="rounded-2xl bg-[#141414] border border-white/[0.06] p-6
              hover:border-white/[0.10] transition-all duration-300"
          >
            <div className="w-9 h-9 rounded-xl bg-red-400/[0.08] border border-red-400/[0.15]
              flex items-center justify-center mb-4">
              <Icon className="w-4 h-4 text-red-400" />
            </div>
            <p className="font-playfair text-base text-white italic mb-2">&ldquo;{pain}&rdquo;</p>
            <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
