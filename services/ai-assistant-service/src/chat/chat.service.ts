import { Injectable, Logger } from '@nestjs/common';
import { DeepseekService } from '../deepseek/deepseek.service';
import { WeaviateService } from '../vector-store/weaviate.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly deepseekService: DeepseekService,
    private readonly weaviateService: WeaviateService,
    private readonly prisma: PrismaService,
  ) {}

  async createSession(userId: string): Promise<any> {
    // Generate session id, here it's a simple UUID.
    const sessionId = uuidv4();

    // Create a new chat session object.
    const newSession = {
      id: sessionId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Saving chat session logic can be implemented here.
    // For example, using Prisma:
    // await this.prisma.chatSession.create({ data: newSession });

    this.logger.log(`Created new chat session for user: ${userId} with id: ${sessionId}`);

    return newSession;
  }

  async sendMessage(sessionId: string, message: string): Promise<any> {
    try {
      // Get userId from session (this is a simplified version)
      // In production, you'd need to retrieve this from a session store
      const userId = 'websocket-user'; // This should be retrieved from session

      const response = await this.processMessage({
        sessionId,
        message,
        userId,
      });

      return {
        id: uuidv4(),
        sessionId,
        role: 'assistant',
        content: response.response,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw error;
    }
  }

  async processMessage(params: {
    sessionId?: string;
    message: string;
    context?: any;
    userId: string;
  }) {
    const sessionId = params.sessionId || uuidv4();
    
    try {
      // Сохраняем сообщение пользователя
      await this.saveChatMessage({
        sessionId,
        userId: params.userId,
        role: 'user',
        content: params.message,
      });

      // Получаем контекст из векторной БД
      const relevantContext = await this.getRelevantContext(params.message);

      // Формируем системный промпт с контекстом
      const systemPrompt = this.buildSystemPrompt(relevantContext);

      // Получаем историю чата
      const chatHistory = await this.getChatHistory(sessionId, 10);

      // Формируем сообщения для DeepSeek
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: params.message },
      ];

      // Получаем ответ от DeepSeek
      const response = await this.deepseekService.chat(messages, {
        temperature: 0.3,
        maxTokens: 2000,
      });

      // Сохраняем ответ ассистента
      await this.saveChatMessage({
        sessionId,
        userId: params.userId,
        role: 'assistant',
        content: response,
      });

      return {
        sessionId,
        response,
        context: relevantContext,
      };
    } catch (error) {
      this.logger.error('Error processing message:', error);
      throw error;
    }
  }

  async analyzeEstimate(params: {
    estimateContent: string;
    documentType?: string;
    regionCode?: string;
    year?: number;
    userId: string;
  }) {
    try {
      // Поиск похожих смет в векторной БД
      const similarEstimates = await this.findSimilarEstimates(
        params.estimateContent,
      );

      // Формируем контекст для анализа
      const context = {
        similarEstimates,
        documentType: params.documentType,
        regionCode: params.regionCode,
        year: params.year,
      };

      // Анализируем через DeepSeek
      const analysis = await this.deepseekService.analyzeEstimate({
        estimateText: params.estimateContent,
        documentType: params.documentType as any,
        regionCode: params.regionCode,
        year: params.year,
      });

      // Сохраняем результат анализа
      await this.saveAnalysisResult({
        userId: params.userId,
        estimateContent: params.estimateContent,
        analysis,
        context,
      });

      return {
        analysis,
        similarEstimates,
        recommendations: await this.generateRecommendations(analysis),
      };
    } catch (error) {
      this.logger.error('Error analyzing estimate:', error);
      throw error;
    }
  }

  async generateEstimate(params: {
    projectDescription: string;
    workTypes: string[];
    area?: number;
    region?: string;
    priceLevel?: string;
    userId: string;
  }) {
    try {
      // Поиск релевантных расценок ФСБЦ
      const relevantRates = await this.findRelevantRates(
        params.workTypes,
        params.region,
      );

      // Поиск похожих проектов
      const similarProjects = await this.findSimilarProjects(
        params.projectDescription,
      );

      // Генерация сметы через DeepSeek
      const estimate = await this.deepseekService.generateEstimate({
        projectDescription: params.projectDescription,
        workTypes: params.workTypes,
        area: params.area,
        region: params.region,
        priceLevel: params.priceLevel as any,
      });

      // Сохраняем сгенерированную смету
      await this.saveGeneratedEstimate({
        userId: params.userId,
        projectDescription: params.projectDescription,
        estimate,
        relevantRates,
      });

      return {
        estimate,
        relevantRates,
        similarProjects,
      };
    } catch (error) {
      this.logger.error('Error generating estimate:', error);
      throw error;
    }
  }

  async getSuggestions(context: string, type?: string) {
    try {
      const weaviateClient = this.weaviateService.getClient();
      
      // Базовый запрос для поиска
      let query = weaviateClient.graphql
        .get()
        .withClassName('FSBCRate')
        .withFields('code name unit category workComposition basePrice')
        .withNearText({ concepts: [context] })
        .withLimit(10);

      // Добавляем фильтр по типу если указан
      if (type) {
        query = query.withWhere({
          path: ['category'],
          operator: 'Equal',
          valueString: type,
        });
      }

      const result = await query.do();

      return {
        suggestions: result.data.Get.FSBCRate || [],
        context,
        type,
      };
    } catch (error) {
      this.logger.error('Error getting suggestions:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId: string, limit = 50, offset = 0) {
    try {
      return await this.prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.logger.error('Error getting chat history:', error);
      return [];
    }
  }

  private async saveChatMessage(params: {
    sessionId: string;
    userId: string;
    role: string;
    content: string;
  }) {
    try {
      return await this.prisma.chatMessage.create({
        data: params,
      });
    } catch (error) {
      this.logger.error('Error saving chat message:', error);
    }
  }

  private async getRelevantContext(message: string) {
    try {
      const weaviateClient = this.weaviateService.getClient();
      
      // Поиск релевантных расценок
      const ratesResult = await weaviateClient.graphql
        .get()
        .withClassName('FSBCRate')
        .withFields('code name unit category workComposition')
        .withNearText({ concepts: [message] })
        .withLimit(5)
        .do();

      // Поиск похожих исторических смет
      const estimatesResult = await weaviateClient.graphql
        .get()
        .withClassName('HistoricalEstimate')
        .withFields('projectName projectType workTypes')
        .withNearText({ concepts: [message] })
        .withLimit(3)
        .do();

      return {
        rates: ratesResult.data?.Get?.FSBCRate || [],
        estimates: estimatesResult.data?.Get?.HistoricalEstimate || [],
      };
    } catch (error) {
      this.logger.error('Error getting relevant context:', error);
      return { rates: [], estimates: [] };
    }
  }

  private buildSystemPrompt(context: any) {
    return `Ты - профессиональный ИИ-ассистент для работы со строительными сметами и базой ФСБЦ-2022.

Твои основные задачи:
1. Помогать в составлении и анализе смет
2. Подбирать корректные расценки из базы ФСБЦ-2022
3. Учитывать региональные особенности и коэффициенты
4. Предоставлять обоснованные рекомендации

Релевантный контекст:
${JSON.stringify(context, null, 2)}

Отвечай структурированно и профессионально, используя терминологию строительной отрасли.`;
  }

  private async findSimilarEstimates(content: string) {
    try {
      const weaviateClient = this.weaviateService.getClient();
      
      const result = await weaviateClient.graphql
        .get()
        .withClassName('HistoricalEstimate')
        .withFields('projectName totalCost region year workTypes accuracy')
        .withNearText({ concepts: [content] })
        .withLimit(5)
        .do();

      return result.data?.Get?.HistoricalEstimate || [];
    } catch (error) {
      this.logger.error('Error finding similar estimates:', error);
      return [];
    }
  }

  private async findRelevantRates(workTypes: string[], region?: string) {
    try {
      const weaviateClient = this.weaviateService.getClient();
      
      const concepts = workTypes.join(' ');
      let query = weaviateClient.graphql
        .get()
        .withClassName('FSBCRate')
        .withFields('code name unit category basePrice laborCost machineCost materialCost')
        .withNearText({ concepts: [concepts] })
        .withLimit(20);

      if (region) {
        query = query.withWhere({
          path: ['region'],
          operator: 'Equal',
          valueString: region,
        });
      }

      const result = await query.do();
      return result.data?.Get?.FSBCRate || [];
    } catch (error) {
      this.logger.error('Error finding relevant rates:', error);
      return [];
    }
  }

  private async findSimilarProjects(description: string) {
    try {
      const weaviateClient = this.weaviateService.getClient();
      
      const result = await weaviateClient.graphql
        .get()
        .withClassName('HistoricalEstimate')
        .withFields('projectName projectType totalCost workTypes')
        .withNearText({ concepts: [description] })
        .withLimit(5)
        .do();

      return result.data?.Get?.HistoricalEstimate || [];
    } catch (error) {
      this.logger.error('Error finding similar projects:', error);
      return [];
    }
  }

  private async generateRecommendations(analysis: string) {
    // Анализируем результат и формируем рекомендации
    const recommendations = [];
    
    if (analysis.includes('завышен')) {
      recommendations.push('Рекомендуется пересмотреть расценки на предмет соответствия текущим рыночным условиям');
    }
    
    if (analysis.includes('не учтен')) {
      recommendations.push('Необходимо добавить упущенные позиции для полноты сметы');
    }
    
    if (analysis.includes('коэффициент')) {
      recommendations.push('Проверьте правильность применения региональных коэффициентов');
    }

    return recommendations;
  }

  private async saveAnalysisResult(params: any) {
    // Сохранение результатов анализа для последующего использования
    try {
      await this.prisma.estimateAnalysis.create({
        data: {
          userId: params.userId,
          content: params.estimateContent,
          analysis: params.analysis,
          context: JSON.stringify(params.context),
        },
      });
    } catch (error) {
      this.logger.error('Error saving analysis result:', error);
    }
  }

  private async saveGeneratedEstimate(params: any) {
    // Сохранение сгенерированной сметы
    try {
      await this.prisma.generatedEstimate.create({
        data: {
          userId: params.userId,
          description: params.projectDescription,
          content: params.estimate,
          rates: JSON.stringify(params.relevantRates),
        },
      });
    } catch (error) {
      this.logger.error('Error saving generated estimate:', error);
    }
  }
}
