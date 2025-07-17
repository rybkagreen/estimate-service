import { Controller, Get, Query, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

export interface NormativeSearchDto {
  query: string;
  type?: 'GESN' | 'FER' | 'TER' | 'TSN' | 'FSSC' | 'TSSC';
  regionCode?: string;
  limit?: number;
}

export interface PriceCalculationDto {
  code: string;
  quantity: number;
  regionCode?: string;
  applyCoefficients?: boolean;
  targetPeriod?: string;
}

@ApiTags('Нормативная база - Unified API')
@Controller('normative')
export class NormativeApiController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('search')
  @ApiOperation({ summary: 'Универсальный поиск по всем нормативным базам' })
  @ApiQuery({ name: 'query', required: true, description: 'Поисковый запрос' })
  @ApiQuery({ name: 'type', required: false, enum: ['GESN', 'FER', 'TER', 'TSN', 'FSSC', 'TSSC'] })
  @ApiQuery({ name: 'regionCode', required: false, description: 'Код региона' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 20 })
  async searchNormatives(@Query() searchDto: NormativeSearchDto) {
    const { query, type, regionCode, limit = 20 } = searchDto;
    const results: any[] = [];

    // Search logic based on type
    if (!type || type === 'GESN') {
      const gesnItems = await this.prisma.gesnItem.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
          ...(regionCode && { regionCode }),
          isActive: true,
        },
        take: limit,
      });
      results.push(...gesnItems.map(item => ({ ...item, type: 'GESN' })));
    }

    if (!type || type === 'FER') {
      const ferItems = await this.prisma.ferItem.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        take: limit,
      });
      results.push(...ferItems.map(item => ({ ...item, type: 'FER' })));
    }

    if (!type || type === 'TER') {
      const terItems = await this.prisma.terItem.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
          ...(regionCode && { regionCode }),
          isActive: true,
        },
        take: limit,
      });
      results.push(...terItems.map(item => ({ ...item, type: 'TER' })));
    }

    return {
      total: results.length,
      items: results.slice(0, limit),
    };
  }

  @Get('calculate-price')
  @ApiOperation({ summary: 'Рассчитать стоимость работ с учетом коэффициентов' })
  @ApiQuery({ name: 'code', required: true, description: 'Код расценки' })
  @ApiQuery({ name: 'quantity', required: true, type: Number, description: 'Количество' })
  @ApiQuery({ name: 'regionCode', required: false, description: 'Код региона' })
  @ApiQuery({ name: 'applyCoefficients', required: false, type: Boolean, default: true })
  @ApiQuery({ name: 'targetPeriod', required: false, description: 'Целевой период (например, 2024-Q1)' })
  async calculatePrice(@Query() dto: PriceCalculationDto) {
    const { code, quantity, regionCode, applyCoefficients = true, targetPeriod } = dto;

    // Find the item by code
    let item: any = null;
    let itemType: string = '';

    // Try to find in different normative bases
    item = await this.prisma.ferItem.findFirst({ where: { code, isActive: true } });
    if (item) itemType = 'FER';

    if (!item && regionCode) {
      item = await this.prisma.terItem.findFirst({ 
        where: { code, regionCode, isActive: true } 
      });
      if (item) itemType = 'TER';
    }

    if (!item) {
      throw new BadRequestException(`Расценка с кодом ${code} не найдена`);
    }

    let result = {
      code: item.code,
      name: item.name,
      unit: item.unit,
      quantity,
      basePrice: Number(item.basePrice),
      laborCost: Number(item.laborCost || 0),
      machineCost: Number(item.machineCost || 0),
      materialCost: Number(item.materialCost || 0),
      totalBase: Number(item.basePrice) * quantity,
      coefficients: {} as any,
      totalWithCoefficients: 0,
    };

    // Apply coefficients if requested
    if (applyCoefficients && regionCode && targetPeriod) {
      const coefficients = await this.prisma.indexCoefficient.findMany({
        where: {
          regionCode,
          targetPeriod,
          isActive: true,
        },
      });

      for (const coef of coefficients) {
        const value = Number(coef.coefficientValue);
        result.coefficients[coef.coefficientType] = value;

        switch (coef.coefficientType) {
          case 'labor':
            result.laborCost *= value;
            break;
          case 'machine':
            result.machineCost *= value;
            break;
          case 'material':
            result.materialCost *= value;
            break;
        }
      }
    }

    // Calculate total with coefficients
    result.totalWithCoefficients = 
      (result.laborCost + result.machineCost + result.materialCost) * quantity;

    // Add overhead and profit if norms exist
    if (itemType === 'FER' || itemType === 'TER') {
      const overheadNorm = await this.prisma.overheadProfitNorm.findFirst({
        where: {
          regionCode: regionCode || undefined,
          isActive: true,
        },
      });

      if (overheadNorm) {
        const overheadRate = Number(overheadNorm.overheadNorm) / 100;
        const profitRate = Number(overheadNorm.profitNorm) / 100;
        const laborBase = result.laborCost * quantity;

        result.coefficients.overhead = overheadRate;
        result.coefficients.profit = profitRate;

        const overhead = laborBase * overheadRate;
        const profit = laborBase * profitRate;

        result.totalWithCoefficients += overhead + profit;
      }
    }

    return result;
  }

  @Get('coefficients/:regionCode')
  @ApiOperation({ summary: 'Получить коэффициенты для региона' })
  @ApiParam({ name: 'regionCode', description: 'Код региона' })
  @ApiQuery({ name: 'targetPeriod', required: false, description: 'Целевой период' })
  async getRegionalCoefficients(
    @Param('regionCode') regionCode: string,
    @Query('targetPeriod') targetPeriod?: string
  ) {
    const where: any = {
      regionCode,
      isActive: true,
    };

    if (targetPeriod) {
      where.targetPeriod = targetPeriod;
    }

    const coefficients = await this.prisma.indexCoefficient.findMany({
      where,
      orderBy: [
        { targetPeriod: 'desc' },
        { coefficientType: 'asc' },
      ],
    });

    const overhead = await this.prisma.overheadProfitNorm.findMany({
      where: {
        regionCode,
        isActive: true,
      },
    });

    return {
      regionCode,
      indexCoefficients: coefficients,
      overheadProfitNorms: overhead,
    };
  }

  @Get('materials/search')
  @ApiOperation({ summary: 'Поиск материалов в ФССЦ/ТССЦ' })
  @ApiQuery({ name: 'query', required: true, description: 'Поисковый запрос' })
  @ApiQuery({ name: 'regionCode', required: false, description: 'Код региона для ТССЦ' })
  @ApiQuery({ name: 'materialGroup', required: false, description: 'Группа материалов' })
  async searchMaterials(
    @Query('query') query: string,
    @Query('regionCode') regionCode?: string,
    @Query('materialGroup') materialGroup?: string
  ) {
    const results: any[] = [];

    // Search in FSSC
    const fsscWhere: any = {
      OR: [
        { code: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
      isActive: true,
    };

    if (materialGroup) {
      fsscWhere.materialGroup = { contains: materialGroup, mode: 'insensitive' };
    }

    const fsscItems = await this.prisma.fsscItem.findMany({
      where: fsscWhere,
      take: 20,
    });

    results.push(...fsscItems.map(item => ({ ...item, type: 'FSSC' })));

    // Search in TSSC if region specified
    if (regionCode) {
      const tsscWhere: any = {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
        regionCode,
        isActive: true,
      };

      if (materialGroup) {
        tsscWhere.materialGroup = { contains: materialGroup, mode: 'insensitive' };
      }

      const tsscItems = await this.prisma.tsscItem.findMany({
        where: tsscWhere,
        take: 20,
      });

      results.push(...tsscItems.map(item => ({ ...item, type: 'TSSC' })));
    }

    return {
      total: results.length,
      items: results,
    };
  }

  @Get('regions')
  @ApiOperation({ summary: 'Получить список регионов с доступными данными' })
  async getRegions() {
    const [terRegions, tsnRegions, tsscRegions, coeffRegions] = await Promise.all([
      this.prisma.terItem.findMany({
        select: { regionCode: true, regionName: true },
        distinct: ['regionCode'],
        where: { isActive: true },
      }),
      this.prisma.tsnItem.findMany({
        select: { regionCode: true, regionName: true },
        distinct: ['regionCode'],
        where: { isActive: true },
      }),
      this.prisma.tsscItem.findMany({
        select: { regionCode: true, regionName: true },
        distinct: ['regionCode'],
        where: { isActive: true },
      }),
      this.prisma.indexCoefficient.findMany({
        select: { regionCode: true, regionName: true },
        distinct: ['regionCode'],
        where: { isActive: true, regionCode: { not: null } },
      }),
    ]);

    // Combine and deduplicate regions
    const regionMap = new Map<string, string>();
    
    [...terRegions, ...tsnRegions, ...tsscRegions, ...coeffRegions].forEach(region => {
      if (region.regionCode && region.regionName) {
        regionMap.set(region.regionCode, region.regionName);
      }
    });

    return Array.from(regionMap.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  }

  @Get('export/:estimateId')
  @ApiOperation({ summary: 'Экспорт сметы с применением нормативной базы' })
  @ApiParam({ name: 'estimateId', description: 'ID сметы' })
  @ApiQuery({ name: 'format', required: false, enum: ['excel', 'pdf', 'grandsmeta'] })
  async exportEstimateWithNormatives(
    @Param('estimateId') estimateId: string,
    @Query('format') format: string = 'excel'
  ) {
    // This would be implemented to export estimates with applied normative data
    return {
      message: 'Export functionality',
      estimateId,
      format,
    };
  }
}
