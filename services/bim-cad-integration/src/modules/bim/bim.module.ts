import { Module } from '@nestjs/common';
import { BimController } from './bim.controller';
import { BimService } from './bim.service';
import { IfcParserService } from './services/ifc-parser.service';
import { RvtParserService } from './services/rvt-parser.service';
import { BimGeometryService } from './services/bim-geometry.service';

@Module({
  controllers: [BimController],
  providers: [
    BimService,
    IfcParserService,
    RvtParserService,
    BimGeometryService,
  ],
  exports: [BimService],
})
export class BimModule {}
