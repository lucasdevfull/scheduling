import { Elysia } from 'elysia'
import { httpSchema, loginSchema } from '@/schema/index.ts'
import { compare } from 'bcrypt'
import { sign } from '@/utils/jwt.ts'
import { z } from 'zod'
import { findAccountByEmail } from '@/repositories/find-user.repository.ts'

export const authController = new Elysia({ prefix: '/auth' }).post(
  '/token',
  async ({ body, status }) => {
    const [user] = await findAccountByEmail(body.email)

    if (!user) {
      return status(404, {
        statusCode: 404,
        error: 'NOT FOUND',
        message: 'Usuário não encontrado',
      })
    }
    if (!(await compare(String(user.password), body.password))) {
      return status(409, {
        statusCode: 409,
        error: 'CONFLIT',
        message: 'Credênciais inválidas',
      })
    }
    const data = await sign({
      sub: user.id,
      iat: Math.floor(Date.now() / 1000),
    })
    return status(201, {
      statusCode: 201,
      error: null,
      message: 'Usuário logado com sucesso',
      data,
    })
  },
  {
    body: loginSchema,
    tags: ['auth'],
    response: {
      201: httpSchema.extend({
        data: z.object({
          accessToken: z.jwt(),
          refreshToken: z.jwt(),
        }),
      }),
      404: httpSchema,
      409: httpSchema,
      500: httpSchema,
    },
  }
)
