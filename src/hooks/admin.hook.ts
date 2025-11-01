import { HttpError } from '@/common/base/errors.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const adminPermission = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (
    request.user?.role ||
    request.user?.role === null ||
    request.user?.role !== 'admin'
  ) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Usuário não autorizado')
  }
  request.role = request.user.role
}
