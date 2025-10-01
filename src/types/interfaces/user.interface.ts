import type { UserWithRole } from 'better-auth/plugins'
import type { Login, Token, User, UserRole } from '../user.types.ts'

export interface UserEmail {
  id: string
  email: string
}

export interface AccountEmail extends UserEmail {
  password: string | null
}

export interface IUserRepository {
  findUserByEmail(email: string): Promise<Array<UserEmail>>
  findAccountByEmail(email: string): Promise<Array<AccountEmail>>
  createUser(data: User): Promise<UserRole>
}

export interface IUserService {
  createUser(data: User): Promise<UserWithRole>
}

export interface IAuthService {
  generate(data: Login): Promise<Token>
}
