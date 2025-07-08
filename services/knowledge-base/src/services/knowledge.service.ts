import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateKnowledgeDto } from '../dto/create-knowledge.dto';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { CreateValidationDto } from '../dto/create-validation.dto';
import { KnowledgeStatus, KnowledgeCategory, Prisma, Priority } from '@prisma/client';

interface FindAllParams {
  status?: KnowledgeStatus;
  category?: KnowledgeCategory;
  tags?: string[];
  search?: string;
  page: number;
  limit: number;
}

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async create(createKnowledgeDto: CreateKnowledgeDto, authorId: string) {
    return this.prisma.knowledgeEntry.create({
      data: {
        ...createKnowledgeDto,
        authorId,
        status: KnowledgeStatus.DRAFT,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: true,
      },
    });
  }

  async findAll(params: FindAllParams) {
    const { status, category, tags, search, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.KnowledgeEntryWhereInput = {
      ...(status && { status }),
      ...(category && { category }),
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [entries, total] = await Promise.all([
      this.prisma.knowledgeEntry.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              feedbacks: true,
              validations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.knowledgeEntry.count({ where }),
    ]);

    return {
      data: entries,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: true,
        feedbacks: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        validations: {
          include: {
            expert: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    // Увеличиваем счетчик просмотров
    await this.prisma.knowledgeEntry.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return entry;
  }

  async update(id: string, updateData: Partial<CreateKnowledgeDto>) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    return this.prisma.knowledgeEntry.update({
      where: { id },
      data: {
        ...updateData,
        version: { increment: 1 },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: true,
      },
    });
  }

  async remove(id: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    // Мягкое удаление - архивирование
    return this.prisma.knowledgeEntry.update({
      where: { id },
      data: {
        status: KnowledgeStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  }

  async addFeedback(knowledgeEntryId: string, feedbackDto: CreateFeedbackDto, userId: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id: knowledgeEntryId },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    return this.prisma.userFeedback.create({
      data: {
        knowledgeEntryId,
        userId,
        feedback: feedbackDto.feedback,
        suggestion: feedbackDto.suggestion,
        rating: feedbackDto.rating,
        feedbackType: feedbackDto.feedbackType || 'general',
        priority: Priority.MEDIUM,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getFeedback(knowledgeEntryId: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id: knowledgeEntryId },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    return this.prisma.userFeedback.findMany({
      where: { knowledgeEntryId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async addValidation(knowledgeEntryId: string, validationDto: CreateValidationDto, expertId: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id: knowledgeEntryId },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    // Проверяем, нет ли уже валидации от этого эксперта
    const existingValidation = await this.prisma.expertValidation.findUnique({
      where: {
        knowledgeEntryId_expertId: {
          knowledgeEntryId,
          expertId,
        },
      },
    });

    if (existingValidation) {
      throw new ConflictException('Валидация от этого эксперта уже существует');
    }

    const validation = await this.prisma.expertValidation.create({
      data: {
        knowledgeEntryId,
        expertId,
        isValid: validationDto.isValid,
        validationScore: validationDto.validationScore,
        comment: validationDto.comment,
        corrections: validationDto.corrections,
        recommendations: validationDto.recommendations || [],
        accuracyScore: validationDto.accuracyScore,
        completenessScore: validationDto.completenessScore,
        clarityScore: validationDto.clarityScore,
        relevanceScore: validationDto.relevanceScore,
        expertiseArea: validationDto.expertiseArea,
        requiresRevision: validationDto.requiresRevision || false,
        reviewCompletedAt: new Date(),
      },
      include: {
        expert: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Если запись одобрена экспертом, можно автоматически изменить статус
    if (validationDto.isValid && entry.status === KnowledgeStatus.PENDING_REVIEW) {
      await this.prisma.knowledgeEntry.update({
        where: { id: knowledgeEntryId },
        data: { status: KnowledgeStatus.APPROVED },
      });
    }

    return validation;
  }

  async getValidations(knowledgeEntryId: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id: knowledgeEntryId },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    return this.prisma.expertValidation.findMany({
      where: { knowledgeEntryId },
      include: {
        expert: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async publish(id: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id },
      include: {
        validations: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    // Проверяем, есть ли хотя бы одна положительная валидация
    const hasValidation = entry.validations.some(v => v.isValid);
    
    if (!hasValidation && entry.status !== KnowledgeStatus.APPROVED) {
      throw new BadRequestException('Запись должна быть проверена экспертом перед публикацией');
    }

    return this.prisma.knowledgeEntry.update({
      where: { id },
      data: {
        status: KnowledgeStatus.APPROVED,
        publishedAt: new Date(),
      },
    });
  }

  async archive(id: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('Запись знаний не найдена');
    }

    return this.prisma.knowledgeEntry.update({
      where: { id },
      data: {
        status: KnowledgeStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  }

  async getPopularTags(limit: number) {
    // Получаем все записи с тегами
    const entries = await this.prisma.knowledgeEntry.findMany({
      where: {
        status: KnowledgeStatus.APPROVED,
        tags: { isEmpty: false },
      },
      select: {
        tags: true,
      },
    });

    // Подсчитываем частоту тегов
    const tagCount = new Map<string, number>();
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    // Сортируем и возвращаем топ тегов
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  async getCategoryStatistics() {
    const stats = await this.prisma.knowledgeEntry.groupBy({
      by: ['category', 'status'],
      _count: true,
    });

    // Форматируем результат
    const result = {};
    stats.forEach(stat => {
      if (!result[stat.category]) {
        result[stat.category] = {
          total: 0,
          byStatus: {},
        };
      }
      result[stat.category].total += stat._count;
      result[stat.category].byStatus[stat.status] = stat._count;
    });

    return result;
  }
}
