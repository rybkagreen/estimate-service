import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('MarketplaceIntegration');

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Marketplace Integration API')
    .setDescription('API для интеграции с B2B строительными маркетплейсами')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('marketplaces', 'Управление маркетплейсами')
    .addTag('pricing', 'Ценовая информация')
    .addTag('transport', 'Расчет транспортировки')
    .addTag('availability', 'Доступность ресурсов')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.MARKETPLACE_PORT || 3004;
  await app.listen(port);
  logger.log(`🚀 Marketplace Integration service is running on: http://localhost:${port}`);
  logger.log(`📚 API documentation: http://localhost:${port}/api`);
}

bootstrap();
