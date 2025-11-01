import { ConflictError, NotFoundError } from '@/common/errors.ts'
import { fb } from '@/db/index.ts'
import { UserRepository } from '@/repositories/user.repository.ts'
import type { IAuthService } from '@/types/interfaces/user.interface.ts'
import type { Login, Token } from '@/types/user.types.ts'
import { sign } from '@/utils/jwt.ts'
import { compare } from '@node-rs/bcrypt'

export class AuthService implements IAuthService {
  private repository: UserRepository
  constructor(repository: UserRepository) {
    this.repository = repository
  }

  async generate(data: Login): Promise<Token> {
    const user = await this.repository.findUserByEmail(data.email)
    //? await this.repository.findAccountByEmail(data.email)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }
    const isValid = await compare(data.password, String(user.password))
    if (!isValid) {
      throw new ConflictError('Credênciais inválidas')
    }
    const tokens = await sign({
      sub: user.id,
      role: String(user.role),
      iat: Math.floor(Date.now() / 1000),
    })
    return {
      tokens,
      role: String(user.role),
    }
  }
}
