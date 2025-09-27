import { auth } from '@/auth.ts'
import { User } from '@/schema/user.schema.ts'

export async function createUser(data: User) {
  return auth.api.createUser({
    body: {
      ...data,
    },
  })
}
