import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeepSeekService } from '../deepseek/deepseek.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private deepSeekService: DeepSeekService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    return this.health.check([
      () => this.http.pingCheck('deepseek-api', 'https://api.deepseek.com/v1/models'),
      () => ({
        deepseek: {
          status: this.deepSeekService.healthCheck() ? 'up' : 'down',
        },
      }),
    ]);
  }
}
