import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Fondos — negro cálido con tinte marrón
        'surface':          '#050504',
        'surface-card':     '#111010',
        'surface-hover':    '#1c1a17',
        'surface-active':   '#252219',

        // Gold — el alma de Ouleeh
        'primary':          '#f1c97d',
        'primary-dark':     '#c9a84c',
        'primary-deep':     '#3d2e0e',
        'primary-border':   'rgba(241, 201, 125, 0.12)',

        // Texto — jerarquía cálida de 4 niveles
        'on-surface':       '#f5f0e8',
        'on-surface-secondary': '#c8c4bc',
        'on-surface-variant':   '#7a766e',
        'on-surface-disabled':  '#3e3b35',

        // Bordes
        'outline':          'rgba(241, 201, 125, 0.12)',
        'outline-subtle':   'rgba(255, 255, 255, 0.06)',
        'outline-strong':   'rgba(241, 201, 125, 0.25)',

        // Semánticos — mantener
        'success':          '#4ade80',
        'success-bg':       'rgba(74, 222, 128, 0.1)',
        'warning':          '#f59e0b',
        'warning-bg':       'rgba(245, 158, 11, 0.1)',
        'danger':           '#f87171',
        'danger-bg':        'rgba(248, 113, 113, 0.1)',

        // Shadcn fallbacks
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Brand compatible tokens
        'brand-primary': '#f1c97d',
        'brand-bg': '#050504',
        'brand-accent': '#f1c97d',
        'brand-surface': '#111010',
      },
      fontFamily: {
        headline: ["Newsreader", "serif"],
        body: ["var(--font-outfit)", "Inter", "sans-serif"],
        label: ["var(--font-outfit)", "Inter", "sans-serif"],
        display: ["var(--font-manrope)", ...fontFamily.sans],
        sans: ["var(--font-outfit)", "var(--font-inter)", ...fontFamily.sans],
        vogue: ["var(--font-playfair)", "serif"],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "3rem",
        full: "9999px"
      },
      boxShadow: {
        'card-glow': '0 0 40px -10px rgba(255, 255, 255, 0.05), 0 0 10px -5px rgba(255, 255, 255, 0.02)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
