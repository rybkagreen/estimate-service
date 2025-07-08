import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Get or generate request ID
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();
    
    // Attach request ID to request object
    request.headers['x-request-id'] = requestId;
    
    // Add request ID to response headers
    response.setHeader('x-request-id', requestId);

    return next.handle();
  }
}
