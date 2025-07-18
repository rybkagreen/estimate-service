import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { captureException } from '@sentry/node';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApplicationError } from '../errors/application.error';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        // Логируем только неумышленные ошибки (не ApplicationError)
        if (!(error instanceof ApplicationError)) {
          captureException(error, {
            extra: this.getRequestContext(context),
          });
        }

        return throwError(() => error);
      }),
    );
  }

  private getRequestContext(context: ExecutionContext): Record<string, any> {
    const request = context.switchToHttp().getRequest();

    return {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      query: request.query,
      params: request.params,
    };
  }
}
