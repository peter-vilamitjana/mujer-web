'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Staff } from '@/lib/schema';

gsap.registerPlugin(ScrollTrigger);

interface SalonStaffProps {
  staff: Pick<Staff, 'id' | 'name' | 'avatarUrl' | 'role' | 'bio'>[];
}

export default function SalonStaff({ staff }: SalonStaffProps) {
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

  // Tarjetas: entrada más pausada que Servicios/Promos (blur-to-sharp), para
  // que el equipo se sienta como el momento "protagonista" de la vitrina.
  useGSAP(() => {
    if (staff.length === 0 || !sectionRef.current) return;
    const cards = gsap.utils.toArray<HTMLElement>('[data-reveal="staff-card"]', sectionRef.current);
    if (cards.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(cards, { autoAlpha: 0, y: 40, filter: 'blur(8px)' });
      const triggers = ScrollTrigger.batch(cards, {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.15, ease: 'power2.out', overwrite: true }),
        onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 40, filter: 'blur(8px)' }),
      });
      return () => triggers.forEach((t) => t.kill());
    });

    return () => mm.revert();
  }, [staff]);

  if (staff.length === 0) return null;

  return (
    <section id="equipo" ref={sectionRef} className="py-24 md:py-32 bg-surface">
      <div className="container mx-auto px-4 max-w-7xl">
        <div ref={headerRef} className="text-center mb-16 px-4">
          <p className="font-sans text-[10px] font-bold text-on-surface-variant tracking-[0.4em] uppercase mb-4">
            Nuestro equipo
          </p>
          <h2 className="font-vogue text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
            Quiénes te van a atender
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 max-w-5xl mx-auto px-4">
          {staff.map((person) => (
            <div key={person.id} data-reveal="staff-card" className="group flex flex-col items-center text-center w-[160px] sm:w-[180px] md:w-[220px]">
              <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-6 bg-[#050504] border border-white/[0.04] shadow-2xl">
                {person.avatarUrl ? (
                  <Image
                    src={person.avatarUrl}
                    alt={person.name}
                    fill
                    className="object-cover grayscale contrast-[1.15] brightness-90 transition-all duration-700 group-hover:scale-105 group-hover:brightness-100"
                    sizes="(min-width: 768px) 220px, 180px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-vogue text-3xl text-on-surface-variant">{person.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="font-vogue text-xl font-normal text-on-surface tracking-wide">{person.name}</h3>
              <p className="font-sans text-[8.5px] uppercase tracking-[0.25em] font-medium text-on-surface-secondary/70 mt-2">{person.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
