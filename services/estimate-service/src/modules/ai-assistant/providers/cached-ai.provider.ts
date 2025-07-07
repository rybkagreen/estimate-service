import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, AiProviderConfig, AiRequest, AiResponse } from './ai-provider.interface';
import { CacheService } from '../../cache';

/**
 * Wrapper for AI providers that adds caching functionality
 */
@Injectable()
export class CachedAiProvider implements AiProvider {
  private readonly logger = new Logger(CachedAiProvider.name);
  private providerConfig: AiProviderConfig;

  constructor(
    private readonly provider: AiProvider,
    private readonly cacheService: CacheService,
  ) {}

  async initialize(config: AiProviderConfig): Promise<void> {
    this.providerConfig = config;
    await this.provider.initialize(config);
  }

  async generateResponse(request: AiRequest): Promise<AiResponse> {
    // Generate cache key from request parameters
    const cacheKey = this.cacheService.generateCacheKey(
      request.prompt,
      this.providerConfig.model,
      {
        systemPrompt: request.systemPrompt,
        temperature: request.temperature ?? this.providerConfig.temperature,
        maxTokens: request.maxTokens ?? this.providerConfig.maxTokens,
        context: request.context ? JSON.stringify(request.context) : undefined,
      },
    );

    this.logger.debug(`Cache key generated: ${cacheKey}`);

    // Use cache wrapper for automatic caching
    return await this.cacheService.wrap(
      cacheKey,
      async () => {
        this.logger.log('Cache miss, generating new response');
        const response = await this.provider.generateResponse(request);
        this.logger.log(`Response generated, confidence: ${response.confidence}`);
        return response;
      },
      {
        ttl: this.getCacheTTL(request),
        tags: this.getCacheTags(request),
      },
    );
  }

  async isAvailable(): Promise<boolean> {
    return this.provider.isAvailable();
  }

  async getUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    averageResponseTime: number;
    errorRate: number;
  }> {
    const providerStats = await this.provider.getUsageStats();
    const cacheStats = this.cacheService.getStats();

    // Enhance provider stats with cache information
    return {
      ...providerStats,
      cacheHits: cacheStats.hits,
      cacheMisses: cacheStats.misses,
      cacheHitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
    } as any;
  }

  /**
   * Determine cache TTL based on request type
   */
  private getCacheTTL(request: AiRequest): number {
    // Shorter TTL for requests with high temperature (more creative)
    if ((request.temperature ?? this.providerConfig.temperature ?? 0.7) > 0.8) {
      return 1800; // 30 minutes
    }

    // Longer TTL for deterministic requests
    if ((request.temperature ?? this.providerConfig.temperature ?? 0.7) < 0.3) {
      return 86400; // 24 hours
    }

    // Default TTL
    return 3600; // 1 hour
  }

  /**
   * Generate cache tags for invalidation
   */
  private getCacheTags(request: AiRequest): string[] {
    const tags: string[] = [
      'ai-response',
      `model:${this.providerConfig.model}`,
      `provider:${this.providerConfig.provider}`,
    ];

    // Add context-based tags if available
    if (request.context?.type) {
      tags.push(`context:${request.context.type}`);
    }

    if (request.context?.projectId) {
      tags.push(`project:${request.context.projectId}`);
    }

    return tags;
  }
}
