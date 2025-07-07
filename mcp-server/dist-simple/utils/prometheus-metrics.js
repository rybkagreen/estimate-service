/**
 * Prometheus metrics for AI model monitoring
 */
import { Registry, Histogram, Counter, Gauge } from 'prom-client';
import { logger } from './logger.js';
// Create a custom registry for our metrics
export const metricsRegistry = new Registry();
// Set default labels for all metrics
metricsRegistry.setDefaultLabels({
    app: 'estimate-service-mcp-server',
    environment: process.env.NODE_ENV || 'development'
});
/**
 * AI Model Response Time Histogram
 * Tracks response times for AI model calls by model and provider
 */
export const aiModelResponseTime = new Histogram({
    name: 'ai_model_response_time',
    help: 'Response time of AI model calls in seconds',
    labelNames: ['model', 'provider', 'operation', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60], // Buckets in seconds
    registers: [metricsRegistry]
});
/**
 * AI Model Errors Counter
 * Counts errors by model, provider, and error type
 */
export const aiModelErrors = new Counter({
    name: 'ai_model_errors',
    help: 'Number of errors from AI model calls',
    labelNames: ['model', 'provider', 'error_type', 'operation'],
    registers: [metricsRegistry]
});
/**
 * AI Cache Hit Rate Counter
 * Tracks cache hits and misses for AI responses
 */
export const aiCacheHits = new Counter({
    name: 'ai_cache_hits',
    help: 'Number of cache hits for AI responses',
    labelNames: ['model', 'provider', 'operation'],
    registers: [metricsRegistry]
});
export const aiCacheMisses = new Counter({
    name: 'ai_cache_misses',
    help: 'Number of cache misses for AI responses',
    labelNames: ['model', 'provider', 'operation'],
    registers: [metricsRegistry]
});
/**
 * AI Cache Hit Rate Gauge
 * Current cache hit rate as a percentage
 */
export const aiCacheHitRate = new Gauge({
    name: 'ai_cache_hit_rate',
    help: 'Current cache hit rate percentage',
    labelNames: ['model', 'provider'],
    registers: [metricsRegistry]
});
/**
 * Additional useful metrics
 */
// Total AI requests counter
export const aiModelRequests = new Counter({
    name: 'ai_model_requests_total',
    help: 'Total number of AI model requests',
    labelNames: ['model', 'provider', 'operation'],
    registers: [metricsRegistry]
});
// Active AI requests gauge
export const aiModelActiveRequests = new Gauge({
    name: 'ai_model_active_requests',
    help: 'Number of currently active AI model requests',
    labelNames: ['model', 'provider'],
    registers: [metricsRegistry]
});
// Token usage counter
export const aiModelTokensUsed = new Counter({
    name: 'ai_model_tokens_used',
    help: 'Total number of tokens used',
    labelNames: ['model', 'provider', 'token_type'], // token_type: 'input' or 'output'
    registers: [metricsRegistry]
});
// Model availability gauge
export const aiModelAvailability = new Gauge({
    name: 'ai_model_availability',
    help: 'Model availability status (1 = available, 0 = unavailable)',
    labelNames: ['model', 'provider'],
    registers: [metricsRegistry]
});
/**
 * Start tracking an AI model call
 */
export function startModelCall(model, provider, operation) {
    aiModelRequests.inc({ model, provider, operation });
    aiModelActiveRequests.inc({ model, provider });
    return {
        model,
        provider,
        operation,
        startTime: Date.now()
    };
}
/**
 * Complete tracking an AI model call
 */
export function endModelCall(metrics, success, cached = false) {
    const duration = (Date.now() - metrics.startTime) / 1000; // Convert to seconds
    aiModelActiveRequests.dec({ model: metrics.model, provider: metrics.provider });
    aiModelResponseTime.observe({
        model: metrics.model,
        provider: metrics.provider,
        operation: metrics.operation,
        status: success ? 'success' : 'error'
    }, duration);
    if (cached) {
        aiCacheHits.inc({ model: metrics.model, provider: metrics.provider, operation: metrics.operation });
    }
    else {
        aiCacheMisses.inc({ model: metrics.model, provider: metrics.provider, operation: metrics.operation });
    }
    // Update cache hit rate
    updateCacheHitRate(metrics.model, metrics.provider);
}
/**
 * Record an AI model error
 */
export function recordModelError(model, provider, operation, errorType) {
    aiModelErrors.inc({ model, provider, error_type: errorType, operation });
}
/**
 * Record token usage
 */
export function recordTokenUsage(model, provider, inputTokens, outputTokens) {
    if (inputTokens > 0) {
        aiModelTokensUsed.inc({ model, provider, token_type: 'input' }, inputTokens);
    }
    if (outputTokens > 0) {
        aiModelTokensUsed.inc({ model, provider, token_type: 'output' }, outputTokens);
    }
}
/**
 * Update model availability
 */
export function updateModelAvailability(model, provider, available) {
    aiModelAvailability.set({ model, provider }, available ? 1 : 0);
}
/**
 * Update cache hit rate for a model/provider combination
 */
function updateCacheHitRate(model, provider) {
    // Get current hit and miss counts
    const hits = metricsRegistry.getSingleMetric('ai_cache_hits');
    const misses = metricsRegistry.getSingleMetric('ai_cache_misses');
    // This is a simplified calculation - in production, you might want to track this differently
    // For now, we'll set it based on the last operation
    const labels = { model, provider };
    // Calculate hit rate (this is a simplified version)
    // In production, you'd want to track this over a time window
    const hitRate = 0; // Placeholder - implement actual calculation based on your needs
    aiCacheHitRate.set(labels, hitRate);
}
/**
 * Express middleware for metrics endpoint
 */
export async function metricsEndpoint(_req, res) {
    try {
        res.set('Content-Type', metricsRegistry.contentType);
        const metrics = await metricsRegistry.metrics();
        res.end(metrics);
    }
    catch (error) {
        logger.error('Error generating metrics:', error);
        res.status(500).end();
    }
}
/**
 * Initialize Prometheus metrics
 */
export function initializeMetrics() {
    // Set initial model availability for known models
    const knownModels = [
        { model: 'deepseek-r1', provider: 'deepseek' },
        { model: 'gpt-3.5-turbo', provider: 'openai' },
        { model: 'gpt-4', provider: 'openai' },
        { model: 'claude-3', provider: 'anthropic' }
    ];
    knownModels.forEach(({ model, provider }) => {
        updateModelAvailability(model, provider, true);
    });
    logger.info('📊 Prometheus metrics initialized');
}
/**
 * Get metrics for export
 */
export async function getMetrics() {
    return metricsRegistry.metrics();
}
/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics() {
    metricsRegistry.clear();
    initializeMetrics();
}
