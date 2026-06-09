'use client';

import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

interface AnimatedHeadlineProps {
  children: string;
  className?: string;
  delay?: number;
  tag?: 'h1' | 'h2' | 'h3';
  triggerStart?: string;
}

export function AnimatedHeadline({
  children,
  className = '',
  delay = 0,
  tag: Tag = 'h2',
  triggerStart = 'top 85%',
}: AnimatedHeadlineProps) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;

    const split = new SplitText(el, {
      type: 'words,chars',
    });

    // Make word spans clip containers so chars slide up from below invisibly.
    split.words.forEach((word) => {
      const w = word as HTMLElement;
      w.style.overflow = 'hidden';
      w.style.display = 'inline-block';
      w.style.verticalAlign = 'bottom';
    });

    const chars = split.chars as HTMLElement[];

    gsap.fromTo(
      chars,
      { yPercent: 110, opacity: 0, filter: 'blur(4px)' },
      {
        yPercent: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.7,
        stagger: 0.025,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: el,
          start: triggerStart,
          once: true,
        },
        onComplete: () => split.revert(),
      },
    );
  }, { scope: ref, dependencies: [prefersReducedMotion, delay] });

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={className}
    >
      {children}
    </Tag>
  );
}
