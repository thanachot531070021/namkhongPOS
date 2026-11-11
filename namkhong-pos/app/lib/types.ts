import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    username: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    username: string
  }
}

export type Role = 'admin' | 'cashier' | 'waiter' | 'kitchen'

export interface BrandConfig {
  name: string
  address: string
  phone: string
  logoUrl: string
  serviceRate: number
  vatRate: number
}