import { PrismaService } from '@app/shared/prisma';
import { Injectable } from '@nestjs/common';
import { KnowledgeContext, KnowledgeData } from '../interfaces/knowledge.interface';

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly prisma: PrismaService) {}

  async getTaskContext(taskType: string): Promise<KnowledgeContext> {
    const knowledge = await this.prisma.taskKnowledge.findUnique({
      where: { taskType },
    });

    if (!knowledge) {
      return {
        taskType,
        context: 'Стандартный контекст задачи',
      };
    }

    return knowledge.context as KnowledgeContext;
  }

  async create(data: KnowledgeData): Promise<void> {
    await this.prisma.generalKnowledge.create({
      data: {
        key: `knowledge_${Date.now()}`,
        value: data,
        description: 'Автоматически созданное знание',
      },
    });
  }

  async bulkCreate(items: KnowledgeData[]): Promise<void> {
    await this.prisma.generalKnowledge.createMany({
      data: items.map(item => ({
        key: `knowledge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        value: item,
        description: 'Автоматически созданное знание (пакетное)',
      })),
      skipDuplicates: true,
    });
  }
}
