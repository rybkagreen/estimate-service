/**
 * Prometheus metrics for AI model monitoring
 */
import { Registry, Histogram, Counter, Gauge } from 'prom-client';
export declare const metricsRegistry: Registry<"text/plain; version=0.0.4; charset=utf-8">;
/**
 * AI Model Response Time Histogram
 * Tracks response times for AI model calls by model and provider
 */
export declare const aiModelResponseTime: Histogram<"status" | "model" | "provider" | "operation">;
/**
 * AI Model Errors Counter
 * Counts errors by model, provider, and error type
 */
export declare const aiModelErrors: Counter<"model" | "provider" | "operation" | "error_type">;
/**
 * AI Cache Hit Rate Counter
 * Tracks cache hits and misses for AI responses
 */
export declare const aiCacheHits: Counter<"model" | "provider" | "operation">;
export declare const aiCacheMisses: Counter<"model" | "provider" | "operation">;
/**
 * AI Cache Hit Rate Gauge
 * Current cache hit rate as a percentage
 */
export declare const aiCacheHitRate: Gauge<"model" | "provider">;
/**
 * Additional useful metrics
 */
export declare const aiModelRequests: Counter<"model" | "provider" | "operation">;
export declare const aiModelActiveRequests: Gauge<"model" | "provider">;
export declare const aiModelTokensUsed: Counter<"model" | "provider" | "token_type">;
export declare const aiModelAvailability: Gauge<"model" | "provider">;
/**
 * Helper functions for recording metrics
 */
interface ModelCallMetrics {
    model: string;
    provider: string;
    operation: string;
    startTime: number;
}
/**
 * Start tracking an AI model call
 */
export declare function startModelCall(model: string, provider: string, operation: string): ModelCallMetrics;
/**
 * Complete tracking an AI model call
 */
export declare function endModelCall(metrics: ModelCallMetrics, success: boolean, cached?: boolean): void;
/**
 * Record an AI model error
 */
export declare function recordModelError(model: string, provider: string, operation: string, errorType: string): void;
/**
 * Record token usage
 */
export declare function recordTokenUsage(model: string, provider: string, inputTokens: number, outputTokens: number): void;
/**
 * Update model availability
 */
export declare function updateModelAvailability(model: string, provider: string, available: boolean): void;
/**
 * Express middleware for metrics endpoint
 */
export declare function metricsEndpoint(_req: any, res: any): Promise<void>;
/**
 * Initialize Prometheus metrics
 */
export declare function initializeMetrics(): void;
/**
 * Get metrics for export
 */
export declare function getMetrics(): Promise<string>;
/**
 * Reset all metrics (useful for testing)
 */
export declare function resetMetrics(): void;
export {};
