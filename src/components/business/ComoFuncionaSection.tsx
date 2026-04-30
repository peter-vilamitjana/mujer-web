import { Store, Share2, LayoutDashboard } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Creá tu perfil',
    description: 'Registrá tu salón en 5 minutos. Cargá tus servicios, tu equipo y tus horarios.',
    icon: Store,
  },
  {
    step: '02',
    title: 'Compartí tu link',
    description: 'Cada salón tiene su página propia. Compartila por WhatsApp e Instagram.',
    icon: Share2,
  },
  {
    step: '03',
    title: 'Gestioná todo acá',
    description: 'Tu agenda, tus clientes y tus cobros — en un solo lugar, desde cualquier dispositivo.',
    icon: LayoutDashboard,
  },
];

export default function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="py-24 px-6 max-w-4xl mx-auto scroll-mt-20">
      <div className="text-center mb-16">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mb-3">
          Simple por diseño
        </p>
        <h2 className="font-playfair text-4xl text-white italic">
          En 3 pasos, tu salón online
        </h2>
        <p className="text-zinc-500 text-sm mt-3">
          Sin configuraciones complicadas. Sin soporte técnico necesario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Línea conectora — solo desktop */}
        <div
          className="hidden md:block absolute top-10 h-px bg-gradient-to-r
            from-transparent via-white/[0.10] to-transparent"
          style={{ left: 'calc(16.6% + 2.5rem)', right: 'calc(16.6% + 2.5rem)' }}
        />

        {steps.map(({ step, title, description, icon: Icon }) => (
          <div key={step} className="flex flex-col items-center text-center relative">
            <div className="w-20 h-20 rounded-2xl bg-[#141414] border border-white/[0.08]
              flex flex-col items-center justify-center mb-5 relative z-10
              hover:border-emerald-400/[0.20] transition-colors duration-200">
              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-bold">
                Paso
              </p>
              <p className="font-playfair text-3xl text-white italic">{step}</p>
            </div>
            <Icon className="w-5 h-5 text-emerald-400 mb-3" aria-hidden="true" />
            <h3 className="font-playfair text-xl text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-[200px] mx-auto">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
