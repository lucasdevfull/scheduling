import z from 'zod'
import { decrypt } from './crypto.ts'
import { BadRequestError } from '@/common/errors.ts'
import { db } from '@/db/index.ts'

export const zDecryptStringToNumber = z.string().transform(val => {
  const decrypted = decrypt(val)
  const id = Number(decrypted)
  if (isNaN(id)) {
    throw new BadRequestError('Id inválido')
  }
  return id
})

export async function getNextId(
  tx: FirebaseFirestore.Transaction,
  counterName: string
): Promise<number> {
  const counterRef = db.collection('counters').doc(counterName)
  const counterSnap = await counterRef.get()
  const current = counterSnap.exists ? (counterSnap.data()?.value ?? 0) : 0
  const next = current + 1
  tx.set(counterRef, { value: next }, { merge: true })
  return next
}
