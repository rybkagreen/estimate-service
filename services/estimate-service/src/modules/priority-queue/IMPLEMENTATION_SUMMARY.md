# Priority Queue Implementation Summary

## Overview
I've successfully designed and implemented a comprehensive request priority handling system for your NestJS application. The system ensures that high-priority requests are processed first while maintaining fairness within each priority level.

## Key Components Implemented

### 1. **Priority Queue Module** (`priority-queue.module.ts`)
- Global module that can be used across the application
- Automatically registers request interceptor for priority detection
- Exports the priority queue service for dependency injection

### 2. **Priority Queue Service** (`priority-queue.service.ts`)
- Core service implementing a heap-based priority queue
- Features:
  - Three priority levels: HIGH, MEDIUM, LOW
  - Automatic queue processing with configurable intervals
  - Request retry mechanism with configurable attempts
  - Event emission for monitoring and logging
  - Real-time statistics tracking
  - Dynamic priority updates
  - Request cancellation
  - Immediate processing (bypass queue)

### 3. **Type Definitions** (`types.ts`)
- Comprehensive TypeScript interfaces and enums
- Request priority levels
- Request status tracking
- Queue statistics
- DTOs for API endpoints

### 4. **REST API Controller** (`priority-queue.controller.ts`)
- Full CRUD operations for queue management
- Endpoints:
  - `POST /priority-queue/requests` - Add new request
  - `GET /priority-queue/requests` - List pending requests
  - `GET /priority-queue/statistics` - Get queue statistics
  - `PUT /priority-queue/requests/:id/priority` - Update priority
  - `DELETE /priority-queue/requests/:id` - Cancel request
  - `POST /priority-queue/requests/:id/process-immediate` - Bypass queue

### 5. **Request Interceptor** (`interceptors/request.interceptor.ts`)
- Automatic priority assignment based on:
  - HTTP headers (`X-Request-Priority`)
  - User roles and subscription levels
  - Route patterns
- Request timing and logging

### 6. **Priority Decorators** (`decorators/priority.decorator.ts`)
- Method decorators for explicit priority assignment
- `@HighPriority()`, `@MediumPriority()`, `@LowPriority()`
- Clean, declarative API for controllers

## Priority Assignment Logic

The system uses a multi-layered approach to determine request priority:

1. **Explicit Header**: `X-Request-Priority: HIGH|MEDIUM|LOW`
2. **User-based**:
   - Admin/Premium users → HIGH
   - Basic subscription → MEDIUM
   - Free/No subscription → LOW
3. **Route-based**:
   - `/critical/*`, `/urgent/*` → HIGH
   - `/batch/*`, `/bulk/*` → LOW
   - Default → MEDIUM
4. **Decorator-based**: Using `@HighPriority()` etc. on controller methods

## Queue Processing Algorithm

1. Requests are sorted by:
   - Priority level (HIGH > MEDIUM > LOW)
   - Timestamp (FIFO within same priority)
2. Processing runs asynchronously every 100ms
3. Failed requests are retried based on `maxRetries` setting
4. Events are emitted for monitoring

## Integration with Existing Code

The priority queue module has been added to your `app.module.ts` and is ready to use. I've also created comprehensive examples showing how to integrate it with your estimate service.

## Example Usage

```typescript
// Register a handler
priorityQueueService.registerHandler('estimate-generation', async (request) => {
  // Process the estimate
  return generateEstimate(request.data);
});

// Submit a request
const requestId = await priorityQueueService.addRequest({
  type: 'estimate-generation',
  priority: RequestPriority.HIGH,
  data: estimateData,
  maxRetries: 3,
  timeout: 30000,
});
```

## Benefits

1. **Fair Resource Allocation**: Premium users get faster service
2. **System Stability**: Prevents overload from batch operations
3. **Monitoring**: Real-time statistics and event tracking
4. **Flexibility**: Dynamic priority updates and cancellation
5. **Reliability**: Built-in retry mechanism
6. **Scalability**: Can be extended with Redis for distributed systems

## Next Steps

To use this system:

1. Install dependencies: `npm install @nestjs/event-emitter`
2. Register handlers for your specific use cases
3. Use the decorators or service to submit requests
4. Monitor queue statistics via the API endpoints
5. Consider adding Redis persistence for production use

The system is fully functional and ready for integration with your estimate generation and other services that require priority-based processing.
