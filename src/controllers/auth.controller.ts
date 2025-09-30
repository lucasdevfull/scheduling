import { httpSchema, loginSchema } from '@/schema/index.ts'
import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { AuthService } from '@/services/auth.services.ts'
import { UserRepository } from '@/repositories/user.repository.ts'

export const authController: FastifyPluginAsyncZod = async fastify => {
  const userRepository = new UserRepository()
  const authService = new AuthService(userRepository)
  fastify.post(
    '/token',
    {
      schema: {
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
      },
    },
    async ({ body }, { status }) => {
      const data = await authService.generate(body)
      return status(201).send({
        statusCode: 201,
        error: null,
        message: 'Usuário logado com sucesso',
        data,
      })
    }
  )
}
