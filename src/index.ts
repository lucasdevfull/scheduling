import { Elysia } from 'elysia'
import { authController } from '@/controllers/auth.controller.ts'
import { node } from '@elysiajs/node'
import { env } from './env.ts'
import { auth, OpenAPI } from './auth.ts'
import { openapi } from '@elysiajs/openapi'
import { userController } from './controllers/user.controller.ts'

const app = new Elysia({ prefix: '/api', adapter: node() })
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  .use(authController)
  .use(userController)
  .mount(auth.handler)
  .get('/', () => 'Hello Elysia')
  .listen(env.PORT)

console.log(`🦊 Elysia is running at ${'localhost'}:${env.PORT}`)
