import { createUser } from '@/repositories/create-user.repository.ts'
import { findUserByEmail } from '@/repositories/find-user.repository.ts'
import { httpSchema } from '@/schema/http.schema.ts'
import { userSchema } from '@/schema/user.schema.ts'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const userController: FastifyPluginAsyncZod = async fastify => {
  fastify.post(
    '/admin/user',
    {
      schema: {
        body: userSchema,
        response: {
          201: httpSchema,
          409: httpSchema,
          500: httpSchema,
        },
      },
    },
    async ({ body }, { status }) => {
      const [userExists] = await findUserByEmail(body.email)
      if (userExists) {
        return status(409).send({
          statusCode: 409,
          error: 'CONFLIT',
          message: 'Usuário já existente',
        })
      }
      try {
        const { user } = await createUser({
          ...body,
          role: 'admin',
        })
        return status(201).send({
          statusCode: 201,
          error: null,
          message: 'Usuário criado com sucesso',
        })
      } catch (error) {
        return status(500).send({
          statusCode: 500,
          error: 'INTERNAL SERVER ERROR',
          message: 'Erro interno no servidor',
        })
      }
    }
  )
  fastify.post(
    '/user',
    {
      schema: {
        body: userSchema,
        response: {
          201: httpSchema,
          409: httpSchema,
          500: httpSchema,
        },
      },
    },
    async ({ body }, { status }) => {
      const [userExists] = await findUserByEmail(body.email)
      if (userExists) {
        return status(409).send({
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
        return status(201).send({
          statusCode: 201,
          error: null,
          message: 'Usuário criado com sucesso',
        })
      } catch (error) {
        return status(500).send({
          statusCode: 500,
          error: 'INTERNAL SERVER ERROR',
          message: 'Erro interno no servidor',
        })
      }
    }
  )
}
