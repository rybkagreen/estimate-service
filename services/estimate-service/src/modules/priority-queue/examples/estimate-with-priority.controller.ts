import { 
  Controller, 
  Post, 
  Body, 
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { 
  PriorityQueueService,
  RequestPriority,
  HighPriority,
  LowPriority,
} from '../index';

/**
 * Example controller showing how to integrate priority queue
 * with estimate generation endpoints
 */
@ApiTags('Estimates with Priority')
@Controller('estimates-priority')
export class EstimateWithPriorityController {
  constructor(private priorityQueue: PriorityQueueService) {
    this.registerEstimateHandlers();
  }

  @Post('quick')
  @HighPriority() // This decorator marks the endpoint as high priority
  @ApiOperation({ summary: 'Generate quick estimate (HIGH priority)' })
  @ApiResponse({ status: 202, description: 'Request accepted and queued' })
  async generateQuickEstimate(@Body() data: any, @Req() req: any) {
    const requestId = await this.priorityQueue.addRequest({
      type: 'quick-estimate',
      priority: RequestPriority.HIGH,
      data,
      userId: req.user?.id,
      metadata: {
        endpoint: 'quick',
        timestamp: new Date(),
      },
    });

    return {
      requestId,
      status: 'queued',
      priority: 'HIGH',
      message: 'Your quick estimate request has been queued with high priority',
    };
  }

  @Post('detailed')
  @ApiOperation({ summary: 'Generate detailed estimate (MEDIUM priority)' })
  @ApiResponse({ status: 202, description: 'Request accepted and queued' })
  async generateDetailedEstimate(@Body() data: any, @Req() req: any) {
    // Priority can be determined dynamically based on user subscription
    const priority = this.determinePriorityByUser(req.user);

    const requestId = await this.priorityQueue.addRequest({
      type: 'detailed-estimate',
      priority,
      data,
      userId: req.user?.id,
      maxRetries: 3,
      timeout: 60000, // 1 minute timeout
    });

    return {
      requestId,
      status: 'queued',
      priority,
      message: 'Your detailed estimate request has been queued',
    };
  }

  @Post('batch')
  @LowPriority() // This decorator marks the endpoint as low priority
  @ApiOperation({ summary: 'Generate batch estimates (LOW priority)' })
  @ApiResponse({ status: 202, description: 'Batch request accepted and queued' })
  async generateBatchEstimates(@Body() data: { estimates: any[] }, @Req() req: any) {
    const requestIds = await Promise.all(
      data.estimates.map((estimate, index) =>
        this.priorityQueue.addRequest({
          type: 'batch-estimate',
          priority: RequestPriority.LOW,
          data: estimate,
          userId: req.user?.id,
          metadata: {
            batchIndex: index,
            batchSize: data.estimates.length,
          },
        })
      )
    );

    return {
      requestIds,
      status: 'queued',
      priority: 'LOW',
      batchSize: data.estimates.length,
      message: 'Your batch estimate requests have been queued with low priority',
    };
  }

  @Get('status/:requestId')
  @ApiOperation({ summary: 'Get estimate request status' })
  @ApiResponse({ status: 200, description: 'Request status' })
  async getRequestStatus(@Param('requestId') requestId: string) {
    // In a real implementation, you would track request status
    const pendingRequests = this.priorityQueue.getPendingRequests();
    const request = pendingRequests.find(r => r.id === requestId);

    if (request) {
      const position = pendingRequests.indexOf(request) + 1;
      return {
        requestId,
        status: request.status,
        priority: request.priority,
        queuePosition: position,
        estimatedWaitTime: this.estimateWaitTime(position, request.priority),
      };
    }

    // Check completed requests (would be stored in database in real app)
    return {
      requestId,
      status: 'completed',
      message: 'Request has been processed',
    };
  }

  @Get('queue-stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStats() {
    const stats = this.priorityQueue.getStatistics();
    return {
      ...stats,
      estimatedProcessingTimes: {
        HIGH: '5-10 seconds',
        MEDIUM: '30-60 seconds',
        LOW: '2-5 minutes',
      },
    };
  }

  private registerEstimateHandlers() {
    // Quick estimate handler
    this.priorityQueue.registerHandler('quick-estimate', async (request) => {
      // Simulate quick processing
      await this.delay(5000);
      return {
        estimateId: `EST-Q-${Date.now()}`,
        type: 'quick',
        total: Math.random() * 100000,
        items: 5,
        generatedAt: new Date(),
      };
    });

    // Detailed estimate handler
    this.priorityQueue.registerHandler('detailed-estimate', async (request) => {
      // Simulate detailed processing
      await this.delay(30000);
      return {
        estimateId: `EST-D-${Date.now()}`,
        type: 'detailed',
        total: Math.random() * 500000,
        items: 50,
        breakdown: {
          materials: Math.random() * 200000,
          labor: Math.random() * 200000,
          equipment: Math.random() * 100000,
        },
        generatedAt: new Date(),
      };
    });

    // Batch estimate handler
    this.priorityQueue.registerHandler('batch-estimate', async (request) => {
      // Simulate batch processing
      await this.delay(10000);
      return {
        estimateId: `EST-B-${Date.now()}`,
        type: 'batch',
        batchIndex: request.metadata?.batchIndex,
        total: Math.random() * 50000,
        generatedAt: new Date(),
      };
    });
  }

  private determinePriorityByUser(user: any): RequestPriority {
    if (!user) return RequestPriority.LOW;

    // Premium users get higher priority
    if (user.subscription === 'premium' || user.role === 'admin') {
      return RequestPriority.HIGH;
    }

    // Basic users get medium priority
    if (user.subscription === 'basic') {
      return RequestPriority.MEDIUM;
    }

    // Free users get low priority
    return RequestPriority.LOW;
  }

  private estimateWaitTime(position: number, priority: RequestPriority): string {
    const baseTime = {
      HIGH: 10,
      MEDIUM: 30,
      LOW: 120,
    };

    const estimatedSeconds = position * baseTime[priority];
    
    if (estimatedSeconds < 60) {
      return `${estimatedSeconds} seconds`;
    } else if (estimatedSeconds < 3600) {
      return `${Math.ceil(estimatedSeconds / 60)} minutes`;
    } else {
      return `${Math.ceil(estimatedSeconds / 3600)} hours`;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
