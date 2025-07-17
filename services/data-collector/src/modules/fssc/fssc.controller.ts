import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FsscService } from './fssc.service';

export interface FsscQueryDto {
  materialGroup?: string;
  materialType?: string;
  manufacturer?: string;
  isActive?: boolean;
  search?: string;
}

export interface TsscQueryDto extends FsscQueryDto {
  regionCode?: string;
}

@ApiTags('ФССЦ/ТССЦ - Сборники сметных цен')
@Controller('price-collections')
export class FsscController {
  constructor(private readonly fsscService: FsscService) {}

  @Get('fssc')
  @ApiOperation({ summary: 'Получить федеральные сметные цены (ФССЦ)' })
  @ApiQuery({ name: 'materialGroup', required: false, description: 'Группа материалов' })
  @ApiQuery({ name: 'materialType', required: false, description: 'Тип материала' })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию или коду' })
  async getFsscItems(@Query() query: FsscQueryDto) {
    return this.fsscService.searchFsscByGroup(query.materialGroup, query.materialType);
  }

  @Get('tssc')
  @ApiOperation({ summary: 'Получить территориальные сметные цены (ТССЦ)' })
  @ApiQuery({ name: 'regionCode', required: true, description: 'Код региона' })
  @ApiQuery({ name: 'materialGroup', required: false, description: 'Группа материалов' })
  @ApiQuery({ name: 'materialType', required: false, description: 'Тип материала' })
  async getTsscItems(@Query() query: TsscQueryDto) {
    // Implementation for TSSC queries
    return { message: 'TSSC data endpoint', query };
  }

  @Get('coefficients')
  @ApiOperation({ summary: 'Получить индексные коэффициенты пересчета' })
  @ApiQuery({ name: 'coefficientType', required: true, description: 'Тип коэффициента (labor, material, machine)' })
  @ApiQuery({ name: 'targetPeriod', required: true, description: 'Целевой период (например, 2024-Q1)' })
  @ApiQuery({ name: 'regionCode', required: false, description: 'Код региона' })
  async getIndexCoefficients(
    @Query('coefficientType') coefficientType: string,
    @Query('targetPeriod') targetPeriod: string,
    @Query('regionCode') regionCode?: string
  ) {
    return this.fsscService.getIndexCoefficients(coefficientType, targetPeriod, regionCode);
  }

  @Post('fssc/sync')
  @ApiOperation({ summary: 'Запустить синхронизацию данных ФССЦ' })
  async syncFsscData() {
    await this.fsscService.syncFsscData();
    return { message: 'FSSC synchronization started' };
  }

  @Post('tssc/sync/:regionCode')
  @ApiOperation({ summary: 'Запустить синхронизацию данных ТССЦ для региона' })
  @ApiParam({ name: 'regionCode', description: 'Код региона' })
  async syncTsscData(@Param('regionCode') regionCode: string) {
    await this.fsscService.syncTsscData(regionCode);
    return { message: `TSSC synchronization started for region ${regionCode}` };
  }
}
