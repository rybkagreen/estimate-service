import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  PriorityRequest, 
  RequestPriority, 
  QueueStatistics, 
  ProcessingResult,
  RequestHandler 
} from './types';

@Injectable()
export class PriorityQueueService {
  private readonly logger = new Logger(PriorityQueueService.name);
  private readonly queue: PriorityRequest[] = [];
  private readonly handlers = new Map<string, RequestHandler>();
  private processing = false;
  private statistics: QueueStatistics = {
    totalRequests: 0,
    processedRequests: 0,
    failedRequests: 0,
    averageProcessingTime: 0,
    queueLength: 0,
    priorityBreakdown: {
      [RequestPriority.HIGH]: 0,
      [RequestPriority.MEDIUM]: 0,
      [RequestPriority.LOW]: 0,
    },
  };

  constructor(private eventEmitter: EventEmitter2) {
    // Start queue processor
    this.startQueueProcessor();
  }

  /**
   * Add a request to the priority queue
   */
  async addRequest(
    request: Omit<PriorityRequest, 'id' | 'timestamp' | 'status' | 'attempts'>
  ): Promise<string> {
    const id = this.generateRequestId();
    const priorityRequest: PriorityRequest = {
      ...request,
      id,
      timestamp: new Date(),
      status: 'pending',
      attempts: 0,
    };

    this.enqueue(priorityRequest);
    this.statistics.totalRequests++;
    this.statistics.priorityBreakdown[request.priority]++;
    
    this.logger.log(`Request ${id} added with priority ${request.priority}`);
    this.eventEmitter.emit('request.added', priorityRequest);
    
    return id;
  }

  /**
   * Register a handler for a specific request type
   */
  registerHandler(type: string, handler: RequestHandler): void {
    this.handlers.set(type, handler);
    this.logger.log(`Handler registered for type: ${type}`);
  }

  /**
   * Get current queue statistics
   */
  getStatistics(): QueueStatistics {
    return {
      ...this.statistics,
      queueLength: this.queue.length,
    };
  }

  /**
   * Get pending requests (with optional filtering)
   */
  getPendingRequests(priority?: RequestPriority): PriorityRequest[] {
    let requests = [...this.queue];
    
    if (priority !== undefined) {
      requests = requests.filter(req => req.priority === priority);
    }
    
    return requests.sort((a, b) => {
      // Sort by priority first (HIGH > MEDIUM > LOW)
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp (older first)
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(requestId: string): boolean {
    const index = this.queue.findIndex(req => req.id === requestId);
    
    if (index !== -1) {
      const request = this.queue.splice(index, 1)[0];
      request.status = 'cancelled';
      
      this.logger.log(`Request ${requestId} cancelled`);
      this.eventEmitter.emit('request.cancelled', request);
      
      return true;
    }
    
    return false;
  }

  /**
   * Update request priority
   */
  updatePriority(requestId: string, newPriority: RequestPriority): boolean {
    const request = this.queue.find(req => req.id === requestId);
    
    if (request) {
      const oldPriority = request.priority;
      request.priority = newPriority;
      
      // Re-sort the queue
      this.sortQueue();
      
      this.logger.log(`Request ${requestId} priority updated from ${oldPriority} to ${newPriority}`);
      this.eventEmitter.emit('request.priorityChanged', { request, oldPriority, newPriority });
      
      return true;
    }
    
    return false;
  }

  /**
   * Process a specific request immediately (bypass queue)
   */
  async processImmediate(requestId: string): Promise<ProcessingResult | null> {
    const index = this.queue.findIndex(req => req.id === requestId);
    
    if (index !== -1) {
      const request = this.queue.splice(index, 1)[0];
      return this.processRequest(request);
    }
    
    return null;
  }

  private enqueue(request: PriorityRequest): void {
    this.queue.push(request);
    this.sortQueue();
  }

  private dequeue(): PriorityRequest | undefined {
    return this.queue.shift();
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Sort by priority first (HIGH > MEDIUM > LOW)
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp (older first)
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  private async startQueueProcessor(): Promise<void> {
    setInterval(async () => {
      if (!this.processing && this.queue.length > 0) {
        await this.processNextRequest();
      }
    }, 100); // Check every 100ms
  }

  private async processNextRequest(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const request = this.dequeue();
    
    if (request) {
      await this.processRequest(request);
    }
    
    this.processing = false;
  }

  private async processRequest(request: PriorityRequest): Promise<ProcessingResult> {
    const startTime = Date.now();
    request.status = 'processing';
    request.attempts++;
    
    this.logger.log(`Processing request ${request.id} (attempt ${request.attempts})`);
    this.eventEmitter.emit('request.processing', request);
    
    try {
      const handler = this.handlers.get(request.type);
      
      if (!handler) {
        throw new Error(`No handler registered for type: ${request.type}`);
      }
      
      const result = await handler(request);
      
      const processingTime = Date.now() - startTime;
      request.status = 'completed';
      request.result = result;
      request.processingTime = processingTime;
      
      this.updateStatistics(processingTime, true);
      
      this.logger.log(`Request ${request.id} completed in ${processingTime}ms`);
      this.eventEmitter.emit('request.completed', request);
      
      return {
        success: true,
        data: result,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      request.status = 'failed';
      request.error = error.message;
      request.processingTime = processingTime;
      
      this.updateStatistics(processingTime, false);
      
      this.logger.error(`Request ${request.id} failed: ${error.message}`);
      this.eventEmitter.emit('request.failed', request);
      
      // Retry logic
      if (request.attempts < (request.maxRetries || 3)) {
        this.logger.log(`Retrying request ${request.id} (attempt ${request.attempts + 1})`);
        request.status = 'pending';
        this.enqueue(request);
      }
      
      return {
        success: false,
        error: error.message,
        processingTime,
      };
    }
  }

  private updateStatistics(processingTime: number, success: boolean): void {
    this.statistics.processedRequests++;
    
    if (!success) {
      this.statistics.failedRequests++;
    }
    
    // Update average processing time
    const totalTime = this.statistics.averageProcessingTime * (this.statistics.processedRequests - 1);
    this.statistics.averageProcessingTime = (totalTime + processingTime) / this.statistics.processedRequests;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
