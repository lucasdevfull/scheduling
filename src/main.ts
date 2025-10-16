import { env } from './env.ts'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error.handler.ts'
import { routes } from './routes.ts'
import { createRequire } from 'node:module'

async function bootstrap() {
  const require = createRequire(import.meta.url)
  const app = fastify().withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.setErrorHandler(errorHandler)

  if (env.NODE_ENV === 'development') {
    app.register(require('@fastify/swagger'), {
      openapi: {
        info: {
          title: 'Fastify API',
          description: 'Fastify API documentation',
          version: '1.0.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
          },
        ],
      },
      transform: jsonSchemaTransform,
    })

    app.register(require('@fastify/swagger-ui'), {
      routePrefix: '/docs',
    })
  }

  app.get('/', () => 'Hello word')
  routes.forEach(route => app.register(route, { prefix: '/api' }))

  app.listen({ port: env.PORT }, (error, adress) => {
    if (error) {
      console.error(error)
      process.exit(1)
    }
    console.log(`Server is running on port ${adress}`)
  })

  return app
}

export default async function handler(req: any, reply: any) {
  const server = await bootstrap()
  await server.ready()
  server.server.emit('request', req, reply)
}

bootstrap()
