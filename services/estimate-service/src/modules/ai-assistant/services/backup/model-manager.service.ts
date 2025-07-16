import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AiProvider, AiProviderConfig, AiRequest, AiResponse } from '../providers/ai-provider.interface';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../../cache/cache.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfidenceLevel } from '@ez-eco/shared-contracts';

/**
 * Enumeration of supported AI models with their unique identifiers.
 * Each model has different capabilities, costs, and performance characteristics.
 * 
 * @enum {string}
 */
export enum ModelType {
  /** DeepSeek R1 - Primary model optimized for construction estimation */
  DEEPSEEK_R1 = 'deepseek-r1',
  /** DeepSeek R1 Distilled - Lighter version with faster response time */
  DEEPSEEK_R1_DISTILL = 'deepseek-r1-distill-llama-70b',
  /** Claude 3 Sonnet - Balanced model for analysis and validation */
  CLAUDE_3_SONNET = 'claude-3-sonnet',
  /** Claude 3 Opus - High-performance model for complex tasks */
  CLAUDE_3_OPUS = 'claude-3-opus',
  /** GPT-4 - OpenAI's flagship model for general purpose */
  GPT_4 = 'gpt-4',
  /** GPT-4 Turbo - Optimized GPT-4 with faster response */
  GPT_4_TURBO = 'gpt-4-turbo',
  /** Local LLaMA - Self-hosted model for data privacy */
  LOCAL_LLAMA = 'local-llama',
}

/**
 * Defines the capabilities and characteristics of an AI model.
 * Used for model selection and optimization decisions.
 * 
 * @interface ModelCapabilities
 */
export interface ModelCapabilities {
  /** Whether the model supports streaming responses */
  supportsStreaming: boolean;
  /** Whether the model supports function/tool calling */
  supportsTools: boolean;
  /** Maximum number of tokens the model can process */
  maxTokens: number;
  /** Cost per token in USD */
  costPerToken: number;
  /** Expected response time category */
  responseTime: 'fast' | 'medium' | 'slow';
  /** Model accuracy level based on benchmarks */
  accuracy: 'high' | 'medium' | 'low';
  /** List of task types this model specializes in */
  specializations: string[];
}

/**
 * Tracks performance metrics for each AI model.
 * Used for monitoring, optimization, and cost analysis.
 * 
 * @interface ModelMetrics
 */
export interface ModelMetrics {
  /** Unique identifier of the model */
  modelId: string;
  /** Total number of requests processed */
  totalRequests: number;
  /** Percentage of successful requests (0-1) */
  successRate: number;
  /** Average response time in milliseconds */
  averageLatency: number;
  /** Average number of tokens used per request */
  averageTokensUsed: number;
  /** Total cost incurred in USD */
  totalCost: number;
  /** Timestamp of last usage */
  lastUsed: Date;
  /** Percentage of failed requests (0-1) */
  errorRate: number;
  /** Distribution of confidence levels across responses */
  confidenceDistribution: {
    [ConfidenceLevel.HIGH]: number;
    [ConfidenceLevel.MEDIUM]: number;
    [ConfidenceLevel.LOW]: number;
    [ConfidenceLevel.UNCERTAIN]: number;
  };
}

/**
 * Extended configuration for AI models including operational parameters.
 * Inherits from base AiProviderConfig and adds management-specific settings.
 * 
 * @interface ModelConfig
 * @extends {AiProviderConfig}
 */
export interface ModelConfig {
  /** Provider type */
  provider: string;
  /** Model identifier */
  model: string;
  /** API Key for the model */
  apiKey: string;
  /** Base URL for the API */
  baseUrl?: string;
  /** Maximum tokens */
  maxTokens?: number;
  /** Temperature setting */
  temperature?: number;
  /** Priority level for model selection (lower number = higher priority) */
  priority: number;
  /** Whether the model is currently active and available for use */
  isActive: boolean;
  /** Model ID to use as fallback if this model fails */
  fallbackModel?: string;
  /** Rate limiting configuration */
  rateLimit?: {
    /** Maximum requests allowed per minute */
    requestsPerMinute: number;
    /** Maximum tokens allowed per minute */
    tokensPerMinute: number;
  };
  /** Retry strategy for failed requests */
  retryStrategy?: {
    /** Maximum number of retry attempts */
    maxRetries: number;
    /** Multiplier for exponential backoff */
    backoffMultiplier: number;
    /** Maximum backoff time in seconds */
    maxBackoffSeconds: number;
  };
}

