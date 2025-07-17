import { Module } from '@nestjs/common';
import { EquipmentParserController } from './equipment-parser.controller';
import { EquipmentParserService } from './equipment-parser.service';
import { SpecificationExtractorService } from './services/specification-extractor.service';
import { EquipmentCatalogService } from './services/equipment-catalog.service';
import { OcrModule } from '../ocr/ocr.module';

@Module({
  imports: [OcrModule],
  controllers: [EquipmentParserController],
  providers: [
    EquipmentParserService,
    SpecificationExtractorService,
    EquipmentCatalogService,
  ],
  exports: [EquipmentParserService],
})
export class EquipmentParserModule {}
