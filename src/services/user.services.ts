import { ConflictError } from '@/common/errors.ts'
import { UserRepository } from '@/repositories/user.repository.ts'
import type { User } from '@/schema/user.schema.ts'

export class UserService {
  private repository: UserRepository
  constructor(repository: UserRepository) {
    this.repository = repository
  }
  async createUser(data: User) {
    const [userExists] = await this.repository.findUserByEmail(data.email)
    if (userExists) {
      throw new ConflictError('Usuário já existente')
    }

    const { user } = await this.repository.createUser(data)
    return user
  }
}
