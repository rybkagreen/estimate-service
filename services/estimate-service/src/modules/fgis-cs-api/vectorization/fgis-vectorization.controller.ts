import { Controller, Post, Get, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FgisVectorizationService } from './fgis-vectorization.service';

@ApiTags('ФГИС ЦС - Векторизация')
@Controller('api/fgis-cs/vectorization')
export class FgisVectorizationController {
  private readonly logger = new Logger(FgisVectorizationController.name);

  constructor(
    private readonly vectorizationService: FgisVectorizationService,
  ) {}

  @Post('vectorize')
  @ApiOperation({ summary: 'Векторизировать данные из базы данных для RAG систем' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Результат векторизации' })
  async vectorizeData() {
    this.logger.log('Starting data vectorization...');
    const result = await this.vectorizationService.vectorizeDbData();
    return {
      success: true,
      ...result,
    };
  }

  @Post('create-samples')
  @ApiOperation({ summary: 'Создать примеры запросов для векторной базы' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Примеры созданы' })
  async createSampleQueries() {
    await this.vectorizationService.createSampleQueries();
    return {
      success: true,
      message: 'Sample queries created successfully',
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Получить статистику векторизации' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Статистика векторизации' })
  async getVectorizationStatistics() {
    // Читаем статистику из файла
    const fs = require('fs/promises');
    const path = require('path');
    
    try {
      const statsPath = path.join(__dirname, '..', 'processing', 'processing_statistics.json');
      const stats = await fs.readFile(statsPath, 'utf-8');
      return JSON.parse(stats);
    } catch (error) {
      return {
        error: 'No statistics available. Run vectorization first.',
      };
    }
  }
}
