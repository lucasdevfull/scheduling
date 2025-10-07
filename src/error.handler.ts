import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { HttpError } from './common/base/errors.ts'

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.error,
      message: error.message,
    })
  }
}
