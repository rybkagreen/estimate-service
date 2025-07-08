/**
 * Контроллер для управления автоматизацией
 */

import { Body, Controller, Get, Logger, Post, Put } from '@nestjs/common';
import { AutomationConfig, AutomationService, AutomationStats } from '../services/automation.service';

@Controller('automation')
export class AutomationController {
  private readonly logger = new Logger(AutomationController.name);

  constructor(private automationService: AutomationService) {}

  /**
   * Получение статистики автоматизации
   */
  @Get('stats')
  async getStats(): Promise<AutomationStats> {
    this.logger.log('📊 Запрос статистики автоматизации');
    return this.automationService.getStats();
  }

  /**
   * Ручной запуск автоматического сбора данных
   */
  @Post('trigger')
  async manualTrigger(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🚀 Ручной запуск автоматизации');

    const success = await this.automationService.manualTrigger();

    return {
      success,
      message: success
        ? 'Автоматический сбор данных запущен'
        : 'Не удалось запустить автоматизацию (возможно, уже выполняется)'
    };
  }

  /**
   * Обновление конфигурации автоматизации
   */
  @Put('config')
  async updateConfig(
    @Body() config: Partial<AutomationConfig>
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log('⚙️ Обновление конфигурации автоматизации');

    try {
      this.automationService.updateConfig(config);
      return {
        success: true,
        message: 'Конфигурация автоматизации обновлена'
      };
    } catch (error) {
      this.logger.error('❌ Ошибка при обновлении конфигурации:', error);
      return {
        success: false,
        message: 'Не удалось обновить конфигурацию'
      };
    }
  }

  /**
   * Статус работы автоматизации
   */
  @Get('status')
  async getStatus(): Promise<{
    enabled: boolean;
    lastDownload: Date | null;
    lastParse: Date | null;
    lastCleanup: Date | null;
    totalOperations: number;
  }> {
    const stats = this.automationService.getStats();

    return {
      enabled: true, // Можно получить из конфигурации
      lastDownload: stats.lastDownload,
      lastParse: stats.lastParse,
      lastCleanup: stats.lastCleanup,
      totalOperations: stats.totalDownloads + stats.totalParsed
    };
  }
}
