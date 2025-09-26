import { Elysia } from 'elysia'
import { httpSchema, loginSchema } from '@/schema/index.ts'
import { db } from '@/db/index.ts'
import { schema } from '@/db/schema/index.ts'
import { eq } from 'drizzle-orm'
import { compare } from 'bcrypt'
import { sign } from '@/utils/jwt.ts'
import { z } from 'zod'

export const authController = new Elysia({ prefix: '/auth' }).post(
  '/token',
  async ({ body, status }) => {
    const [user] = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        password: schema.accounts.password,
      })
      .from(schema.users)
      .innerJoin(schema.accounts, eq(schema.accounts.userId, schema.users.id))
      .where(eq(schema.users.email, body.email))

    if (!user) {
      return
    }
    if (!(await compare(String(user.password), body.password))) {
      return
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
      409: httpSchema,
      500: httpSchema,
    },
  }
)
