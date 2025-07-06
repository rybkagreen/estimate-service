import { Module } from '@nestjs/common';
import { FerModule } from '../fer/fer.module';
import { GesnModule } from '../gesn/gesn.module';
import { TerModule } from '../ter/ter.module';
import { FsbcController } from './fsbc.controller';
import { FsbcService } from './fsbc.service';

@Module({
  imports: [FerModule, TerModule, GesnModule],
  controllers: [FsbcController],
  providers: [FsbcService],
  exports: [FsbcService],
})
export class FsbcModule {}
