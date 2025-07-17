import { Module } from '@nestjs/common';
import { VolumeExtractionController } from './volume-extraction.controller';
import { VolumeExtractionService } from './volume-extraction.service';
import { QuantityTakeoffService } from './services/quantity-takeoff.service';
import { MaterialMappingService } from './services/material-mapping.service';
import { BimModule } from '../bim/bim.module';
import { CadModule } from '../cad/cad.module';

@Module({
  imports: [BimModule, CadModule],
  controllers: [VolumeExtractionController],
  providers: [
    VolumeExtractionService,
    QuantityTakeoffService,
    MaterialMappingService,
  ],
  exports: [VolumeExtractionService],
})
export class VolumeExtractionModule {}
