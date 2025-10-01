import { auth } from '@/auth.ts'
import { db } from '@/db/index.ts'
import { schema } from '@/db/schema/index.ts'
import type {
  AccountEmail,
  IUserRepository,
  UserEmail,
} from '@/types/interfaces/user.interface.ts'
import type { User, UserRole } from '@/types/user.types.ts'
import { eq } from 'drizzle-orm'

export class UserRepository implements IUserRepository {
  async findUserByEmail(email: string): Promise<Array<UserEmail>> {
    return await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.email, email))
  }

  async findAccountByEmail(email: string): Promise<Array<AccountEmail>> {
    return db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        password: schema.accounts.password,
        role: schema.users.role
      })
      .from(schema.users)
      .innerJoin(schema.accounts, eq(schema.accounts.userId, schema.users.id))
      .where(eq(schema.users.email, email))
  }

  async createUser(data: User): Promise<UserRole> {
    return auth.api.createUser({
      body: {
        ...data,
      },
    })
  }
}
