import type { DefaultSession, DefaultJWT } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: DefaultSession['user'] & {
      id?: string;
      uid: string;
      role?: string;
      tenantIds?: string[];
      salonId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user?: any;
    uid?: string;
    role?: string;
    tenantIds?: string[];
    salonId?: string;
  }
}
