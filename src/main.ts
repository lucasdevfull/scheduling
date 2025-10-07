import { authController } from '@/controllers/auth.controller.ts'
import { env } from './env.ts'
import { auth, OpenAPI } from './auth.ts'
import { userController } from './controllers/user.controller.ts'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error.handler.ts'

async function bootstrap() {
  const app = fastify().withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.register(authController, { prefix: '/api/auth' })
  app.register(userController, { prefix: '/api' })

  app.get('/', () => 'Hello word')

  app.setErrorHandler(errorHandler)

  // if (env.NODE_ENV !== 'production') {
  //   app.use(
  //     openapi({
  //       documentation: {
  //         components: await OpenAPI.components,
  //         paths: await OpenAPI.getPaths(),
  //       },
  //       mapJsonSchema: {
  //         zod: z.toJSONSchema,
  //       },
  //       path: '/docs',
  //     })
  //   )
  // }
  //console.log(`🦊 Elysia is running at ${'localhost'}:${env.PORT}`)
  return app
}

export default async function handler(req: any, reply: any) {
  const server = await bootstrap()
  await server.ready()
  server.server.emit('request', req, reply)
}
