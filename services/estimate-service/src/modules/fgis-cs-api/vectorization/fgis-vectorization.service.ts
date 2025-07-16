import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Сервис для векторизации документов ФГИС ЦС
 * Интеграция с системой из estimate-templates
 */
@Injectable()
export class FgisVectorizationService {
  private readonly logger = new Logger(FgisVectorizationService.name);
  private readonly vectorDbPath: string;
  private readonly processingPath: string;
  private readonly pythonScriptsPath: string;

  constructor(private readonly prisma: PrismaService) {
    this.vectorDbPath = path.join(__dirname, '..', 'vector_db_ready');
    this.processingPath = path.join(__dirname, '..', 'processing');
    this.pythonScriptsPath = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', '..', 'estimate-templates');
  }

  /**
   * Инициализировать директории для векторизации
   */
  async initializeDirectories(): Promise<void> {
    await fs.mkdir(this.vectorDbPath, { recursive: true });
    await fs.mkdir(this.processingPath, { recursive: true });
  }

  /**
   * Векторизировать данные из базы данных
   */
  async vectorizeDbData(): Promise<{
    totalChunks: number;
    chromaFormat: string;
    langchainFormat: string;
    llamaIndexFormat: string;
  }> {
    this.logger.log('Starting database data vectorization...');
    
    // Инициализация директорий
    await this.initializeDirectories();

    // Сбор данных из базы
    const data = await this.collectDataFromDb();
    
    // Создание чанков
    const chunks = await this.createChunks(data);
    
    // Сохранение в различных форматах
    const chromaPath = await this.saveChromaFormat(chunks);
    const langchainPath = await this.saveLangchainFormat(chunks);
    const llamaIndexPath = await this.saveLlamaIndexFormat(chunks);
    
    // Создание поисковых индексов
    await this.createSearchIndexes(chunks);
    
    // Статистика
    const stats = {
      totalChunks: chunks.length,
      chromaFormat: chromaPath,
      langchainFormat: langchainPath,
      llamaIndexFormat: llamaIndexPath,
    };
    
    await this.saveProcessingStatistics(stats);
    
    this.logger.log(`Vectorization completed. Total chunks: ${chunks.length}`);
    
    return stats;
  }

  /**
   * Собрать данные из базы данных
   */
  private async collectDataFromDb(): Promise<any[]> {
    const data = [];
    
    // Сбор данных ФСНБ
    const priceBase = await this.prisma.priceBase.findMany();
    data.push(...priceBase.map(item => ({
      type: 'fsnb_data',
      category: item.category,
      code: item.code,
      title: item.name,
      content: `${item.name}. Единица измерения: ${item.unit}. Затраты труда: ${item.laborCost}, Материалы: ${item.materialCost}, Машины: ${item.machineCost}, Всего: ${item.totalCost}`,
      metadata: {
        year: item.year,
        unit: item.unit,
        laborCost: item.laborCost,
        materialCost: item.materialCost,
        machineCost: item.machineCost,
        totalCost: item.totalCost,
      },
    })));
    
    // Сбор данных КСР
    const resources = await this.prisma.constructionResource.findMany();
    data.push(...resources.map(item => ({
      type: 'ksr_data',
      category: item.category,
      code: item.code,
      title: item.name,
      content: `${item.name}. Единица измерения: ${item.unit}. Категория: ${item.category}. ${item.description || ''}`,
      metadata: {
        unit: item.unit,
        subcategory: item.subcategory,
      },
    })));
    
    // Сбор данных ГЭСН
    const gesn = await this.prisma.gESN.findMany();
    data.push(...gesn.map(item => ({
      type: 'gesn_data',
      category: item.type,
      code: item.code,
      title: item.name,
      content: `${item.name}. Единица измерения: ${item.unit}. Трудозатраты: ${item.laborHours} чел-час`,
      metadata: {
        unit: item.unit,
        laborHours: item.laborHours,
        type: item.type,
      },
    })));
    
    // Сбор ценовых зон
    const priceZones = await this.prisma.priceZone.findMany();
    data.push(...priceZones.map(item => ({
      type: 'price_zone',
      category: 'regional',
      code: `${item.regionCode}-${item.zoneCode}`,
      title: `${item.regionName} - ${item.zoneName}`,
      content: `Ценовая зона: ${item.zoneName} в регионе ${item.regionName}. Коэффициент: ${item.coefficient}`,
      metadata: {
        regionCode: item.regionCode,
        zoneCode: item.zoneCode,
        coefficient: item.coefficient,
      },
    })));
    
    return data;
  }

