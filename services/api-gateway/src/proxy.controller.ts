import { Controller, Get, Query } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('estimate')
  getEstimate(@Query('id') id: string) {
    return this.proxyService.getEstimate(id);
  }

  @Get('ai')
  getAIResult(@Query('query') query: string) {
    return this.proxyService.getAIResult(query);
  }

  @Get('data')
  getData(@Query('type') type: string) {
    return this.proxyService.getData(type);
  }
}
