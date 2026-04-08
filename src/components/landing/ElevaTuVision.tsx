import { ArrowRight } from 'lucide-react';

export default function ElevaTuVision() {
  return (
    <section className="relative bg-brand-surface text-brand-primary py-60 border-t border-glass-border overflow-hidden transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-24 grid grid-cols-1 md:grid-cols-2 items-center gap-32">
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.7em] font-black mb-12 text-brand-primary/40 font-inter">Membresía Exclusiva</p>
          <h3 className="font-vogue text-7xl md:text-9xl italic leading-[0.85] mb-16 text-brand-primary">
            Eleva tu <br/>
            <span className="not-italic text-brand-primary">Vision</span>
          </h3>
          <p className="text-lg font-light leading-relaxed mb-16 max-w-md text-brand-primary/50 italic font-vogue">
            "La elegancia es la única belleza que nunca se desvanece." — Un espacio para los creadores del mañana.
          </p>
          <button className="bg-brand-primary text-brand-accent dark:text-black px-16 py-6 rounded-full text-[10px] font-black tracking-[0.4em] uppercase hover:opacity-90 transition-all flex items-center gap-6 group font-inter">
            SOLICITAR INGRESO
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform font-light" />
          </button>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] w-full bg-background overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          </div>
          <div className="absolute -top-10 -right-10 w-48 h-px bg-glass-border hidden lg:block"></div>
          <div className="absolute -top-10 -right-10 w-px h-48 bg-glass-border hidden lg:block"></div>
        </div>
      </div>
    </section>
  );
}
