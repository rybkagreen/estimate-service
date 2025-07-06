import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
import { BulkEstimateJobData, EstimateCalculationJobData } from '../services/estimate-jobs.service';
import { NotificationJobsService } from '../services/notification-jobs.service';

@Processor('estimate-calculations')
export class EstimateJobsProcessor {
  private readonly logger = new Logger(EstimateJobsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationJobsService,
  ) {}

  /**
   * Обработка расчета сметы
   */
  @Process('calculate-estimate')
  async handleEstimateCalculation(job: Job<EstimateCalculationJobData>) {
    const { estimateId, userId, recalculateAll } = job.data;

    this.logger.log(`Начинаем расчет сметы ${estimateId}`);

    try {
      // Получаем смету с позициями
      const estimate = await this.prisma.estimate.findUnique({
        where: { id: estimateId },
        include: {
          items: true,
          project: true,
        },
      });

      if (!estimate) {
        throw new Error(`Смета ${estimateId} не найдена`);
      }

      // Рассчитываем стоимость материалов
      const materialCost = estimate.items.reduce((sum: number, item: any) => {
        return sum + Number(item.totalPrice);
      }, 0);

      // Рассчитываем стоимость труда
      const laborCost = estimate.items.reduce((sum: number, item: any) => {
        return sum + (Number(item.laborHours) * Number(estimate.laborCostPerHour));
      }, 0);

      // Рассчитываем накладные расходы
      const subtotal = materialCost + laborCost;
      const overheadCost = subtotal * (Number(estimate.overheadPercentage) / 100);

      // Рассчитываем сметную прибыль
      const baseForProfit = subtotal + overheadCost;
      const profitCost = baseForProfit * (Number(estimate.profitPercentage) / 100);

      // Общая стоимость
      const totalCost = subtotal + overheadCost + profitCost;

      // Обновляем смету в БД
      await this.prisma.estimate.update({
        where: { id: estimateId },
        data: {
          materialCost,
          laborCost,
          overheadCost,
          profitCost,
          totalCost,
          updatedAt: new Date(),
        },
      });

      // Если нужно пересчитать все связанные позиции
      if (recalculateAll) {
        await this.recalculateEstimateItems(estimateId);
      }

      this.logger.log(`Расчет сметы ${estimateId} завершен успешно. Общая стоимость: ${totalCost}`);

      // Отправляем уведомление пользователю
      if (userId) {
        await this.notificationService.notifyEstimateCalculationComplete(
          userId,
          estimateId,
          estimate.name,
          true
        );
      }

      return {
        success: true,
        estimateId,
        totalCost,
        calculatedAt: new Date(),
      };

    } catch (error) {
      this.logger.error(`Ошибка расчета сметы ${estimateId}:`, error);

      // Уведомляем об ошибке
      if (userId) {
        const estimate = await this.prisma.estimate.findUnique({
          where: { id: estimateId },
          select: { name: true },
        });

        await this.notificationService.notifyEstimateCalculationComplete(
          userId,
          estimateId,
          estimate?.name || 'Неизвестная смета',
          false
        );
      }

      throw error;
    }
  }

  /**
   * Обработка массового расчета смет
   */
  @Process('bulk-calculate-estimates')
  async handleBulkCalculation(job: Job<BulkEstimateJobData>) {
    const { estimateIds, userId, operationType } = job.data;

    this.logger.log(`Начинаем массовый ${operationType} для ${estimateIds.length} смет`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const estimateId of estimateIds) {
      try {
        if (operationType === 'recalculate') {
          await this.handleEstimateCalculation({
            data: { estimateId, userId },
          } as Job<EstimateCalculationJobData>);
        }

        results.push({ estimateId, success: true });
        successCount++;

        // Обновляем прогресс задачи
        await job.progress((successCount + errorCount) / estimateIds.length * 100);

      } catch (error) {
        this.logger.error(`Ошибка обработки сметы ${estimateId}:`, error);
        results.push({ estimateId, success: false, error: (error as Error).message });
        errorCount++;
      }
    }

    this.logger.log(`Массовая операция завершена. Успешно: ${successCount}, Ошибок: ${errorCount}`);

    return {
      totalProcessed: estimateIds.length,
      successful: successCount,
      failed: errorCount,
      results,
    };
  }

