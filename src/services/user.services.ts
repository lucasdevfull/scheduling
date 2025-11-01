import { ConflictError } from '@/common/errors.ts'
import { UserRepository } from '@/repositories/user.repository.ts'
import type { IUserService } from '@/types/interfaces/user.interface.ts'
import type { User } from '@/types/user.types.ts'
import { genSalt, hash } from '@node-rs/bcrypt'
import type { UserWithRole } from 'better-auth/plugins'
import { randomInt } from 'node:crypto'

export class UserService {
  private repository: UserRepository
  constructor(repository: UserRepository) {
    this.repository = repository
  }
  async createUser(data: User) {
    const userExists = await this.repository.findUserByEmail(data.email)
    if (userExists) {
      throw new ConflictError('Usuário já existente')
    }
    const cost = randomInt(10, 15)
    const salt = await genSalt(cost)
    const password = await hash(data.password, cost, salt)
    return this.repository.createUser({
      ...data,
      password,
    })
    //return user
  }
}
