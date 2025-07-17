import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BimModule } from './modules/bim/bim.module';
import { CadModule } from './modules/cad/cad.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { VolumeExtractionModule } from './modules/volume-extraction/volume-extraction.module';
import { EquipmentParserModule } from './modules/equipment-parser/equipment-parser.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    PrismaModule,
    StorageModule,
    BimModule,
    CadModule,
    OcrModule,
    VolumeExtractionModule,
    EquipmentParserModule,
  ],
})
export class AppModule {}
