'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (!barRef.current || prefersReducedMotion) return;

    gsap.to(barRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
      },
    });
  }, { dependencies: [prefersReducedMotion] });

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 h-[2px] w-full origin-left z-[9999] pointer-events-none"
      style={{
        transform: 'scaleX(0)',
        background: 'linear-gradient(to right, rgba(139,92,246,0.9), rgba(168,85,247,0.7))',
      }}
      aria-hidden="true"
    />
  );
}
