import { env } from '@/env.ts'
import { drizzle } from 'drizzle-orm/node-postgres'
import { schema } from '@/db/schema/index.ts'
export const db = drizzle(env.DATABASE_URL, { schema, casing: 'snake_case' })
