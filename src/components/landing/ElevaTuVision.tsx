import { ArrowRight } from 'lucide-react';

export default function ElevaTuVision() {
  return (
    <section className="relative bg-zinc-950 text-white py-60 border-t border-white/5 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-24 grid grid-cols-1 md:grid-cols-2 items-center gap-32">
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.7em] font-black mb-12 opacity-40 font-inter">Membresía Exclusiva</p>
          <h3 className="font-vogue text-7xl md:text-9xl italic leading-[0.85] mb-16 text-white">
            Eleva tu <br/>
            <span className="not-italic text-white">Vision</span>
          </h3>
          <p className="text-lg font-light leading-relaxed mb-16 max-w-md text-white/50 italic font-vogue">
            "La elegancia es la única belleza que nunca se desvanece." — Un espacio para los creadores del mañana.
          </p>
          <button className="bg-white text-black px-16 py-6 rounded-full text-[10px] font-black tracking-[0.4em] uppercase hover:bg-zinc-200 transition-all flex items-center gap-6 group font-inter">
            SOLICITAR INGRESO
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform font-light" />
          </button>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] w-full bg-zinc-900 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
            {/* TODO: reemplazar con next/image y assets propios */}
            <img 
                alt="Luxury Studio" 
                className="w-full h-full object-cover filter contrast-125 brightness-75" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSbVLGSgUMjLAerCCq9Iri4qRgQfoIIQAs9QPddcskX_1NQjt9HIagO_878eclOgdcA2q3r8eMf4HTtQeCGqmBZOXY0w-WYpLTaspBJjzAvjWRTPV_uusOtHb31_IbS4V1btydpx9ffGSKThuG3e-URNRTsHr1LGOCA_fbdCzyR8RIUYefkEsow5tF1RI2h-Td2Oi_Nr4x0FyLitF2drEX4oUZcd5OUkJ_qUwU2IhRV6KT3LXKpqxJUYLOmXy25pynp6m-pDW8ogpb"
            />
          </div>
          <div className="absolute -top-10 -right-10 w-48 h-px bg-white/20 hidden lg:block"></div>
          <div className="absolute -top-10 -right-10 w-px h-48 bg-white/20 hidden lg:block"></div>
        </div>
      </div>
    </section>
  );
}
