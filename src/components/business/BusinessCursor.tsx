'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

// Spring constants — tight enough to feel responsive, loose enough to trail slightly
const SPRING = { stiffness: 500, damping: 28, mass: 0.6 };

export function BusinessCursor() {
  const shouldReduce = useReducedMotion();

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  useEffect(() => {
    if (shouldReduce) return;

    const move = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, [rawX, rawY, shouldReduce]);

  // Never render on touch devices or when reduced-motion is preferred
  if (shouldReduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] top-0 left-0 hidden md:block"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      {/* Inner dot */}
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.95) 0%, rgba(139,92,246,0.7) 60%, transparent 100%)',
          boxShadow: '0 0 8px 2px rgba(167,139,250,0.35)',
        }}
      />
    </motion.div>
  );
}
