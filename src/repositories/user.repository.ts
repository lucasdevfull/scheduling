import { auth } from '@/auth.ts'
import { db } from '@/db/index.ts'
import { schema } from '@/db/schema/index.ts'
import type { User } from '@/schema/user.schema.ts'
import { eq } from 'drizzle-orm'

export class UserRepository {
  async findUserByEmail(email: string) {
    return await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.email, email))
  }

  async findAccountByEmail(email: string) {
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

  async createUser(data: User) {
    return auth.api.createUser({
      body: {
        ...data,
      },
    })
  }
}
