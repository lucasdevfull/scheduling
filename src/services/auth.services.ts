import { ConflictError, NotFoundError } from '@/common/errors.ts'
import { UserRepository } from '@/repositories/user.repository.ts'
import type { Login } from '@/schema/user.schema.ts'
import { sign } from '@/utils/jwt.ts'
import { compare } from '@node-rs/bcrypt'

export class AuthService {
  private repository: UserRepository
  constructor(repository: UserRepository) {
    this.repository = repository
  }

  async generate(data: Login) {
    const [user] = await this.repository.findAccountByEmail(data.email)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }
    const isValid = await compare(String(user.password), data.password)
    if (!isValid) {
      throw new ConflictError('Credênciais inválidas')
    }
    return sign({
      sub: user.id,
      iat: Math.floor(Date.now() / 1000),
    })
  }
}
