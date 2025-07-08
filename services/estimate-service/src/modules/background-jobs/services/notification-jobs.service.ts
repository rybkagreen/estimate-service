import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

export interface EmailNotificationJobData {
  to: string | string[];
  subject: string;
  template: string;
  templateData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SystemNotificationJobData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  data?: Record<string, any>;
}

export interface BulkNotificationJobData {
  userIds: string[];
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

@Injectable()
export class NotificationJobsService {
  private readonly logger = new Logger(NotificationJobsService.name);

  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  /**
   * Отправить email уведомление
   */
  async sendEmailNotification(data: EmailNotificationJobData): Promise<void> {
    try {
      const job = await this.notificationQueue.add('send-email', data, {
        priority: this.getPriorityNumber(data.priority),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });

      this.logger.log(`Email уведомление добавлено в очередь: ${job.id}`);
    } catch (error) {
      this.logger.error('Ошибка добавления email уведомления:', error);
      throw error;
    }
  }

  /**
   * Отправить системное уведомление пользователю
   */
  async sendSystemNotification(data: SystemNotificationJobData): Promise<void> {
    try {
      const job = await this.notificationQueue.add('send-system-notification', data, {
        priority: 5,
        attempts: 2,
      });

      this.logger.log(`Системное уведомление добавлено в очередь: ${job.id} для пользователя ${data.userId}`);
    } catch (error) {
      this.logger.error('Ошибка добавления системного уведомления:', error);
      throw error;
    }
  }

  /**
   * Отправить массовое уведомление
   */
  async sendBulkNotification(data: BulkNotificationJobData): Promise<void> {
    try {
      const job = await this.notificationQueue.add('send-bulk-notification', data, {
        priority: 7, // Низкий приоритет для массовых уведомлений
        attempts: 2,
      });

      this.logger.log(`Массовое уведомление добавлено в очередь: ${job.id} для ${data.userIds.length} пользователей`);
    } catch (error) {
      this.logger.error('Ошибка добавления массового уведомления:', error);
      throw error;
    }
  }

  /**
   * Уведомление о завершении расчета сметы
   */
  async notifyEstimateCalculationComplete(
    userId: string,
    estimateId: string,
    estimateName: string,
    success: boolean
  ): Promise<void> {
    const data: SystemNotificationJobData = {
      userId,
      title: success ? 'Расчет сметы завершен' : 'Ошибка расчета сметы',
      message: success
        ? `Смета "${estimateName}" успешно пересчитана`
        : `При расчете сметы "${estimateName}" произошла ошибка`,
      type: success ? 'success' : 'error',
      data: { estimateId, estimateName },
    };

    await this.sendSystemNotification(data);
  }

  /**
   * Уведомление о готовности экспорта
   */
  async notifyExportReady(
    userId: string,
    estimateId: string,
    format: string,
    downloadUrl: string
  ): Promise<void> {
    const data: SystemNotificationJobData = {
      userId,
      title: 'Экспорт готов',
      message: `Файл экспорта в формате ${format} готов для скачивания`,
      type: 'success',
      data: { estimateId, format, downloadUrl },
    };

    await this.sendSystemNotification(data);
  }

  /**
   * Уведомление о смене статуса сметы
   */
  async notifyEstimateStatusChange(
    userId: string,
    estimateId: string,
    estimateName: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const data: SystemNotificationJobData = {
      userId,
      title: 'Изменен статус сметы',
      message: `Статус сметы "${estimateName}" изменен с "${oldStatus}" на "${newStatus}"`,
      type: 'info',
      data: { estimateId, estimateName, oldStatus, newStatus },
    };

    await this.sendSystemNotification(data);
  }

  /**
   * Получить статистику очереди уведомлений
   */
  async getQueueStats() {
    const waiting = await this.notificationQueue.getWaiting();
    const active = await this.notificationQueue.getActive();
    const completed = await this.notificationQueue.getCompleted();
    const failed = await this.notificationQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  }

  /**
   * Очистить очередь уведомлений
   */
  async cleanQueue(): Promise<void> {
    await this.notificationQueue.clean(7 * 24 * 60 * 60 * 1000, 'completed'); // Удаляем завершенные задачи старше недели
    await this.notificationQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Удаляем упавшие задачи старше суток
    this.logger.log('Очередь уведомлений очищена');
  }

  /**
   * Преобразовать текстовый приоритет в числовой
   */
  private getPriorityNumber(priority?: 'low' | 'normal' | 'high' | 'urgent'): number {
    switch (priority) {
      case 'urgent':
        return 1;
      case 'high':
        return 2;
      case 'normal':
        return 5;
      case 'low':
        return 10;
      default:
        return 5;
    }
  }
}
