import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstimateJobsService } from './services/estimate-jobs.service';
import { NotificationJobsService } from './services/notification-jobs.service';

class CreateCalculationJobDto {
  estimateId: string;
  priority?: 'low' | 'normal' | 'high';
  recalculateAll?: boolean;
}

class CreateExportJobDto {
  estimateId: string;
  format: 'pdf' | 'excel' | 'grand-smeta';
}

class CreateBulkJobDto {
  estimateIds: string[];
  operationType: 'recalculate' | 'approve' | 'export';
}

class SendNotificationDto {
  userIds: string[];
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

@ApiTags('Background Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BackgroundJobsController {
  constructor(
    private readonly estimateJobsService: EstimateJobsService,
    private readonly notificationJobsService: NotificationJobsService,
  ) {}

  @Post('estimates/calculate')
  @ApiOperation({ summary: 'Добавить задачу расчета сметы' })
  @ApiResponse({ status: 201, description: 'Задача добавлена в очередь' })
  async createCalculationJob(@Body() dto: CreateCalculationJobDto) {
    await this.estimateJobsService.addCalculationJob({
      estimateId: dto.estimateId,
      priority: dto.priority,
      recalculateAll: dto.recalculateAll,
    });

    return {
      success: true,
      message: 'Задача расчета сметы добавлена в очередь',
      estimateId: dto.estimateId,
    };
  }

  @Post('estimates/bulk-calculate')
  @ApiOperation({ summary: 'Добавить задачу массового расчета смет' })
  @ApiResponse({ status: 201, description: 'Задача добавлена в очередь' })
  async createBulkCalculationJob(@Body() dto: CreateBulkJobDto) {
    await this.estimateJobsService.addBulkCalculationJob({
      estimateIds: dto.estimateIds,
      operationType: dto.operationType,
    });

    return {
      success: true,
      message: 'Задача массового расчета добавлена в очередь',
      estimatesCount: dto.estimateIds.length,
    };
  }

  @Post('estimates/export')
  @ApiOperation({ summary: 'Добавить задачу экспорта сметы' })
  @ApiResponse({ status: 201, description: 'Задача добавлена в очередь' })
  async createExportJob(@Body() dto: CreateExportJobDto) {
    await this.estimateJobsService.addExportJob(
      dto.estimateId,
      dto.format,
    );

    return {
      success: true,
      message: 'Задача экспорта добавлена в очередь',
      estimateId: dto.estimateId,
      format: dto.format,
    };
  }

  @Post('estimates/:id/validate')
  @ApiOperation({ summary: 'Добавить задачу валидации сметы' })
  @ApiResponse({ status: 201, description: 'Задача добавлена в очередь' })
  async createValidationJob(@Param('id') estimateId: string) {
    await this.estimateJobsService.addValidationJob(estimateId);

    return {
      success: true,
      message: 'Задача валидации добавлена в очередь',
      estimateId,
    };
  }

  @Post('notifications/send')
  @ApiOperation({ summary: 'Отправить уведомления пользователям' })
  @ApiResponse({ status: 201, description: 'Уведомления добавлены в очередь' })
  async sendNotifications(@Body() dto: SendNotificationDto) {
    await this.notificationJobsService.sendBulkNotification({
      userIds: dto.userIds,
      title: dto.title,
      message: dto.message,
      type: dto.type,
    });

    return {
      success: true,
      message: 'Уведомления добавлены в очередь',
      recipientsCount: dto.userIds.length,
    };
  }

  @Get('estimates/queue/stats')
  @ApiOperation({ summary: 'Получить статистику очереди расчетов' })
  @ApiResponse({ status: 200, description: 'Статистика очереди' })
  async getEstimateQueueStats() {
    const stats = await this.estimateJobsService.getQueueStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get('notifications/queue/stats')
  @ApiOperation({ summary: 'Получить статистику очереди уведомлений' })
  @ApiResponse({ status: 200, description: 'Статистика очереди' })
  async getNotificationQueueStats() {
    const stats = await this.notificationJobsService.getQueueStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Post('estimates/queue/clean')
  @ApiOperation({ summary: 'Очистить очередь расчетов' })
  @ApiResponse({ status: 200, description: 'Очередь очищена' })
  async cleanEstimateQueue() {
    await this.estimateJobsService.cleanQueue();
    return {
      success: true,
      message: 'Очередь расчетов очищена',
    };
  }

  @Post('notifications/queue/clean')
  @ApiOperation({ summary: 'Очистить очередь уведомлений' })
  @ApiResponse({ status: 200, description: 'Очередь очищена' })
  async cleanNotificationQueue() {
    await this.notificationJobsService.cleanQueue();
    return {
      success: true,
      message: 'Очередь уведомлений очищена',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Проверить здоровье фоновых задач' })
  @ApiResponse({ status: 200, description: 'Статус фоновых задач' })
  async getJobsHealth() {
    try {
      const [estimateStats, notificationStats] = await Promise.all([
        this.estimateJobsService.getQueueStats(),
        this.notificationJobsService.getQueueStats(),
      ]);

      return {
        success: true,
        status: 'healthy',
        queues: {
          estimates: {
            ...estimateStats,
            status: estimateStats.failed > estimateStats.active * 2 ? 'warning' : 'healthy',
          },
          notifications: {
            ...notificationStats,
            status: notificationStats.failed > notificationStats.active * 2 ? 'warning' : 'healthy',
          },
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}
