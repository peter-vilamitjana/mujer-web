
import './src/lib/shim-storage';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const securityHeaders = [
  // Previene clickjacking — nadie puede embeder esta app en un iframe
  { key: 'X-Frame-Options', value: 'DENY' },
  // Previene MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Controla cuánta info de referrer se comparte con terceros
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Desactiva permisos de hardware que no usa la app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
