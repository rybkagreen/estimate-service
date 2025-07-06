import { Controller, Get, Logger } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    this.logger.log('Health check запрошен');
    return this.healthService.getHealth();
  }

  @Get('readiness')
  getReadiness() {
    this.logger.log('Readiness check запрошен');
    return this.healthService.getReadiness();
  }
}
