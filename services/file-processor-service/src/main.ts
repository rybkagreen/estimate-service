import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // CORS configuration
  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Set global prefix
  app.setGlobalPrefix('api', {
    exclude: ['health', 'metrics'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('File Processor Service')
    .setDescription('Service for processing construction documents including Excel, PDF, GGE, and GSFX formats')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    })
    .addTag('Files', 'File upload and processing')
    .addTag('OCR', 'Optical character recognition')
    .addTag('Storage', 'File storage management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env['PORT'] || 3040;
  const host = process.env['HOST'] || '0.0.0.0';

  await app.listen(port, host);

  console.log(`📄 File Processor Service is running on ${host}:${port}`);
  console.log(`📚 API documentation: http://localhost:${port}/api/docs`);
  console.log(`❤️  Health check: http://localhost:${port}/health`);
  console.log(`🚀 Environment: ${process.env['NODE_ENV'] || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start File Processor Service:', error);
  process.exit(1);
});
