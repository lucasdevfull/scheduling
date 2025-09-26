import { env } from '@/env.ts'
import { type JWTPayload, jwtVerify, SignJWT } from 'jose'
// import type { JWTPayloadInput, JWTPayloadSpec } from "@elysiajs/jwt";
// import { JWTPayload, SignJWT, type JWTVerifyOptions } from "jose";

// type AllowClaimValue = string | number | boolean | null | undefined | AllowClaimValue[] | {
//     [key: string]: AllowClaimValue;
// };
// type ClaimType = Record<string, AllowClaimValue>;

// type NormalizedClaim = 'nbf' | 'exp' | 'iat';

// type JWT = {
//     jwt: {
//         sign(signValue: Omit<ClaimType, NormalizedClaim> & JWTPayloadInput): Promise<string>;
//         verify(jwt?: string, options?: JWTVerifyOptions): Promise<false | (ClaimType & Omit<JWTPayloadSpec, never>)>;
//     }
// }
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
    throw new Error('Token inválido ou expirado')
  }
}
