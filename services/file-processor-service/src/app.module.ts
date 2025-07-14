import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { FileProcessorModule } from './file-processor/file-processor.module';
import { OcrModule } from './ocr/ocr.module';
import { StorageModule } from './storage/storage.module';
import { VirusScanModule } from './virus-scan/virus-scan.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
    FileProcessorModule,
    OcrModule,
    StorageModule,
    VirusScanModule,
    HealthModule,
  ],
})
export class AppModule {}
