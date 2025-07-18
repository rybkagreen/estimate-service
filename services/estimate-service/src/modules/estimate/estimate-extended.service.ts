import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateEstimateDto } from './dto';
import { EstimateStatus, Prisma } from '@prisma/client';
import { CacheService as EnhancedCacheService } from '../../shared/cache/enhanced-cache.service';

/**
 * Расширенные методы для работы со сметами
 */
@Injectable()
export class EstimateExtendedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enhancedCacheService: EnhancedCacheService,
  ) {}

  /**
   * Обновление сметы
   */
  async update(id: string, updateEstimateDto: UpdateEstimateDto, userId: string) {
    try {
      // Проверяем существование сметы
      const existingEstimate = await this.prisma.estimate.findUnique({
        where: { id },
        select: { 
          id: true, 
          status: true,
          createdById: true,
          version: true,
        },
      });

      if (!existingEstimate) {
        throw new NotFoundException(`Смета с ID ${id} не найдена`);
      }

      // Проверяем права на редактирование
      if (existingEstimate.status === EstimateStatus.APPROVED) {
        throw new BadRequestException('Нельзя редактировать утвержденную смету');
      }

      // Обновляем смету
      const updatedEstimate = await this.prisma.estimate.update({
        where: { id },
        data: {
          ...updateEstimateDto,
          version: existingEstimate.version + 1,
        },
        include: {
          project: true,
          createdBy: true,
          approvedBy: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      // Очищаем кэш
      await this.clearEstimateCache(id);

      return updatedEstimate;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Ошибка при обновлении сметы');
    }
  }

  /**
   * Удаление сметы
   */
  async delete(id: string, userId: string) {
    try {
      const estimate = await this.prisma.estimate.findUnique({
        where: { id },
        select: { 
          id: true, 
          status: true,
          createdById: true,
        },
      });

      if (!estimate) {
        throw new NotFoundException(`Смета с ID ${id} не найдена`);
      }

      // Проверяем права на удаление
      if (estimate.status === EstimateStatus.APPROVED) {
        throw new BadRequestException('Нельзя удалить утвержденную смету');
      }

      // Удаляем смету (каскадно удалятся и позиции)
      await this.prisma.estimate.delete({
        where: { id },
      });

      // Очищаем кэш
      await this.clearEstimateCache(id);

      return { success: true, message: 'Смета успешно удалена' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Ошибка при удалении сметы');
    }
  }

  /**
   * Изменение статуса сметы
   */
  async updateStatus(id: string, status: EstimateStatus, userId: string) {
    try {
      const estimate = await this.prisma.estimate.findUnique({
        where: { id },
        select: { 
          id: true, 
          status: true,
          totalCost: true,
        },
      });

      if (!estimate) {
        throw new NotFoundException(`Смета с ID ${id} не найдена`);
      }

      // Валидация перехода статусов
      this.validateStatusTransition(estimate.status, status);

      // Подготавливаем данные для обновления
      const updateData: any = { status };

      // Если статус меняется на APPROVED, записываем утверждающего и дату
      if (status === EstimateStatus.APPROVED) {
        updateData.approvedById = userId;
        updateData.approvedAt = new Date();
      }

      // Обновляем статус
      const updatedEstimate = await this.prisma.estimate.update({
        where: { id },
        data: updateData,
        include: {
          project: true,
          createdBy: true,
          approvedBy: true,
        },
      });

      // Очищаем кэш
      await this.clearEstimateCache(id);

      return updatedEstimate;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Ошибка при изменении статуса сметы');
    }
  }

  /**
   * Дублирование сметы
   */
  async duplicate(id: string, userId: string) {
    try {
      // Получаем оригинальную смету с позициями
      const original = await this.prisma.estimate.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!original) {
        throw new NotFoundException(`Смета с ID ${id} не найдена`);
      }

      // Создаем копию сметы
      const duplicate = await this.prisma.estimate.create({
        data: {
          name: `${original.name} (копия)`,
          description: original.description,
          projectId: original.projectId,
          status: EstimateStatus.DRAFT,
          currency: original.currency,
          laborCostPerHour: original.laborCostPerHour,
          overheadPercentage: original.overheadPercentage,
          profitPercentage: original.profitPercentage,
          materialCost: original.materialCost,
          laborCost: original.laborCost,
          overheadCost: original.overheadCost,
          profitCost: original.profitCost,
          totalCost: original.totalCost,
          createdById: userId,
          parentId: original.id,
          metadata: original.metadata || undefined,
          // Копируем позиции
          items: {
            create: original.items.map(item => ({
              name: item.name,
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              laborHours: item.laborHours,
              fsbtsCode: item.fsbtsCode,
              category: item.category,
              sortOrder: item.sortOrder,
              groupName: item.groupName,
              metadata: item.metadata || undefined,
            })),
          },
        },
        include: {
          project: true,
          createdBy: true,
          items: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      // Очищаем кэш списков
      await this.enhancedCacheService.delByTag('estimates:list:*');

      return duplicate;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Ошибка при дублировании сметы');
    }
  }

  /**
   * Расчет итоговых сумм сметы
   */
  async calculateTotals(id: string) {
    try {
      // Получаем смету с позициями
      const estimate = await this.prisma.estimate.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!estimate) {
        throw new NotFoundException(`Смета с ID ${id} не найдена`);
      }

      // Рассчитываем суммы по позициям
      let materialCost = 0;
      let laborCost = 0;

      for (const item of estimate.items) {
        materialCost += Number(item.totalPrice);
        laborCost += Number(item.laborHours) * Number(estimate.laborCostPerHour);
      }

      // Рассчитываем накладные и прибыль
      const baseCost = materialCost + laborCost;
      const overheadCost = baseCost * (Number(estimate.overheadPercentage) / 100);
      const profitCost = baseCost * (Number(estimate.profitPercentage) / 100);
      const totalCost = baseCost + overheadCost + profitCost;

      // Обновляем смету
      const updatedEstimate = await this.prisma.estimate.update({
        where: { id },
        data: {
          materialCost,
          laborCost,
          overheadCost,
          profitCost,
          totalCost,
        },
      });

      // Очищаем кэш
      await this.clearEstimateCache(id);

      return {
        materialCost,
        laborCost,
        overheadCost,
        profitCost,
        totalCost,
        breakdown: {
          materials: materialCost,
          labor: laborCost,
          overhead: overheadCost,
          profit: profitCost,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Ошибка при расчете итогов сметы');
    }
  }

  /**
   * Валидация перехода статусов
   */
  private validateStatusTransition(currentStatus: EstimateStatus, newStatus: EstimateStatus) {
    const validTransitions: Record<EstimateStatus, EstimateStatus[]> = {
      [EstimateStatus.DRAFT]: [EstimateStatus.IN_REVIEW, EstimateStatus.ARCHIVED],
      [EstimateStatus.IN_REVIEW]: [EstimateStatus.APPROVED, EstimateStatus.REJECTED, EstimateStatus.DRAFT],
      [EstimateStatus.APPROVED]: [EstimateStatus.ARCHIVED],
      [EstimateStatus.REJECTED]: [EstimateStatus.DRAFT, EstimateStatus.ARCHIVED],
      [EstimateStatus.ARCHIVED]: [EstimateStatus.DRAFT],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Невозможно изменить статус с ${currentStatus} на ${newStatus}`
      );
    }
  }

  /**
   * Очистка кэша для сметы
   */
  private async clearEstimateCache(id: string) {
    await this.enhancedCacheService.delByTag(`estimate:${id}`);
    await this.enhancedCacheService.del(`estimate:${id}`);
    await this.enhancedCacheService.delByTag('estimates:list:*');
  }
}
