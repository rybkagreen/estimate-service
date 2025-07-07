# ModelManagerService Documentation

## Overview

The `ModelManagerService` is a sophisticated AI model management system designed to handle multiple AI models with intelligent selection, automatic failover, performance tracking, and self-optimization capabilities. It serves as the central hub for all AI operations in the estimate service.

## Key Features

### 1. **Intelligent Model Selection**
- Context-aware model selection based on task requirements
- Scoring algorithm considers multiple factors:
  - Task type specialization
  - Complexity matching
  - Urgency vs. response time
  - Budget constraints
  - Historical performance

### 2. **Performance Tracking**
- Real-time metrics collection
- Success/failure rate monitoring
- Latency tracking
- Token usage and cost calculation
- Confidence level distribution

### 3. **Automatic Failover**
- Seamless fallback to secondary models
- Configurable fallback chains
- Prevention of infinite loops
- Error tracking and reporting

### 4. **Rate Limiting**
- Per-model rate limits
- Request and token-based limiting
- Automatic enforcement
- Cache-based implementation with TTL

### 5. **Circuit Breaker Pattern**
- Automatic model disabling on high failure rates
- Configurable thresholds
- Performance-based circuit breaking
- Self-healing capabilities

### 6. **Cost Management**
- Real-time cost tracking
- Budget-aware model selection
- Cost optimization strategies
- Detailed cost reporting

### 7. **Self-Optimization**
- Automatic configuration tuning
- Temperature adjustment based on confidence
- Model priority reordering
- Performance-based optimization

## Overview

The `ModelManagerService` is a comprehensive AI model management system designed for the estimate-service. It provides intelligent model selection, performance tracking, automatic fallback mechanisms, and configuration optimization.

## Features

### 1. **Multi-Model Support**
- DeepSeek R1 (primary model for construction estimation)
- Claude 3 Sonnet (for validation and analysis)
- GPT-4 (for complex analysis)
- Extensible architecture for adding new models

### 2. **Context-Aware Model Selection**
```typescript
const context: ModelSelectionContext = {
  taskType: 'estimation',      // estimation | analysis | validation | generation
  complexity: 'high',           // low | medium | high
  urgency: 'medium',           // low | medium | high
  budget?: 0.5,                // Optional budget constraint
  requiredAccuracy?: 'high',   // high | medium | low
  dataVolume?: 5000            // Estimated tokens
};

const bestModel = await modelManager.selectModel(context);
```

### 3. **Automatic Fallback Mechanism**
- Primary model failure triggers automatic fallback
- Configurable fallback chains
- Prevents circular dependencies

### 4. **Performance Metrics Tracking**
- Request success/failure rates
- Average latency measurements
- Token usage and cost tracking
- Confidence distribution analysis

### 5. **Rate Limiting**
- Per-model rate limits
- Request and token-based limiting
- Automatic throttling

### 6. **Dynamic Configuration Optimization**
- Automatic model disabling based on error rates
- Temperature adjustment based on confidence
- Performance-based priority adjustment

## Usage Examples

### Basic Model Execution
```typescript
const request: AiRequest = {
  prompt: "Estimate construction costs for foundation work",
  systemPrompt: "You are a construction estimation expert",
  maxTokens: 2000,
  temperature: 0.3
};

const context: ModelSelectionContext = {
  taskType: 'estimation',
  complexity: 'medium',
  urgency: 'high'
};

const response = await modelManager.executeWithBestModel(request, context);
```

### Manual Model Switching
```typescript
// Switch to a specific model
await modelManager.switchModel(ModelType.CLAUDE_3_SONNET);

// Get current active model configuration
const activeConfig = modelManager.getActiveModelConfig();
```

### Performance Monitoring
```typescript
// Get performance report for all models
const performanceReport = await modelManager.getModelPerformanceReport();

// Health check all active models
const healthStatus = await modelManager.healthCheck();

// Optimize configurations based on performance
await modelManager.optimizeModelConfiguration();
```

### List Available Models
```typescript
const models = modelManager.listAvailableModels();
models.forEach(model => {
  console.log(`Model: ${model.id}`);
  console.log(`Max Tokens: ${model.capabilities.maxTokens}`);
  console.log(`Cost per Token: ${model.capabilities.costPerToken}`);
  console.log(`Specializations: ${model.capabilities.specializations.join(', ')}`);
});
```

## Model Selection Algorithm

The service uses a scoring system to select the best model:

1. **Task Type Matching** (30 points)
   - Models specialized in the requested task type get higher scores

2. **Accuracy Requirements** (20 points)
   - Models matching the required accuracy level

3. **Response Time vs Urgency** (25 points)
   - Fast models for urgent requests
   - Accurate models for non-urgent requests

4. **Cost Considerations** (15 points)
   - Budget-conscious selection when budget is specified

5. **Historical Performance** (10-20 points)
   - Success rate and error rate influence selection

## Configuration

### Environment Variables
```env
# DeepSeek Configuration
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-r1
DEEPSEEK_MAX_TOKENS=4000

# Anthropic Configuration
ANTHROPIC_API_KEY=your-api-key

# OpenAI Configuration
OPENAI_API_KEY=your-api-key
```

### Model Configuration Structure
```typescript
interface ModelConfig {
  provider: 'deepseek-r1' | 'anthropic' | 'openai';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  priority: number;           // Higher priority = preferred selection
  isActive: boolean;         // Enable/disable model
  fallbackModel?: string;    // Fallback model ID
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  retryStrategy?: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffSeconds: number;
  };
}
```

## Integration with AI Assistant Service

The ModelManagerService can be injected into other services:

```typescript
@Injectable()
export class AiAssistantService {
  constructor(
    private readonly modelManager: ModelManagerService,
    // ... other dependencies
  ) {}

  async processRequest(item: GrandSmetaItem): Promise<AiAssistantResponse> {
    const context: ModelSelectionContext = {
      taskType: 'estimation',
      complexity: this.assessComplexity(item),
      urgency: 'medium'
    };

    const request: AiRequest = {
      prompt: this.buildPrompt(item),
      maxTokens: 2000
    };

    const aiResponse = await this.modelManager.executeWithBestModel(request, context);
    return this.formatResponse(aiResponse);
  }
}
```

## Error Handling

The service includes comprehensive error handling:

1. **Model Initialization Errors**: Logged and throws exception
2. **Rate Limit Errors**: Throws error with descriptive message
3. **API Failures**: Automatic fallback to configured fallback model
4. **All Models Failed**: Throws error after all fallbacks attempted

## Testing

Run tests with:
```bash
npm test model-manager.service.spec.ts
```

## Future Enhancements

1. **Additional Model Support**
   - Local LLaMA models
   - Custom fine-tuned models
   - Multi-modal models

2. **Advanced Features**
   - A/B testing framework
   - Model ensemble support
   - Real-time performance optimization
   - Cost optimization algorithms

3. **Persistence**
   - Database schema for model configurations
   - Historical metrics storage
   - Configuration versioning

## Best Practices

1. **Model Selection Context**
   - Always provide accurate context for optimal model selection
   - Include budget constraints when cost is a concern

2. **Performance Monitoring**
   - Regularly review performance reports
   - Run optimization periodically
   - Monitor health check results

3. **Configuration Management**
   - Keep API keys secure
   - Test fallback chains
   - Set appropriate rate limits

4. **Error Recovery**
   - Configure fallback models for critical services
   - Monitor error rates
   - Set up alerts for model failures
