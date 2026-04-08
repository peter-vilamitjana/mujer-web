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
        // MD3 Variables inyectadas desde el prototipo HTML
        "surface-container-low": "#f3f4f5",
        "tertiary-container": "#757474",
        "on-error": "#ffffff",
        "surface-container-high": "#e7e8e9",
        "on-primary": "#ffffff",
        "surface-bright": "#f8f9fa",
        "on-primary-container": "#fffbff",
        "inverse-primary": "#f0b9b6",
        "error": "#ba1a1a",
        "background": "#f8f9fa",
        "on-secondary-fixed": "#261900",
        "tertiary-fixed": "#e5e2e1",
        "on-primary-fixed-variant": "#643c3b",
        "surface-container-highest": "#e1e3e4",
        "primary": "#7b514f",
        "on-tertiary": "#ffffff",
        "surface": "#f8f9fa",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "on-tertiary-fixed": "#1c1b1b",
        "surface-tint": "#7e5351",
        "surface-container": "#edeeef",
        "secondary": "#775a19",
        "outline": "#837373",
        "surface-container-lowest": "#ffffff",
        "tertiary": "#5d5c5b",
        "on-secondary-fixed-variant": "#5d4201",
        "on-tertiary-fixed-variant": "#474746",
        "surface-variant": "#e1e3e4",
        "surface-dim": "#d9dadb",
        "primary-fixed": "#ffdad8",
        "secondary-fixed-dim": "#e9c176",
        "on-secondary": "#ffffff",
        "on-surface": "#191c1d",
        "on-tertiary-container": "#f7feff",
        "tertiary-fixed-dim": "#c8c6c5",
        "primary-container": "#976967",
        "secondary-container": "#fed488",
        "inverse-on-surface": "#f0f1f2",
        "outline-variant": "#d5c2c1",
        "primary-fixed-dim": "#f0b9b6",
        "on-primary-fixed": "#311212",
        "secondary-fixed": "#ffdea5",
        "on-surface-variant": "#514443",
        "inverse-surface": "#2e3132",
        "on-secondary-container": "#785a1a",
        "on-background": "#191c1d",

        // Shadcn fallbacks
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        // Brand Theming (Editorial Layer 1)
        'brand-primary': 'var(--color-primary)',
        'brand-bg': 'var(--color-bg)',
        'brand-accent': 'var(--color-accent)',
        'brand-surface': 'var(--color-surface)',
        'glass': 'var(--color-glass)',
        'glass-border': 'var(--color-glass-border)',

        brand: {
          rose: '#7b514f',
          gold: '#775a19',
          black: '#191c1d',
        },
      },
      fontFamily: {
        headline: ["var(--font-manrope)", ...fontFamily.sans],
        body: ["var(--font-inter)", ...fontFamily.sans],
        label: ["var(--font-inter)", ...fontFamily.sans],
        display: ["var(--font-manrope)", ...fontFamily.sans],
        sans: ["var(--font-inter)", ...fontFamily.sans],
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
