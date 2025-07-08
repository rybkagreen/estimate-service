import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MonitoringService } from './monitoring.service';

export interface RequestWithCorrelation extends Request {
  correlationId: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly monitoringService: MonitoringService) {}

  use(req: RequestWithCorrelation, res: Response, next: NextFunction): void {
    // Get correlation ID from header or generate new one
    const correlationId =
      req.headers['x-correlation-id'] as string ||
      this.monitoringService.generateCorrelationId();

    // Set correlation ID on request
    req.correlationId = correlationId;

    // Set response header
    res.setHeader('x-correlation-id', correlationId);

    // Add to response locals for logging
    res.locals.correlationId = correlationId;

    next();
  }
}
