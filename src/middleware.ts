import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory sliding-window rate limiter.
// Note: state is per-process — not shared across multiple server instances.
const rl = new Map<string, { n: number; reset: number }>();

function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  let e = rl.get(key);
  if (!e || e.reset < now) {
    rl.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  return ++e.n <= max;
}

// Routes that require a valid session token
const AUTH_PAGE_PATHS = [
  /^\/[^/]+\/dashboard/,
  /^\/admin/,
  /^\/perfil/,
];

// Admin API routes: require session + rate limit
const AUTH_API_PATHS = [
  /^\/api\/google\/(connect|disconnect|event|status|sync)/,
];

// Webhook routes: rate limit only (no session — called by external services)
const WEBHOOK_PATHS = [
  /^\/api\/google\/webhook/,
  /^\/api\/mercadopago\/webhook/,
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();

  // Superadmin panel — requiere role superadmin, sin excepciones
  if (pathname.startsWith('/superadmin')) {
    if (!allow(`sa:${ip}`, 30, 60_000)) {
      return new NextResponse('Too many requests', { status: 429 });
    }
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'superadmin') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Webhooks — rate limit only, no auth (external services)
  if (WEBHOOK_PATHS.some(p => p.test(pathname))) {
    if (!allow(`wh:${ip}`, 120, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }
    return NextResponse.next();
  }

  // Admin API routes — rate limit + auth
  if (AUTH_API_PATHS.some(p => p.test(pathname))) {
    if (!allow(`api:${ip}`, 30, 60_000)) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intentá en un minuto.' }, { status: 429 });
    }
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protected page routes — rate limit + auth (redirect to /login)
  if (AUTH_PAGE_PATHS.some(p => p.test(pathname))) {
    if (!allow(`pg:${ip}`, 60, 60_000)) {
      return new NextResponse('Too many requests', { status: 429 });
    }
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/superadmin/:path*',
    '/:slug/dashboard/:path*',
    '/admin/:path*',
    '/perfil/:path*',
    '/api/google/:path*',
    '/api/mercadopago/webhook',
  ],
};
