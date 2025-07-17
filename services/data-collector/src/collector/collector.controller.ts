import { Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { NormativeCollectorService } from '../services/normative-collector.service';

@ApiTags('Синхронизация данных')
@Controller('sync')
export class CollectorController {
  constructor(private readonly collectorService: NormativeCollectorService) {}

  @Get('status')
  @ApiOperation({ summary: 'Получить статус синхронизации' })
  getSyncStatus() {
    return this.collectorService.getSyncStatus();
  }

  @Post('all')
  @ApiOperation({ summary: 'Запустить полную синхронизацию всех нормативных баз' })
  async syncAll() {
    await this.collectorService.syncAllNormativeData();
    return { message: 'Полная синхронизация запущена' };
  }

  @Post(':database')
  @ApiOperation({ summary: 'Запустить синхронизацию конкретной базы' })
  @ApiParam({ 
    name: 'database', 
    enum: ['GESN', 'FER', 'TSN', 'FSSC'],
    description: 'Тип базы данных для синхронизации' 
  })
  async syncDatabase(@Param('database') database: string) {
    await this.collectorService.syncSpecificDatabase(database);
    return { message: `Синхронизация ${database} запущена` };
  }
}
