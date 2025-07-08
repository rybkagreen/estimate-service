import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { GesnItem, GesnService } from './gesn.service';

@Controller('gesn')
export class GesnController {
  private readonly logger = new Logger(GesnController.name);

  constructor(private readonly gesnService: GesnService) {}

  /**
   * Получить все данные ГЭСН
   */
  @Get()
  async getAllGesn(@Query('chapter') chapter?: string): Promise<GesnItem[]> {
    this.logger.log(`GET /gesn - получение всех данных ГЭСН${chapter ? ` для главы: ${chapter}` : ''}`);
    return await this.gesnService.getGesnData(chapter);
  }

  /**
   * Получить ГЭСН по коду
   */
  @Get(':code')
  async getGesnByCode(@Param('code') code: string): Promise<GesnItem | null> {
    this.logger.log(`GET /gesn/${code} - получение ГЭСН по коду`);
    return await this.gesnService.getGesnByCode(code);
  }

  /**
   * Поиск ГЭСН по названию
   */
  @Get('search/:term')
  async searchGesn(@Param('term') term: string): Promise<GesnItem[]> {
    this.logger.log(`GET /gesn/search/${term} - поиск ГЭСН по названию`);
    return await this.gesnService.searchGesnByName(term);
  }

  /**
   * Получить список глав ГЭСН
   */
  @Get('structure/chapters')
  async getChapters(): Promise<string[]> {
    this.logger.log('GET /gesn/structure/chapters - получение глав ГЭСН');
    return await this.gesnService.getGesnChapters();
  }
}
