import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from './application.error';

export class ExternalServiceError extends ApplicationError {
  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly originalError?: Error,
    public readonly code = 'EXTERNAL_SERVICE_ERROR',
  ) {
    super(message, HttpStatus.BAD_GATEWAY, code, {
      serviceName,
      originalError: originalError?.message,
    });
  }
}
