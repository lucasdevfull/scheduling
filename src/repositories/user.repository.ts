import { db, prisma } from '@/db/index.ts'
import type { IUserRepository } from '@/types/interfaces/user.interface.ts'
import type { User } from '@/types/user.types.ts'
import { randomUUID } from 'node:crypto'

export class UserRepository implements IUserRepository {
  async findUserByEmail(email: string) {
    const user = await db.collection('users').where('email', '==', email).get()
    // const user = await prisma.users.findUnique({
    //   where: { email },
    //   select: { id: true, email: true },
    // })
    // return user
    return !user.empty ? user.docs[0].data() : null
  }

  async findAccountByEmail(email: string) {
    return prisma.users.findUnique({
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

  async createUser(data: User): Promise<string> {
    // const user = await auth.api.createUser({
    //   body: {
    //     name: data.name,
    //     email: data.email,
    //     password: data.password,
    //     role: data.role,
    //   },
    // })
    // return user
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
    return result.id
  }
}
