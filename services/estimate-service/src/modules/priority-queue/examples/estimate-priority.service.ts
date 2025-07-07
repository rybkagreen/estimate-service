import { Injectable } from '@nestjs/common';
import { PriorityQueueService } from '../priority-queue.service';
import { RequestPriority } from '../types';

/**
 * Example service showing how to use the priority queue
 * for estimate generation requests
 */
@Injectable()
export class EstimatePriorityService {
  constructor(private priorityQueueService: PriorityQueueService) {
    // Register handlers for different estimate types
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Handler for quick estimates
    this.priorityQueueService.registerHandler('quick-estimate', async (request) => {
      // Simulate quick estimate processing
      await this.delay(500);
      return {
        estimateId: `est_${Date.now()}`,
        type: 'quick',
        data: request.data,
        processedAt: new Date(),
      };
    });

    // Handler for detailed estimates
    this.priorityQueueService.registerHandler('detailed-estimate', async (request) => {
      // Simulate detailed estimate processing
      await this.delay(2000);
      return {
        estimateId: `est_${Date.now()}`,
        type: 'detailed',
        data: request.data,
        processedAt: new Date(),
      };
    });

    // Handler for AI-powered estimates
    this.priorityQueueService.registerHandler('ai-estimate', async (request) => {
      // Simulate AI processing
      await this.delay(3000);
      return {
        estimateId: `est_${Date.now()}`,
        type: 'ai',
        data: request.data,
        aiScore: 0.95,
        processedAt: new Date(),
      };
    });
  }

  /**
   * Submit a quick estimate request
   */
  async submitQuickEstimate(data: any, userId?: string): Promise<string> {
    return this.priorityQueueService.addRequest({
      type: 'quick-estimate',
      priority: RequestPriority.HIGH, // Quick estimates are high priority
      data,
      userId,
      maxRetries: 2,
      timeout: 5000,
    });
  }

  /**
   * Submit a detailed estimate request
   */
  async submitDetailedEstimate(data: any, userId?: string): Promise<string> {
    return this.priorityQueueService.addRequest({
      type: 'detailed-estimate',
      priority: RequestPriority.MEDIUM, // Detailed estimates are medium priority
      data,
      userId,
      maxRetries: 3,
      timeout: 30000,
    });
  }

  /**
   * Submit an AI-powered estimate request
   */
  async submitAIEstimate(data: any, userId?: string, isPremium = false): Promise<string> {
    return this.priorityQueueService.addRequest({
      type: 'ai-estimate',
      priority: isPremium ? RequestPriority.HIGH : RequestPriority.LOW,
      data,
      userId,
      maxRetries: 3,
      timeout: 60000,
      metadata: {
        isPremium,
        model: 'gpt-4',
      },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
