import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from './application.error';

export class RetryableError extends ApplicationError {
  constructor(
    message: string,
    public readonly retryAfter: number,
    public readonly originalError?: Error,
    public readonly code = 'RETRYABLE_ERROR',
  ) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, code, {
      retryAfter,
      originalError: originalError?.message,
      isRetryable: true,
    });
  }
}
