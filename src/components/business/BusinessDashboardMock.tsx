"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const weekData = [
  { label: 'LUN', height: 40, value: '$12k' },
  { label: 'MAR', height: 62, value: '$18k' },
  { label: 'MIE', height: 32, value: '$9k' },
  { label: 'JUE', height: 100, value: '$29k', highlight: true },
  { label: 'VIE', height: 58, value: '$17k' },
  { label: 'SAB', height: 75, value: '$22k' },
  { label: 'DOM', height: 44, value: '$13k' },
];

export default function BusinessDashboardMock() {
  return (
    <section className="bg-white dark:bg-[#050505] overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="mb-8">
            <span className="text-[9px] uppercase tracking-[0.4em] text-[#0a0a0a]/35 dark:text-white/25 font-inter block mb-4">
              La experiencia
            </span>
            <h2 className="font-playfair text-5xl md:text-6xl text-[#0a0a0a] dark:text-white mb-4">
              Minimalismo funcional.
            </h2>
            <p className="text-[#0a0a0a]/50 dark:text-white/35 font-light font-inter max-w-md mx-auto text-sm leading-relaxed">
              Una interfaz que desaparece para dejar que tu trabajo brille.
            </p>
          </div>
        }
      >
        <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0d0d0d]">
          <img 
            src="/landing/dashboard-preview.png?v=2" 
            alt="Dashboard Profesional" 
            className="w-full h-full object-cover object-top opacity-90 transition-opacity duration-500 hover:opacity-100"
          />
        </div>
      </ContainerScroll>
    </section>
  );
}
