# Model Selection Guide - Dynamic AI Model Routing

## Overview

The ModelManagerService implements intelligent routing between DeepSeek-R1 and Claude 3.5 Sonnet based on prompt complexity, use case requirements, and performance considerations.

## Architecture

```
┌─────────────────┐
│   User Request  │
└────────┬────────┘
         │
┌────────▼────────┐
│ ModelManager    │
│   Service       │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Analyze │
    │Criteria │
    └────┬────┘
         │
   ┌─────┴─────┐
   │  Select   │
   │   Model   │
   └─────┬─────┘
         │
    ┌────┴────┬──────────┐
    │         │          │
┌───▼───┐ ┌──▼────┐ ┌───▼────┐
│DeepSeek│ │Claude │ │Fallback│
│  R1    │ │ 3.5   │ │Handler │
└────────┘ └───────┘ └────────┘
```

## Model Selection Criteria

### 1. Complexity Analysis

The service analyzes prompt complexity using keyword detection:

- **Simple**: Definitions, lists, basic questions
- **Moderate**: Explanations, comparisons, examples
- **Complex**: Analysis, architecture, optimization, strategy

### 2. Use Case Detection

#### DeepSeek-R1 Specializations:
- Code analysis and debugging
- Technical documentation
- Quick factual responses
- Error troubleshooting
- Function/class implementations

#### Claude 3.5 Sonnet Specializations:
- Architectural design decisions
- Strategic planning
- Creative problem solving
- Best practices reviews
- Complex reasoning tasks
- Trade-off analysis

### 3. Selection Rules

```typescript
// Rule 1: Very simple queries → DeepSeek (speed)
if (complexity === 'simple' && promptLength < 100) {
  return 'deepseek-r1';
}

// Rule 2: Complex reasoning → Claude (quality)
if (complexity === 'complex' && requiresReasoning) {
  return 'claude-3.5-sonnet';
}

// Rule 3: Code tasks → DeepSeek (specialized)
if (hasCodeAnalysis && !requiresCreativity) {
  return 'deepseek-r1';
}

// Rule 4: Creative/strategic → Claude (advanced)
if (requiresCreativity || hasClaudeKeywords) {
  return 'claude-3.5-sonnet';
}

// Rule 5: Moderate complexity → Balance
if (complexity === 'moderate') {
  if (estimatedTokens > 2000) {
    return 'claude-3.5-sonnet';
  }
  return 'deepseek-r1';
}
```

## Usage Examples

### Basic Usage

```typescript
import { modelManager } from './services/model-manager.service.js';

// Simple query - will use DeepSeek
const response1 = await modelManager.processRequest({
  prompt: "What is React?",
  maxTokens: 200
});

// Complex query - will use Claude
const response2 = await modelManager.processRequest({
  prompt: "Design a scalable microservices architecture for a fintech platform",
  maxTokens: 3000
});

// User preference override
const response3 = await modelManager.processRequest({
  prompt: "Explain this code",
  preferredModel: 'claude-3.5-sonnet',
  maxTokens: 1000
});
```

### Response Format

```typescript
interface ModelResponse {
  content: string;              // AI response
  model: string;               // Model used
  tokensUsed: number;          // Token count
  responseTime: number;        // Processing time
  selectionReason: string;     // Why this model was chosen
  metadata?: {
    selection: ModelSelectionResult;
    processingTime: number;
    fallbackUsed: boolean;
  };
}
```

## Configuration

### Environment Variables

```bash
# DeepSeek Configuration
DEEPSEEK_API_KEY=your_deepseek_key
DEEPSEEK_MODEL=deepseek-coder
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Claude Configuration (optional)
CLAUDE_API_KEY=your_claude_key
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### Initialization

```typescript
// Initialize with Claude support
await modelManager.initializeClaude(process.env.CLAUDE_API_KEY);

// Check service health
const health = await modelManager.healthCheck();
console.log(health);
// {
//   deepseek: { status: 'ok', latency: 245 },
//   claude: { status: 'ok', latency: 312 }
// }
```

## Keyword Categories

### Complexity Keywords

**Simple Keywords:**
- что такое, what is, define, определение
- список, list, перечислить, enumerate
- название, name, простой, simple
- базовый, basic, краткий, brief

**Moderate Keywords:**
- объяснить, explain, как работает, how does
- почему, why, сравнить, compare
- различия, differences, преимущества, advantages
- пример, example, показать, show

**Complex Keywords:**
- анализ, analyze, архитектура, architecture
- оптимизация, optimize, рефакторинг, refactor
- проектирование, design, стратегия, strategy
- комплексный, comprehensive, детальный, detailed

### Technical Keywords

**DeepSeek-Optimized:**
- код, code, функция, function, класс, class
- алгоритм, algorithm, debug, отладка
- ошибка, error, bug, typescript, javascript
- react, nestjs, api, база данных, database

**Claude-Optimized:**
- архитектурное решение, architectural decision
- best practices, паттерн, pattern
- масштабирование, scaling, производительность, performance
- безопасность, security, review, обзор
- аудит, audit, compliance, стандарты, standards

## Performance Considerations

### Response Time Expectations

- **DeepSeek-R1**: 200-800ms for typical queries
- **Claude 3.5 Sonnet**: 500-2000ms for complex analysis
- **Fallback overhead**: +100-200ms if primary fails

### Token Estimation

```typescript
// Rough estimation formula
estimatedTokens = promptLength * complexityMultiplier
// Simple: 1.5x, Moderate: 3x, Complex: 5x
```

## Error Handling

### Fallback Strategy

1. Primary model selected based on criteria
2. If primary fails, automatic fallback to alternative
3. If both fail, detailed error with context
4. All failures logged for monitoring

### Example Error Response

```typescript
{
  content: "Fallback response from DeepSeek",
  model: "deepseek-r1",
  tokensUsed: 150,
  responseTime: 450,
  selectionReason: "Fallback due to primary model error",
  metadata: {
    error: "Claude API timeout",
    fallback: true
  }
}
```

## Monitoring and Analytics

### Usage Statistics

```typescript
const stats = await modelManager.getUsageStats();
// {
//   deepseek: { requests: 1523, tokens: 425000 },
//   claude: { requests: 287, tokens: 850000 },
//   modelSelections: {
//     'deepseek-r1': 1523,
//     'claude-3.5-sonnet': 287
//   }
// }
```

### Selection Patterns

Monitor which models are selected for different query types to optimize the selection algorithm over time.

## Future Enhancements

1. **Machine Learning Integration**: Train a classifier on historical selections
2. **Cost Optimization**: Add cost-based routing decisions
3. **Multi-Model Ensemble**: Combine responses from multiple models
4. **Custom Model Support**: Add support for other AI providers
5. **A/B Testing**: Compare model performance on identical prompts
6. **Caching Layer**: Cache responses for common queries

## Testing

Run the test suite to see model selection in action:

```bash
node mcp-server/src/services/model-manager.test.js
```

This will demonstrate various query types and show which model would be selected for each.
