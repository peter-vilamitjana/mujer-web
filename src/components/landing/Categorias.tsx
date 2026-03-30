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
  },
  {
    icon: Palette,
    label: 'Color',
    count: '8+ salones',
    href: '/explore?categoria=color',
  },
  {
    icon: Sparkles,
    label: 'Tratamientos',
    count: '10+ salones',
    href: '/explore?categoria=tratamientos',
  },
  {
    icon: Hand,
    label: 'Uñas',
    count: '6+ salones',
    href: '/explore?categoria=unas',
  },
  {
    icon: Brush,
    label: 'Maquillaje',
    count: '5+ salones',
    href: '/explore?categoria=maquillaje',
  },
];

export default function Categorias() {
  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-brand-primary/40 block mb-4 font-inter">
              Explorá por categoría
            </span>
            <h2 className="font-vogue text-4xl md:text-5xl text-brand-primary">
              ¿Qué estás buscando?
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categorias.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <ScrollReveal key={cat.label} delay={i * 0.08}>
                <Link href={cat.href} className="group block">
                  <div className="relative p-8 rounded-[2rem] cursor-pointer transition-all duration-500 ease-out flex flex-col items-center gap-5 text-center overflow-hidden
                    border border-brand-primary/8
                    bg-brand-primary/[0.03]
                    hover:-translate-y-2
                    hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)]
                    dark:hover:shadow-[0_24px_48px_rgba(0,0,0,0.35)]
                  ">
                    {/* Fondo liquid glass — aparece en hover */}
                    <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-white/60 dark:bg-white/5
                      backdrop-blur-xl
                      border border-white/60 dark:border-white/10
                    " />

                    {/* Brillo superior */}
                    <div className="absolute inset-x-0 top-0 h-px rounded-t-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent
                    " />

                    {/* Ícono */}
                    <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                      bg-brand-primary/6 group-hover:bg-brand-primary/10
                      border border-brand-primary/8 group-hover:border-brand-primary/15
                    ">
                      <Icon
                        className="w-6 h-6 text-brand-primary/70 group-hover:text-brand-primary transition-colors duration-500"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Texto */}
                    <div className="relative z-10">
                      <p className="font-semibold text-brand-primary text-sm leading-tight mb-1 font-inter">
                        {cat.label}
                      </p>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-brand-primary/40 font-inter">
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
