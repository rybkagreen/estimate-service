import { Module } from '@nestjs/common';
import { CadController } from './cad.controller';
import { CadService } from './cad.service';
import { DwgParserService } from './services/dwg-parser.service';
import { PdfCadParserService } from './services/pdf-cad-parser.service';
import { CadGeometryService } from './services/cad-geometry.service';

@Module({
  controllers: [CadController],
  providers: [
    CadService,
    DwgParserService,
    PdfCadParserService,
    CadGeometryService,
  ],
  exports: [CadService],
})
export class CadModule {}
