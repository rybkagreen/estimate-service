import { Module } from '@nestjs/common';
import { FileProcessorService } from './file-processor.service';
import { FileProcessorController } from './file-processor.controller';
import { StorageModule } from '../storage/storage.module';
import { OcrModule } from '../ocr/ocr.module';
import { VirusScanModule } from '../virus-scan/virus-scan.module';

@Module({
  imports: [StorageModule, OcrModule, VirusScanModule],
  controllers: [FileProcessorController],
  providers: [FileProcessorService],
  exports: [FileProcessorService],
})
export class FileProcessorModule {}
