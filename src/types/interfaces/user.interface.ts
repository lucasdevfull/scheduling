import type { Login, Token, User } from '../user.types.ts'

export interface UserEmail {
  id: string
  email: string
}

export interface AccountEmail extends UserEmail {
  accounts: Array<{
    password: string | null
  }>
  role: string | null
}

export interface IUserRepository {
  //findUserByEmail(email: string): Promise<UserEmail | null>
  findUserByEmail(email: string): Promise<FirebaseFirestore.DocumentData | null>
  findAccountByEmail(email: string): Promise<AccountEmail | null>
  //createUser(data: User): Promise<UserRole>
  createUser(data: User): Promise<string>
}

export interface IUserService {
  // createUser(data: User): Promise<UserRole>
  createUser(data: User): Promise<string>
}

export interface IAuthService {
  generate(data: Login): Promise<Token>
}
