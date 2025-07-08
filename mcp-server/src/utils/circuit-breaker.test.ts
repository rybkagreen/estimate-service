import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CircuitBreaker, CircuitState, CircuitBreakerFactory } from './circuit-breaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;
  const testConfig = {
    failureThreshold: 3,
    resetTimeout: 1000,
    monitoringPeriod: 5000,
    halfOpenRequests: 2,
    timeout: 500,
    volumeThreshold: 3,
    errorThresholdPercentage: 50
  };

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test-service', testConfig);
  });

  describe('Initial State', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should be available initially', () => {
      expect(circuitBreaker.isAvailable()).toBe(true);
    });
  });

  describe('Success Handling', () => {
    it('should execute successful requests', async () => {
      const result = await circuitBreaker.execute(async () => 'success');
      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should track successful requests in metrics', async () => {
      await circuitBreaker.execute(async () => 'success');
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.totalRequests).toBe(1);
    });
  });

  describe('Failure Handling', () => {
    it('should track failures', async () => {
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('test error');
        });
      } catch (e) {
        // Expected
      }
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.totalRequests).toBe(1);
    });

    it('should open circuit after failure threshold', async () => {
      // Need minimum volume first
      for (let i = 0; i < testConfig.volumeThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('test error');
          });
        } catch (e) {
          // Expected
        }
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should reject requests when circuit is open', async () => {
      // Open the circuit
      for (let i = 0; i < testConfig.volumeThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('test error');
          });
        } catch (e) {
          // Expected
        }
      }

      // Try another request
      await expect(
        circuitBreaker.execute(async () => 'should not execute')
      ).rejects.toThrow('Circuit breaker is OPEN');
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout long-running requests', async () => {
      await expect(
        circuitBreaker.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return 'should timeout';
        })
      ).rejects.toThrow('Request timeout after 500ms');
    });
  });

  describe('Half-Open State', () => {
    it('should transition to half-open after reset timeout', async () => {
      // Open the circuit
      for (let i = 0; i < testConfig.volumeThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('test error');
          });
        } catch (e) {
          // Expected
        }
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, testConfig.resetTimeout + 100));

      // Next request should transition to half-open
      try {
        await circuitBreaker.execute(async () => 'test');
      } catch (e) {
        // Expected
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);
    });

    it('should close circuit on successful half-open requests', async () => {
      // Force to half-open state
      circuitBreaker['transitionTo'](CircuitState.HALF_OPEN);

      // Successful requests
      for (let i = 0; i < testConfig.halfOpenRequests; i++) {
        await circuitBreaker.execute(async () => 'success');
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should reopen circuit on failed half-open request', async () => {
      // Force to half-open state
      circuitBreaker['transitionTo'](CircuitState.HALF_OPEN);

      // Failed request
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('test error');
        });
      } catch (e) {
        // Expected
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('Manual Controls', () => {
    it('should reset circuit on manual reset', () => {
      circuitBreaker['transitionTo'](CircuitState.OPEN);
      circuitBreaker.reset();
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should force open circuit', () => {
      circuitBreaker.forceOpen();
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('Metrics', () => {
    it('should calculate error rate correctly', async () => {
      // Mix of successes and failures
      await circuitBreaker.execute(async () => 'success');
      
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('test error');
          });
        } catch (e) {
          // Expected
        }
      }

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.errorRate).toBeCloseTo(66.67, 1);
    });
  });
});

describe('CircuitBreakerFactory', () => {
  beforeEach(() => {
    // Clear all breakers
    CircuitBreakerFactory['breakers'].clear();
  });

  it('should create and reuse circuit breakers', () => {
    const breaker1 = CircuitBreakerFactory.getBreaker('service1');
    const breaker2 = CircuitBreakerFactory.getBreaker('service1');
    expect(breaker1).toBe(breaker2);
  });

  it('should create different breakers for different services', () => {
    const breaker1 = CircuitBreakerFactory.getBreaker('service1');
    const breaker2 = CircuitBreakerFactory.getBreaker('service2');
    expect(breaker1).not.toBe(breaker2);
  });

  it('should get all metrics', () => {
    CircuitBreakerFactory.getBreaker('service1');
    CircuitBreakerFactory.getBreaker('service2');
    
    const metrics = CircuitBreakerFactory.getAllMetrics();
    expect(Object.keys(metrics)).toHaveLength(2);
    expect(metrics).toHaveProperty('service1');
    expect(metrics).toHaveProperty('service2');
  });

  it('should reset all breakers', () => {
    const breaker1 = CircuitBreakerFactory.getBreaker('service1');
    const breaker2 = CircuitBreakerFactory.getBreaker('service2');
    
    breaker1.forceOpen();
    breaker2.forceOpen();
    
    CircuitBreakerFactory.resetAll();
    
    expect(breaker1.getState()).toBe(CircuitState.CLOSED);
    expect(breaker2.getState()).toBe(CircuitState.CLOSED);
  });
});
