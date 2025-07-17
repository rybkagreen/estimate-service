import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CoreService } from './core.service';

@ApiTags('AI Assistant Core')
@Controller('ai-assistant/core')
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get AI model configuration' })
  getConfig() {
    return this.coreService.getModelConfig();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check AI Assistant health status' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
