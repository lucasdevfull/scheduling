import { PrismaClient } from '@prisma/client'
import serviceAccount from '../../appsmoveis.json' with { type: 'json' }
import admin from 'firebase-admin'

export let fb: boolean

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
    fb = false
    console.log(fb)
  })
  .catch(async e => {
    fb = true
    await prisma.$disconnect()
    //process.exit(1)
  })
  .finally(() => console.log(fb))

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
  }),
})

export const db = admin.firestore()
