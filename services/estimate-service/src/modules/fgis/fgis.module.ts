import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FgisService } from './fgis.service';
import { FgisController } from './fgis.controller';
import { ConstructionResourceService } from './services/construction-resource.service';
import { PriceZoneService } from './services/price-zone.service';
import { LaborCostService } from './services/labor-cost.service';
import { MaterialService } from './services/material.service';
import { MachineService } from './services/machine.service';
import { TechGroupService } from './services/tech-group.service';
import { GesnService } from './services/gesn.service';
import { PriceBaseService } from './services/price-base.service';

@Module({
  imports: [PrismaModule],
  controllers: [FgisController],
  providers: [
    FgisService,
    ConstructionResourceService,
    PriceZoneService,
    LaborCostService,
    MaterialService,
    MachineService,
    TechGroupService,
    GesnService,
    PriceBaseService,
  ],
  exports: [
    FgisService,
    ConstructionResourceService,
    PriceZoneService,
    LaborCostService,
    MaterialService,
    MachineService,
    TechGroupService,
    GesnService,
    PriceBaseService,
  ],
})
export class FgisModule {}
