import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';

@Module({
  controllers: [EstimateController],
  providers: [EstimateService, PrismaService],
  exports: [EstimateService],
})
export class EstimateModule {}
