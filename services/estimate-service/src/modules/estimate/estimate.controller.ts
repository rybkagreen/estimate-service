import { Body, Controller, Get, Param, Post, Put, Delete, Query, UseInterceptors, UseGuards, Patch, Req, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Cacheable } from '../../shared/cache/cache.decorators';
import { CacheInterceptor } from '../../shared/cache/cache.interceptor';
import { EstimateService } from './estimate.service';
import { EstimateExtendedService } from './estimate-extended.service';
import {
  CreateEstimateDto,
  UpdateEstimateDto,
  EstimateFilterDto,
  EstimateResponseDto,
  EstimateListResponseDto,
  DeleteResponseDto,
  CalculateTotalsResponseDto,
  ExportFormatDto,
  ExportResponseDto,
  UpdateStatusDto
} from './dto';
import { EstimateStatus } from '@prisma/client';

@ApiTags('Estimates')
@Controller('estimates')
export class EstimateController {
  constructor(
    private readonly estimateService: EstimateService,
    private readonly extendedService: EstimateExtendedService,
  ) {}

  /**
   * Получить список смет с фильтрацией и пагинацией
   */
  @Get()
  @UseInterceptors(CacheInterceptor)
  @Cacheable('estimates:list', 300000) // 5 minutes cache
  @ApiOperation({ summary: 'Получить список смет' })
  @ApiResponse({ status: 200, description: 'Список смет', type: EstimateListResponseDto })
  async getEstimates(@Query() filter: EstimateFilterDto): Promise<EstimateListResponseDto> {
    return this.estimateService.findAll(filter);
  }

  /**
   * Получить детали сметы по ID
   */
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @Cacheable('estimates:detail', 600000) // 10 minutes cache
  @ApiOperation({ summary: 'Получить смету по ID' })
  @ApiResponse({ status: 200, description: 'Смета найдена', type: EstimateResponseDto })
  @ApiResponse({ status: 404, description: 'Смета не найдена' })
  async getEstimate(@Param('id') id: string): Promise<EstimateResponseDto> {
    return this.estimateService.findOne(id);
  }

  /**
   * Создать новую смету
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую смету' })
  @ApiResponse({ status: 201, description: 'Смета создана', type: EstimateResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  async createEstimate(
    @Body() createEstimateDto: CreateEstimateDto,
    @Req() req: any
  ): Promise<EstimateResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Пользователь не авторизован');
    }
    return this.estimateService.create(createEstimateDto, userId);
  }

  /**
   * Обновить существующую смету
   */
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить смету' })
  @ApiResponse({ status: 200, description: 'Смета обновлена', type: EstimateResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Смета не найдена' })
  async updateEstimate(
    @Param('id') id: string,
    @Body() updateEstimateDto: UpdateEstimateDto,
    @Req() req: any
  ): Promise<EstimateResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Пользователь не авторизован');
    }
    return this.extendedService.update(id, updateEstimateDto, userId);
  }

  /**
   * Удалить смету
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить смету' })
  @ApiResponse({ status: 200, description: 'Смета удалена', type: DeleteResponseDto })
  @ApiResponse({ status: 400, description: 'Нельзя удалить утвержденную смету' })
  @ApiResponse({ status: 404, description: 'Смета не найдена' })
  async deleteEstimate(@Param('id') id: string, @Req() req: any): Promise<DeleteResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Пользователь не авторизован');
    }
    return this.extendedService.delete(id, userId);
  }

  /**
   * Обновить статус сметы
   */
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить статус сметы' })
  @ApiResponse({ status: 200, description: 'Статус сметы обновлён', type: EstimateResponseDto })
  @ApiResponse({ status: 400, description: 'Невозможный переход статуса' })
  @ApiResponse({ status: 404, description: 'Смета не найдена' })
  async updateEstimateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req: any
  ): Promise<EstimateResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Пользователь не авторизован');
    }
    return this.extendedService.updateStatus(id, updateStatusDto.status, userId);
  }

  /**
   * Дублировать смету
   */
  @Post(':id/duplicate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Дублировать смету' })
  @ApiResponse({ status: 201, description: 'Смета дублирована', type: EstimateResponseDto })
  @ApiResponse({ status: 404, description: 'Смета не найдена' })
  async duplicateEstimate(@Param('id') id: string, @Req() req: any): Promise<EstimateResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Пользователь не авторизован');
    }
    return this.extendedService.duplicate(id, userId);
  }

  /**
   * Рассчитать итоги сметы
   */
  @Post(':id/calculate')
  @ApiOperation({ summary: 'Рассчитать итоги сметы' })
  @ApiResponse({ status: 200, description: 'Итоги рассчитаны', type: CalculateTotalsResponseDto })
  @ApiResponse({ status: 404, description: 'Смета не найдена' })
  async calculateEstimate(@Param('id') id: string): Promise<CalculateTotalsResponseDto> {
    return this.extendedService.calculateTotals(id);
  }

  /**
   * Экспортировать смету в выбранный формат
   */
  @Post(':id/export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Экспортировать смету' })
  @ApiResponse({ status: 200, description: 'Файл экспорта', type: ExportResponseDto })
  @ApiResponse({ status: 404, description: 'Смета не найдена' })
  @ApiResponse({ status: 400, description: 'Некорректный формат экспорта' })
  async exportEstimate(
    @Param('id') id: string,
    @Body() exportFormatDto: ExportFormatDto
  ): Promise<ExportResponseDto> {
    // TODO: Implement export functionality
    return { message: 'Экспорт будет реализован в следующей версии' };
  }
}
