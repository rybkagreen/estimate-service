import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { TerItem, TerService } from './ter.service';

@Controller('ter')
export class TerController {
  private readonly logger = new Logger(TerController.name);

  constructor(private readonly terService: TerService) {}

  /**
   * Получить все данные ТЕР
   */
  @Get()
  async getAllTer(@Query('region') region?: string): Promise<TerItem[]> {
    this.logger.log(`GET /ter - получение всех данных ТЕР${region ? ` для региона: ${region}` : ''}`);
    return await this.terService.getTerData(region);
  }

  /**
   * Получить ТЕР по коду
   */
  @Get(':code')
  async getTerByCode(
    @Param('code') code: string,
    @Query('region') region?: string
  ): Promise<TerItem | null> {
    this.logger.log(`GET /ter/${code} - получение ТЕР по коду для региона: ${region || 'default'}`);
    return await this.terService.getTerByCode(code, region);
  }

  /**
   * Получить список регионов ТЕР
   */
  @Get('structure/regions')
  async getRegions(): Promise<string[]> {
    this.logger.log('GET /ter/structure/regions - получение регионов ТЕР');
    return await this.terService.getTerRegions();
  }

  /**
   * Получить список глав ТЕР
   */
  @Get('structure/chapters')
  async getChapters(): Promise<string[]> {
    this.logger.log('GET /ter/structure/chapters - получение глав ТЕР');
    return await this.terService.getTerChapters();
  }
}
