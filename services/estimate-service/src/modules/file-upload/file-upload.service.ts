import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';

export interface UploadedFileInfo {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: Date;
  userId?: string;
  estimateId?: string;
}

export interface FileFilter {
  userId?: string;
  estimateId?: string;
  mimetype?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.uploadPath = this.configService.get('UPLOAD_PATH', './uploads');
    this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:3020');
  }

  /**
   * Сохранить информацию о загруженном файле в БД
   */
  async saveFileInfo(
    file: Express.Multer.File,
    userId?: string,
    estimateId?: string,
    metadata?: Record<string, any>
  ): Promise<UploadedFileInfo> {
    try {
      // TODO: Добавить модель Document в schema.prisma для хранения файлов
      // Пока используем заглушку
      const fileInfo: UploadedFileInfo = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `${this.baseUrl}/files/${file.filename}`,
        uploadedAt: new Date(),
        userId,
        estimateId,
      };

      this.logger.log(`Файл сохранен: ${file.originalname} (${file.size} bytes)`);

      return fileInfo;
    } catch (error) {
      this.logger.error('Ошибка сохранения информации о файле:', error);
      throw error;
    }
  }

  /**
   * Получить информацию о файле
   */
  async getFileInfo(fileId: string): Promise<UploadedFileInfo | null> {
    try {
      // TODO: Реализовать получение из БД когда будет модель Document
      // Пока возвращаем null
      return null;
    } catch (error) {
      this.logger.error(`Ошибка получения информации о файле ${fileId}:`, error);
      return null;
    }
  }

  /**
   * Получить список файлов
   */
  async getFiles(filter: FileFilter = {}): Promise<UploadedFileInfo[]> {
    try {
      // TODO: Реализовать получение из БД
      // Пока возвращаем пустой массив
      return [];
    } catch (error) {
      this.logger.error('Ошибка получения списка файлов:', error);
      return [];
    }
  }

  /**
   * Удалить файл
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const fileInfo = await this.getFileInfo(fileId);

      if (!fileInfo) {
        throw new NotFoundException(`Файл ${fileId} не найден`);
      }

      // Удаляем физический файл
      await fs.unlink(fileInfo.path);

      // TODO: Удаляем запись из БД

      this.logger.log(`Файл удален: ${fileInfo.filename}`);
      return true;
    } catch (error) {
      this.logger.error(`Ошибка удаления файла ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Получить файл для скачивания
   */
  async downloadFile(filename: string): Promise<{ path: string; mimetype: string; originalName: string }> {
    try {
      const filePath = path.join(this.uploadPath, filename);

      // Проверяем существование файла
      await fs.access(filePath);

      // TODO: Получить mimetype и originalName из БД
      const stats = await fs.stat(filePath);

      return {
        path: filePath,
        mimetype: 'application/octet-stream', // Временно
        originalName: filename, // Временно
      };
    } catch (error) {
      this.logger.error(`Ошибка доступа к файлу ${filename}:`, error);
      throw new NotFoundException(`Файл ${filename} не найден`);
    }
  }

  /**
   * Валидация файла
   */
  validateFile(file: Express.Multer.File): void {
    const maxSize = this.configService.get('MAX_FILE_SIZE', 10 * 1024 * 1024);

    if (file.size > maxSize) {
      throw new BadRequestException(`Размер файла превышает лимит ${maxSize} bytes`);
    }

    // Проверка на потенциально опасные файлы
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (dangerousExtensions.includes(fileExtension)) {
      throw new BadRequestException(`Недопустимое расширение файла: ${fileExtension}`);
    }
  }

  /**
   * Очистка старых файлов
   */
  async cleanupOldFiles(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // TODO: Реализовать очистку из БД и файловой системы

      this.logger.log(`Очистка файлов старше ${olderThanDays} дней`);
      return 0; // Временно
    } catch (error) {
      this.logger.error('Ошибка очистки старых файлов:', error);
      throw error;
    }
  }

  /**
   * Получить статистику загруженных файлов
   */
  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    uploadsByDate: Record<string, number>;
  }> {
    try {
      // TODO: Реализовать получение статистики из БД

      return {
        totalFiles: 0,
        totalSize: 0,
        filesByType: {},
        uploadsByDate: {},
      };
    } catch (error) {
      this.logger.error('Ошибка получения статистики файлов:', error);
      throw error;
    }
  }

  /**
   * Обработка изображений (изменение размера, оптимизация)
   */
  async processImage(file: Express.Multer.File): Promise<string> {
    try {
      // TODO: Интегрировать с библиотекой обработки изображений (Sharp, Jimp)
      // Пока просто возвращаем путь к оригинальному файлу

      this.logger.log(`Обработка изображения: ${file.originalname}`);
      return file.path;
    } catch (error) {
      this.logger.error('Ошибка обработки изображения:', error);
      throw error;
    }
  }

  /**
   * Парсинг Excel файлов смет
   */
  async parseEstimateExcel(file: Express.Multer.File): Promise<any[]> {
    try {
      // TODO: Интегрировать с библиотекой для работы с Excel (ExcelJS, XLSX)

      this.logger.log(`Парсинг Excel файла: ${file.originalname}`);

      // Заглушка - возвращаем примерные данные сметы
      return [
        {
          name: 'Земляные работы',
          unit: 'м³',
          quantity: 100,
          unitPrice: 500,
          totalPrice: 50000,
        },
        {
          name: 'Бетонные работы',
          unit: 'м³',
          quantity: 50,
          unitPrice: 3000,
          totalPrice: 150000,
        },
      ];
    } catch (error) {
      this.logger.error('Ошибка парсинга Excel файла:', error);
      throw error;
    }
  }
}
