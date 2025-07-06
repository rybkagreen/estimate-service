import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
import {
    BulkNotificationJobData,
    EmailNotificationJobData,
    SystemNotificationJobData,
} from '../services/notification-jobs.service';

@Processor('notifications')
export class NotificationJobsProcessor {
  private readonly logger = new Logger(NotificationJobsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Обработка отправки email уведомлений
   */
  @Process('send-email')
  async handleEmailNotification(job: Job<EmailNotificationJobData>) {
    const { to, subject, template, templateData, priority } = job.data;

    this.logger.log(`Отправляем email уведомление: ${subject} to ${Array.isArray(to) ? to.join(', ') : to}`);

    try {
      // TODO: Интеграция с реальным email-провайдером (SendGrid, AWS SES, etc.)
      const emailResult = await this.sendEmail(to, subject, template, templateData);

      this.logger.log(`Email уведомление отправлено успешно: ${emailResult.messageId}`);

      return {
        success: true,
        messageId: emailResult.messageId,
        sentAt: new Date(),
        recipients: Array.isArray(to) ? to : [to],
      };

    } catch (error) {
      this.logger.error('Ошибка отправки email уведомления:', error);
      throw error;
    }
  }

  /**
   * Обработка системных уведомлений
   */
  @Process('send-system-notification')
  async handleSystemNotification(job: Job<SystemNotificationJobData>) {
    const { userId, title, message, type, data } = job.data;

    this.logger.log(`Отправляем системное уведомление пользователю ${userId}: ${title}`);

    try {
      // Сохраняем уведомление в БД
      const notification = await this.prisma.notification.create({
        data: {
          title,
          content: message,
          type: type.toUpperCase() as any,
          priority: 'MEDIUM',
          status: 'PENDING',
          recipientId: userId,
          metadata: data || undefined,
        },
      });

      // Создаем запись для пользователя
      await this.prisma.userNotification.create({
        data: {
          userId,
          notificationId: notification.id,
          isRead: false,
        },
      });

      // TODO: Отправить real-time уведомление через WebSocket
      await this.sendRealTimeNotification(userId, {
        id: notification.id,
        title,
        message,
        type,
        data,
        createdAt: notification.createdAt,
      });

      this.logger.log(`Системное уведомление создано: ${notification.id}`);

      return {
        success: true,
        notificationId: notification.id,
        userId,
        sentAt: notification.createdAt,
      };

    } catch (error) {
      this.logger.error('Ошибка создания системного уведомления:', error);
      throw error;
    }
  }

  /**
   * Обработка массовых уведомлений
   */
  @Process('send-bulk-notification')
  async handleBulkNotification(job: Job<BulkNotificationJobData>) {
    const { userIds, title, message, type } = job.data;

    this.logger.log(`Отправляем массовое уведомление ${userIds.length} пользователям: ${title}`);

    try {
      const notifications = [];
      let successCount = 0;
      let errorCount = 0;

      for (const userId of userIds) {
        try {
          const notification = await this.prisma.notification.create({
            data: {
              title,
              content: message,
              type: type.toUpperCase() as any,
              priority: 'LOW', // Массовые уведомления имеют низкий приоритет
              status: 'PENDING',
              recipientId: userId,
            },
          });

          // Создаем запись для пользователя
          await this.prisma.userNotification.create({
            data: {
              userId,
              notificationId: notification.id,
              isRead: false,
            },
          });

          notifications.push(notification);
          successCount++;

          // Отправляем real-time уведомление
          await this.sendRealTimeNotification(userId, {
            id: notification.id,
            title,
            message,
            type,
            createdAt: notification.createdAt,
          });

          // Обновляем прогресс задачи
          await job.progress((successCount + errorCount) / userIds.length * 100);

        } catch (error) {
          this.logger.error(`Ошибка создания уведомления для пользователя ${userId}:`, error);
          errorCount++;
        }
      }

      this.logger.log(`Массовая рассылка завершена. Успешно: ${successCount}, Ошибок: ${errorCount}`);

      return {
        success: true,
        totalUsers: userIds.length,
        successful: successCount,
        failed: errorCount,
        notifications: notifications.map(n => n.id),
      };

    } catch (error) {
      this.logger.error('Ошибка массовой рассылки уведомлений:', error);
      throw error;
    }
  }

  /**
   * Очистка старых уведомлений
   */
  @Process('cleanup-notifications')
  async handleNotificationCleanup(job: Job<{ olderThanDays: number }>) {
    const { olderThanDays } = job.data;

    this.logger.log(`Очищаем уведомления старше ${olderThanDays} дней`);

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const deleteResult = await this.prisma.userNotification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true, // Удаляем только прочитанные уведомления
        },
      });

      this.logger.log(`Удалено старых уведомлений: ${deleteResult.count}`);

      return {
        success: true,
        deletedCount: deleteResult.count,
        cutoffDate,
        cleanedAt: new Date(),
      };

    } catch (error) {
      this.logger.error('Ошибка очистки уведомлений:', error);
      throw error;
    }
  }

  /**
   * Отправка email (заглушка)
   */
  private async sendEmail(
    to: string | string[],
    subject: string,
    template: string,
    templateData?: Record<string, any>
  ): Promise<{ messageId: string }> {
    // TODO: Интеграция с реальным email-провайдером
    // Например, с помощью @nestjs-modules/mailer или nodemailer

    // Имитируем отправку email
    await new Promise(resolve => setTimeout(resolve, 100));

    const messageId = `fake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.debug(`[MOCK] Email отправлен:`, {
      to: Array.isArray(to) ? to : [to],
      subject,
      template,
      templateData,
      messageId,
    });

    return { messageId };
  }

  /**
   * Отправка real-time уведомления (заглушка)
   */
  private async sendRealTimeNotification(
    userId: string,
    notification: {
      id: string;
      title: string;
      message: string;
      type: string;
      data?: any;
      createdAt: Date;
    }
  ): Promise<void> {
    // TODO: Интеграция с WebSocket или Server-Sent Events
    // Например, с помощью Socket.IO или встроенного WebSocket Gateway

    this.logger.debug(`[MOCK] Real-time уведомление отправлено пользователю ${userId}:`, {
      notificationId: notification.id,
      title: notification.title,
      type: notification.type,
    });

    // Имитируем отправку
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  /**
   * Отправка push-уведомления (заглушка)
   */
  private async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    // TODO: Интеграция с Firebase Cloud Messaging или другим push-сервисом

    this.logger.debug(`[MOCK] Push-уведомление отправлено пользователю ${userId}:`, {
      title,
      message,
      data,
    });

    // Имитируем отправку
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
