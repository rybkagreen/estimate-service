import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerController } from './ter.controller';
import { TerService } from './ter.service';

@Module({
  imports: [HttpModule],
  controllers: [TerController],
  providers: [TerService],
  exports: [TerService],
})
export class TerModule {}