  /**
   * Обработка экспорта сметы
   */
  @Process('export-estimate')
  async handleEstimateExport(job: Job<{ estimateId: string; format: string; userId?: string }>) {
    const { estimateId, format, userId } = job.data;

    this.logger.log(`Начинаем экспорт сметы ${estimateId} в формате ${format}`);

    try {
      // Получаем полные данные сметы
      const estimate = await this.prisma.estimate.findUnique({
        where: { id: estimateId },
        include: {
          items: true,
          project: true,
          createdBy: true,
        },
      });

      if (!estimate) {
        throw new Error(`Смета ${estimateId} не найдена`);
      }

      // Генерируем файл экспорта (пока заглушка)
      const exportData = await this.generateExportFile(estimate, format);

      // Сохраняем файл и получаем URL для скачивания
      const downloadUrl = await this.saveExportFile(exportData, estimateId, format);

      this.logger.log(`Экспорт сметы ${estimateId} завершен успешно`);

      // Уведомляем пользователя
      if (userId) {
        await this.notificationService.notifyExportReady(
          userId,
          estimateId,
          format,
          downloadUrl
        );
      }

      return {
        success: true,
        estimateId,
        format,
        downloadUrl,
        exportedAt: new Date(),
      };

    } catch (error) {
      this.logger.error(`Ошибка экспорта сметы ${estimateId}:`, error);
      throw error;
    }
  }

  /**
   * Обработка валидации сметы
   */
  @Process('validate-estimate')
  async handleEstimateValidation(job: Job<{ estimateId: string; userId?: string }>) {
    const { estimateId, userId } = job.data;

    this.logger.log(`Начинаем валидацию сметы ${estimateId}`);

    try {
      const estimate = await this.prisma.estimate.findUnique({
        where: { id: estimateId },
        include: {
          items: true,
        },
      });

      if (!estimate) {
        throw new Error(`Смета ${estimateId} не найдена`);
      }

      const validationErrors = [];

      // Проверка базовых данных
      if (!estimate.name || estimate.name.trim().length === 0) {
        validationErrors.push('Название сметы не может быть пустым');
      }

      if (estimate.items.length === 0) {
        validationErrors.push('Смета должна содержать хотя бы одну позицию');
      }

      // Проверка позиций
      estimate.items.forEach((item: any, index: number) => {
        if (Number(item.quantity) <= 0) {
          validationErrors.push(`Позиция ${index + 1}: количество должно быть больше нуля`);
        }

        if (Number(item.unitPrice) < 0) {
          validationErrors.push(`Позиция ${index + 1}: цена не может быть отрицательной`);
        }

        if (!item.name || item.name.trim().length === 0) {
          validationErrors.push(`Позиция ${index + 1}: название не может быть пустым`);
        }
      });

      // Проверка расчетных данных
      if (Number(estimate.totalCost) <= 0) {
        validationErrors.push('Общая стоимость сметы должна быть больше нуля');
      }

      this.logger.log(`Валидация сметы ${estimateId} завершена. Найдено ошибок: ${validationErrors.length}`);

      return {
        success: true,
        estimateId,
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        validatedAt: new Date(),
      };

    } catch (error) {
      this.logger.error(`Ошибка валидации сметы ${estimateId}:`, error);
      throw error;
    }
  }

  /**
   * Пересчет позиций сметы
   */
  private async recalculateEstimateItems(estimateId: string): Promise<void> {
    const items = await this.prisma.estimateItem.findMany({
      where: { estimateId },
    });

    for (const item of items) {
      const totalPrice = Number(item.quantity) * Number(item.unitPrice);

      await this.prisma.estimateItem.update({
        where: { id: item.id },
        data: { totalPrice },
      });
    }
  }

  /**
   * Генерация файла экспорта (заглушка)
   */
  private async generateExportFile(estimate: any, format: string): Promise<Buffer> {
    // TODO: Реализовать реальную генерацию файлов
    const content = JSON.stringify({
      estimate,
      format,
      exportedAt: new Date(),
    }, null, 2);

    return Buffer.from(content, 'utf-8');
  }

  /**
   * Сохранение файла экспорта (заглушка)
   */
  private async saveExportFile(data: Buffer, estimateId: string, format: string): Promise<string> {
    // TODO: Реализовать реальное сохранение в файловое хранилище
    const filename = `estimate-${estimateId}-${Date.now()}.${format}`;
    const downloadUrl = `/exports/${filename}`;

    return downloadUrl;
  }
}
