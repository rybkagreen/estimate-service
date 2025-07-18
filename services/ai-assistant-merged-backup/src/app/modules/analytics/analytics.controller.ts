import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('AI Assistant Analytics')
@Controller('ai-assistant/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  @ApiOperation({ summary: 'Add analytics data' })
  addAnalytics(@Body() data: { description: string; data: any }) {
    return this.analyticsService.addAnalytics(data.description, data.data);
  }

  @Get()
  @ApiOperation({ summary: 'List all analytics data' })
  listAnalytics() {
    return this.analyticsService.listAnalytics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get analytics data by ID' })
  getAnalyticsData(@Param('id') id: string) {
    return this.analyticsService.getAnalyticsData(id);
  }
}
