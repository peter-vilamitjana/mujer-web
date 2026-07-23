'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { PortfolioItem } from '@/lib/schema';

gsap.registerPlugin(ScrollTrigger);

interface SalonPortfolioProps {
  items: Pick<PortfolioItem, 'id' | 'imageUrl' | 'caption'>[];
}

// Bento controlado: alterna proporciones para que la grilla no se sienta
// uniforme/genérica. Aspect-ratio fijo + object-cover siempre — nunca
// height:auto, para que no se rompa si el salón sube fotos de tamaños
// distintos (celular vertical, cámara horizontal, lo que sea).
const ASPECTS = ['aspect-[4/5]', 'aspect-square', 'aspect-[4/5]'];

export default function SalonPortfolio({ items }: SalonPortfolioProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Header: fade-up simple al entrar en viewport.
  useGSAP(() => {
    if (!headerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });
    return () => mm.revert();
  }, []);

  // Tarjetas: mismo tratamiento pausado (blur-to-sharp) que Staff — el
  // portfolio es evidencia del trabajo real, merece el mismo peso.
  useGSAP(() => {
    if (items.length === 0 || !sectionRef.current) return;
    const cards = gsap.utils.toArray<HTMLElement>('[data-reveal="portfolio-card"]', sectionRef.current);
    if (cards.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(cards, { autoAlpha: 0, y: 40, filter: 'blur(8px)' });
      const triggers = ScrollTrigger.batch(cards, {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12, ease: 'power2.out', overwrite: true }),
        onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 40, filter: 'blur(8px)' }),
      });
      return () => triggers.forEach((t) => t.kill());
    });

    return () => mm.revert();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section id="portfolio" ref={sectionRef} className="py-24 md:py-32 bg-surface">
      <div className="container mx-auto px-4 max-w-7xl">
        <div ref={headerRef} className="text-center mb-16 px-4">
          <p className="font-sans text-[10px] font-bold text-on-surface-variant tracking-[0.4em] uppercase mb-4">
            Nuestro trabajo
          </p>
          <h2 className="font-vogue text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
            Portfolio
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              data-reveal="portfolio-card"
              className={`group relative ${ASPECTS[index % ASPECTS.length]} rounded-[1.5rem] overflow-hidden border border-outline-subtle`}
            >
              <Image
                src={item.imageUrl}
                alt={item.caption || 'Trabajo del salón'}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-105"
                sizes="(min-width: 768px) 33vw, 50vw"
              />
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="font-sans text-xs text-on-surface">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
