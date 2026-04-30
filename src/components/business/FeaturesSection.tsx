import { Check } from 'lucide-react';

const features = [
  { title: 'Agenda online 24/7', description: 'Tus clientas reservan solas, vos no movés un dedo.', free: true },
  { title: 'Perfil público de tu salón', description: 'Tu página propia con servicios, fotos y equipo.', free: true },
  { title: 'Notificaciones por WhatsApp', description: 'Confirmaciones y recordatorios automáticos.', free: true },
  { title: 'Hasta 3 profesionales', description: 'Gestioná el equipo de tu salón.', free: true },
  { title: 'Profesionales ilimitados', description: 'Escalá sin límites a medida que crece tu equipo.', free: false },
  { title: 'Reportes y métricas', description: 'Ingresos, servicios más pedidos, retención de clientas.', free: false },
  { title: 'Cobro online con MercadoPago', description: 'Señas y pagos completos desde la app.', free: false },
  { title: 'CRM de clientas', description: 'Historial técnico, preferencias y métricas por clienta.', free: false },
];

export default function FeaturesSection() {
  return (
    <section className="relative z-10 bg-[#09090b]">
      <div className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
          Todo lo que incluye
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          Herramientas que tu salón necesita
        </h2>
        <p className="text-zinc-500 text-sm mt-3">
          El plan base cubre lo esencial. El premium lo lleva al siguiente nivel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map(({ title, description, free }) => (
          <div
            key={title}
            className={`rounded-2xl p-5 flex items-start gap-4 transition-colors duration-200
              ${free
                ? 'bg-[#141414] border border-white/[0.06] hover:border-white/[0.12]'
                : 'bg-emerald-400/[0.04] border border-emerald-400/[0.12] hover:border-emerald-400/[0.22]'
              }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
              ${free ? 'bg-white/[0.06]' : 'bg-emerald-400/[0.10]'}`}>
              <Check
                className={`w-3.5 h-3.5 ${free ? 'text-zinc-400' : 'text-emerald-400'}`}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-semibold text-white">{title}</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0
                  ${free
                    ? 'bg-white/[0.06] text-zinc-500'
                    : 'bg-emerald-400/[0.10] text-emerald-400 border border-emerald-400/[0.20]'
                  }`}>
                  {free ? 'Gratis' : 'Premium'}
                </span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
