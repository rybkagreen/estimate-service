import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../modules/auth/decorators/auth.decorators';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  @Get()
  @Public()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Prometheus метрики' })
  @ApiResponse({ status: 200, description: 'Метрики в формате Prometheus' })
  async getMetrics(): Promise<string> {
    const metrics = [
      '# HELP process_uptime_seconds Process uptime in seconds',
      '# TYPE process_uptime_seconds gauge',
      `process_uptime_seconds ${process.uptime()}`,
      '',
      '# HELP process_memory_usage_bytes Process memory usage in bytes',
      '# TYPE process_memory_usage_bytes gauge',
      `process_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}`,
      `process_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}`,
      `process_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}`,
      `process_memory_usage_bytes{type="external"} ${process.memoryUsage().external}`,
      '',
      '# HELP nodejs_version_info Node.js version information',
      '# TYPE nodejs_version_info gauge',
      `nodejs_version_info{version="${process.version}"} 1`,
      '',
      '# HELP app_info Application information',
      '# TYPE app_info gauge',
      `app_info{version="${process.env['npm_package_version'] || '1.0.0'}",name="estimate-service"} 1`,
    ];

    return metrics.join('\n');
  }

  @Get('health-summary')
  @Public()
  @ApiOperation({ summary: 'Краткая сводка состояния системы' })
  @ApiResponse({ status: 200, description: 'Сводка состояния' })
  async getHealthSummary() {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env['npm_package_version'] || '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      pid: process.pid,
    };
  }
}