  /**
   * Создать чанки из данных
   */
  private async createChunks(data: any[]): Promise<any[]> {
    const chunks = [];
    const chunkSize = 512; // Размер чанка в символах
    
    for (const item of data) {
      // Если контент большой, разбиваем на чанки
      if (item.content.length > chunkSize) {
        const contentChunks = this.splitIntoChunks(item.content, chunkSize);
        contentChunks.forEach((chunk, index) => {
          chunks.push({
            id: `${item.type}_${item.code}_${index}`,
            content: chunk,
            metadata: {
              ...item.metadata,
              type: item.type,
              category: item.category,
              code: item.code,
              title: item.title,
              chunk_index: index,
              total_chunks: contentChunks.length,
            },
          });
        });
      } else {
        chunks.push({
          id: `${item.type}_${item.code}`,
          content: item.content,
          metadata: {
            ...item.metadata,
            type: item.type,
            category: item.category,
            code: item.code,
            title: item.title,
          },
        });
      }
    }
    
    return chunks;
  }

  /**
   * Разбить текст на чанки
   */
  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks = [];
    const words = text.split(' ');
    let currentChunk = '';
    
    for (const word of words) {
      if ((currentChunk + ' ' + word).length > chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = word;
        }
      } else {
        currentChunk += (currentChunk ? ' ' : '') + word;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Сохранить в формате ChromaDB
   */
  private async saveChromaFormat(chunks: any[]): Promise<string> {
    const chromaData = chunks.map(chunk => ({
      id: chunk.id,
      document: chunk.content,
      metadata: chunk.metadata,
    }));
    
    const filePath = path.join(this.vectorDbPath, 'chroma_format.json');
    await fs.writeFile(filePath, JSON.stringify(chromaData, null, 2), 'utf-8');
    
    return filePath;
  }

  /**
   * Сохранить в формате LangChain
   */
  private async saveLangchainFormat(chunks: any[]): Promise<string> {
    const langchainData = chunks.map(chunk => ({
      page_content: chunk.content,
      metadata: chunk.metadata,
    }));
    
    const filePath = path.join(this.vectorDbPath, 'langchain_format.json');
    await fs.writeFile(filePath, JSON.stringify(langchainData, null, 2), 'utf-8');
    
    return filePath;
  }

  /**
   * Сохранить в формате LlamaIndex
   */
  private async saveLlamaIndexFormat(chunks: any[]): Promise<string> {
    const llamaData = chunks.map(chunk => ({
      text: chunk.content,
      doc_id: chunk.id,
      extra_info: chunk.metadata,
    }));
    
    const filePath = path.join(this.vectorDbPath, 'llama_index_format.json');
    await fs.writeFile(filePath, JSON.stringify(llamaData, null, 2), 'utf-8');
    
    return filePath;
  }

  /**
   * Создать поисковые индексы
   */
  private async createSearchIndexes(chunks: any[]): Promise<void> {
    const indexes = {
      by_type: {},
      by_category: {},
      by_code: {},
      keywords: {},
    };
    
    // Индексация по типу
    for (const chunk of chunks) {
      const type = chunk.metadata.type;
      if (!indexes.by_type[type]) {
        indexes.by_type[type] = [];
      }
      indexes.by_type[type].push(chunk.id);
      
      // Индексация по категории
      const category = chunk.metadata.category;
      if (category) {
        if (!indexes.by_category[category]) {
          indexes.by_category[category] = [];
        }
        indexes.by_category[category].push(chunk.id);
      }
      
      // Индексация по коду
      const code = chunk.metadata.code;
      if (code) {
        indexes.by_code[code] = chunk.id;
      }
      
      // Извлечение ключевых слов
      const keywords = this.extractKeywords(chunk.content);
      for (const keyword of keywords) {
        if (!indexes.keywords[keyword]) {
          indexes.keywords[keyword] = [];
        }
        indexes.keywords[keyword].push(chunk.id);
      }
    }
    
    const filePath = path.join(this.vectorDbPath, 'search_indexes.json');
    await fs.writeFile(filePath, JSON.stringify(indexes, null, 2), 'utf-8');
  }

  /**
   * Извлечь ключевые слова из текста
   */
  private extractKeywords(text: string): string[] {
    // Простое извлечение ключевых слов
    const stopWords = new Set([
      'и', 'в', 'на', 'с', 'по', 'для', 'из', 'от', 'до', 'при',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    ]);
    
    const words = text.toLowerCase()
      .replace(/[^а-яёa-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Возвращаем уникальные слова
    return [...new Set(words)].slice(0, 10); // Максимум 10 ключевых слов
  }

  /**
   * Сохранить статистику обработки
   */
  private async saveProcessingStatistics(stats: any): Promise<void> {
    const statistics = {
      ...stats,
      processedAt: new Date().toISOString(),
      dataTypes: await this.getDataTypeStatistics(),
    };
    
    const filePath = path.join(this.processingPath, 'processing_statistics.json');
    await fs.writeFile(filePath, JSON.stringify(statistics, null, 2), 'utf-8');
  }

  /**
   * Получить статистику по типам данных
   */
  private async getDataTypeStatistics(): Promise<any> {
    const [priceBase, resources, gesn, priceZones, materials, machines] = await this.prisma.$transaction([
      this.prisma.priceBase.count(),
      this.prisma.constructionResource.count(),
      this.prisma.gESN.count(),
      this.prisma.priceZone.count(),
      this.prisma.material.count(),
      this.prisma.machine.count(),
    ]);
    
    return {
      fsnb_data: priceBase,
      ksr_data: resources,
      gesn_data: gesn,
      price_zones: priceZones,
      materials: materials,
      machines: machines,
    };
  }

  /**
   * Создать примеры запросов
   */
  async createSampleQueries(): Promise<void> {
    const sampleQueries = [
      {
        query: "земляные работы экскаватор",
        description: "Поиск норм для земляных работ с использованием экскаватора",
        expected_types: ["gesn_data", "fsnb_data"],
      },
      {
        query: "устройство фундамента",
        description: "Поиск норм и расценок для устройства фундаментов",
        expected_types: ["gesn_data", "fsnb_data", "ksr_data"],
      },
      {
        query: "расценки московская область",
        description: "Поиск расценок с учетом региональных коэффициентов",
        expected_types: ["price_zone", "fsnb_data"],
      },
      {
        query: "монтаж металлоконструкций",
        description: "Поиск норм для монтажа металлических конструкций",
        expected_types: ["gesn_data", "fsnb_data"],
      },
      {
        query: "бетон класс B25",
        description: "Поиск материалов и расценок для бетона",
        expected_types: ["ksr_data", "materials"],
      },
    ];
    
    const filePath = path.join(this.vectorDbPath, 'sample_queries.json');
    await fs.writeFile(filePath, JSON.stringify(sampleQueries, null, 2), 'utf-8');
  }

  /**
   * Запустить Python скрипт для продвинутой обработки
   */
  async runPythonProcessing(scriptName: string): Promise<any> {
    try {
      const scriptPath = path.join(this.pythonScriptsPath, scriptName);
      const { stdout, stderr } = await execAsync(`python "${scriptPath}"`);
      
      if (stderr) {
        this.logger.warn(`Python script warnings: ${stderr}`);
      }
      
      return { success: true, output: stdout };
    } catch (error) {
      this.logger.error(`Failed to run Python script: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
