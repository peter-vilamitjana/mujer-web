
import './src/lib/shim-storage';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Content-Security-Policy
// 'unsafe-inline' en script-src/style-src es necesario para Next.js App Router
// (hidratación del cliente) y Tailwind/Framer Motion (estilos inline).
// Los controles más críticos anti-XSS son object-src 'none', base-uri 'self'
// y frame-ancestors 'none'. Nonces por ruta es el siguiente paso de hardening.
const isDev = process.env.NODE_ENV === 'development';

// Emuladores de Firebase (solo activos en e2e/CI vía `firebase emulators:exec`,
// que exporta estas dos vars sin prefijo). Se reenvían al cliente bajo
// NEXT_PUBLIC_* para que lib/firebase.ts pueda conectar el SDK del browser
// al emulador — sin esto, el navegador seguiría hablando con Firestore real.
const firestoreEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const emulatorsActive = Boolean(firestoreEmulatorHost || authEmulatorHost);

const cspDirectives = [
  "default-src 'self'",
  // Next.js necesita 'unsafe-inline' para scripts de hidratación del cliente.
  // En dev además necesita 'unsafe-eval' para sourcemaps y hot reload —
  // sin él React no puede hydratar y los event handlers no se adjuntan.
  // En producción Next.js no usa eval(), así que no se incluye.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com`,
  // Tailwind, Framer Motion y Google Fonts (hojas de estilo)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fuentes propias + Google Fonts (archivos de fuente desde gstatic)
  "font-src 'self' https://fonts.gstatic.com",
  // Imágenes: Firebase Storage, avatares de Google, datos embebidos
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://images.unsplash.com https://plus.unsplash.com",
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
    // Solo en e2e/CI: permite que el SDK del browser hable con los
    // emuladores de Firestore/Auth corriendo en localhost.
    ...(emulatorsActive ? ["http://127.0.0.1:*", "ws://127.0.0.1:*"] : []),
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Solo NEXT_PUBLIC_* deben ir aquí. Los secretos del servidor
  // (GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET) los lee Next.js directamente
  // del entorno — no necesitan declararse en este bloque.
  //
  // GOOGLE_CLIENT_ID y NEXTAUTH_URL se sacaron a propósito: declararlas acá
  // hace que Next.js las reemplace textualmente en build time, horneando la
  // URL de producción en cada deploy. En Vercel eso rompe el login en los
  // previews (el callback de OAuth apuntaría al dominio de prod). Ambas se
  // usan solo desde el servidor, así que Next.js las lee del entorno en
  // runtime sin necesidad de declararlas.
  env: {
    NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: firestoreEmulatorHost,
    NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: authEmulatorHost,
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
