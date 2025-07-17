import { Module } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { CollectorController } from './collector.controller';
import { NormativeCollectorService } from '../services/normative-collector.service';
import { FerModule } from '../modules/fer/fer.module';
import { TerModule } from '../modules/ter/ter.module';
import { GesnModule } from '../modules/gesn/gesn.module';
import { TsnModule } from '../modules/tsn/tsn.module';
import { FsscModule } from '../modules/fssc/fssc.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    FerModule,
    TerModule,
    GesnModule,
    TsnModule,
    FsscModule,
  ],
  controllers: [CollectorController],
  providers: [CollectorService, NormativeCollectorService],
  exports: [CollectorService, NormativeCollectorService],
})
export class CollectorModule {}
