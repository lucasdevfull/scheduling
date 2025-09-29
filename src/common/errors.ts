import { HttpError } from './base/errors.ts'

export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super(400, 'BAD REQUEST', message)
  }
}

export class ConflictError extends HttpError {
  constructor(message?: string) {
    super(409, 'CONFLICT', message)
  }
}

export class NotFoundError extends HttpError {
  constructor(message?: string) {
    super(404, 'NOT FOUND', message)
  }
}

export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(500, 'INTERNAL SERVER ERROR', message)
  }
}
