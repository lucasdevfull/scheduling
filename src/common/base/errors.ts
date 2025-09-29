export class HttpError extends Error {
  public readonly statusCode: number
  public readonly error: string

  constructor(statusCode: number, error: string, message?: string) {
    super(message ?? error)
    this.statusCode = statusCode
    this.error = error

    // mantém stack trace correta
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
