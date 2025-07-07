# Priority Queue System

A comprehensive request priority handling system for NestJS applications that ensures high-priority requests are processed first.

## Features

- **Three-tier priority system**: HIGH, MEDIUM, LOW
- **Automatic priority assignment** based on:
  - User roles and subscription levels
  - Request headers
  - Route patterns
  - Custom decorators
- **Queue management** with:
  - FIFO ordering within same priority
  - Dynamic priority updates
  - Request cancellation
  - Immediate processing (bypass queue)
- **Retry mechanism** with configurable attempts
- **Event-driven architecture** for monitoring
- **Real-time statistics** and monitoring
- **RESTful API** for queue management

## Installation

1. Add the module to your app:

```typescript
import { PriorityQueueModule } from './modules/priority-queue';

@Module({
  imports: [
    PriorityQueueModule,
    // other modules...
  ],
})
export class AppModule {}
```

2. Install required dependencies:

```bash
npm install @nestjs/event-emitter
```

## Basic Usage

### 1. Using Decorators

```typescript
import { HighPriority, LowPriority } from './modules/priority-queue';

@Controller('estimates')
export class EstimateController {
  
  @Post('urgent')
  @HighPriority()
  async createUrgentEstimate(@Body() data: any) {
    // This endpoint will have HIGH priority
  }
  
  @Post('batch')
  @LowPriority()
  async createBatchEstimates(@Body() data: any) {
    // This endpoint will have LOW priority
  }
}
```

### 2. Manual Request Submission

```typescript
import { PriorityQueueService, RequestPriority } from './modules/priority-queue';

@Injectable()
export class MyService {
  constructor(private priorityQueue: PriorityQueueService) {}
  
  async processData(data: any) {
    // Register a handler
    this.priorityQueue.registerHandler('my-handler', async (request) => {
      // Process the request
      return { processed: true, data: request.data };
    });
    
    // Submit a request
    const requestId = await this.priorityQueue.addRequest({
      type: 'my-handler',
      priority: RequestPriority.HIGH,
      data,
      maxRetries: 3,
      timeout: 30000,
    });
    
    return requestId;
  }
}
```

### 3. Using Headers

Send priority via HTTP headers:

```bash
curl -X POST http://localhost:3000/api/estimates \
  -H "X-Request-Priority: HIGH" \
  -H "Content-Type: application/json" \
  -d '{"data": "urgent request"}'
```

## API Endpoints

### Create Request
```http
POST /priority-queue/requests
Content-Type: application/json

{
  "type": "estimate-generation",
  "priority": "HIGH",
  "data": {
    "projectId": "123",
    "items": []
  },
  "maxRetries": 3,
  "timeout": 30000
}
```

### Get Pending Requests
```http
GET /priority-queue/requests?priority=HIGH
```

### Update Priority
```http
PUT /priority-queue/requests/{requestId}/priority
Content-Type: application/json

{
  "priority": "HIGH"
}
```

### Cancel Request
```http
DELETE /priority-queue/requests/{requestId}
```

### Get Statistics
```http
GET /priority-queue/statistics
```

### Process Immediately
```http
POST /priority-queue/requests/{requestId}/process-immediate
```

## Priority Assignment Logic

The system automatically assigns priorities based on:

1. **Explicit Header**: `X-Request-Priority: HIGH|MEDIUM|LOW`
2. **User Role/Subscription**:
   - Admin users → HIGH
   - Premium subscription → HIGH
   - Basic subscription → MEDIUM
   - Free users → LOW
3. **Route Patterns**:
   - `/critical/*`, `/urgent/*` → HIGH
   - `/batch/*`, `/bulk/*` → LOW
   - Default → MEDIUM

## Events

The system emits the following events:

- `request.added` - When a new request is added
- `request.processing` - When processing starts
- `request.completed` - When processing completes successfully
- `request.failed` - When processing fails
- `request.cancelled` - When a request is cancelled
- `request.priorityChanged` - When priority is updated

### Event Listeners Example

```typescript
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class QueueMonitor {
  
  @OnEvent('request.completed')
  handleRequestCompleted(request: PriorityRequest) {
    console.log(`Request ${request.id} completed in ${request.processingTime}ms`);
  }
  
  @OnEvent('request.failed')
  handleRequestFailed(request: PriorityRequest) {
    console.error(`Request ${request.id} failed: ${request.error}`);
  }
}
```

## Configuration

### Queue Configuration

```typescript
interface QueueConfig {
  maxQueueSize?: number;        // Maximum requests in queue
  processingConcurrency?: number; // Parallel processing count
  defaultTimeout?: number;       // Default request timeout
  defaultMaxRetries?: number;    // Default retry attempts
  enablePersistence?: boolean;   // Enable queue persistence
}
```

## Best Practices

1. **Register handlers on module initialization** to ensure they're available when requests arrive
2. **Use appropriate priorities** - don't mark everything as HIGH
3. **Set reasonable timeouts** based on expected processing time
4. **Monitor queue statistics** to identify bottlenecks
5. **Implement proper error handling** in request handlers
6. **Use events** for monitoring and alerting

## Advanced Usage

### Custom Priority Logic

```typescript
@Injectable()
export class CustomInterceptor extends RequestInterceptor {
  protected determinePriority(request: any): RequestPriority {
    // Custom logic here
    if (request.body?.amount > 100000) {
      return RequestPriority.HIGH;
    }
    return super.determinePriority(request);
  }
}
```

### Persistent Queue

For production environments, consider implementing persistence:

```typescript
@Injectable()
export class PersistentQueueService extends PriorityQueueService {
  async onModuleInit() {
    // Load queue from database/Redis
    const persistedRequests = await this.loadFromStorage();
    persistedRequests.forEach(req => this.enqueue(req));
  }
  
  async onModuleDestroy() {
    // Save queue state
    await this.saveToStorage(this.queue);
  }
}
```

## Performance Considerations

- The queue uses in-memory storage by default
- Processing runs asynchronously with configurable concurrency
- Queue sorting is O(n log n) but only triggered on changes
- Consider Redis or database persistence for production
- Monitor memory usage for large queues

## Troubleshooting

### Common Issues

1. **Handler not found**: Ensure handler is registered before submitting requests
2. **Queue not processing**: Check if handlers are throwing unhandled errors
3. **Memory issues**: Implement queue size limits or persistence
4. **Priority not working**: Verify priority assignment logic and headers

### Debug Mode

Enable debug logging:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
})
```

Set in `.env`:
```
LOG_LEVEL=debug
```
