'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface HeroParallaxImageProps {
  src: string;
  alt: string;
}

// Aislado como leaf client component: SalonHero se queda como Server Component,
// esta es la única pieza que necesita GSAP/DOM.
export default function HeroParallaxImage({ src, alt }: HeroParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !imgRef.current) return;

    const mm = gsap.matchMedia();
    // Sin parallax si el usuario prefiere menos movimiento — la imagen se
    // queda estática en su posición base, sin animar en absoluto.
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(imgRef.current, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <div ref={imgRef} className="absolute inset-x-0 -top-[10%] h-[120%]">
        <Image src={src} alt={alt} fill priority className="object-cover" sizes="100vw" />
      </div>
    </div>
  );
}
