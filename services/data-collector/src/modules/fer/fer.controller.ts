import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { FerItem, FerService } from './fer.service';

@Controller('fer')
export class FerController {
  private readonly logger = new Logger(FerController.name);

  constructor(private readonly ferService: FerService) {}

  /**
   * Получить все данные ФЕР
   */
  @Get()
  async getAllFer(@Query('region') region?: string): Promise<FerItem[]> {
    this.logger.log(`GET /fer - получение всех данных ФЕР${region ? ` для региона: ${region}` : ''}`);
    return await this.ferService.getFerData(region);
  }

  /**
   * Получить ФЕР по коду
   */
  @Get(':code')
  async getFerByCode(@Param('code') code: string): Promise<FerItem | null> {
    this.logger.log(`GET /fer/${code} - получение ФЕР по коду`);
    return await this.ferService.getFerByCode(code);
  }

  /**
   * Получить список глав ФЕР
   */
  @Get('structure/chapters')
  async getChapters(): Promise<string[]> {
    this.logger.log('GET /fer/structure/chapters - получение глав ФЕР');
    return await this.ferService.getFerChapters();
  }
}
