import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH') || './uploads';
    this.ensureDirectoryExists(this.uploadPath);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subFolder?: string): Promise<string> {
    const folder = subFolder ? path.join(this.uploadPath, subFolder) : this.uploadPath;
    this.ensureDirectoryExists(folder);

    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(folder, fileName);

    await fs.promises.writeFile(filePath, file.buffer);
    return filePath;
  }

  async readFile(filePath: string): Promise<Buffer> {
    return fs.promises.readFile(filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    const destDir = path.dirname(destinationPath);
    this.ensureDirectoryExists(destDir);
    await fs.promises.rename(sourcePath, destinationPath);
  }

  getFilePath(fileName: string, subFolder?: string): string {
    return subFolder 
      ? path.join(this.uploadPath, subFolder, fileName)
      : path.join(this.uploadPath, fileName);
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
