import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, jwt, openAPI } from 'better-auth/plugins'
import { db } from './db/index.ts'
import { env } from './env.ts'
import { hash, compare } from 'bcrypt'
import { randomInt } from 'node:crypto'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  basePath: '/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    password: {
      hash: (password: string) => hash(password, randomInt(10, 16)),
      verify: ({ password, hash }) => compare(password, hash),
    },
  },
  disabledPaths: [
    '/token', // desabilita o endpoint /api/auth/token (basePath + /token)
  ],
  plugins: [
    jwt({
      disableSettingJwtHeader: true,
    }),
    openAPI(),
    admin(),
  ],
})

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
  getPaths: (prefix = '/auth/api') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null)

      for (const path of Object.keys(paths)) {
        const key = prefix + path
        reference[key] = paths[path]

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method]

          operation.tags = ['Better Auth']
        }
      }

      return reference
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const
