import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS configuration
  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Estimate Service API')
    .setDescription('ИИ-ассистент для составления сметной документации совместимой с Гранд Смета')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] || 3020;

  await app.listen(port);

  console.log(`🏗️  Estimate Service запущен на порту ${port}`);
  console.log(`📚 API документация: http://localhost:${port}/api/docs`);
}

bootstrap();
