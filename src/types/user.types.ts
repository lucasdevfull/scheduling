import { loginSchema, userSchema } from '@/schema/user.schema.ts'
import type { UserWithRole } from 'better-auth/plugins'
import { z } from 'zod'

export type User = Omit<z.infer<typeof userSchema>, 'confirmPassword'> & {
  role: 'admin' | 'user'
}

export type Login = z.infer<typeof loginSchema>

export type UserRole = {
  user: UserWithRole
}

export type Token = {
  tokens: {
    refreshToken: string
    accessToken: string
  }
  role: string | null
}
