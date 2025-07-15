import { Injectable, Inject } from '@nestjs/common';
import { MonitoringConfig } from '../config/monitoring.config';
import * as prometheus from 'prom-client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MetricsService {
  private register: prometheus.Registry;
  
  // HTTP Metrics
  private httpRequestDuration: prometheus.Histogram<string>;
  private httpRequestSize: prometheus.Histogram<string>;
  private httpResponseSize: prometheus.Histogram<string>;
  private httpActiveRequests: prometheus.Gauge<string>;
  
  // System Metrics
  private cpuUsage: prometheus.Gauge<string>;
  private memoryUsage: prometheus.Gauge<string>;
  private eventLoopDelay: prometheus.Histogram<string>;
  private gcDuration: prometheus.Histogram<string>;
  
  // Database Metrics
  private dbConnectionPool: prometheus.Gauge<string>;
  private dbQueryDuration: prometheus.Histogram<string>;
  private dbTransactionDuration: prometheus.Histogram<string>;
  
  // Redis Metrics
  private redisCommandDuration: prometheus.Histogram<string>;
  private redisConnectionPool: prometheus.Gauge<string>;
  
  // Business Metrics
  private estimateCreationTime: prometheus.Histogram<string>;
  private fileProcessingTime: prometheus.Histogram<string>;
  private aiResponseTime: prometheus.Histogram<string>;
  private exportGenerationTime: prometheus.Histogram<string>;
  
  // Custom counters
  private errorCounter: prometheus.Counter<string>;
  private requestCounter: prometheus.Counter<string>;
  private businessEventCounter: prometheus.Counter<string>;

  constructor(
    @Inject('MONITORING_CONFIG') private config: MonitoringConfig,
    private eventEmitter: EventEmitter2,
  ) {
    this.register = new prometheus.Registry();
    this.initializeMetrics();
    this.startCollectors();
  }

  private initializeMetrics(): void {
    // Default metrics (CPU, memory, etc.)
    if (this.config.performance.collection.metrics.cpuUsage || 
        this.config.performance.collection.metrics.memoryUsage) {
      prometheus.collectDefaultMetrics({ 
        register: this.register,
        prefix: 'estimate_service_',
      });
    }

    // HTTP Metrics
    if (this.config.performance.collection.metrics.httpRequestDuration) {
      this.httpRequestDuration = new prometheus.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.httpRequestSize) {
      this.httpRequestSize = new prometheus.Histogram({
        name: 'http_request_size_bytes',
        help: 'Size of HTTP requests in bytes',
        labelNames: ['method', 'route'],
        buckets: [100, 1000, 10000, 100000, 1000000],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.httpResponseSize) {
      this.httpResponseSize = new prometheus.Histogram({
        name: 'http_response_size_bytes',
        help: 'Size of HTTP responses in bytes',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [100, 1000, 10000, 100000, 1000000],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.httpActiveRequests) {
      this.httpActiveRequests = new prometheus.Gauge({
        name: 'http_active_requests',
        help: 'Number of active HTTP requests',
        labelNames: ['method'],
        registers: [this.register],
      });
    }

    // System Metrics
    if (this.config.performance.collection.metrics.eventLoopDelay) {
      this.eventLoopDelay = new prometheus.Histogram({
        name: 'nodejs_event_loop_delay_seconds',
        help: 'Node.js event loop delay in seconds',
        buckets: [0.001, 0.01, 0.1, 1],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.gcDuration) {
      this.gcDuration = new prometheus.Histogram({
        name: 'nodejs_gc_duration_seconds',
        help: 'Garbage collection duration in seconds',
        labelNames: ['type'],
        buckets: [0.001, 0.01, 0.1, 1],
        registers: [this.register],
      });
    }

    // Database Metrics
    if (this.config.performance.collection.metrics.dbConnectionPool) {
      this.dbConnectionPool = new prometheus.Gauge({
        name: 'database_connection_pool_size',
        help: 'Database connection pool metrics',
        labelNames: ['state'], // active, idle, total
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.dbQueryDuration) {
      this.dbQueryDuration = new prometheus.Histogram({
        name: 'database_query_duration_seconds',
        help: 'Database query duration in seconds',
        labelNames: ['operation', 'table'],
        buckets: [0.001, 0.01, 0.1, 0.5, 1, 5],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.dbTransactionDuration) {
      this.dbTransactionDuration = new prometheus.Histogram({
        name: 'database_transaction_duration_seconds',
        help: 'Database transaction duration in seconds',
        labelNames: ['status'], // commit, rollback
        buckets: [0.01, 0.1, 0.5, 1, 5, 10],
        registers: [this.register],
      });
    }

    // Redis Metrics
    if (this.config.performance.collection.metrics.redisCommandDuration) {
      this.redisCommandDuration = new prometheus.Histogram({
        name: 'redis_command_duration_seconds',
        help: 'Redis command duration in seconds',
        labelNames: ['command'],
        buckets: [0.0001, 0.001, 0.01, 0.1, 1],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.redisConnectionPool) {
      this.redisConnectionPool = new prometheus.Gauge({
        name: 'redis_connection_pool_size',
        help: 'Redis connection pool metrics',
        labelNames: ['state'], // active, idle, total
        registers: [this.register],
      });
    }

    // Business Metrics
    if (this.config.performance.collection.metrics.estimateCreationTime) {
      this.estimateCreationTime = new prometheus.Histogram({
        name: 'estimate_creation_duration_seconds',
        help: 'Time to create an estimate in seconds',
        labelNames: ['status', 'type'],
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.fileProcessingTime) {
      this.fileProcessingTime = new prometheus.Histogram({
        name: 'file_processing_duration_seconds',
        help: 'File processing duration in seconds',
        labelNames: ['file_type', 'status'],
        buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.aiResponseTime) {
      this.aiResponseTime = new prometheus.Histogram({
        name: 'ai_response_duration_seconds',
        help: 'AI service response time in seconds',
        labelNames: ['model', 'operation'],
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
        registers: [this.register],
      });
    }

    if (this.config.performance.collection.metrics.exportGenerationTime) {
      this.exportGenerationTime = new prometheus.Histogram({
        name: 'export_generation_duration_seconds',
        help: 'Export generation duration in seconds',
        labelNames: ['format', 'status'],
        buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
        registers: [this.register],
      });
    }

    // Error and request counters
    this.errorCounter = new prometheus.Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'code', 'method'],
      registers: [this.register],
    });

    this.requestCounter = new prometheus.Counter({
      name: 'requests_total',
      help: 'Total number of requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.businessEventCounter = new prometheus.Counter({
      name: 'business_events_total',
      help: 'Total number of business events',
      labelNames: ['event', 'status'],
      registers: [this.register],
    });
  }

  private startCollectors(): void {
    // Event loop delay collector
    if (this.config.performance.collection.metrics.eventLoopDelay) {
      const measureEventLoopDelay = () => {
        const start = process.hrtime.bigint();
        setImmediate(() => {
          const delay = Number(process.hrtime.bigint() - start) / 1e9;
          this.eventLoopDelay.observe(delay);
        });
      };
      
      setInterval(measureEventLoopDelay, this.config.performance.collection.interval);
    }

    // GC metrics collector
    if (this.config.performance.collection.metrics.gcDuration) {
      try {
        const perfHooks = require('perf_hooks');
        const obs = new perfHooks.PerformanceObserver((list: any) => {
          const entry = list.getEntries()[0];
          this.gcDuration.observe({ type: entry.detail.kind }, entry.duration / 1000);
        });
        obs.observe({ entryTypes: ['gc'], buffered: false });
      } catch (e) {
        // GC metrics not available
      }
    }
  }

  // HTTP metrics recording
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    requestSize?: number,
    responseSize?: number
  ): void {
    if (this.httpRequestDuration) {
      this.httpRequestDuration.observe(
        { method, route, status_code: statusCode.toString() },
        duration / 1000
      );
    }

    if (this.httpRequestSize && requestSize) {
      this.httpRequestSize.observe({ method, route }, requestSize);
    }

    if (this.httpResponseSize && responseSize) {
      this.httpResponseSize.observe(
        { method, route, status_code: statusCode.toString() },
        responseSize
      );
    }

    this.requestCounter.inc({ 
      method, 
      route, 
      status_code: statusCode.toString() 
    });

    // Check thresholds
    if (duration > this.config.performance.thresholds.responseTime.p99) {
      this.eventEmitter.emit('performance.slow-request', {
        method,
        route,
        duration,
        threshold: this.config.performance.thresholds.responseTime.p99,
      });
    }
  }

  incrementActiveRequests(method: string): void {
    if (this.httpActiveRequests) {
      this.httpActiveRequests.inc({ method });
    }
  }

  decrementActiveRequests(method: string): void {
    if (this.httpActiveRequests) {
      this.httpActiveRequests.dec({ method });
    }
  }

  // Database metrics
  recordDatabaseQuery(operation: string, table: string, duration: number): void {
    if (this.dbQueryDuration) {
      this.dbQueryDuration.observe({ operation, table }, duration / 1000);
    }

    // Check threshold
    if (duration > this.config.performance.thresholds.database.queryTime) {
      this.eventEmitter.emit('performance.slow-query', {
        operation,
        table,
        duration,
        threshold: this.config.performance.thresholds.database.queryTime,
      });
    }
  }

  recordDatabaseTransaction(status: 'commit' | 'rollback', duration: number): void {
    if (this.dbTransactionDuration) {
      this.dbTransactionDuration.observe({ status }, duration / 1000);
    }
  }

  updateDatabasePoolMetrics(active: number, idle: number, total: number): void {
    if (this.dbConnectionPool) {
      this.dbConnectionPool.set({ state: 'active' }, active);
      this.dbConnectionPool.set({ state: 'idle' }, idle);
      this.dbConnectionPool.set({ state: 'total' }, total);
    }

    // Check threshold
    const usage = active / total;
    if (usage > this.config.performance.thresholds.database.connectionPoolUsage) {
      this.eventEmitter.emit('performance.high-db-pool-usage', {
        usage,
        active,
        total,
        threshold: this.config.performance.thresholds.database.connectionPoolUsage,
      });
    }
  }

  // Redis metrics
  recordRedisCommand(command: string, duration: number): void {
    if (this.redisCommandDuration) {
      this.redisCommandDuration.observe({ command }, duration / 1000);
    }

    // Check threshold
    if (duration > this.config.performance.thresholds.redis.commandTime) {
      this.eventEmitter.emit('performance.slow-redis-command', {
        command,
        duration,
        threshold: this.config.performance.thresholds.redis.commandTime,
      });
    }
  }

  updateRedisPoolMetrics(active: number, idle: number, total: number): void {
    if (this.redisConnectionPool) {
      this.redisConnectionPool.set({ state: 'active' }, active);
      this.redisConnectionPool.set({ state: 'idle' }, idle);
      this.redisConnectionPool.set({ state: 'total' }, total);
    }
  }

  // Business metrics
  recordEstimateCreation(status: 'success' | 'failure', type: string, duration: number): void {
    if (this.estimateCreationTime) {
      this.estimateCreationTime.observe({ status, type }, duration / 1000);
    }
    
    this.businessEventCounter.inc({ event: 'estimate_created', status });
  }

  recordFileProcessing(fileType: string, status: 'success' | 'failure', duration: number): void {
    if (this.fileProcessingTime) {
      this.fileProcessingTime.observe({ file_type: fileType, status }, duration / 1000);
    }
    
    this.businessEventCounter.inc({ event: 'file_processed', status });
  }

  recordAIResponse(model: string, operation: string, duration: number): void {
    if (this.aiResponseTime) {
      this.aiResponseTime.observe({ model, operation }, duration / 1000);
    }
  }

  recordExportGeneration(format: string, status: 'success' | 'failure', duration: number): void {
    if (this.exportGenerationTime) {
      this.exportGenerationTime.observe({ format, status }, duration / 1000);
    }
    
    this.businessEventCounter.inc({ event: 'export_generated', status });
  }

  // Error recording
  recordError(type: string, code: string, method?: string): void {
    this.errorCounter.inc({ type, code, method: method || 'unknown' });
  }

  // Get metrics for export
  getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getMetricsContentType(): string {
    return this.register.contentType;
  }

  // Custom metric creation
  createCounter(name: string, help: string, labelNames?: string[]): prometheus.Counter<string> {
    return new prometheus.Counter({
      name,
      help,
      labelNames,
      registers: [this.register],
    });
  }

  createGauge(name: string, help: string, labelNames?: string[]): prometheus.Gauge<string> {
    return new prometheus.Gauge({
      name,
      help,
      labelNames,
      registers: [this.register],
    });
  }

  createHistogram(
    name: string, 
    help: string, 
    labelNames?: string[], 
    buckets?: number[]
  ): prometheus.Histogram<string> {
    return new prometheus.Histogram({
      name,
      help,
      labelNames,
      buckets,
      registers: [this.register],
    });
  }

  // Performance timer helper
  startTimer(): { end: (labels?: Record<string, string>) => number } {
    const start = process.hrtime.bigint();
    
    return {
      end: (labels?: Record<string, string>) => {
        const duration = Number(process.hrtime.bigint() - start) / 1e6; // Convert to ms
        return duration;
      }
    };
  }
}
