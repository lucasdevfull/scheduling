import { auth } from '@/auth.ts'
import { db, fb, prisma } from '@/db/index.ts'
import type { UserEmail } from '@/types/interfaces/user.interface.ts'
import type { User, UserRole } from '@/types/user.types.ts'
import { randomUUID } from 'node:crypto'

export class UserRepository {
  async findUserByEmail(email: string): Promise<UserEmail | null> {
    const user = await db.collection('users').where('email', '==', email).get()

    if (!fb) {
      const user = await prisma.users.findUnique({
        where: { email },
        select: { id: true, email: true },
      })
      return user
    }
    return !user.empty ? (user.docs[0].data() as UserEmail) : null
  }

  async findAccountByEmail(email: string) {
    return await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        accounts: {
          select: {
            password: true,
          },
        },
      },
    })
  }

  async createUser(data: User) {
    const result = await db.collection('users').add({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      emailVerified: false,
      role: data.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    if (!fb) {
      const user = await auth.api.createUser({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        },
      })
      return user.user.id
    }
    return result.id
  }
}
