import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PriorityQueueService } from '../priority-queue.service';
import { RequestPriority } from '../types';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  constructor(private priorityQueueService: PriorityQueueService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Extract priority from headers or default based on route/user
    const priority = this.determinePriority(request);
    
    // Add priority to request object for use in controllers
    request.priority = priority;
    
    // Log request with priority
    const now = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        
        // Log response time with priority information
        console.log(
          `[${priority}] ${request.method} ${request.url} - ${responseTime}ms`
        );
      }),
    );
  }

  private determinePriority(request: any): RequestPriority {
    // Check for explicit priority header
    const headerPriority = request.headers['x-request-priority'];
    if (headerPriority && Object.values(RequestPriority).includes(headerPriority)) {
      return headerPriority as RequestPriority;
    }
    
    // Check user role or subscription level
    if (request.user) {
      if (request.user.role === 'admin' || request.user.subscription === 'premium') {
        return RequestPriority.HIGH;
      }
      if (request.user.subscription === 'basic') {
        return RequestPriority.MEDIUM;
      }
    }
    
    // Route-based priority
    const url = request.url;
    if (url.includes('/critical') || url.includes('/urgent')) {
      return RequestPriority.HIGH;
    }
    if (url.includes('/batch') || url.includes('/bulk')) {
      return RequestPriority.LOW;
    }
    
    // Default priority
    return RequestPriority.MEDIUM;
  }
}
