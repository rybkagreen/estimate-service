import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
    PrismaHealthIndicator,
} from '@nestjs/terminus';

import { Public } from '../modules/auth/decorators/auth.decorators';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private memoryIndicator: MemoryHealthIndicator,
    private diskIndicator: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Базовая проверка здоровья системы' })
  @ApiResponse({ status: 200, description: 'Система работает' })
  @ApiResponse({ status: 503, description: 'Система недоступна' })
  check() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
      () => this.memoryIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memoryIndicator.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.diskIndicator.checkStorage('storage', {
        path: '/',
        thresholdPercent: 0.8
      }),
    ]);
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Проверка готовности к работе' })
  @ApiResponse({ status: 200, description: 'Система готова' })
  async ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env['npm_package_version'] || '1.0.0',
    };
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Проверка жизнеспособности' })
  @ApiResponse({ status: 200, description: 'Система жива' })
  async live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
      memory: process.memoryUsage(),
    };
  }
}
