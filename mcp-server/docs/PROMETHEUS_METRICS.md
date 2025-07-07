# Prometheus Metrics Documentation

## Overview

The MCP server exposes Prometheus metrics for monitoring AI model performance, errors, and caching efficiency. These metrics are available on a separate HTTP endpoint for integration with external monitoring systems.

## Configuration

The metrics server runs on port `9090` by default. You can change this by setting the `METRICS_PORT` environment variable:

```bash
export METRICS_PORT=9091
```

## Accessing Metrics

Once the server is running, metrics are available at:
- **Metrics endpoint**: `http://localhost:9090/metrics`
- **Health check**: `http://localhost:9090/health`

## Available Metrics

### 1. AI Model Response Time (`ai_model_response_time`)

A histogram that tracks response times for AI model calls in seconds.

**Labels:**
- `model`: The AI model name (e.g., "deepseek-r1", "gpt-4")
- `provider`: The AI provider (e.g., "deepseek", "openai")
- `operation`: The operation type (e.g., "chat", "analyze_code", "generate_docs")
- `status`: Request status ("success" or "error")

**Example query:**
```promql
# Average response time by model
rate(ai_model_response_time_sum[5m]) / rate(ai_model_response_time_count[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(ai_model_response_time_bucket[5m]))
```

### 2. AI Model Errors (`ai_model_errors`)

A counter that tracks errors from AI model calls.

**Labels:**
- `model`: The AI model name
- `provider`: The AI provider
- `error_type`: Type of error (e.g., "auth_error", "rate_limit", "network_error", "server_error")
- `operation`: The operation type

**Example query:**
```promql
# Error rate by model
rate(ai_model_errors[5m])

# Total errors in the last hour
increase(ai_model_errors[1h])
```

### 3. AI Cache Metrics

#### Cache Hits (`ai_cache_hits`)
Counter for cache hits.

#### Cache Misses (`ai_cache_misses`)
Counter for cache misses.

#### Cache Hit Rate (`ai_cache_hit_rate`)
Gauge showing current cache hit rate as a percentage.

**Labels:**
- `model`: The AI model name
- `provider`: The AI provider
- `operation`: The operation type (for hits/misses)

**Example query:**
```promql
# Cache hit rate calculation
ai_cache_hits / (ai_cache_hits + ai_cache_misses)

# Cache efficiency by model
rate(ai_cache_hits[5m]) / (rate(ai_cache_hits[5m]) + rate(ai_cache_misses[5m]))
```

### 4. Additional Metrics

#### Total Requests (`ai_model_requests_total`)
Total number of AI model requests.

#### Active Requests (`ai_model_active_requests`)
Number of currently active AI model requests.

#### Token Usage (`ai_model_tokens_used`)
Total tokens consumed by AI models.

**Labels for token usage:**
- `token_type`: "input" or "output"

#### Model Availability (`ai_model_availability`)
Model availability status (1 = available, 0 = unavailable).

## Integration with Prometheus

### Prometheus Configuration

Add the following to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'mcp-server'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 15s
```

### Grafana Dashboard

Example dashboard queries:

1. **Response Time Panel**:
```promql
histogram_quantile(0.95, 
  sum(rate(ai_model_response_time_bucket[5m])) by (model, le)
)
```

2. **Error Rate Panel**:
```promql
sum(rate(ai_model_errors[5m])) by (model, error_type)
```

3. **Cache Efficiency Panel**:
```promql
sum(rate(ai_cache_hits[5m])) by (model) / 
(sum(rate(ai_cache_hits[5m])) by (model) + sum(rate(ai_cache_misses[5m])) by (model))
```

4. **Token Usage Panel**:
```promql
sum(increase(ai_model_tokens_used[1h])) by (model, token_type)
```

## Alerting Rules

Example Prometheus alerting rules:

```yaml
groups:
  - name: ai_model_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(ai_model_errors[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate for {{ $labels.model }}"
          description: "Error rate is {{ $value }} errors/sec"
      
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(ai_model_response_time_bucket[5m])) > 30
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time for {{ $labels.model }}"
          description: "95th percentile response time is {{ $value }}s"
      
      - alert: ModelUnavailable
        expr: ai_model_availability == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Model {{ $labels.model }} is unavailable"
          description: "The AI model has been unavailable for more than 1 minute"
      
      - alert: LowCacheHitRate
        expr: ai_cache_hit_rate < 0.5
        for: 15m
        labels:
          severity: info
        annotations:
          summary: "Low cache hit rate for {{ $labels.model }}"
          description: "Cache hit rate is {{ $value }}%"
```

## Best Practices

1. **Monitor Response Times**: Keep track of p95 and p99 response times to identify performance degradation.

2. **Track Error Patterns**: Monitor error types to identify authentication issues, rate limiting, or service outages.

3. **Optimize Cache Usage**: Use cache hit rate metrics to optimize caching strategies.

4. **Set Up Alerts**: Configure alerts for critical metrics like high error rates or model unavailability.

5. **Dashboard Organization**: Create separate dashboards for:
   - Performance metrics (response times, throughput)
   - Error analysis (error rates, types)
   - Resource usage (token consumption, active requests)
   - Cache efficiency

## Troubleshooting

### Metrics not appearing
1. Check if the metrics server is running: `curl http://localhost:9090/health`
2. Verify no other service is using port 9090
3. Check logs for any initialization errors

### High cardinality warnings
If you see warnings about high cardinality, consider:
- Reducing the number of unique label combinations
- Aggregating metrics at a higher level
- Using recording rules for frequently-queried metrics

## Example Usage

### Starting the server with metrics
```bash
# Set metrics port (optional)
export METRICS_PORT=9090

# Start the MCP server
npm run start:simple
```

### Checking metrics manually
```bash
# View raw metrics
curl http://localhost:9090/metrics

# Check specific metric
curl http://localhost:9090/metrics | grep ai_model_response_time

# Health check
curl http://localhost:9090/health
```
