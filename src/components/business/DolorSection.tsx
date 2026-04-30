import { MessageCircle, Calendar, DollarSign, UserX, Clock, Phone } from 'lucide-react';

const pains = [
  {
    icon: MessageCircle,
    quote: 'Seño, ¿me das turno para el viernes?',
    description: 'Confirmaciones por WhatsApp que se pierden entre mensajes.',
  },
  {
    icon: Calendar,
    quote: 'Metí dos clientas a la misma hora... de nuevo.',
    description: 'Sin sistema centralizado, los errores de agenda son inevitables.',
  },
  {
    icon: DollarSign,
    quote: '¿Cuánto gané este mes? No tengo idea.',
    description: 'Sin registros claros, no sabés si tu negocio crece o se estanca.',
  },
  {
    icon: UserX,
    quote: 'Se fue y nunca más llamó. ¿Qué hice mal?',
    description: 'Sin seguimiento, perdés clientas que simplemente se olvidaron de volver.',
  },
  {
    icon: Clock,
    quote: 'Hoy perdí dos horas solo ordenando turnos.',
    description: 'Tiempo que podrías dedicar a tu trabajo lo gastás en administración.',
  },
  {
    icon: Phone,
    quote: 'Me llamaron en pleno tinturado. La tercera vez hoy.',
    description: 'Interrupciones constantes que afectan la calidad de tu servicio.',
  },
];

export default function DolorSection() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
          El problema
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          ¿Te suena familiar?
        </h2>
        <p className="text-zinc-500 text-sm mt-3 max-w-md mx-auto">
          Cada dueña de salón pasa por esto. No tenés que seguir así.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pains.map(({ icon: Icon, quote, description }) => (
          <div
            key={quote}
            className="rounded-2xl bg-[#141414] border border-white/[0.06] p-6
              hover:border-red-400/[0.15] hover:bg-[#181414] transition-colors duration-200"
          >
            <div className="w-9 h-9 rounded-xl bg-red-400/[0.08] border border-red-400/[0.15]
              flex items-center justify-center mb-4 shrink-0">
              <Icon className="w-4 h-4 text-red-400" aria-hidden="true" />
            </div>
            <p className="font-playfair text-base text-white italic leading-snug mb-2">
              &ldquo;{quote}&rdquo;
            </p>
            <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
