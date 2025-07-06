import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Cacheable } from '../../shared/cache/cache.decorators';
import { CacheInterceptor } from '../../shared/cache/cache.interceptor';
import { EstimateService } from './estimate.service';

@ApiTags('Estimates')
@Controller('estimates')
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @Cacheable('estimates:list', 300000) // 5 minutes cache
  @ApiOperation({ summary: 'Получить список смет' })
  @ApiResponse({ status: 200, description: 'Список смет' })
  async getEstimates() {
    return this.estimateService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @Cacheable('estimates:detail', 600000) // 10 minutes cache
  @ApiOperation({ summary: 'Получить смету по ID' })
  @ApiResponse({ status: 200, description: 'Смета найдена' })
  @ApiResponse({ status: 404, description: 'Смета не найдена' })
  async getEstimate(@Param('id') id: string) {
    return this.estimateService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новую смету' })
  @ApiResponse({ status: 201, description: 'Смета создана' })
  async createEstimate(@Body() createEstimateDto: any) {
    return this.estimateService.create(createEstimateDto);
  }
}
