import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('BIM & CAD Integration Service')
    .setDescription('Service for processing BIM (IFC, RVT) and CAD (DWG, PDF) files with OCR and NLP capabilities')
    .setVersion('1.0')
    .addTag('bim', 'BIM file processing endpoints')
    .addTag('cad', 'CAD file processing endpoints')
    .addTag('ocr', 'OCR and text extraction endpoints')
    .addTag('volume', 'Volume extraction and quantity takeoff endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3025;
  await app.listen(port);
  console.log(`BIM & CAD Integration Service is running on: http://localhost:${port}`);
  console.log(`API Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
