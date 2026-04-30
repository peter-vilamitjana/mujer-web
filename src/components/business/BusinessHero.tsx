'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollVideoHero from './ScrollVideoHero';

export default function BusinessHero() {
  return (
    <ScrollVideoHero
      totalFrames={96}
      framesPath="/frames/studio-display"
    >
      <div className="w-full text-center px-6 pb-4 pointer-events-auto">
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <p className="text-[10px] text-emerald-400 uppercase tracking-[0.5em] font-bold">
            Ouleeh para Negocios
          </p>
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        </div>

        <h1 className="font-playfair text-5xl md:text-7xl text-white leading-tight tracking-tight mb-5 max-w-4xl mx-auto drop-shadow-2xl">
          Tu salón,{' '}
          <span className="italic text-emerald-400">sin el caos.</span>
        </h1>

        <p className="text-zinc-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8 drop-shadow-lg">
          Agenda inteligente, clientes fidelizados y cobros simples —
          todo en una plataforma diseñada para salones de Argentina.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/business/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-950
              font-black text-[12px] uppercase tracking-widest rounded-full
              hover:bg-zinc-100 active:scale-[0.98] transition-colors duration-200
              cursor-pointer focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-white/60 min-h-[44px]"
          >
            Empezar gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/[0.20]
              text-zinc-300 font-semibold text-[12px] uppercase tracking-widest rounded-full
              hover:border-white/[0.45] hover:text-white transition-colors duration-200
              backdrop-blur-sm cursor-pointer focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-white/30 min-h-[44px]"
          >
            Ver cómo funciona
          </a>
        </div>

        <p className="text-zinc-500 text-xs mt-6 tracking-wide">
          Gratis para siempre en el plan base · Sin tarjeta de crédito
        </p>
      </div>
    </ScrollVideoHero>
  );
}
