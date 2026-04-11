import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/agenda/:path*',
    '/clientes/:path*',
    '/dashboard/:path*',
    '/servicios/:path*',
    '/turnos/:path*',
    '/mis-turnos/:path*',
    '/admin/:path*',
    '/perfil/:path*',
  ],
};
