import { ArrowUpRight } from 'lucide-react';

export default function ColeccionCurada() {
  return (
    <section className="py-48 bg-brand-bg">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-32 border-b border-glass-border pb-16">
          <div className="max-w-2xl">
            <h3 className="font-vogue text-7xl md:text-9xl italic leading-none mb-8 text-brand-primary">
              Colección <br/>
              <span className="not-italic font-black text-brand-primary/20">Curada</span>
            </h3>
            <p className="text-brand-primary/40 text-[11px] tracking-[0.5em] uppercase font-bold font-inter">
              Un manifiesto de exclusividad y rigor estético.
            </p>
          </div>
          <a className="text-[10px] font-black tracking-[0.4em] uppercase border-b-2 border-brand-primary pb-1 hover:opacity-50 transition-all mt-10 md:mt-0 text-brand-primary font-inter" href="#">VER TODO</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-32 items-start">
          <article className="md:col-span-7 flex flex-col">
            <div className="editorial-image-container aspect-[4/5] mb-12">
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
            </div>
            <div className="flex flex-col max-w-md">
              <span className="text-[9px] tracking-[0.5em] uppercase text-brand-primary/30 font-bold mb-4 font-inter">Architecture • 01</span>
              <h4 className="font-vogue text-5xl mb-6 italic text-brand-primary">L'Aura Santuaire</h4>
              <p className="text-brand-primary/40 text-sm leading-relaxed font-light mb-8 font-inter">Un espacio donde el minimalismo se encuentra con la espiritualidad. Diseño de vanguardia en el corazón de la ciudad.</p>
              <div className="flex items-center gap-4 border-t border-glass-border pt-6">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-brand-primary font-inter">Polanco</span>
                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-brand-primary/50 font-inter">Curated</span>
              </div>
            </div>
          </article>
          
          <article className="md:col-span-5 flex flex-col md:mt-48">
            <div className="editorial-image-container aspect-[3/4] mb-12">
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] tracking-[0.5em] uppercase text-brand-primary/30 font-bold mb-4 font-inter">Therapy • 02</span>
              <h4 className="font-vogue text-5xl mb-6 italic text-brand-primary">Lumina Ritual</h4>
              <p className="text-brand-primary/40 text-sm leading-relaxed font-light mb-8 font-inter">Rituales de luz y sombra que redefinen la experiencia sensorial del bienestar clásico.</p>
              <div className="flex items-center gap-4 border-t border-glass-border pt-6">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-brand-primary font-inter">Roma Norte</span>
              </div>
            </div>
          </article>
          
          <article className="md:col-span-8 md:col-start-3 flex flex-col md:mt-32">
            <div className="editorial-image-container aspect-[16/9] mb-12">
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
            </div>
            <div className="flex justify-between items-start">
              <div className="max-w-md">
                <span className="text-[9px] tracking-[0.5em] uppercase text-brand-primary/30 font-bold mb-4 font-inter">Nature • 03</span>
                <h4 className="font-vogue text-5xl mb-4 italic text-brand-primary">Botanica</h4>
                <p className="text-brand-primary/40 text-sm font-light font-inter">L'essence de la pureté organique.</p>
              </div>
              <button aria-label="Ver Botanica" className="border border-glass-border hover:bg-brand-primary hover:text-brand-accent dark:hover:text-black transition-all rounded-full p-6 text-brand-primary group flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 font-light group-hover:text-brand-accent dark:group-hover:text-black" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
