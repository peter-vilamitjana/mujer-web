
import './src/lib/shim-storage';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Content-Security-Policy
// 'unsafe-inline' en script-src/style-src es necesario para Next.js App Router
// (hidratación del cliente) y Tailwind/Framer Motion (estilos inline).
// Los controles más críticos anti-XSS son object-src 'none', base-uri 'self'
// y frame-ancestors 'none'. Nonces por ruta es el siguiente paso de hardening.
const cspDirectives = [
  "default-src 'self'",
  // Next.js necesita 'unsafe-inline' para scripts de hidratación del cliente
  "script-src 'self' 'unsafe-inline' https://apis.google.com",
  // Tailwind y Framer Motion emiten estilos inline
  "style-src 'self' 'unsafe-inline'",
  // Fuentes propias únicamente
  "font-src 'self'",
  // Imágenes: Firebase Storage, avatares de Google, datos embebidos
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
  // Conexiones: Firebase, Google APIs, Sentry, MercadoPago, WhatsApp API
  [
    "connect-src 'self'",
    "https://*.googleapis.com",
    "https://*.google.com",
    "https://*.firebaseio.com",
    "wss://*.firebaseio.com",
    "https://*.cloudfunctions.net",
    "https://*.ingest.sentry.io",
    "https://api.mercadopago.com",
  ].join(' '),
  // Google OAuth necesita abrir accounts.google.com en un frame/popup
  "frame-src https://accounts.google.com",
  // Bloquea que esta app sea embebida en iframes de terceros (> X-Frame-Options)
  "frame-ancestors 'none'",
  // Bloquea plugins (Flash, etc.) — vector de ataque clásico
  "object-src 'none'",
  // Previene inyección de etiqueta <base> que redirige recursos relativos
  "base-uri 'self'",
].join('; ');

const securityHeaders = [
  // Previene clickjacking — nadie puede embeder esta app en un iframe
  { key: 'X-Frame-Options', value: 'DENY' },
  // Previene MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Controla cuánta info de referrer se comparte con terceros
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Desactiva permisos de hardware que no usa la app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Content-Security-Policy — protege contra XSS, inyección de base tag y plugins
  { key: 'Content-Security-Policy', value: cspDirectives },
  // Fuerza HTTPS por 2 años (solo activo en prod)
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Solo NEXT_PUBLIC_* deben ir aquí. Los secretos del servidor
  // (GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET) los lee Next.js directamente
  // del entorno — no necesitan declararse en este bloque.
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Solo subir source maps en CI/CD (no en dev local)
  silent: !process.env.CI,

  // Desactivar en builds locales si no hay token configurado
  disableLogger: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,
});
