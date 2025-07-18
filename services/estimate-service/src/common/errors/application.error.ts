import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class ApplicationError extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly code = 'APPLICATION_ERROR',
    public readonly details?: Record<string, any>,
  ) {
    super({ message, code, details }, statusCode);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
