import { UserRepository } from '@/repositories/user.repository.ts'
import { httpSchema } from '@/schema/http.schema.ts'
import { userSchema } from '@/schema/user.schema.ts'
import { UserService } from '@/services/user.services.ts'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const userController: FastifyPluginAsyncZod = async fastify => {
  const userRepository = new UserRepository()
  const userService = new UserService(userRepository)
  fastify.post(
    '/admin/user',
    {
      schema: {
        tags: ['user'],
        body: userSchema,
        response: {
          201: httpSchema,
          409: httpSchema,
          500: httpSchema,
        },
      },
    },
    async ({ body }, reply) => {
      const user = await userService.createUser({
        ...body,
        role: 'admin',
      })
      return reply.status(201).send({
        statusCode: 201,
        error: null,
        message: 'Usuário criado com sucesso',
      })
    }
  )
  fastify.post(
    '/user',
    {
      schema: {
        tags: ['user'],
        body: userSchema,
        response: {
          201: httpSchema,
          409: httpSchema,
          500: httpSchema,
        },
      },
    },
    async ({ body }, reply) => {
      const user = await userService.createUser({
        ...body,
        role: 'user',
      })
      return reply.status(201).send({
        statusCode: 201,
        error: null,
        message: 'Usuário criado com sucesso',
      })
    }
  )
}
