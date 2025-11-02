import { ConflictError } from '@/common/errors.ts'
import type {
  IUserRepository,
  IUserService,
} from '@/types/interfaces/user.interface.ts'
import type { User } from '@/types/user.types.ts'
import { genSalt, hash } from '@node-rs/bcrypt'
import { randomInt } from 'node:crypto'

export class UserService implements IUserService {
  private repository: IUserRepository
  constructor(repository: IUserRepository) {
    this.repository = repository
  }
  async createUser(data: User): Promise<string> {
    const userExists = await this.repository.findUserByEmail(data.email)
    console.log({ userExists })
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
  }
}
