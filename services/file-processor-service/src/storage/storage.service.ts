import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface StorageResult {
  id: string;
  url: string;
  bucket: string;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10),
      useSSL,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin',
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'estimates';
    this.initializeBucket();
  }

  /**
   * Initialize bucket if it doesn't exist
   */
  private async initializeBucket(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      this.logger.error('Error initializing bucket:', error);
    }
  }

  /**
   * Upload file to MinIO/S3
   */
  async uploadFile(file: Express.Multer.File): Promise<StorageResult> {
    const fileId = uuidv4();
    const extension = path.extname(file.originalname);
    const key = `${fileId}${extension}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        key,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'X-Original-Name': Buffer.from(file.originalname).toString('base64'),
        }
      );

      const url = await this.getFileUrl(key);

      return {
        id: fileId,
        url,
        bucket: this.bucketName,
        key,
      };
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(key: string): Promise<string> {
    try {
      // Generate presigned URL valid for 7 days
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        key,
        7 * 24 * 60 * 60
      );
    } catch (error) {
      this.logger.error('Error generating file URL:', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<any> {
    // In a real implementation, you would store file metadata in a database
    // For now, we'll just return a mock response
    return {
      id: fileId,
      originalName: 'file.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      storageUrl: `https://${this.bucketName}.s3.amazonaws.com/${fileId}`,
      isScanned: true,
      scanResult: 'clean',
    };
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      // Find the actual key (would be from database in real implementation)
      const objects = await this.listFiles(fileId);
      
      for (const obj of objects) {
        await this.minioClient.removeObject(this.bucketName, obj.name);
      }
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * List files with prefix
   */
  private async listFiles(prefix: string): Promise<Minio.BucketItem[]> {
    const objects: Minio.BucketItem[] = [];
    const stream = this.minioClient.listObjects(this.bucketName, prefix, true);

    return new Promise((resolve, reject) => {
      stream.on('data', obj => objects.push(obj));
      stream.on('error', reject);
      stream.on('end', () => resolve(objects));
    });
  }

  /**
   * Get file stream
   */
  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    try {
      return await this.minioClient.getObject(this.bucketName, key);
    } catch (error) {
      this.logger.error('Error getting file stream:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, key);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }
}
