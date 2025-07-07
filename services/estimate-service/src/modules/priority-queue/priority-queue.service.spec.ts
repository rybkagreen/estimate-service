import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PriorityQueueService } from './priority-queue.service';
import { RequestPriority } from './types';

describe('PriorityQueueService', () => {
  let service: PriorityQueueService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriorityQueueService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PriorityQueueService>(PriorityQueueService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Priority Ordering', () => {
    it('should process HIGH priority requests first', async () => {
      const results: string[] = [];
      
      // Register a simple handler
      service.registerHandler('test-handler', async (request) => {
        results.push(`${request.priority}-${request.data.id}`);
        return { processed: true };
      });

      // Add requests in mixed order
      await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.LOW,
        data: { id: 1 },
      });

      await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.HIGH,
        data: { id: 2 },
      });

      await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.MEDIUM,
        data: { id: 3 },
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify processing order: HIGH -> MEDIUM -> LOW
      expect(results).toEqual([
        'HIGH-2',
        'MEDIUM-3',
        'LOW-1',
      ]);
    });

    it('should maintain FIFO order within same priority', async () => {
      const results: string[] = [];
      
      service.registerHandler('test-handler', async (request) => {
        results.push(`${request.data.id}`);
        return { processed: true };
      });

      // Add multiple MEDIUM priority requests
      for (let i = 1; i <= 3; i++) {
        await service.addRequest({
          type: 'test-handler',
          priority: RequestPriority.MEDIUM,
          data: { id: i },
        });
      }

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify FIFO order
      expect(results).toEqual(['1', '2', '3']);
    });
  });

  describe('Request Management', () => {
    it('should update request priority', async () => {
      const requestId = await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.LOW,
        data: { test: true },
      });

      const success = service.updatePriority(requestId, RequestPriority.HIGH);
      expect(success).toBe(true);

      const requests = service.getPendingRequests();
      const request = requests.find(r => r.id === requestId);
      expect(request?.priority).toBe(RequestPriority.HIGH);
    });

    it('should cancel requests', async () => {
      const requestId = await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.MEDIUM,
        data: { test: true },
      });

      const success = service.cancelRequest(requestId);
      expect(success).toBe(true);

      const requests = service.getPendingRequests();
      expect(requests.find(r => r.id === requestId)).toBeUndefined();
    });

    it('should filter requests by priority', async () => {
      // Add mixed priority requests
      await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.HIGH,
        data: { id: 1 },
      });

      await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.LOW,
        data: { id: 2 },
      });

      await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.HIGH,
        data: { id: 3 },
      });

      const highPriorityRequests = service.getPendingRequests(RequestPriority.HIGH);
      expect(highPriorityRequests).toHaveLength(2);
      expect(highPriorityRequests.every(r => r.priority === RequestPriority.HIGH)).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      let attempts = 0;
      
      service.registerHandler('failing-handler', async (request) => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return { success: true };
      });

      await service.addRequest({
        type: 'failing-handler',
        priority: RequestPriority.MEDIUM,
        data: { test: true },
        maxRetries: 3,
      });

      // Wait for retries
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(attempts).toBe(3);
    });
  });

  describe('Statistics', () => {
    it('should track queue statistics', async () => {
      service.registerHandler('test-handler', async () => ({ success: true }));

      // Add some requests
      await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.HIGH,
        data: {},
      });

      await service.addRequest({
        type: 'test-handler',
        priority: RequestPriority.LOW,
        data: {},
      });

      const stats = service.getStatistics();
      expect(stats.totalRequests).toBe(2);
      expect(stats.priorityBreakdown[RequestPriority.HIGH]).toBe(1);
      expect(stats.priorityBreakdown[RequestPriority.LOW]).toBe(1);
    });
  });
});
