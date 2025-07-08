/**
 * Example of how to integrate Prometheus metrics in other services
 */

import {
  startModelCall,
  endModelCall,
  recordModelError,
  recordTokenUsage,
  updateModelAvailability
} from '../src/utils/prometheus-metrics.js';

/**
 * Example: Using metrics in a hypothetical OpenAI service
 */
class OpenAIService {
  async chat(messages: any[], options: any = {}): Promise<string> {
    // Start tracking the model call
    const metricsCall = startModelCall('gpt-4', 'openai', 'chat');
    
    try {
      // Simulate API call
      const response = await this.callOpenAIAPI(messages, options);
      
      // Record token usage if available
      if (response.usage) {
        recordTokenUsage(
          'gpt-4',
          'openai',
          response.usage.prompt_tokens,
          response.usage.completion_tokens
        );
      }
      
      // Mark successful completion
      endModelCall(metricsCall, true, false);
      updateModelAvailability('gpt-4', 'openai', true);
      
      return response.content;
    } catch (error) {
      // Determine error type
      let errorType = 'unknown_error';
      
      if (error.code === 'rate_limit_exceeded') {
        errorType = 'rate_limit';
      } else if (error.code === 'invalid_api_key') {
        errorType = 'auth_error';
        updateModelAvailability('gpt-4', 'openai', false);
      } else if (error.code === 'model_overloaded') {
        errorType = 'capacity_error';
      }
      
      // Record the error
      recordModelError('gpt-4', 'openai', 'chat', errorType);
      endModelCall(metricsCall, false, false);
      
      throw error;
    }
  }
  
  private async callOpenAIAPI(messages: any[], options: any): Promise<any> {
    // Simulated API call
    return {
      content: 'This is a simulated response',
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50
      }
    };
  }
}

/**
 * Example: Using metrics with caching
 */
class CachedAIService {
  private cache = new Map<string, string>();
  
  async getResponse(prompt: string, model: string, provider: string): Promise<string> {
    const cacheKey = `${model}:${prompt}`;
    const metricsCall = startModelCall(model, provider, 'cached_query');
    
    try {
      // Check cache first
      if (this.cache.has(cacheKey)) {
        // Cache hit!
        const cachedResponse = this.cache.get(cacheKey)!;
        endModelCall(metricsCall, true, true); // Note: cached = true
        return cachedResponse;
      }
      
      // Cache miss - call the actual model
      const response = await this.callModel(prompt, model, provider);
      
      // Store in cache
      this.cache.set(cacheKey, response);
      
      // Record successful call (not cached)
      endModelCall(metricsCall, true, false);
      
      return response;
    } catch (error) {
      recordModelError(model, provider, 'cached_query', 'api_error');
      endModelCall(metricsCall, false, false);
      throw error;
    }
  }
  
  private async callModel(prompt: string, model: string, provider: string): Promise<string> {
    // Simulate model call
    return `Response for: ${prompt}`;
  }
}

/**
 * Example: Batch processing with metrics
 */
async function processBatchWithMetrics(items: string[], model: string, provider: string) {
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of items) {
    const metricsCall = startModelCall(model, provider, 'batch_process');
    
    try {
      const result = await processItem(item);
      endModelCall(metricsCall, true, false);
      successCount++;
      results.push({ item, result, success: true });
    } catch (error) {
      recordModelError(model, provider, 'batch_process', 'processing_error');
      endModelCall(metricsCall, false, false);
      errorCount++;
      results.push({ item, error: error.message, success: false });
    }
  }
  
  console.log(`Batch processing complete: ${successCount} success, ${errorCount} errors`);
  return results;
}

async function processItem(item: string): Promise<string> {
  // Simulate processing
  if (Math.random() > 0.9) {
    throw new Error('Random processing error');
  }
  return `Processed: ${item}`;
}

/**
 * Example: Health check with metrics
 */
async function performHealthCheckWithMetrics() {
  const models = [
    { model: 'gpt-4', provider: 'openai' },
    { model: 'claude-3', provider: 'anthropic' },
    { model: 'deepseek-r1', provider: 'deepseek' }
  ];
  
  for (const { model, provider } of models) {
    const metricsCall = startModelCall(model, provider, 'health_check');
    
    try {
      // Perform health check
      const isHealthy = await checkModelHealth(model, provider);
      
      if (isHealthy) {
        endModelCall(metricsCall, true, false);
        updateModelAvailability(model, provider, true);
      } else {
        recordModelError(model, provider, 'health_check', 'unhealthy');
        endModelCall(metricsCall, false, false);
        updateModelAvailability(model, provider, false);
      }
    } catch (error) {
      recordModelError(model, provider, 'health_check', 'check_failed');
      endModelCall(metricsCall, false, false);
      updateModelAvailability(model, provider, false);
    }
  }
}

async function checkModelHealth(model: string, provider: string): Promise<boolean> {
  // Simulate health check
  return Math.random() > 0.1; // 90% healthy
}

// Export examples
export {
  OpenAIService,
  CachedAIService,
  processBatchWithMetrics,
  performHealthCheckWithMetrics
};
