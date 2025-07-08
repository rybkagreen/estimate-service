import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FerController } from './fer.controller';
import { FerService } from './fer.service';

@Module({
  imports: [HttpModule],
  controllers: [FerController],
  providers: [FerService],
  exports: [FerService],
})
export class FerModule {}
