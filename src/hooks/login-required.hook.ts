import { BadRequestError, NotFoundError } from '@/common/errors.ts'
import { prisma } from '@/db/index.ts'
import { verify } from '@/utils/jwt.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const loginRequiredHook = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { authorization } = request.headers

  if (!authorization) {
    throw new BadRequestError('Token inválido ou expirado')
  }

  const [bearer, token] = authorization.split(' ')

  if (!bearer || bearer.trim().toLocaleLowerCase() !== 'bearer' || !token) {
    throw new BadRequestError('Token inválido ou expirado')
  }

  const { valid, ...result } = await verify(token)

  if (!valid || !result.payload?.sub) {
    throw new BadRequestError('Token inválido ou expirado')
  }

  const user = await prisma.users.findFirst({
    where: {
      id: result.payload?.sub,
    },
  })

  if (!user) {
    throw new NotFoundError('Usuário não encontrado.')
  }

  request.user = user
}
