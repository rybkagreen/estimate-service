import { Controller, Get, Delete, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CacheService, CacheStats } from './cache.service';

@ApiTags('cache')
@Controller('api/cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
    schema: {
      properties: {
        hits: { type: 'number' },
        misses: { type: 'number' },
        evictions: { type: 'number' },
        size: { type: 'number' },
        hitRate: { type: 'number' },
      },
    },
  })
  async getStats(): Promise<CacheStats & { hitRate: number }> {
    const stats = this.cacheService.getStats();
    const hitRate = stats.hits / (stats.hits + stats.misses) || 0;
    
    return {
      ...stats,
      hitRate,
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all cache entries' })
  @ApiResponse({
    status: 200,
    description: 'Cache cleared successfully',
  })
  async clearCache(): Promise<{ message: string }> {
    await this.cacheService.clear();
    return { message: 'Cache cleared successfully' };
  }

  @Delete('tag/:tag')
  @ApiOperation({ summary: 'Invalidate cache entries by tag' })
  @ApiResponse({
    status: 200,
    description: 'Cache entries invalidated successfully',
  })
  async invalidateByTag(@Param('tag') tag: string): Promise<{ message: string }> {
    await this.cacheService.invalidateByTag(tag);
    return { message: `Cache entries with tag '${tag}' invalidated successfully` };
  }

  @Post('warm')
  @ApiOperation({ summary: 'Warm up cache with predefined prompts' })
  @ApiResponse({
    status: 200,
    description: 'Cache warmed up successfully',
  })
  async warmCache(
    @Body() body: { prompts?: string[]; model?: string }
  ): Promise<{ message: string; warmedEntries: number }> {
    const defaultPrompts = [
      'Проанализируй стоимость работ',
      'Оцени риски проекта',
      'Предложи альтернативные материалы',
      'Рассчитай трудозатраты',
    ];

    const prompts = body.prompts || defaultPrompts;
    const model = body.model || 'deepseek-r1';
    let warmedEntries = 0;

    for (const prompt of prompts) {
      const cacheKey = this.cacheService.generateCacheKey(prompt, model, {});
      
      // Check if already cached
      const existing = await this.cacheService.get(cacheKey);
      if (!existing) {
        // In a real scenario, you would call the AI provider here
        // For now, we'll just set a placeholder
        await this.cacheService.set(
          cacheKey,
          { 
            content: `Warmed cache for: ${prompt}`,
            confidence: 'HIGH',
            timestamp: new Date(),
          },
          { ttl: 3600, tags: ['warm-cache'] }
        );
        warmedEntries++;
      }
    }

    return {
      message: 'Cache warming completed',
      warmedEntries,
    };
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get cached value by key' })
  @ApiResponse({
    status: 200,
    description: 'Cached value retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Cache key not found',
  })
  async getCachedValue(@Param('key') key: string): Promise<any> {
    const value = await this.cacheService.get(key);
    
    if (value === null) {
      return { 
        found: false,
        message: 'Cache key not found' 
      };
    }

    return {
      found: true,
      value,
    };
  }
}
