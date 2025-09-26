import { accounts } from './account.schema.ts'
import { jwkss } from './jwks.schema.ts'
import { sessions } from './session.schema.ts'
import { users } from './users.schema.ts'
import { verifications } from './verifications.schema.ts'

export const schema = {
  users,
  sessions,
  jwkss,
  verifications,
  accounts,
}
