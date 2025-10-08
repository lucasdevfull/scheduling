import z from 'zod'
import { decrypt } from './crypto.ts'
import { BadRequestError } from '@/common/errors.ts'

export const zDecryptStringToNumber = z.string().transform(val => {
  const decrypted = decrypt(val)
  const id = Number(decrypted)
  if (isNaN(id)) {
    throw new BadRequestError('Id inválido')
  }
  return id
})
