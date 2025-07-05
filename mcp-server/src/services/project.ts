/**
 * Сервис для работы с проектными файлами и структурой
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

export interface ProjectConfig {
  rootPath: string;
  servicePath: string;
  docsPath: string;
  libsPath: string;
}

export interface FileInfo {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  extension?: string;
}

export interface ProjectStructure {
  name: string;
  path: string;
  children: ProjectStructure[];
  type: 'file' | 'directory';
  size?: number;
}

export class ProjectService {
  private config: ProjectConfig;
  private isInitialized = false;

  constructor(config: ProjectConfig) {
    this.config = config;
  }

  /**
   * Инициализация проектного сервиса
   */
  async initialize(): Promise<void> {
    try {
      logger.info('📁 Инициализация проектного сервиса...');

      // Проверяем доступность проектных путей
      await this.validateProjectPaths();

      this.isInitialized = true;
      logger.info('✅ Проектный сервис инициализирован');
    } catch (error) {
      logger.error('❌ Ошибка инициализации проектного сервиса:', error);
      throw error;
    }
  }

  /**
   * Проверка доступности проектных путей
   */
  private async validateProjectPaths(): Promise<void> {
    const paths = [
      this.config.rootPath,
      this.config.servicePath,
      this.config.docsPath,
      this.config.libsPath,
    ];

    for (const projectPath of paths) {
      try {
        await fs.access(projectPath);
        logger.debug(`✅ Путь доступен: ${projectPath}`);
      } catch (error) {
        logger.warn(`⚠️ Путь недоступен: ${projectPath}`);
      }
    }
  }

  /**
   * Получение структуры проекта
   */
  async getProjectStructure(targetPath?: string): Promise<ProjectStructure> {
    if (!this.isInitialized) {
      throw new Error('Проектный сервис не инициализирован');
    }

    const basePath = targetPath || this.config.rootPath;

    try {
      return await this.buildDirectoryTree(basePath);
    } catch (error) {
      logger.error('❌ Ошибка получения структуры проекта:', error);
      throw error;
    }
  }

  /**
   * Построение дерева директорий
   */
  private async buildDirectoryTree(dirPath: string): Promise<ProjectStructure> {
    const stats = await fs.stat(dirPath);
    const name = path.basename(dirPath);

    if (stats.isFile()) {
      return {
        name,
        path: dirPath,
        type: 'file',
        size: stats.size,
        children: [],
      };
    }

    const children: ProjectStructure[] = [];

    try {
      const entries = await fs.readdir(dirPath);

      for (const entry of entries) {
        // Пропускаем скрытые файлы и node_modules
        if (entry.startsWith('.') || entry === 'node_modules') {
          continue;
        }

        const fullPath = path.join(dirPath, entry);
        try {
          const child = await this.buildDirectoryTree(fullPath);
          children.push(child);
        } catch (error) {
          // Пропускаем недоступные файлы
          logger.debug(`Пропуск недоступного файла: ${fullPath}`);
        }
      }
    } catch (error) {
      logger.warn(`Не удалось прочитать директорию: ${dirPath}`);
    }

    return {
      name,
      path: dirPath,
      type: 'directory',
      children: children.sort((a, b) => {
        // Сначала директории, потом файлы
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
    };
  }

  /**
   * Чтение файла проекта
   */
  async readFile(filePath: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Проектный сервис не инициализирован');
    }

    try {
      // Проверяем, что файл находится в разрешенных директориях
      const resolvedPath = path.resolve(filePath);
      const allowedPaths = [
        path.resolve(this.config.rootPath),
        path.resolve(this.config.servicePath),
        path.resolve(this.config.docsPath),
        path.resolve(this.config.libsPath),
      ];

      const isAllowed = allowedPaths.some(allowedPath =>
        resolvedPath.startsWith(allowedPath)
      );

      if (!isAllowed) {
        throw new Error('Файл находится за пределами разрешенных директорий');
      }

      const content = await fs.readFile(resolvedPath, 'utf-8');
      logger.debug(`📖 Файл прочитан: ${filePath} (${content.length} символов)`);

      return content;
    } catch (error) {
      logger.error(`❌ Ошибка чтения файла ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Запись файла проекта
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Проектный сервис не инициализирован');
    }

    try {
      // Проверяем разрешения на запись
      const resolvedPath = path.resolve(filePath);
      const allowedPaths = [
        path.resolve(this.config.rootPath),
        path.resolve(this.config.servicePath),
        path.resolve(this.config.docsPath),
        path.resolve(this.config.libsPath),
      ];

      const isAllowed = allowedPaths.some(allowedPath =>
        resolvedPath.startsWith(allowedPath)
      );

      if (!isAllowed) {
        throw new Error('Файл находится за пределами разрешенных директорий');
      }

      // Создаем директорию если не существует
      const dir = path.dirname(resolvedPath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(resolvedPath, content, 'utf-8');
      logger.debug(`✍️ Файл записан: ${filePath} (${content.length} символов)`);
    } catch (error) {
      logger.error(`❌ Ошибка записи файла ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Поиск файлов по паттерну
   */
  async searchFiles(pattern: string, directory?: string): Promise<FileInfo[]> {
    if (!this.isInitialized) {
      throw new Error('Проектный сервис не инициализирован');
    }

    const searchDir = directory || this.config.rootPath;
    const results: FileInfo[] = [];

    try {
      await this.searchFilesRecursive(searchDir, pattern, results);
      logger.debug(`🔍 Найдено файлов: ${results.length} по паттерну "${pattern}"`);

      return results;
    } catch (error) {
      logger.error(`❌ Ошибка поиска файлов по паттерну ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Рекурсивный поиск файлов
   */
  private async searchFilesRecursive(
    directory: string,
    pattern: string,
    results: FileInfo[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(directory);

      for (const entry of entries) {
        // Пропускаем скрытые файлы и node_modules
        if (entry.startsWith('.') || entry === 'node_modules') {
          continue;
        }

        const fullPath = path.join(directory, entry);
        const stats = await fs.stat(fullPath);

        if (stats.isFile()) {
          // Проверяем соответствие паттерну
          if (this.matchesPattern(entry, pattern)) {
            results.push({
              path: fullPath,
              name: entry,
              type: 'file',
              size: stats.size,
              modified: stats.mtime,
              extension: path.extname(entry),
            });
          }
        } else if (stats.isDirectory()) {
          // Рекурсивно обходим подпапки
          await this.searchFilesRecursive(fullPath, pattern, results);
        }
      }
    } catch (error) {
      // Пропускаем недоступные директории
      logger.debug(`Пропуск недоступной директории: ${directory}`);
    }
  }

  /**
   * Проверка соответствия паттерну
   */
  private matchesPattern(filename: string, pattern: string): boolean {
    // Простая реализация glob-паттернов
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\./g, '\\.');

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(filename);
  }

  /**
   * Получение информации о файле
   */
  async getFileInfo(filePath: string): Promise<FileInfo | null> {
    if (!this.isInitialized) {
      throw new Error('Проектный сервис не инициализирован');
    }

    try {
      const stats = await fs.stat(filePath);
      const name = path.basename(filePath);

      return {
        path: filePath,
        name,
        type: stats.isFile() ? 'file' : 'directory',
        size: stats.size,
        modified: stats.mtime,
        extension: stats.isFile() ? path.extname(filePath) : undefined,
      };
    } catch (error) {
      logger.debug(`Файл не найден: ${filePath}`);
      return null;
    }
  }

  /**
   * Получение списка TypeScript файлов
   */
  async getTypeScriptFiles(): Promise<FileInfo[]> {
    return this.searchFiles('*.ts', this.config.servicePath);
  }

  /**
   * Получение списка документации
   */
  async getDocumentationFiles(): Promise<FileInfo[]> {
    return this.searchFiles('*.md', this.config.docsPath);
  }

  /**
   * Получение статистики проекта
   */
  async getProjectStats(): Promise<{
    totalFiles: number;
    totalDirectories: number;
    fileTypes: Record<string, number>;
    totalSize: number;
  }> {
    try {
      const structure = await this.getProjectStructure();
      const stats = {
        totalFiles: 0,
        totalDirectories: 0,
        fileTypes: {} as Record<string, number>,
        totalSize: 0,
      };

      this.collectStats(structure, stats);

      return stats;
    } catch (error) {
      logger.error('❌ Ошибка получения статистики проекта:', error);
      throw error;
    }
  }

  /**
   * Сбор статистики рекурсивно
   */
  private collectStats(
    structure: ProjectStructure,
    stats: any
  ): void {
    if (structure.type === 'file') {
      stats.totalFiles++;
      if (structure.size) {
        stats.totalSize += structure.size;
      }

      const ext = path.extname(structure.name);
      if (ext) {
        stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
      }
    } else {
      stats.totalDirectories++;
    }

    for (const child of structure.children) {
      this.collectStats(child, stats);
    }
  }

  /**
   * Проверка готовности сервиса
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Завершение работы проектного сервиса
   */
  async shutdown(): Promise<void> {
    logger.info('📁 Завершение работы проектного сервиса...');
    this.isInitialized = false;
    logger.info('✅ Проектный сервис завершил работу');
  }
}
