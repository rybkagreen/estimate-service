import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('DataCollectorService');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3021;
  await app.listen(port);

  logger.log(`🔄 Data Collector Service запущен на порту ${port}`);
  logger.log(`📊 Готов к сбору данных ФСБЦ-2022`);
}

bootstrap();
