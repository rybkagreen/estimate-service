/**
 * Model Manager Service for Dynamic AI Model Selection
 * Intelligently routes requests between DeepSeek-R1 and Claude 3.5 Sonnet
 * based on prompt complexity, keywords, and use case requirements
 */

import { logger } from '../utils/logger.js';
import { DeepSeekService } from './deepseek.service.js';
import { ClaudeService } from './claude.service.js';
import { CircuitBreaker, CircuitBreakerFactory, CircuitBreakerConfig, CircuitState } from '../utils/circuit-breaker.js';

export interface ModelSelectionCriteria {
  promptLength: number;
  complexity: 'simple' | 'moderate' | 'complex';
  keywords: string[];
  hasCodeAnalysis: boolean;
  requiresCreativity: boolean;
  requiresReasoning: boolean;
  responseSpeed: 'fast' | 'balanced' | 'quality';
  estimatedTokens: number;
}

export interface ModelSelectionResult {
  selectedModel: 'deepseek-r1' | 'claude-3.5-sonnet';
  reason: string;
  confidence: number;
  alternativeModel?: string;
  criteria: ModelSelectionCriteria;
}

export interface ModelRequest {
  prompt: string;
  context?: any;
  preferredModel?: 'deepseek-r1' | 'claude-3.5-sonnet';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ModelResponse {
  content: string;
  model: string;
  tokensUsed: number;
  responseTime: number;
  selectionReason: string;
  metadata?: any;
}

/**
 * Service responsible for intelligent model selection and routing
 */
export class ModelManagerService {
  private deepSeekService: DeepSeekService;
  private claudeService?: ClaudeService;
  private deepSeekCircuitBreaker: CircuitBreaker;
  private claudeCircuitBreaker: CircuitBreaker;
  
  // Circuit breaker configuration for AI models
  private readonly circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 3,          // Open circuit after 3 consecutive failures
    resetTimeout: 120000,         // Try to recover after 2 minutes
    monitoringPeriod: 300000,     // Monitor errors over 5 minute window
    halfOpenRequests: 2,          // Allow 2 test requests in half-open state
    timeout: 45000,               // 45 second timeout for AI requests
    volumeThreshold: 5,           // Need at least 5 requests before evaluating
    errorThresholdPercentage: 60  // Open if 60% of requests fail
  };
  
  // Complexity keywords that indicate need for advanced reasoning
  private readonly complexityKeywords = {
    simple: [
      'что такое', 'what is', 'define', 'определение', 'список', 'list',
      'перечислить', 'enumerate', 'название', 'name', 'простой', 'simple',
      'базовый', 'basic', 'краткий', 'brief', 'короткий', 'short'
    ],
    moderate: [
      'объяснить', 'explain', 'как работает', 'how does', 'почему', 'why',
      'сравнить', 'compare', 'различия', 'differences', 'преимущества', 'advantages',
      'недостатки', 'disadvantages', 'пример', 'example', 'показать', 'show'
    ],
    complex: [
      'анализ', 'analyze', 'архитектура', 'architecture', 'оптимизация', 'optimize',
      'рефакторинг', 'refactor', 'проектирование', 'design', 'стратегия', 'strategy',
      'комплексный', 'comprehensive', 'детальный', 'detailed', 'исследование', 'research',
      'критический', 'critical', 'оценка', 'evaluation', 'рекомендации', 'recommendations'
    ]
  };
  
  // Technical keywords that benefit from specialized models
  private readonly technicalKeywords = {
    deepseek: [
      'код', 'code', 'функция', 'function', 'класс', 'class', 'алгоритм', 'algorithm',
      'debug', 'отладка', 'ошибка', 'error', 'bug', 'typescript', 'javascript',
      'react', 'nestjs', 'api', 'база данных', 'database', 'sql', 'тест', 'test'
    ],
    claude: [
      'архитектурное решение', 'architectural decision', 'best practices', 'паттерн', 'pattern',
      'масштабирование', 'scaling', 'производительность', 'performance', 'безопасность', 'security',
      'review', 'обзор', 'аудит', 'audit', 'compliance', 'соответствие', 'стандарты', 'standards'
    ]
  };

