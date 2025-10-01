import { HttpError } from '@/common/base/errors.ts'
import { env } from '@/env.ts'
import { type JWTPayload, jwtVerify, SignJWT } from 'jose'

const secret = Buffer.from(env.BETTER_AUTH_SECRET, 'base64')

export async function sign(payload: JWTPayload) {
  const accessToken = await new SignJWT({
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.EXPIRES_IN)
    .sign(secret)

  const refreshToken = await new SignJWT({
    exp: Math.floor(Date.now() / 1000) + 86400,
    ...payload,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_EXPIRES_IN)
    .sign(secret)

  return { refreshToken, accessToken }
}

export async function verify(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    throw new HttpError(400, 'BAD REQUEST', 'Token inválido ou expirado')
  }
}