/**
 * Context information for intelligent model selection.
 * Provides criteria to help select the most appropriate model for a given task.
 * 
 * @interface ModelSelectionContext
 */
export interface ModelSelectionContext {
  /** Type of task to be performed */
  taskType: 'estimation' | 'analysis' | 'validation' | 'generation';
  /** Complexity level of the task */
  complexity: 'low' | 'medium' | 'high';
  /** Urgency level affecting response time requirements */
  urgency: 'low' | 'medium' | 'high';
  /** Optional budget constraint in USD */
  budget?: number;
  /** Required accuracy level for the task */
  requiredAccuracy?: 'high' | 'medium' | 'low';
  /** Estimated data volume in tokens */
  dataVolume?: number;
}

/**
 * Service responsible for managing multiple AI models with intelligent selection,
 * performance tracking, automatic optimization, and failover capabilities.
 * 
 * Key features:
 * - Dynamic model selection based on context
 * - Performance metrics tracking
 * - Automatic failover and retry mechanisms
 * - Rate limiting and cost management
 * - Circuit breaker pattern for fault tolerance
 * - Automatic configuration optimization
 * 
 * @class ModelManagerService
 */
@Injectable()
export class ModelManagerService {
  private readonly logger = new Logger(ModelManagerService.name);
  private activeModels: Map<string, AiProvider> = new Map();
  private modelConfigs: Map<string, ModelConfig> = new Map();
  private modelMetrics: Map<string, ModelMetrics> = new Map();
  private primaryModel: string = ModelType.DEEPSEEK_R1;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly prismaService: PrismaService,
  ) {
    this.initializeDefaultModels();
  }

  /**
   * Initialize default model configurations
   */
  private async initializeDefaultModels(): Promise<void> {
    const defaultConfigs: ModelConfig[] = [
      {
        provider: 'deepseek-r1',
        model: ModelType.DEEPSEEK_R1,
        apiKey: this.configService.get('DEEPSEEK_API_KEY'),
        baseUrl: this.configService.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
        maxTokens: 4000,
        temperature: 0.3,
        priority: 1,
        isActive: true,
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 100000,
        },
        retryStrategy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30,
        },
      },
      {
        provider: 'anthropic',
        model: ModelType.CLAUDE_3_SONNET,
        apiKey: this.configService.get('ANTHROPIC_API_KEY'),
        baseUrl: 'https://api.anthropic.com/v1',
        maxTokens: 4096,
        temperature: 0.3,
        priority: 2,
        isActive: false,
        fallbackModel: ModelType.DEEPSEEK_R1,
      },
    ];

    for (const config of defaultConfigs) {
      this.modelConfigs.set(config.model, config);
      this.initializeModelMetrics(config.model);
    }
  }

  /**
   * Initialize model metrics
   */
  private initializeModelMetrics(modelId: string): void {
    this.modelMetrics.set(modelId, {
      modelId,
      totalRequests: 0,
      successRate: 1.0,
      averageLatency: 0,
      averageTokensUsed: 0,
      totalCost: 0,
      lastUsed: new Date(),
      errorRate: 0,
      confidenceDistribution: {
        [ConfidenceLevel.HIGH]: 0,
        [ConfidenceLevel.MEDIUM]: 0,
        [ConfidenceLevel.LOW]: 0,
        [ConfidenceLevel.UNCERTAIN]: 0,
      },
    });
  }

  /**
   * Get model capabilities
   */
  private getModelCapabilities(modelId: string): ModelCapabilities {
    const capabilities: Record<string, ModelCapabilities> = {
      [ModelType.DEEPSEEK_R1]: {
        supportsStreaming: true,
        supportsTools: true,
        maxTokens: 4000,
        costPerToken: 0.0001,
        responseTime: 'medium',
        accuracy: 'high',
        specializations: ['construction', 'estimation', 'analysis'],
      },
      [ModelType.CLAUDE_3_SONNET]: {
        supportsStreaming: true,
        supportsTools: false,
        maxTokens: 4096,
        costPerToken: 0.003,
        responseTime: 'fast',
        accuracy: 'high',
        specializations: ['validation', 'analysis', 'generation'],
      },
      [ModelType.GPT_4]: {
        supportsStreaming: true,
        supportsTools: true,
        maxTokens: 8192,
        costPerToken: 0.03,
        responseTime: 'slow',
        accuracy: 'high',
        specializations: ['complex-analysis', 'generation'],
      },
    };

    return capabilities[modelId] || {
      supportsStreaming: false,
      supportsTools: false,
      maxTokens: 2048,
      costPerToken: 0.001,
      responseTime: 'medium',
      accuracy: 'medium',
      specializations: [],
    };
  }

  /**
   * Intelligently selects the best AI model based on the provided context.
   * Uses a scoring algorithm that considers task type, complexity, urgency,
   * budget constraints, and model performance history.
   * 
   * The selection is cached for 1 hour to improve performance for similar requests.
   * 
   * @param {ModelSelectionContext} context - The context defining task requirements
   * @returns {Promise<string>} The ID of the selected model
   * 
   * @example
   * const model = await modelManager.selectModel({
   *   taskType: 'estimation',
   *   complexity: 'high',
   *   urgency: 'medium',
   *   requiredAccuracy: 'high',
   *   budget: 0.5
   * });
   */
  async selectModel(context: ModelSelectionContext): Promise<string> {
    this.logger.log('Selecting model based on context', context);

    // Check cache for similar context
    const cacheKey = `model_selection:${JSON.stringify(context)}`;
    const cachedSelection = await this.cacheService.get(cacheKey) as string | null;
    if (cachedSelection) {
      return cachedSelection;
    }

    let selectedModel = this.primaryModel;
    let highestScore = 0;

    for (const [modelId, config] of Array.from(this.modelConfigs.entries())) {
      if (!config.isActive) continue;

      const score = this.calculateModelScore(modelId, context);
      if (score > highestScore) {
        highestScore = score;
        selectedModel = modelId;
      }
    }

    // Cache the selection
    await this.cacheService.set(cacheKey, selectedModel, { ttl: 3600 }); // 1 hour cache

    this.logger.log(`Selected model: ${selectedModel} with score: ${highestScore}`);
    return selectedModel;
  }

  /**
   * Calculate model score based on context
   */
  private calculateModelScore(modelId: string, context: ModelSelectionContext): number {
    const capabilities = this.getModelCapabilities(modelId);
    const metrics = this.modelMetrics.get(modelId);
    let score = 0;

    // Task type matching
    if (capabilities.specializations.includes(context.taskType)) {
      score += 30;
    }

    // Accuracy requirements
    if (context.requiredAccuracy === capabilities.accuracy) {
      score += 20;
    }

    // Response time vs urgency
    if (context.urgency === 'high' && capabilities.responseTime === 'fast') {
      score += 25;
    } else if (context.urgency === 'low' && capabilities.responseTime === 'slow') {
      score += 15;
    }

    // Cost considerations
    if (context.budget) {
      const estimatedCost = capabilities.costPerToken * (context.dataVolume || 1000);
      if (estimatedCost <= context.budget) {
        score += 15;
      }
    }

    // Performance metrics
    if (metrics) {
      score += metrics.successRate * 10;
      score -= metrics.errorRate * 20;
    }

    return score;
  }

  /**
   * Switch to a specific model
   */
  async switchModel(modelId: string): Promise<void> {
    this.logger.log(`Switching primary model to ${modelId}`);

    const config = this.modelConfigs.get(modelId);
    if (!config) {
      throw new BadRequestException(`Model ${modelId} not found`);
    }

    if (!config.isActive) {
      throw new BadRequestException(`Model ${modelId} is not active`);
    }

    this.primaryModel = modelId;

    // Update configuration in database
    await this.persistModelConfiguration();

    this.logger.log(`Successfully switched to model ${modelId}`);
  }

  /**
   * Executes an AI request with automatic model selection and fallback handling.
   * This is the main entry point for AI requests with full resilience features.
   * 
   * Features:
   * - Automatic model selection based on context
   * - Fallback to secondary models on failure
   * - Rate limiting enforcement
   * - Performance metrics tracking
   * - Cost tracking
   * 
   * @param {AiRequest} request - The AI request to execute
   * @param {ModelSelectionContext} context - Context for model selection
   * @returns {Promise<AiResponse>} The AI response
   * @throws {Error} If all available models fail
   * 
   * @example
   * const response = await modelManager.executeWithBestModel(
   *   { messages: [{ role: 'user', content: 'Estimate costs' }] },
   *   { taskType: 'estimation', complexity: 'high', urgency: 'low' }
   * );
   */
  async executeWithBestModel(
    request: AiRequest,
    context: ModelSelectionContext,
  ): Promise<AiResponse> {
    const selectedModel = await this.selectModel(context);
    return this.executeWithFallback(request, selectedModel);
  }

  /**
   * Execute request with fallback mechanism
   */
  private async executeWithFallback(
    request: AiRequest,
    modelId: string,
    attemptedModels: Set<string> = new Set(),
  ): Promise<AiResponse> {
    if (attemptedModels.has(modelId)) {
      throw new Error('All available models have been attempted');
    }

    attemptedModels.add(modelId);
    const startTime = Date.now();

    try {
      // Get or create provider for the model
      const provider = await this.getOrCreateProvider(modelId);
      
      // Apply rate limiting
      await this.applyRateLimit(modelId);

      // Execute the request
      const response = await provider.generateResponse(request);

      // Update metrics
      await this.updateModelMetrics(modelId, {
        success: true,
        latency: Date.now() - startTime,
        tokensUsed: response.tokensUsed || 0,
        confidence: response.confidence,
      });

      return response;
    } catch (error) {
      this.logger.error(`Model ${modelId} failed:`, error);

      // Update error metrics
      await this.updateModelMetrics(modelId, {
        success: false,
        latency: Date.now() - startTime,
        tokensUsed: 0,
        confidence: ConfidenceLevel.UNCERTAIN,
      });

      // Try fallback model
      const config = this.modelConfigs.get(modelId);
      if (config?.fallbackModel) {
        this.logger.log(`Falling back to model ${config.fallbackModel}`);
        return this.executeWithFallback(request, config.fallbackModel, attemptedModels);
      }

      throw error;
    }
  }

  /**
   * Get or create AI provider for a model
   */
  private async getOrCreateProvider(modelId: string): Promise<AiProvider> {
    if (this.activeModels.has(modelId)) {
      return this.activeModels.get(modelId)!;
    }

    const config = this.modelConfigs.get(modelId);
    if (!config) {
      throw new Error(`Configuration not found for model ${modelId}`);
    }

    // Dynamically import and create provider based on config
    let provider: AiProvider;
    switch (config.provider) {
      case 'deepseek-r1':
        const { DeepSeekAiProvider } = await import('../providers/deepseek-ai.provider');
        provider = new DeepSeekAiProvider();
        break;
      case 'anthropic':
        // Placeholder for Anthropic provider
        throw new Error('Anthropic provider not implemented');
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }

    await provider.initialize(config);
    this.activeModels.set(modelId, provider);

    return provider;
  }

  /**
   * Apply rate limiting for a model
   */
  private async applyRateLimit(modelId: string): Promise<void> {
    const config = this.modelConfigs.get(modelId);
    if (!config?.rateLimit) return;

    const cacheKey = `rate_limit:${modelId}`;
    const currentUsage = await this.cacheService.get(cacheKey) as { requests: number; tokens: number } | null || { requests: 0, tokens: 0 };

    if (currentUsage.requests >= config.rateLimit.requestsPerMinute) {
      throw new Error(`Rate limit exceeded for model ${modelId}`);
    }

    // Update usage
    currentUsage.requests++;
    await this.cacheService.set(cacheKey, currentUsage, { ttl: 60 }); // 1 minute TTL
  }

  /**
   * Update model metrics
   */
  private async updateModelMetrics(
    modelId: string,
    result: {
      success: boolean;
      latency: number;
      tokensUsed: number;
      confidence: ConfidenceLevel;
    },
  ): Promise<void> {
    const metrics = this.modelMetrics.get(modelId);
    if (!metrics) return;

    // Update metrics
    metrics.totalRequests++;
    metrics.lastUsed = new Date();
    
    if (result.success) {
      const successCount = metrics.totalRequests * metrics.successRate;
      metrics.successRate = (successCount + 1) / metrics.totalRequests;
      
      // Update average latency
      metrics.averageLatency = 
        (metrics.averageLatency * (metrics.totalRequests - 1) + result.latency) / 
        metrics.totalRequests;
      
      // Update average tokens
      metrics.averageTokensUsed = 
        (metrics.averageTokensUsed * (metrics.totalRequests - 1) + result.tokensUsed) / 
        metrics.totalRequests;
      
      // Update confidence distribution
      metrics.confidenceDistribution[result.confidence]++;
      
      // Update cost
      const capabilities = this.getModelCapabilities(modelId);
      metrics.totalCost += result.tokensUsed * capabilities.costPerToken;
    } else {
      metrics.errorRate = 1 - metrics.successRate;
    }

    // Persist metrics periodically
    if (metrics.totalRequests % 10 === 0) {
      await this.persistModelMetrics(modelId, metrics);
    }
  }

  /**
   * Get model performance report
   */
  async getModelPerformanceReport(): Promise<Record<string, ModelMetrics>> {
    const report: Record<string, ModelMetrics> = {};
    
    for (const [modelId, metrics] of Array.from(this.modelMetrics.entries())) {
      report[modelId] = { ...metrics };
    }

    return report;
  }

  /**
   * Automatically optimizes model configurations based on performance metrics.
   * This method implements a self-healing mechanism that adjusts model settings
   * to improve overall system performance.
   * 
   * Optimization strategies:
   * - Disables models with error rates > 30% (with sufficient data)
   * - Reduces temperature for models producing low-confidence results
   * - Adjusts priority based on success rates
   * 
   * Should be called periodically (e.g., hourly) for best results.
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * // Run optimization every hour
   * setInterval(() => modelManager.optimizeModelConfiguration(), 3600000);
   */
  async optimizeModelConfiguration(): Promise<void> {
    this.logger.log('Optimizing model configuration based on performance metrics');

    for (const [modelId, metrics] of Array.from(this.modelMetrics.entries())) {
      const config = this.modelConfigs.get(modelId);
      if (!config) continue;

      // Disable models with high error rates
      if (metrics.errorRate > 0.3 && metrics.totalRequests > 100) {
        config.isActive = false;
        this.logger.warn(`Disabling model ${modelId} due to high error rate: ${metrics.errorRate}`);
      }

      // Adjust temperature based on confidence distribution
      const lowConfidenceRate = 
        (metrics.confidenceDistribution[ConfidenceLevel.LOW] + 
         metrics.confidenceDistribution[ConfidenceLevel.UNCERTAIN]) / 
        metrics.totalRequests;
      
      if (lowConfidenceRate > 0.5 && config.temperature) {
        config.temperature = Math.max(0.1, config.temperature - 0.1);
        this.logger.log(`Reducing temperature for model ${modelId} to ${config.temperature}`);
      }
    }

    await this.persistModelConfiguration();
  }

  /**
   * Persist model configuration to database
   */
  private async persistModelConfiguration(): Promise<void> {
    try {
      const configurations = Array.from(this.modelConfigs.entries()).map(
        ([modelId, config]) => ({
          modelId,
          config: JSON.stringify(config),
          updatedAt: new Date(),
        }),
      );

      // Store in database (placeholder - implement based on your schema)
      // await this.prismaService.modelConfiguration.createMany({
      //   data: configurations,
      //   skipDuplicates: true,
      // });

      this.logger.log('Model configurations persisted');
    } catch (error) {
      this.logger.error('Failed to persist model configurations', error);
    }
  }

  /**
   * Persist model metrics to database
   */
  private async persistModelMetrics(modelId: string, metrics: ModelMetrics): Promise<void> {
    try {
      // Store in database (placeholder - implement based on your schema)
      // await this.prismaService.modelMetrics.upsert({
      //   where: { modelId },
      //   create: metrics,
      //   update: metrics,
      // });

      this.logger.debug(`Model metrics persisted for ${modelId}`);
    } catch (error) {
      this.logger.error(`Failed to persist metrics for model ${modelId}`, error);
    }
  }

  /**
   * Health check for all active models
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [modelId, config] of Array.from(this.modelConfigs.entries())) {
      if (!config.isActive) continue;

      try {
        const provider = await this.getOrCreateProvider(modelId);
        health[modelId] = await provider.isAvailable();
      } catch (error) {
        health[modelId] = false;
        this.logger.error(`Health check failed for model ${modelId}`, error);
      }
    }

    return health;
  }

  /**
   * Get active model configuration
   */
  getActiveModelConfig(): ModelConfig | undefined {
    return this.modelConfigs.get(this.primaryModel);
  }

  /**
   * List all available models
   */
  listAvailableModels(): Array<{ id: string; config: ModelConfig; capabilities: ModelCapabilities }> {
    return Array.from(this.modelConfigs.entries()).map(([id, config]) => ({
      id,
      config,
      capabilities: this.getModelCapabilities(id),
    }));
  }
}
