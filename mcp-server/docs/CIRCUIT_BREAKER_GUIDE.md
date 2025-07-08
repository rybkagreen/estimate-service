# Circuit Breaker Pattern Implementation Guide

## Overview

The circuit breaker pattern has been integrated into the ModelManagerService to prevent cascading failures when AI model providers experience issues. This implementation protects the system from repeated failures and provides automatic recovery mechanisms.

## Architecture

### Circuit Breaker States

1. **CLOSED** (Normal Operation)
   - All requests pass through normally
   - Failures are tracked but don't block requests
   - Circuit opens if failure threshold is reached

2. **OPEN** (Failing State)
   - All requests are immediately rejected
   - No requests reach the failing service
   - After reset timeout, circuit attempts recovery

3. **HALF_OPEN** (Testing Recovery)
   - Limited number of test requests allowed
   - If successful, circuit closes
   - If any failure occurs, circuit reopens

### Configuration

```typescript
const circuitBreakerConfig: CircuitBreakerConfig = {
  failureThreshold: 3,          // Open after 3 consecutive failures
  resetTimeout: 120000,         // Try recovery after 2 minutes
  monitoringPeriod: 300000,     // Monitor over 5 minute window
  halfOpenRequests: 2,          // Allow 2 test requests
  timeout: 45000,               // 45 second request timeout
  volumeThreshold: 5,           // Min requests before evaluation
  errorThresholdPercentage: 60  // Open if 60% fail
};
```

## Implementation Details

### ModelManagerService Integration

The ModelManagerService now includes circuit breakers for each AI provider:

```typescript
private deepSeekCircuitBreaker: CircuitBreaker;
private claudeCircuitBreaker: CircuitBreaker;
```

### Request Flow

1. **Model Selection**: Service selects appropriate AI model based on request
2. **Circuit Check**: Verifies if selected model's circuit is available
3. **Fallback Logic**: If circuit is open, automatically falls back to alternative model
4. **Execution**: Requests are wrapped in circuit breaker execution
5. **Metrics**: All requests update circuit breaker metrics

### Error Handling

```typescript
// Primary model with circuit protection
if (this.claudeCircuitBreaker.isAvailable()) {
  try {
    response = await this.processWithClaude(request);
  } catch (error) {
    // Automatic fallback to DeepSeek
    response = await this.processWithDeepSeek(request);
  }
} else {
  // Circuit is open, use fallback directly
  response = await this.processWithDeepSeek(request);
}
```

## Usage Examples

### Basic Request Processing

```typescript
const response = await modelManager.processRequest({
  prompt: "Analyze this code",
  preferredModel: "claude-3.5-sonnet",
  maxTokens: 2000
});

// Response includes circuit breaker metadata
console.log(response.metadata.circuitBreakerMetrics);
```

### Health Check with Circuit Status

```typescript
const health = await modelManager.healthCheck();

console.log(health.deepseek.circuitBreaker);
// {
//   state: 'CLOSED',
//   available: true,
//   metrics: { ... }
// }
```

### Manual Circuit Control

```typescript
// Reset all circuits (admin operation)
modelManager.resetCircuitBreakers();

// Get current configuration
const config = modelManager.getCircuitBreakerConfig();
```

## Monitoring and Metrics

### Available Metrics

```typescript
interface CircuitBreakerMetrics {
  totalRequests: number;
  failedRequests: number;
  successfulRequests: number;
  rejectedRequests: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  currentState: CircuitState;
  stateChangedAt: Date;
  errorRate: number;
}
```

### Monitoring Endpoints

- `/health` - Includes circuit breaker status for each model
- `/metrics` - Detailed circuit breaker metrics
- `/admin/circuit-breakers/reset` - Reset all circuits

## Best Practices

### 1. Timeout Configuration
- Set appropriate timeouts based on expected AI model response times
- Consider network latency and model complexity

### 2. Failure Thresholds
- Balance between protecting the system and allowing recovery
- Monitor error rates to tune thresholds

### 3. Reset Timing
- Allow enough time for services to recover
- Consider peak vs off-peak configurations

### 4. Fallback Strategies
- Always have a fallback model configured
- Consider degraded responses vs complete failures

### 5. Monitoring
- Set up alerts for circuit state changes
- Monitor rejection rates
- Track recovery success rates

## Testing

### Unit Tests

```bash
npm test src/utils/circuit-breaker.test.ts
```

### Integration Testing

```typescript
// Simulate failures
for (let i = 0; i < 5; i++) {
  try {
    await modelManager.processRequest({
      prompt: "test",
      preferredModel: "claude-3.5-sonnet"
    });
  } catch (e) {
    // Circuit should open after threshold
  }
}

// Verify circuit is open
const health = await modelManager.healthCheck();
expect(health.claude.circuitBreaker.state).toBe('OPEN');
```

## Troubleshooting

### Circuit Stuck Open
1. Check if the service has actually recovered
2. Verify network connectivity
3. Review error logs for root cause
4. Manually reset if necessary

### High Rejection Rate
1. Review failure threshold configuration
2. Check if timeouts are too aggressive
3. Analyze error patterns
4. Consider increasing half-open test requests

### Cascade Failures
1. Ensure fallback models are properly configured
2. Verify both circuits aren't opening simultaneously
3. Review shared dependencies
4. Consider separate circuit configurations per model

## Future Enhancements

1. **Dynamic Configuration**
   - Adjust thresholds based on time of day
   - Auto-tune based on historical data

2. **Advanced Metrics**
   - Latency percentiles
   - Success rate trends
   - Prediction of circuit opening

3. **Multi-Level Fallbacks**
   - Chain of fallback models
   - Degraded functionality options

4. **Event System**
   - Emit events on state changes
   - Integration with monitoring systems

## Conclusion

The circuit breaker implementation provides robust protection against AI model failures while maintaining service availability through intelligent fallbacks. By monitoring circuit states and adjusting configurations based on observed patterns, the system can maintain high availability even when individual providers experience issues.
