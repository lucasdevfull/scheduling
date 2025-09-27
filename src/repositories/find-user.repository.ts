import { db } from '@/db/index.ts'
import { schema } from '@/db/schema/index.ts'
import { eq } from 'drizzle-orm'

export async function findUserByEmail(email: string) {
  return await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
    })
    .from(schema.users)
    .where(eq(schema.users.email, email))
}

export async function findAccountByEmail(email: string) {
  return db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      password: schema.accounts.password,
    })
    .from(schema.users)
    .innerJoin(schema.accounts, eq(schema.accounts.userId, schema.users.id))
    .where(eq(schema.users.email, email))
}
