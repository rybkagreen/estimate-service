import { Controller, Get, Post, Query, Param, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FgisCSApiService } from './fgis-cs-api.service';
import { FgisCSDataSyncService } from './fgis-cs-data-sync.service';
import { FgisDataType } from './constants/fgis-cs.constants';

@ApiTags('ФГИС ЦС')
@Controller('api/fgis-cs')
export class FgisCSApiController {
  private readonly logger = new Logger(FgisCSApiController.name);

  constructor(
    private readonly apiService: FgisCSApiService,
    private readonly syncService: FgisCSDataSyncService,
  ) {}

  @Get('datasets')
  @ApiOperation({ summary: 'Получить список доступных наборов данных ФГИС ЦС' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список наборов данных' })
  async getAvailableDatasets() {
    return this.apiService.getAvailableDatasets();
  }

  @Get('ksr')
  @ApiOperation({ summary: 'Получить данные классификатора строительных ресурсов (КСР)' })
  @ApiQuery({ name: 'code', required: false, description: 'Фильтр по коду ресурса' })
  @ApiQuery({ name: 'name', required: false, description: 'Фильтр по наименованию' })
  @ApiQuery({ name: 'category', required: false, description: 'Фильтр по категории' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Данные КСР' })
  async getKSRData(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('category') category?: string,
  ) {
    return this.apiService.getConstructionResourcesClassifier({ code, name, category });
  }

  @Get('price-zones')
  @ApiOperation({ summary: 'Получить ценовые зоны' })
  @ApiQuery({ name: 'regionCode', required: false, description: 'Код региона' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ценовые зоны' })
  async getPriceZones(@Query('regionCode') regionCode?: string) {
    return this.apiService.getPriceZones(regionCode);
  }

  @Get('labor-costs')
  @ApiOperation({ summary: 'Получить данные по оплате труда' })
  @ApiQuery({ name: 'regionCode', required: false, description: 'Код региона' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Данные по оплате труда' })
  async getLaborCosts(@Query('regionCode') regionCode?: string) {
    return this.apiService.getLaborCosts(regionCode);
  }

  @Get('fsnb/:year')
  @ApiOperation({ summary: 'Получить данные ФСНБ' })
  @ApiParam({ name: 'year', enum: ['2020', '2022'], description: 'Год ФСНБ' })
  @ApiQuery({ name: 'code', required: false, description: 'Фильтр по коду' })
  @ApiQuery({ name: 'category', required: false, description: 'Фильтр по категории' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Данные ФСНБ' })
  async getFSNBData(
    @Param('year') year: '2020' | '2022',
    @Query('code') code?: string,
    @Query('category') category?: string,
  ) {
    return this.apiService.getFSNBData(year, { code, category });
  }

  @Get('tech-groups')
  @ApiOperation({ summary: 'Получить технологические группы' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Технологические группы' })
  async getTechnologyGroups() {
    return this.apiService.getTechnologyGroups();
  }

  @Post('sync')
  @ApiOperation({ summary: 'Запустить синхронизацию всех данных из ФГИС ЦС' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Результат синхронизации' })
  async syncAllData() {
    this.logger.log('Starting full data sync...');
    const result = await this.syncService.syncAllData();
    this.logger.log(`Sync completed with status: ${result.status}`);
    return result;
  }

  @Get('sync/statistics')
  @ApiOperation({ summary: 'Получить статистику синхронизации' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Статистика синхронизации' })
  async getSyncStatistics() {
    return this.syncService.getSyncStatistics();
  }

  @Get('registry/:type')
  @ApiOperation({ summary: 'Получить данные реестра по типу' })
  @ApiParam({ name: 'type', enum: FgisDataType, description: 'Тип данных' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Данные реестра' })
  async getRegistryData(
    @Param('type') type: FgisDataType,
    @Query() params: any,
  ) {
    return this.apiService.getRegistryData(type, params);
  }
}
