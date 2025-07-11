import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    // Получить количество активных проектов
    const activeProjects = await this.prisma.project.count({ where: { status: 'ACTIVE' } });
    // Сметы в работе
    const estimatesInProgress = await this.prisma.estimate.count({
      where: { status: 'IN_REVIEW' },
    });
    // Завершённые сметы
    const completedEstimates = await this.prisma.estimate.count({ where: { status: 'APPROVED' } });
    // Savings (пример: сумма totalCost всех утверждённых смет)
    const savingsAgg = await this.prisma.estimate.aggregate({
      where: { status: 'APPROVED' },
      _sum: { totalCost: true },
    });
    const savings = Number(savingsAgg._sum.totalCost) || 0;
    // Критические задачи (пример: последние 2 сметы в статусе IN_REVIEW)
    const criticalTasksRaw = await this.prisma.estimate.findMany({
      where: { status: 'IN_REVIEW' },
      orderBy: { updatedAt: 'desc' },
      take: 2,
      select: { id: true, name: true, status: true },
    });
    const criticalTasks = criticalTasksRaw.map(
      (e: { id: string; name: string; status: string }) => ({
        id: e.id,
        title: e.name,
        status: e.status,
      }),
    );

    return {
      activeProjects,
      estimatesInProgress,
      completedEstimates,
      savings,
      criticalTasks,
    };
  }
}
