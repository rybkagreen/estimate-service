import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExtendedProblemDetails, ValidationError } from '../interfaces/problem-details.interface';
import * as Sentry from '@sentry/node';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly problemTypeMapping: Record<number, string> = {
    400: 'https://example.com/probs/bad-request',
    401: 'https://example.com/probs/unauthorized',
    403: 'https://example.com/probs/forbidden',
    404: 'https://example.com/probs/not-found',
    409: 'https://example.com/probs/conflict',
    422: 'https://example.com/probs/unprocessable-entity',
    500: 'https://example.com/probs/internal-server-error',
    502: 'https://example.com/probs/bad-gateway',
    503: 'https://example.com/probs/service-unavailable',
  };

  constructor(private readonly isDevMode: boolean = process.env.NODE_ENV !== 'production') {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const traceId = (request.headers['x-request-id'] as string) || uuidv4();
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let detail: string | undefined;
    let validationErrors: ValidationError[] | undefined;
    let code: string | undefined;

    // Handle different exception types
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).error || (response as any).message || message;
        detail = (response as any).detail;
        code = (response as any).code;
        
        // Handle validation errors from class-validator
        if ((response as any).message && Array.isArray((response as any).message)) {
          validationErrors = this.formatValidationErrors((response as any).message);
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      detail = 'An internal server error occurred. Please try again later.';
    }

    // Determine problem type based on status code
    const problemType = this.problemTypeMapping[status] || 'https://example.com/probs/unknown';

    // Construct problem details response
    const problemDetails: ExtendedProblemDetails = {
      type: problemType,
      title: this.getErrorTitle(status),
      status,
      detail: detail || message,
      instance: `${request.method} ${request.url}`,
      timestamp,
      path: request.url,
      traceId,
      code,
    };

    // Add validation errors if present
    if (validationErrors && validationErrors.length > 0) {
      problemDetails.errors = validationErrors;
    }

    // Include stack trace in development mode
    if (this.isDevMode && exception instanceof Error) {
      problemDetails.stack = exception.stack;
    }

    // Log the error
    this.logError(exception, status, traceId, request);

    // Capture critical errors in Sentry
    if (this.shouldCaptureInSentry(status)) {
      Sentry.withScope((scope) => {
        scope.setTag('traceId', traceId);
        scope.setTag('status', status);
        scope.setContext('request', {
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
        });
        Sentry.captureException(exception);
      });
    }

    // Send response
    response
      .status(status)
      .setHeader('Content-Type', 'application/problem+json')
      .json(problemDetails);
  }

  private formatValidationErrors(messages: string[]): ValidationError[] {
    return messages.map((message) => {
      // Try to parse validation error format
      const match = message.match(/^(\w+)\s(.+)$/);
      if (match) {
        return {
          field: match[1],
          message: match[2],
        };
      }
      return {
        field: 'unknown',
        message,
      };
    });
  }

  private getErrorTitle(status: number): string {
    const titles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return titles[status] || 'Error';
  }

  private shouldCaptureInSentry(status: number): boolean {
    // Capture server errors and specific client errors
    return status >= 500 || [401, 403, 409].includes(status);
  }

  private logError(exception: unknown, status: number, traceId: string, request: Request): void {
    const errorMessage = exception instanceof Error ? exception.message : 'Unknown error';
    const errorContext = {
      traceId,
      status,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    if (status >= 500) {
      this.logger.error(errorMessage, exception instanceof Error ? exception.stack : '', errorContext);
    } else if (status >= 400) {
      this.logger.warn(errorMessage, errorContext);
    }
  }
}