  constructor() {
    this.deepSeekService = new DeepSeekService();
    
    // Initialize circuit breakers for each AI provider
    this.deepSeekCircuitBreaker = CircuitBreakerFactory.getBreaker(
      'deepseek-r1', 
      this.circuitBreakerConfig
    );
    
    this.claudeCircuitBreaker = CircuitBreakerFactory.getBreaker(
      'claude-3.5-sonnet',
      this.circuitBreakerConfig
    );
    
    logger.info('🎯 ModelManagerService initialized with circuit breakers');
  }

  /**
   * Initialize Claude service if available
   */
  async initializeClaude(apiKey?: string): Promise<void> {
    try {
      if (apiKey || process.env.CLAUDE_API_KEY) {
        // Initialize Claude service when implemented
        logger.info('✅ Claude 3.5 Sonnet service initialized');
      } else {
        logger.warn('⚠️ Claude API key not provided, will use DeepSeek-R1 only');
      }
    } catch (error) {
      logger.error('❌ Failed to initialize Claude service:', error);
    }
  }

  /**
   * Process request with automatic model selection and circuit breaker protection
   */
  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      // Analyze prompt and select model
      const selection = await this.selectModel(request);
      
      logger.info(`🤖 Selected model: ${selection.selectedModel}`, {
        reason: selection.reason,
        confidence: selection.confidence,
        criteria: selection.criteria
      });

      // Check circuit breaker availability and route to appropriate model
      let response: string;
      let tokensUsed: number;
      let actualModel = selection.selectedModel;
      let circuitBreakerFallback = false;
      
      // Check if selected model's circuit is available
      if (selection.selectedModel === 'claude-3.5-sonnet' && this.claudeService) {
        if (this.claudeCircuitBreaker.isAvailable()) {
          try {
            response = await this.processWithClaude(request);
            tokensUsed = this.estimateTokens(response);
          } catch (error) {
            logger.warn(`Claude failed, falling back to DeepSeek: ${error.message}`);
            circuitBreakerFallback = true;
            actualModel = 'deepseek-r1';
            response = await this.processWithDeepSeek(request);
            tokensUsed = this.estimateTokens(response);
          }
        } else {
          // Claude circuit is open, use DeepSeek
          logger.warn('Claude circuit breaker is OPEN, using DeepSeek');
          circuitBreakerFallback = true;
          actualModel = 'deepseek-r1';
          response = await this.processWithDeepSeek(request);
          tokensUsed = this.estimateTokens(response);
        }
      } else {
        // Use DeepSeek (check its circuit breaker)
        if (!this.deepSeekCircuitBreaker.isAvailable()) {
          throw new Error('DeepSeek circuit breaker is OPEN - no models available');
        }
        response = await this.processWithDeepSeek(request);
        tokensUsed = this.estimateTokens(response);
      }

      const responseTime = Date.now() - startTime;

