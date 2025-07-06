import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../modules/auth/decorators/auth.decorators';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Базовая проверка здоровья системы' })
  @ApiResponse({ status: 200, description: 'Система работает' })
  @ApiResponse({ status: 503, description: 'Система недоступна' })
  async check() {
    try {
      // Проверка подключения к БД
      await this.prisma.$queryRaw`SELECT 1`;

      // Проверка памяти
      const memory = process.memoryUsage();
      const memoryOk = memory.heapUsed < 150 * 1024 * 1024; // 150MB

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'healthy',
          memory: memoryOk ? 'healthy' : 'warning',
          uptime: process.uptime(),
        },
        details: {
          memory: {
            used: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
          }
        }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Проверка готовности к работе' })
  @ApiResponse({ status: 200, description: 'Система готова' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env['npm_package_version'] || '1.0.0',
      };
    } catch (error) {
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
