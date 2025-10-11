import { auth } from '@/auth.ts'
import { prisma } from '@/db/index.ts'
import type { UserEmail } from '@/types/interfaces/user.interface.ts'
import type { User, UserRole } from '@/types/user.types.ts'

export class UserRepository {
  async findUserByEmail(email: string): Promise<UserEmail | null> {
    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true },
    })
    return user
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

  async createUser(data: User): Promise<UserRole> {
    const user = await auth.api.createUser({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      },
    })
    return user
  }
}
