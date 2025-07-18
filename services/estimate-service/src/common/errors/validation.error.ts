import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from './application.error';

export class ValidationError extends ApplicationError {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]> = {},
    public readonly code = 'VALIDATION_ERROR',
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, { fields });
  }
}
