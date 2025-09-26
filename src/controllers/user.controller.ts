import { auth } from '@/auth.ts'
import { db } from '@/db/index.ts'
import { schema } from '@/db/schema/index.ts'
import { httpSchema } from '@/schema/http.schema.ts'
import { userSchema } from '@/schema/user.schema.ts'
import { eq } from 'drizzle-orm'
import { Elysia } from 'elysia'

export const userController = new Elysia({ prefix: '/user' }).post(
  '',
  async ({ body, status }) => {
    const userExists = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.email, body.email))
    if (userExists) {
      return status(409, {
        statusCode: 500,
        error: 'CONFLIT',
        message: 'Usuário já existente',
      })
    }
    try {
      const user = await auth.api.createUser({
        body: {
          ...body,
          role: 'user',
        },
      })
      return status(201, {
        statusCode: 201,
        error: null,
        message: 'Usuário criado com sucesso',
      })
    } catch (error) {
      return status(500, {
        statusCode: 500,
        error: 'INTERNAL SERVER ERROR',
        message: 'Erro interno no servidor',
      })
    }
  },
  {
    body: userSchema,
    response: {
      201: httpSchema,
      409: httpSchema,
      500: httpSchema,
    },
  }
)
