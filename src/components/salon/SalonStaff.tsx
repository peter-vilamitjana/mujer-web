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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {staff.map((person) => (
            <div key={person.id} data-reveal="staff-card" className="group">
              <div className="relative aspect-[3/4] rounded-[1.5rem] overflow-hidden border border-outline-subtle">
                {person.avatarUrl ? (
                  <Image
                    src={person.avatarUrl}
                    alt={person.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                    <span className="font-vogue text-5xl text-on-surface-variant">{person.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="font-vogue text-xl text-on-surface">{person.name}</h3>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-primary mt-1">{person.role}</p>
                  {person.bio && (
                    <p className="font-sans text-xs text-on-surface-secondary mt-2 leading-relaxed">{person.bio}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
