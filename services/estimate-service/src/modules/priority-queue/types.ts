export enum RequestPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export type RequestStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PriorityRequest {
  id: string;
  type: string;
  priority: RequestPriority;
  data: any;
  userId?: string;
  timestamp: Date;
  status: RequestStatus;
  attempts: number;
  maxRetries?: number;
  timeout?: number;
  metadata?: Record<string, any>;
  result?: any;
  error?: string;
  processingTime?: number;
}

export interface QueueStatistics {
  totalRequests: number;
  processedRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  queueLength: number;
  priorityBreakdown: Record<RequestPriority, number>;
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
}

export type RequestHandler = (request: PriorityRequest) => Promise<any>;

export interface CreateRequestDto {
  type: string;
  priority: RequestPriority;
  data: any;
  userId?: string;
  maxRetries?: number;
  timeout?: number;
  metadata?: Record<string, any>;
}

export interface UpdatePriorityDto {
  priority: RequestPriority;
}

export interface QueueConfig {
  maxQueueSize?: number;
  processingConcurrency?: number;
  defaultTimeout?: number;
  defaultMaxRetries?: number;
  enablePersistence?: boolean;
}
