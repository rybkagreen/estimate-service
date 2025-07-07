/**
 * Example usage of the caching system
 * This file demonstrates how to use the cache module in your application
 */

import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';
import { Cacheable, CacheInvalidate } from './cache.decorator';

// Example 1: Basic cache usage
@Injectable()
export class EstimateAnalysisService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Example of manual caching for AI responses
   */
  async analyzeEstimate(projectId: string, prompt: string): Promise<any> {
    // Generate cache key based on prompt and parameters
    const cacheKey = this.cacheService.generateCacheKey(
      prompt,
      'deepseek-r1',
      { projectId, temperature: 0.7 }
    );

    // Try to get from cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      console.log('Cache hit! Returning cached response');
      return cached;
    }

    // Simulate expensive AI operation
    console.log('Cache miss! Generating new response');
    const aiResponse = await this.simulateAiCall(prompt);

    // Store in cache with 1 hour TTL and tags
    await this.cacheService.set(cacheKey, aiResponse, {
      ttl: 3600,
      tags: ['ai-response', `project:${projectId}`]
    });

    return aiResponse;
  }

  /**
   * Example using cache wrapper
   */
  async getProjectAnalysis(projectId: string): Promise<any> {
    const cacheKey = `project-analysis:${projectId}`;

    return await this.cacheService.wrap(
      cacheKey,
      async () => {
        // This function only runs on cache miss
        console.log('Computing project analysis...');
        return {
          projectId,
          analysis: 'Detailed project analysis',
          timestamp: new Date(),
          metrics: {
            cost: 1000000,
            duration: 180,
            risk: 'medium'
          }
        };
      },
      { ttl: 7200, tags: ['analysis', `project:${projectId}`] }
    );
  }

  /**
   * Example of cache invalidation
   */
  async updateProject(projectId: string, data: any): Promise<void> {
    // Update project data...
    console.log('Updating project:', projectId);

    // Invalidate all cache entries for this project
    await this.cacheService.invalidateByTag(`project:${projectId}`);
  }

  private async simulateAiCall(prompt: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      content: `AI response for: ${prompt}`,
      confidence: 0.95,
      timestamp: new Date(),
      model: 'deepseek-r1'
    };
  }
}

// Example 2: Using decorators
@Injectable()
export class CostCalculationService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * This method's results will be automatically cached
   */
  @Cacheable({ ttl: 3600, tags: ['calculations'], keyPrefix: 'cost-calc' })
  async calculateConstructionCost(
    area: number,
    materialType: string,
    location: string
  ): Promise<number> {
    console.log('Calculating construction cost...');
    
    // Simulate complex calculation
    const baseCost = area * 50000; // Base cost per sq meter
    const materialMultiplier = materialType === 'premium' ? 1.5 : 1.0;
    const locationMultiplier = location === 'moscow' ? 1.3 : 1.0;
    
    return baseCost * materialMultiplier * locationMultiplier;
  }

  /**
   * This method will invalidate cache entries with 'calculations' tag
   */
  @CacheInvalidate(['calculations'])
  async updateCostFactors(factors: any): Promise<void> {
    console.log('Updating cost factors, invalidating calculations cache...');
    // Update cost calculation factors
  }
}

// Example 3: Cache statistics and management
@Injectable()
export class CacheManagementService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Get cache performance metrics
   */
  async getCachePerformance(): Promise<any> {
    const stats = this.cacheService.getStats();
    
    const hitRate = stats.hits / (stats.hits + stats.misses) || 0;
    const efficiency = hitRate * 100;
    
    return {
      ...stats,
      hitRate: hitRate.toFixed(2),
      efficiency: `${efficiency.toFixed(1)}%`,
      recommendation: efficiency > 80 
        ? 'Cache is performing well'
        : 'Consider warming cache with common queries'
    };
  }

  /**
   * Warm cache with common prompts
   */
  async warmCache(): Promise<void> {
    const commonPrompts = [
      'Проанализируй стоимость строительных работ',
      'Оцени риски проекта',
      'Предложи альтернативные материалы',
      'Рассчитай трудозатраты на проект'
    ];

    for (const prompt of commonPrompts) {
      const cacheKey = this.cacheService.generateCacheKey(
        prompt,
        'deepseek-r1',
        { temperature: 0.7 }
      );

      // Check if already cached
      const existing = await this.cacheService.get(cacheKey);
      if (!existing) {
        // In production, you would call the AI service here
        const warmData = {
          content: `Warmed response for: ${prompt}`,
          confidence: 0.9,
          timestamp: new Date(),
          warmed: true
        };

        await this.cacheService.set(cacheKey, warmData, {
          ttl: 86400, // 24 hours for warmed cache
          tags: ['warm-cache', 'ai-response']
        });
      }
    }
  }
}

// Example 4: Usage in main application
export async function demonstrateCaching() {
  // This would normally be injected by NestJS
  const cacheService = new CacheService({
    get: (key: string) => {
      // Mock config service
      if (key === 'REDIS_HOST') return undefined; // Use in-memory cache
      return undefined;
    }
  } as any);

  await cacheService.onModuleInit();

  // Example 1: Basic caching
  console.log('\n=== Basic Caching Example ===');
  const key1 = cacheService.generateCacheKey(
    'Analyze construction cost',
    'deepseek-r1',
    { temperature: 0.7 }
  );

  // First call - cache miss
  let result = await cacheService.get(key1);
  console.log('First call:', result || 'Cache miss');

  // Set value
  await cacheService.set(key1, { 
    response: 'AI analysis result',
    cost: 1500000 
  }, { ttl: 60 });

  // Second call - cache hit
  result = await cacheService.get(key1);
  console.log('Second call:', result);

  // Example 2: Cache wrapper
  console.log('\n=== Cache Wrapper Example ===');
  let callCount = 0;
  const expensiveOperation = async () => {
    callCount++;
    console.log(`Expensive operation called (count: ${callCount})`);
    return { data: 'expensive result', callCount };
  };

  const key2 = 'expensive-op';
  
  // First call
  let wrapped = await cacheService.wrap(key2, expensiveOperation, { ttl: 60 });
  console.log('First wrapped call:', wrapped);

  // Second call - should use cache
  wrapped = await cacheService.wrap(key2, expensiveOperation, { ttl: 60 });
  console.log('Second wrapped call:', wrapped);

  // Example 3: Tags and invalidation
  console.log('\n=== Tags and Invalidation Example ===');
  await cacheService.set('item1', 'value1', { tags: ['group1', 'type:a'] });
  await cacheService.set('item2', 'value2', { tags: ['group1', 'type:b'] });
  await cacheService.set('item3', 'value3', { tags: ['group2', 'type:a'] });

  console.log('Before invalidation:');
  console.log('item1:', await cacheService.get('item1'));
  console.log('item2:', await cacheService.get('item2'));
  console.log('item3:', await cacheService.get('item3'));

  // Invalidate by tag
  await cacheService.invalidateByTag('group1');

  console.log('\nAfter invalidating group1:');
  console.log('item1:', await cacheService.get('item1'));
  console.log('item2:', await cacheService.get('item2'));
  console.log('item3:', await cacheService.get('item3'));

  // Example 4: Statistics
  console.log('\n=== Cache Statistics ===');
  const stats = cacheService.getStats();
  console.log('Stats:', stats);
  console.log('Hit rate:', (stats.hits / (stats.hits + stats.misses) * 100).toFixed(1) + '%');

  await cacheService.onModuleDestroy();
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateCaching().catch(console.error);
}
