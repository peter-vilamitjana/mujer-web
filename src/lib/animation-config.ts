// Shared animation constants — used by all business/ components.
// Centralising here ensures every reveal shares identical physics and timing.

export const ANIM = {
  ease: {
    // expo-out — authoritative, decisive. Used for entrances.
    apple:   [0.16, 1, 0.3, 1] as const,
    // expo-in — used for exits (rare on a landing page).
    appleIn: [0.7, 0, 0.84, 0] as const,
    // Back with slight overshoot — for elements that need to feel alive.
    spring:  'back.out(1.4)',
    // General-purpose smooth deceleration.
    smooth:  'power3.out',
  },

  duration: {
    fast:   0.35, // micro-interactions
    normal: 0.55, // standard entrances
    slow:   0.8,  // headlines and primary elements
    epic:   1.2,  // hero and CTA elements
  },

  stagger: {
    tight:  0.02,  // SplitText chars
    normal: 0.08,  // SplitText words
    loose:  0.12,  // cards and list items
  },

  scroll: {
    once:  { start: 'top 85%', once: true },
    scrub: { start: 'top bottom', end: 'bottom top', scrub: 1.2 },
  },
} as const;
