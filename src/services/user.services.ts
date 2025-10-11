import { ConflictError } from '@/common/errors.ts'
import { UserRepository } from '@/repositories/user.repository.ts'
import type { IUserService } from '@/types/interfaces/user.interface.ts'
import type { User } from '@/types/user.types.ts'
import type { UserWithRole } from 'better-auth/plugins'

export class UserService implements IUserService {
  private repository: UserRepository
  constructor(repository: UserRepository) {
    this.repository = repository
  }
  async createUser(data: User): Promise<UserWithRole> {
    const userExists = await this.repository.findUserByEmail(data.email)
    if (userExists !== null) {
      throw new ConflictError('Usuário já existente')
    }
    const { user } = await this.repository.createUser(data)
    return user
  }
}
