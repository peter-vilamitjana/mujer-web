import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';

const stats = [
  { value: '+42k', label: 'Reservas gestionadas' },
  { value: '98%', label: 'Satisfacción de clientas' },
  { value: '5.0', label: 'Calificación promedio' },
  { value: 'Free', label: 'Para empezar' },
];

export default function CTABusiness() {
  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <ScrollReveal>
          <div className="bg-[#0F0F0F] dark:bg-[#0A0A0A] rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            
            {/* Glow decorativo */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-16">
              
              {/* Copy */}
              <div className="flex-1 space-y-8">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/30 block mb-6">
                    Para dueños de salones
                  </span>
                  <h2 className="font-vogue text-5xl md:text-7xl text-white leading-[0.9]">
                    Tu salón,<br/>
                    <span className="italic text-brand-accent">redefinido.</span>
                  </h2>
                </div>
                <p className="text-white/50 text-lg font-light leading-relaxed max-w-lg">
                  Sumá tu peluquería a la plataforma. Gestioná turnos, mostrá tus servicios y 
                  conectá con nuevas clientas — todo desde un solo lugar.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/business/register"
                    className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all duration-300"
                  >
                    Sumá tu salón
                  </Link>
                  <Link
                    href="/explore"
                    className="border border-white/20 text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all duration-300"
                  >
                    Ver la plataforma
                  </Link>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 lg:w-80 flex-shrink-0">
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 backdrop-blur-sm"
                  >
                    <span className="font-vogue text-3xl text-white block mb-1">{stat.value}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/30">{stat.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
