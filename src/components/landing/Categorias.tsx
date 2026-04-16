'use client';
import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';
import {
  Scissors, Palette, Sparkles, Hand, Brush
} from 'lucide-react';

const categorias = [
  {
    icon: Scissors,
    label: 'Corte & Estilo',
    count: '12+ salones',
    href: '/explore?categoria=corte',
    color: '#fda4af', // Rose
  },
  {
    icon: Palette,
    label: 'Color',
    count: '8+ salones',
    href: '/explore?categoria=color',
    color: '#c084fc', // Iris
  },
  {
    icon: Sparkles,
    label: 'Tratamientos',
    count: '10+ salones',
    href: '/explore?categoria=tratamientos',
    color: '#f1c97d', // Gold
  },
  {
    icon: Hand,
    label: 'Uñas',
    count: '6+ salones',
    href: '/explore?categoria=unas',
    color: '#6ee7b7', // Emerald
  },
  {
    icon: Brush,
    label: 'Maquillaje',
    count: '5+ salones',
    href: '/explore?categoria=maquillaje',
    color: '#fb7185', // Ruby
  },
];

export default function Categorias() {
  return (
    <section className="py-48 bg-[#080808] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(241,201,125,0.02),transparent_50%)] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-8 lg:px-16 relative z-10">

        <ScrollReveal>
          <div className="text-center mb-24">
            <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-[#f1c97d]/50 block mb-6 font-body">
              Explorá por categoría
            </span>
            <h2 className="font-body font-light text-5xl md:text-6xl text-[#e5e2e1] tracking-tight">
              ¿Qué estás <span className="italic font-headline text-[#f1c97d]/80">buscando?</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8">
          {categorias.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <ScrollReveal key={cat.label} delay={i * 0.08}>
                <Link href={cat.href} className="group block">
                  <div className="relative p-8 rounded-[2.25rem] cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col items-center gap-6 text-center 
                    border border-white/5
                    bg-white/[0.02] 
                    hover:bg-white/[0.05]
                    hover:scale-[1.03]
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                    hover:shadow-[0_20px_48px_rgba(0,0,0,0.6)]
                    hover:border-white/10
                    active:scale-[0.98]
                    overflow-hidden
                  ">
                    {/* Glassmorphism Background macOS Style */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700
                      bg-white/[0.03] backdrop-blur-2xl
                    " />

                    {/* Specular Highlight (MacOS Bevel) */}
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Category Specific Glow Background */}
                    <div 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-[0.15] transition-all duration-700 pointer-events-none"
                      style={{ background: cat.color }}
                    />

                    {/* App-like Icon Container */}
                    <div className="relative z-10 w-20 h-20 rounded-[1.75rem] flex items-center justify-center transition-all duration-500
                      bg-gradient-to-b from-white/[0.08] to-transparent
                      border border-white/10 group-hover:border-white/20 
                      shadow-[0_4px_16px_rgba(0,0,0,0.3)]
                      inner-shadow-subtle
                    ">
                      {/* Inner Vibrancy Glow */}
                      <div 
                        className="absolute inset-0 rounded-[1.75rem] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-md pointer-events-none"
                        style={{ background: cat.color }}
                      />
                      
                      <Icon
                         className="w-8 h-8 transition-all duration-500 group-hover:scale-110"
                         style={{ 
                            color: '#99907c', 
                            filter: `drop-shadow(0 0 8px ${cat.color}00)` 
                         }}
                         onMouseEnter={(e) => {
                            e.currentTarget.style.color = cat.color;
                            e.currentTarget.style.filter = `drop-shadow(0 0 12px ${cat.color}66)`;
                         }}
                         onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#99907c';
                            e.currentTarget.style.filter = `drop-shadow(0 0 8px ${cat.color}00)`;
                         }}
                        strokeWidth={1.1}
                      />
                    </div>

                    {/* Texto macOS Style */}
                    <div className="relative z-10 pt-2 space-y-1">
                      <p className="font-body font-medium text-[#e5e2e1]/80 text-[15px] leading-tight tracking-tight group-hover:text-white transition-colors duration-300">
                        {cat.label}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#99907c] font-body font-light group-hover:text-[#f1c97d]/50 transition-colors">
                        {cat.count}
                      </p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
