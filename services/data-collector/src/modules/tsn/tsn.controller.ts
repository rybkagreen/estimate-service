import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TsnService } from './tsn.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface TsnQueryDto {
  regionCode?: string;
  normativeType?: string;
  isActive?: boolean;
  search?: string;
}

@ApiTags('ТСН - Территориальные сметные нормативы')
@Controller('tsn')
export class TsnController {
  constructor(
    private readonly tsnService: TsnService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получить список ТСН' })
  @ApiQuery({ name: 'regionCode', required: false, description: 'Код региона' })
  @ApiQuery({ name: 'normativeType', required: false, description: 'Тип норматива' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию или коду' })
  async getTsnItems(@Query() query: TsnQueryDto) {
    const where: any = {};
    
    if (query.regionCode) {
      where.regionCode = query.regionCode;
    }
    
    if (query.normativeType) {
      where.normativeType = query.normativeType;
    }
    
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    where.validTo = {
      OR: [
        { equals: null },
        { gt: new Date() }
      ]
    };

    return this.prisma.tsnItem.findMany({
      where,
      orderBy: [
        { regionCode: 'asc' },
        { code: 'asc' }
      ],
      take: 100
    });
  }

  @Get(':code')
  @ApiOperation({ summary: 'Получить ТСН по коду' })
  @ApiParam({ name: 'code', description: 'Код ТСН' })
  async getTsnByCode(@Param('code') code: string) {
    return this.prisma.tsnItem.findFirst({
      where: {
        code,
        isActive: true,
        validTo: {
          OR: [
            { equals: null },
            { gt: new Date() }
          ]
        }
      }
    });
  }

  @Get('regions/:regionCode')
  @ApiOperation({ summary: 'Получить все ТСН для региона' })
  @ApiParam({ name: 'regionCode', description: 'Код региона' })
  async getTsnByRegion(@Param('regionCode') regionCode: string) {
    return this.prisma.tsnItem.findMany({
      where: {
        regionCode,
        isActive: true,
        validTo: {
          OR: [
            { equals: null },
            { gt: new Date() }
          ]
        }
      },
      orderBy: [
        { normativeType: 'asc' },
        { code: 'asc' }
      ]
    });
  }

  @Post('sync')
  @ApiOperation({ summary: 'Запустить синхронизацию данных ТСН' })
  async syncTsnData() {
    await this.tsnService.syncTsnData();
    return { message: 'TSN synchronization started' };
  }
}
