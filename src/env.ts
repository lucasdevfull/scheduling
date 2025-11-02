import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.url().startsWith('mongodb+srv://'),
  PORT: z.coerce.number().default(3000),
  BETTER_AUTH_SECRET: z.string(),
  EXPIRES_IN: z.string(),
  REFRESH_EXPIRES_IN: z.string(),
})

export const env = envSchema.parse(process.env)
