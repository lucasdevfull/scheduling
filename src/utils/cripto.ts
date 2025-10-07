import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

export function encrypt(value: string) {
  const key = Buffer.from(process.env.ENCRYPT_KEY!, 'base64')
  const iv = randomBytes(12)
  const cipher = createCipheriv('chacha20-poly1305', key, iv, {
    authTagLength: 16,
  })

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(value, 'utf-8')),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('hex')
}

export function decrypt(valueEncrypted: string) {
  const buf = Buffer.from(valueEncrypted, 'hex')

  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)

  const decipher = createDecipheriv(
    'chacha20-poly1305',
    process.env.ENCRYPT_KEY!,
    iv,
    {
      authTagLength: 16,
    }
  )

  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    'utf-8'
  )
}