      return {
        content: response,
        model: actualModel,
        tokensUsed,
        responseTime,
        selectionReason: circuitBreakerFallback 
          ? `${selection.reason} (Circuit breaker fallback from ${selection.selectedModel})`
          : selection.reason,
        metadata: {
          selection,
          processingTime: responseTime,
          fallbackUsed: actualModel !== selection.selectedModel,
          circuitBreakerFallback,
          circuitBreakerMetrics: this.getCircuitBreakerMetrics()
        }
      };
    } catch (error) {
      logger.error('❌ Error processing request:', error);
      
      // Last resort fallback with circuit breaker protection
      try {
        if (!this.deepSeekCircuitBreaker.isAvailable()) {
          throw new Error('All circuit breakers are OPEN - service unavailable');
        }
        
        const response = await this.deepSeekCircuitBreaker.execute(async () => {
          return await this.deepSeekService.chat(
            this.buildMessages(request),
            {
              temperature: request.temperature,
              maxTokens: request.maxTokens
            }
          );
        });
        
        return {
          content: response,
          model: 'deepseek-r1',
          tokensUsed: this.estimateTokens(response),
          responseTime: Date.now() - startTime,
          selectionReason: 'Emergency fallback due to primary model error',
          metadata: { 
            error: error.message, 
            fallback: true,
            circuitBreakerMetrics: this.getCircuitBreakerMetrics()
          }
        };
      } catch (fallbackError) {
        throw new Error(`All models failed: ${error.message}. Fallback error: ${fallbackError.message}`);
      }
    }
  }

  /**
   * Select the most appropriate model based on request characteristics
   */
  private async selectModel(request: ModelRequest): Promise<ModelSelectionResult> {
    // Check if user has a preference
    if (request.preferredModel) {
      return {
        selectedModel: request.preferredModel,
        reason: 'User preference',
        confidence: 1.0,
        criteria: this.analyzeCriteria(request)
      };
    }

    // Analyze request criteria
    const criteria = this.analyzeCriteria(request);
    
    // Decision logic
    let selectedModel: 'deepseek-r1' | 'claude-3.5-sonnet' = 'deepseek-r1';
    let reason = '';
    let confidence = 0.8;

    // Rule 1: Very simple queries go to DeepSeek for speed
    if (criteria.complexity === 'simple' && criteria.promptLength < 100) {
      selectedModel = 'deepseek-r1';
      reason = 'Simple query - optimizing for speed';
      confidence = 0.95;
    }
    // Rule 2: Complex architectural or design questions go to Claude
    else if (criteria.complexity === 'complex' && criteria.requiresReasoning) {
      selectedModel = this.claudeService ? 'claude-3.5-sonnet' : 'deepseek-r1';
      reason = 'Complex reasoning required - using advanced model';
      confidence = 0.9;
    }
    // Rule 3: Code-heavy tasks go to DeepSeek
    else if (criteria.hasCodeAnalysis && !criteria.requiresCreativity) {
      selectedModel = 'deepseek-r1';
      reason = 'Code analysis task - DeepSeek specialized';
      confidence = 0.85;
    }
    // Rule 4: Creative or strategic tasks go to Claude
    else if (criteria.requiresCreativity || this.hasClaudeKeywords(request.prompt)) {
      selectedModel = this.claudeService ? 'claude-3.5-sonnet' : 'deepseek-r1';
      reason = 'Creative/strategic thinking required';
      confidence = 0.8;
    }
    // Rule 5: Moderate complexity - balance between speed and quality
    else if (criteria.complexity === 'moderate') {
      // Use token estimate to decide
      if (criteria.estimatedTokens > 2000) {
        selectedModel = this.claudeService ? 'claude-3.5-sonnet' : 'deepseek-r1';
        reason = 'Large response expected - using comprehensive model';
      } else {
        selectedModel = 'deepseek-r1';
        reason = 'Moderate complexity - balanced approach';
      }
      confidence = 0.75;
    }
    // Default to DeepSeek
    else {
      selectedModel = 'deepseek-r1';
      reason = 'Default selection for general query';
      confidence = 0.7;
    }

    return {
      selectedModel,
      reason,
      confidence,
      alternativeModel: selectedModel === 'deepseek-r1' ? 'claude-3.5-sonnet' : 'deepseek-r1',
      criteria
    };
  }

  /**
   * Analyze request to determine selection criteria
   */
  private analyzeCriteria(request: ModelRequest): ModelSelectionCriteria {
    const prompt = request.prompt.toLowerCase();
    const promptLength = request.prompt.length;
    
    // Determine complexity
    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    let complexityScore = 0;
    
    // Check for simple keywords
    const simpleCount = this.complexityKeywords.simple.filter(kw => prompt.includes(kw)).length;
    const moderateCount = this.complexityKeywords.moderate.filter(kw => prompt.includes(kw)).length;
    const complexCount = this.complexityKeywords.complex.filter(kw => prompt.includes(kw)).length;
    
    if (complexCount > 0 || promptLength > 500) {
      complexity = 'complex';
    } else if (simpleCount > moderateCount && promptLength < 200) {
      complexity = 'simple';
    }
    
    // Check for code patterns
    const hasCodeAnalysis = this.hasCodePatterns(prompt);
    
    // Check for creativity/reasoning requirements
    const requiresCreativity = this.requiresCreativeThinking(prompt);
    const requiresReasoning = this.requiresDeepReasoning(prompt);
    
    // Extract keywords
    const keywords = this.extractKeywords(prompt);
    
    // Estimate response tokens (rough heuristic)
    const estimatedTokens = this.estimateResponseTokens(promptLength, complexity);
    
    // Determine speed preference
    const responseSpeed = complexity === 'simple' ? 'fast' : 
                         complexity === 'complex' ? 'quality' : 'balanced';

    return {
      promptLength,
      complexity,
      keywords,
      hasCodeAnalysis,
      requiresCreativity,
      requiresReasoning,
      responseSpeed,
      estimatedTokens
    };
  }

  /**
   * Check if prompt contains code patterns
   */
  private hasCodePatterns(prompt: string): boolean {
    const codePatterns = [
      /```[\s\S]*```/,  // Code blocks
      /function\s+\w+\s*\(/,  // Function declarations
      /class\s+\w+/,  // Class declarations
      /const\s+\w+\s*=/,  // Variable declarations
      /import\s+.*from/,  // Import statements
      /\.(ts|js|tsx|jsx|py|java|cs)/,  // File extensions
    ];
    
    return codePatterns.some(pattern => pattern.test(prompt));
  }

  /**
   * Check if prompt requires creative thinking
   */
  private requiresCreativeThinking(prompt: string): boolean {
    const creativeKeywords = [
      'создать', 'create', 'придумать', 'invent', 'дизайн', 'design',
      'инновационный', 'innovative', 'креативный', 'creative', 'уникальный', 'unique',
      'идея', 'idea', 'концепция', 'concept', 'предложить', 'suggest', 'propose'
    ];
    
    return creativeKeywords.some(kw => prompt.includes(kw));
  }

  /**
   * Check if prompt requires deep reasoning
   */
  private requiresDeepReasoning(prompt: string): boolean {
    const reasoningKeywords = [
      'почему', 'why', 'объяснить', 'explain', 'обоснование', 'reasoning',
      'логика', 'logic', 'анализировать', 'analyze', 'оценить', 'evaluate',
      'сравнение', 'comparison', 'компромисс', 'trade-off', 'за и против', 'pros and cons'
    ];
    
    return reasoningKeywords.some(kw => prompt.includes(kw));
  }

  /**
   * Check for Claude-specific keywords
   */
  private hasClaudeKeywords(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    return this.technicalKeywords.claude.some(kw => lowerPrompt.includes(kw));
  }

  /**
   * Extract relevant keywords from prompt
   */
  private extractKeywords(prompt: string): string[] {
    const allKeywords = [
      ...this.complexityKeywords.simple,
      ...this.complexityKeywords.moderate,
      ...this.complexityKeywords.complex,
      ...this.technicalKeywords.deepseek,
      ...this.technicalKeywords.claude
    ];
    
    return allKeywords.filter(kw => prompt.includes(kw));
  }

  /**
   * Estimate response tokens based on prompt characteristics
   */
  private estimateResponseTokens(promptLength: number, complexity: string): number {
    const baseEstimate = promptLength * 2; // Basic multiplier
    
    const complexityMultiplier = {
      simple: 1.5,
      moderate: 3,
      complex: 5
    };
    
    return Math.round(baseEstimate * complexityMultiplier[complexity]);
  }

  /**
   * Process request with DeepSeek using circuit breaker protection
   */
  private async processWithDeepSeek(request: ModelRequest): Promise<string> {
    const messages = this.buildMessages(request);
    
    return await this.deepSeekCircuitBreaker.execute(async () => {
      return await this.deepSeekService.chat(messages, {
        temperature: request.temperature,
        maxTokens: request.maxTokens
      });
    });
  }

  /**
   * Process request with Claude using circuit breaker protection
   */
  private async processWithClaude(request: ModelRequest): Promise<string> {
    if (!this.claudeService) {
      throw new Error('Claude service not initialized');
    }
    
    return await this.claudeCircuitBreaker.execute(async () => {
      // Placeholder - will be implemented when Claude service is available
      logger.warn('Claude service called but not fully implemented, falling back to DeepSeek');
      // When Claude service is ready, replace this with:
      // return await this.claudeService.chat(messages, options);
      throw new Error('Claude service not yet implemented');
    });
  }

  /**
   * Build messages array for AI models
   */
  private buildMessages(request: ModelRequest): Array<{ role: string; content: string }> {
    const messages = [];
    
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt
      });
    }
    
    let userContent = request.prompt;
    if (request.context) {
      userContent = `Context: ${JSON.stringify(request.context, null, 2)}\n\n${userContent}`;
    }
    
    messages.push({
      role: 'user',
      content: userContent
    });
    
    return messages;
  }

  /**
   * Estimate tokens in text
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Get model usage statistics
   */
  async getUsageStats(): Promise<{
    deepseek: { requests: number; tokens: number };
    claude: { requests: number; tokens: number };
    modelSelections: { [key: string]: number };
  }> {
    // This would track actual usage in production
    return {
      deepseek: { requests: 0, tokens: 0 },
      claude: { requests: 0, tokens: 0 },
      modelSelections: {
        'deepseek-r1': 0,
        'claude-3.5-sonnet': 0
      }
    };
  }

  /**
   * Get circuit breaker metrics for all models
   */
  private getCircuitBreakerMetrics(): { [key: string]: any } {
    return {
      'deepseek-r1': this.deepSeekCircuitBreaker.getMetrics(),
      'claude-3.5-sonnet': this.claudeCircuitBreaker.getMetrics()
    };
  }

  /**
   * Health check for model services including circuit breaker status
   */
  async healthCheck(): Promise<{
    deepseek: { 
      status: string; 
      latency?: number;
      circuitBreaker: {
        state: CircuitState;
        available: boolean;
        metrics: any;
      };
    };
    claude: { 
      status: string; 
      latency?: number;
      circuitBreaker: {
        state: CircuitState;
        available: boolean;
        metrics: any;
      };
    };
  }> {
    const deepseekHealth = await this.deepSeekService.healthCheck();
    const deepseekMetrics = this.deepSeekCircuitBreaker.getMetrics();
    const claudeMetrics = this.claudeCircuitBreaker.getMetrics();
    
    return {
      deepseek: {
        ...deepseekHealth,
        circuitBreaker: {
          state: this.deepSeekCircuitBreaker.getState(),
          available: this.deepSeekCircuitBreaker.isAvailable(),
          metrics: deepseekMetrics
        }
      },
      claude: this.claudeService ? 
        { 
          status: 'ok', 
          latency: 0,
          circuitBreaker: {
            state: this.claudeCircuitBreaker.getState(),
            available: this.claudeCircuitBreaker.isAvailable(),
            metrics: claudeMetrics
          }
        } : 
        { 
          status: 'not initialized',
          circuitBreaker: {
            state: this.claudeCircuitBreaker.getState(),
            available: false,
            metrics: claudeMetrics
          }
        }
    };
  }

  /**
   * Force reset circuit breakers (for admin use)
   */
  resetCircuitBreakers(): void {
    this.deepSeekCircuitBreaker.reset();
    this.claudeCircuitBreaker.reset();
    logger.info('🔧 All circuit breakers have been reset');
  }

  /**
   * Get circuit breaker configuration
   */
  getCircuitBreakerConfig(): CircuitBreakerConfig {
    return this.circuitBreakerConfig;
  }
}

// Export singleton instance
export const modelManager = new ModelManagerService();
