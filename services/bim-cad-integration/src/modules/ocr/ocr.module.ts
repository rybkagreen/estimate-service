import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { TextExtractionService } from './services/text-extraction.service';
import { NlpService } from './services/nlp.service';

@Module({
  controllers: [OcrController],
  providers: [
    OcrService,
    TextExtractionService,
    NlpService,
  ],
  exports: [OcrService],
})
export class OcrModule {}
