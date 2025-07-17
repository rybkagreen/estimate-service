import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TsnService } from './tsn.service';
import { TsnController } from './tsn.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  providers: [TsnService],
  controllers: [TsnController],
  exports: [TsnService],
})
export class TsnModule {}
