import type { Users } from '@prisma/client'
import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: Users
    role: string | null
  }
}
