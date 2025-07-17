import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FsscService } from './fssc.service';
import { FsscController } from './fssc.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  providers: [FsscService],
  controllers: [FsscController],
  exports: [FsscService],
})
export class FsscModule {}
