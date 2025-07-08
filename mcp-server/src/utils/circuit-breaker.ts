/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily halting requests to failing services
 */

import { logger } from './logger.js';

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening circuit
  resetTimeout: number;          // Time in ms before attempting to close circuit
  monitoringPeriod: number;      // Time window in ms for failure counting
  halfOpenRequests: number;      // Number of test requests in half-open state
  timeout: number;               // Request timeout in ms
  volumeThreshold: number;       // Minimum requests before evaluating failures
  errorThresholdPercentage: number; // Percentage of errors to open circuit
}

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, rejecting requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerMetrics {
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

export class CircuitBreaker<T = any> {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttempt?: Date;
  private stateChangedAt: Date = new Date();
  private requestsInWindow: Array<{ timestamp: Date; success: boolean }> = [];
  private halfOpenTests: number = 0;
  private totalRequests: number = 0;
  private rejectedRequests: number = 0;

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000, // 1 minute
      halfOpenRequests: 3,
      timeout: 30000, // 30 seconds
      volumeThreshold: 10,
      errorThresholdPercentage: 50
    }
  ) {
    logger.info(`🔌 Circuit breaker initialized for ${name}`, config);
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<R>(fn: () => Promise<R>): Promise<R> {
    // Check if circuit should be evaluated
    if (this.state === CircuitState.OPEN) {
      if (!this.canAttemptReset()) {
        this.rejectedRequests++;
        throw new Error(`Circuit breaker is OPEN for ${this.name}. Service is unavailable.`);
      }
      // Transition to half-open for testing
      this.transitionTo(CircuitState.HALF_OPEN);
    }

    // In half-open state, limit concurrent tests
    if (this.state === CircuitState.HALF_OPEN && this.halfOpenTests >= this.config.halfOpenRequests) {
      this.rejectedRequests++;
      throw new Error(`Circuit breaker is testing ${this.name}. Please retry later.`);
    }

    try {
      // Add timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Request timeout after ${this.config.timeout}ms`)), this.config.timeout);
      });

      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenTests++;
      }

      const result = await Promise.race([fn(), timeoutPromise]);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    } finally {
      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenTests--;
      }
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.totalRequests++;
    this.successes++;
    this.lastSuccessTime = new Date();
    this.recordRequest(true);

    if (this.state === CircuitState.HALF_OPEN) {
      const recentRequests = this.getRecentRequests();
      const successRate = recentRequests.filter(r => r.success).length / recentRequests.length;
      
      // If success rate is good in half-open state, close the circuit
      if (successRate >= 0.8 && recentRequests.length >= this.config.halfOpenRequests) {
        this.transitionTo(CircuitState.CLOSED);
        logger.info(`✅ Circuit breaker for ${this.name} is now CLOSED (recovered)`);
      }
    }

    // Reset failure count on success in closed state
    if (this.state === CircuitState.CLOSED) {
      this.failures = 0;
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(error: Error): void {
    this.totalRequests++;
    this.failures++;
    this.lastFailureTime = new Date();
    this.recordRequest(false);

    logger.warn(`⚠️ Circuit breaker ${this.name} recorded failure: ${error.message}`);

    // Evaluate if circuit should open
    if (this.state === CircuitState.CLOSED) {
      const shouldOpen = this.shouldOpenCircuit();
      if (shouldOpen) {
        this.transitionTo(CircuitState.OPEN);
        logger.error(`🚨 Circuit breaker for ${this.name} is now OPEN due to failures`);
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open state reopens the circuit
      this.transitionTo(CircuitState.OPEN);
      logger.warn(`🔄 Circuit breaker for ${this.name} reopened due to failure in half-open state`);
    }
  }

  /**
   * Check if circuit should open based on failure metrics
   */
  private shouldOpenCircuit(): boolean {
    const recentRequests = this.getRecentRequests();
    
    // Need minimum volume of requests
    if (recentRequests.length < this.config.volumeThreshold) {
      return false;
    }

    // Check failure count threshold
    const recentFailures = recentRequests.filter(r => !r.success).length;
    if (recentFailures >= this.config.failureThreshold) {
      return true;
    }

    // Check error percentage threshold
    const errorRate = (recentFailures / recentRequests.length) * 100;
    return errorRate >= this.config.errorThresholdPercentage;
  }

  /**
   * Record request for metrics
   */
  private recordRequest(success: boolean): void {
    const now = new Date();
    this.requestsInWindow.push({ timestamp: now, success });
    
    // Clean old requests outside monitoring window
    const cutoff = new Date(now.getTime() - this.config.monitoringPeriod);
    this.requestsInWindow = this.requestsInWindow.filter(r => r.timestamp > cutoff);
  }

  /**
   * Get recent requests within monitoring period
   */
  private getRecentRequests(): Array<{ timestamp: Date; success: boolean }> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.config.monitoringPeriod);
    return this.requestsInWindow.filter(r => r.timestamp > cutoff);
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private canAttemptReset(): boolean {
    if (!this.nextAttempt) {
      return true;
    }
    return new Date() >= this.nextAttempt;
  }

  /**
   * Transition to new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.stateChangedAt = new Date();

    if (newState === CircuitState.OPEN) {
      this.nextAttempt = new Date(Date.now() + this.config.resetTimeout);
      this.halfOpenTests = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.halfOpenTests = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.failures = 0;
      this.nextAttempt = undefined;
      this.halfOpenTests = 0;
    }

    logger.info(`🔄 Circuit breaker ${this.name} transitioned from ${oldState} to ${newState}`);
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    const recentRequests = this.getRecentRequests();
    const recentFailures = recentRequests.filter(r => !r.success).length;
    const errorRate = recentRequests.length > 0 
      ? (recentFailures / recentRequests.length) * 100 
      : 0;

    return {
      totalRequests: this.totalRequests,
      failedRequests: this.failures,
      successfulRequests: this.successes,
      rejectedRequests: this.rejectedRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      currentState: this.state,
      stateChangedAt: this.stateChangedAt,
      errorRate
    };
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Check if circuit is available for requests
   */
  isAvailable(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }
    if (this.state === CircuitState.OPEN) {
      return this.canAttemptReset();
    }
    // Half-open state - limited availability
    return this.halfOpenTests < this.config.halfOpenRequests;
  }

  /**
   * Force reset circuit (for testing or manual intervention)
   */
  reset(): void {
    this.transitionTo(CircuitState.CLOSED);
    this.failures = 0;
    this.successes = 0;
    this.requestsInWindow = [];
    this.halfOpenTests = 0;
    logger.info(`🔧 Circuit breaker ${this.name} manually reset`);
  }

  /**
   * Force open circuit (for testing or manual intervention)
   */
  forceOpen(): void {
    this.transitionTo(CircuitState.OPEN);
    logger.warn(`⚡ Circuit breaker ${this.name} manually opened`);
  }
}

/**
 * Circuit breaker factory for managing multiple breakers
 */
export class CircuitBreakerFactory {
  private static breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker
   */
  static getBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 60000,
        halfOpenRequests: 3,
        timeout: 30000,
        volumeThreshold: 10,
        errorThresholdPercentage: 50
      };
      
      this.breakers.set(name, new CircuitBreaker(name, { ...defaultConfig, ...config }));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breakers
   */
  static getAllBreakers(): Map<string, CircuitBreaker> {
    return this.breakers;
  }

  /**
   * Get metrics for all breakers
   */
  static getAllMetrics(): { [key: string]: CircuitBreakerMetrics } {
    const metrics: { [key: string]: CircuitBreakerMetrics } = {};
    this.breakers.forEach((breaker, name) => {
      metrics[name] = breaker.getMetrics();
    });
    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  static resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
  }
}
