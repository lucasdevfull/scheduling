import { PrismaClient } from '@prisma/client'
import serviceAccount from '../../appsmoveis.json' with { type: 'json' }
import admin from 'firebase-admin'

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
    await prisma.$disconnect()
    process.exit(1)
  })

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
  }),
})

export const db = admin.firestore()
