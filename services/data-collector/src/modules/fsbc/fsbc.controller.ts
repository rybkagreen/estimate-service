import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { FsbcItem, FsbcService } from './fsbc.service';

@Controller('fsbc')
export class FsbcController {
  private readonly logger = new Logger(FsbcController.name);

  constructor(private readonly fsbcService: FsbcService) {}

  /**
   * Получить данные ФСБЦ-2022
   */
  @Get()
  async getFsbc(
    @Query('region') region?: string,
    @Query('category') category?: 'FER' | 'TER' | 'GESN'
  ): Promise<FsbcItem[]> {
    this.logger.log(`GET /fsbc - получение данных ФСБЦ-2022${region ? ` для региона: ${region}` : ''}${category ? ` категория: ${category}` : ''}`);
    return await this.fsbcService.getFsbcData(region, category);
  }

  /**
   * Получить позицию ФСБЦ-2022 по коду
   */
  @Get(':code')
  async getFsbcByCode(
    @Param('code') code: string,
    @Query('region') region?: string
  ): Promise<FsbcItem | null> {
    this.logger.log(`GET /fsbc/${code} - получение позиции ФСБЦ-2022 по коду`);
    return await this.fsbcService.getFsbcByCode(code, region);
  }

  /**
   * Поиск в ФСБЦ-2022
   */
  @Get('search/:term')
  async searchFsbc(
    @Param('term') term: string,
    @Query('region') region?: string,
    @Query('category') category?: 'FER' | 'TER' | 'GESN'
  ): Promise<FsbcItem[]> {
    this.logger.log(`GET /fsbc/search/${term} - поиск в ФСБЦ-2022`);
    return await this.fsbcService.searchFsbc(term, region, category);
  }

  /**
   * Получить статистику ФСБЦ-2022
   */
  @Get('statistics/overview')
  async getFsbcStats(
    @Query('region') region?: string
  ): Promise<{
    total: number;
    fer: number;
    ter: number;
    gesn: number;
    byChapter: Record<string, number>;
  }> {
    this.logger.log('GET /fsbc/statistics/overview - получение статистики ФСБЦ-2022');
    return await this.fsbcService.getFsbcStats(region);
  }
}
