import { PrismaClient } from '@prisma/client'

// export const db = drizzle(env.DATABASE_URL, { schema, casing: 'snake_case' })
export const prisma = new PrismaClient({
  log: ['query'],
})

async function main() {
  // ... you will write your Prisma Client queries here
}

main()
  .then(async () => {
    await prisma.$connect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
