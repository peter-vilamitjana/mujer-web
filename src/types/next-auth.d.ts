import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      uid?: string
      salonId?: string | null
      salonSlug?: string | null
      tenantIds: string[]
      role: 'superadmin' | 'customer' | 'staff' | 'admin'
      phone?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
    user?: any
    uid?: string
    tenantIds?: string[]
    salonSlug?: string | null
    role?: 'superadmin' | 'customer' | 'staff' | 'admin'
    phone?: string
  }
}
