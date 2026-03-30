import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-brand-bg pb-32">
      <div className="absolute inset-0 z-0">
        <img 
          alt="Dramatic Lifestyle" 
          className="w-full h-full object-cover object-center scale-105 
                     brightness-[0.65] contrast-[1.05]
                     dark:brightness-[0.65] dark:contrast-[1.05]
                     transition-all duration-1000 ease-in-out" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjS9LSsGTPztQ9TCUsdN8xwWCiNJFUWAnLy5UEvWNIFarfFXo-7NKfdu8AoD2AqIlaB9O9zr__02G2eCSCxbmxnAMCpfJqTaRd6qqLEBxV8D9Z3tMBhLRjU_CJlO_wiFsHvWR0LQM6IAGZQljwE7QUXvXg-WY_XRiquIX1MU7pBcr9VTKOKv1K3Ubmy5j91LNPmfX3qq-LqEti5GU93_GOR3qflFnXP0TBMSpFA9PeDHOaL9-fz2EoGU06tmJPAy-AGff8hkVWd6wz"
        />
        {/* Cross-fade overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40 opacity-100 dark:opacity-0 transition-opacity duration-1000 ease-in-out z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/85 opacity-0 dark:opacity-100 transition-opacity duration-1000 ease-in-out z-0"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-7xl px-6">
        <p className="text-[9px] uppercase tracking-[1.2em] mb-10 opacity-70 font-medium text-white/90">
          Innovation Meets High Aesthetic
        </p>
        <h2 className="font-vogue hero-title italic text-white text-center transition-colors duration-500">
          La Nouvelle <br/>
          <span className="not-italic text-white transition-colors duration-500">Présence</span>
        </h2>
        <div className="mt-12 flex flex-col items-center">
          <p className="text-white/60 text-[10px] md:text-[11px] font-light tracking-[0.5em] uppercase max-w-md leading-relaxed">
            Redefiniendo el santuario del bienestar moderno con precisión absoluta.
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[900px] px-6 z-20">
        <div className="liquid-glass rounded-full p-2 flex flex-col md:flex-row items-center theme-transition">
          <div className="flex-[1.2] flex items-center px-8 py-4 w-full">
            <Search className="text-brand-primary/30 mr-4 w-5 h-5 font-light" />
            <input 
              className="w-full bg-transparent border-none text-brand-primary placeholder-brand-primary/20 text-[10px] tracking-[0.3em] uppercase no-ring p-0 font-medium focus:ring-0" 
              placeholder="QUÉ BUSCAS" 
              type="text"
            />
          </div>
          <div className="hidden md:block w-px h-10 bg-glass-border"></div>
          <div className="flex-1 flex items-center px-8 py-4 w-full">
            <MapPin className="text-brand-primary/30 mr-4 w-5 h-5 font-light" />
            <input 
              className="w-full bg-transparent border-none text-brand-primary placeholder-brand-primary/20 text-[10px] tracking-[0.3em] uppercase no-ring p-0 font-medium focus:ring-0 transition-colors theme-transition" 
              placeholder="UBICACIÓN" 
              type="text"
            />
          </div>
          <Link 
            href="/login" 
            className="w-full md:w-auto text-center 
                       bg-white text-black hover:bg-zinc-200
                       dark:bg-white dark:text-black dark:hover:bg-zinc-200
                       px-12 py-5 rounded-full text-[10px] font-black tracking-[0.3em] uppercase transition-all duration-500 font-inter theme-transition"
          >
            RESERVAR
          </Link>
        </div>
      </div>
    </section>
  );
}
