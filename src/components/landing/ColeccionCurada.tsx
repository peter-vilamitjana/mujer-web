import { ArrowUpRight } from 'lucide-react';

export default function ColeccionCurada() {
  return (
    <section className="py-48 bg-black">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-32 border-b border-white/5 pb-16">
          <div className="max-w-2xl">
            <h3 className="font-vogue text-7xl md:text-9xl italic leading-none mb-8 text-white">
              Colección <br/>
              <span className="not-italic font-black text-white/20">Curada</span>
            </h3>
            <p className="text-white/40 text-[11px] tracking-[0.5em] uppercase font-bold font-inter">
              Un manifiesto de exclusividad y rigor estético.
            </p>
          </div>
          <a className="text-[10px] font-black tracking-[0.4em] uppercase border-b-2 border-white pb-1 hover:opacity-50 transition-all mt-10 md:mt-0 text-white font-inter" href="#">VER TODO</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-32 items-start">
          <article className="md:col-span-7 flex flex-col">
            <div className="editorial-image-container aspect-[4/5] mb-12">
              {/* TODO: reemplazar con next/image y assets propios */}
              <img 
                alt="Atelier I" 
                className="w-full h-full object-cover editorial-image" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAeh3_-2lKcPyRDVcrg0qVwOXB-xpYLxdIigYwK6lApIgM0qoOebI-4Ctvaz290akOaKbM_nyzUloybTZgn5gKNhdeYiAJwkyMSTgbgv-l_oJUZTtiDEXJT0deBs4IBwkVHlzRbuwI9HllbfJPXjC1oj7Pxl940ehzaLC4EQgniT1uByFWAfT5eJy1yqj5a9mcHyDTay-txodLjpVnrXMyrE3B079nSgVWwyH2HuyIr1i9rp9huz1u1G2xDd1qs8z_oNjeS1dx97p3"
              />
            </div>
            <div className="flex flex-col max-w-md">
              <span className="text-[9px] tracking-[0.5em] uppercase text-white/30 font-bold mb-4 font-inter">Architecture • 01</span>
              <h4 className="font-vogue text-5xl mb-6 italic text-white">L'Aura Santuaire</h4>
              <p className="text-white/40 text-sm leading-relaxed font-light mb-8 font-inter">Un espacio donde el minimalismo se encuentra con la espiritualidad. Diseño de vanguardia en el corazón de la ciudad.</p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white font-inter">Polanco</span>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/50 font-inter">Curated</span>
              </div>
            </div>
          </article>
          
          <article className="md:col-span-5 flex flex-col md:mt-48">
            <div className="editorial-image-container aspect-[3/4] mb-12">
              {/* TODO: reemplazar con next/image y assets propios */}
              <img 
                alt="Atelier II" 
                className="w-full h-full object-cover editorial-image" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAz2fdTEMJFxHq7ybQmaYq11tmA_ZWyzQ-Sj01xOfi0-W9caktCRAgQLtbg-ENJay-ByB1xkVigns06YgX9NsajU5oAR9ommn7iDD7mCJBKxwRjdIyksNxbKBUIiSacrvYvD4ifYZhtoFvW6LRI4_2ozoKL_e4i1-7KwlHRDavYlXlEnPC9EZEDXDEtA-EWntOqkFkzsTt-2bYu7zGSjdXCFOneSZ9i_G_KDmiJ9gzVKSGW4acKWnwDAXHsshCoKfxbBxw0xtBALdb"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] tracking-[0.5em] uppercase text-white/30 font-bold mb-4 font-inter">Therapy • 02</span>
              <h4 className="font-vogue text-5xl mb-6 italic text-white">Lumina Ritual</h4>
              <p className="text-white/40 text-sm leading-relaxed font-light mb-8 font-inter">Rituales de luz y sombra que redefinen la experiencia sensorial del bienestar clásico.</p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white font-inter">Roma Norte</span>
              </div>
            </div>
          </article>
          
          <article className="md:col-span-8 md:col-start-3 flex flex-col md:mt-32">
            <div className="editorial-image-container aspect-[16/9] mb-12">
              {/* TODO: reemplazar con next/image y assets propios */}
              <img 
                alt="Atelier III" 
                className="w-full h-full object-cover editorial-image" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC99viM6uZI_VKe21zb6UxSIAMN_4RtTd-4s7u8B7Vt0pHL8_SOURAZkMYHzD-8YVwgkDI6M5P5Ot2LgE5XLxDtVnohHUMXhYsIlMQN1wwJagB-zlt3TEaSlg0jZ7dvaQB6ZFLkDWtdE7xyud3UqVU96bAS_ozbVaSjtYjtA-HhDzYjZJrqGBIVA0uCXZLmHe5Y6OlOu1cM19jDgqvy7M3EeVL1tjoqdMNTAz447DgshcWbebX12n_i6Sc9QVc-K28sEYOZxafU9F_V"
              />
            </div>
            <div className="flex justify-between items-start">
              <div className="max-w-md">
                <span className="text-[9px] tracking-[0.5em] uppercase text-white/30 font-bold mb-4 font-inter">Nature • 03</span>
                <h4 className="font-vogue text-5xl mb-4 italic text-white">Botanica</h4>
                <p className="text-white/40 text-sm font-light font-inter">L'essence de la pureté organique.</p>
              </div>
              <button aria-label="Ver Botanica" className="border border-white/20 hover:bg-white hover:text-black transition-all rounded-full p-6 text-white group flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 font-light group-hover:text-black" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
