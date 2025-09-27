import { createUser } from '@/repositories/create-user.repository.ts'
import { findUserByEmail } from '@/repositories/find-user.repository.ts'
import { httpSchema } from '@/schema/http.schema.ts'
import { userSchema } from '@/schema/user.schema.ts'
import { Elysia } from 'elysia'

export const userController = new Elysia()
  .group('/admin', app =>
    app.post(
      '/user',
      async ({ body, status }) => {
        const [userExists] = await findUserByEmail(body.email)
        if (userExists) {
          return status(409, {
            statusCode: 500,
            error: 'CONFLIT',
            message: 'Usuário já existente',
          })
        }
        try {
          const { user } = await createUser({
            ...body,
            role: 'admin',
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
  )
  .group('/user', app =>
    app.post(
      '',
      async ({ body, status }) => {
        const [userExists] = await findUserByEmail(body.email)
        if (userExists) {
          return status(409, {
            statusCode: 500,
            error: 'CONFLIT',
            message: 'Usuário já existente',
          })
        }
        try {
          const { user } = await createUser({
            ...body,
            role: 'user',
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
  )
