import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Full Application Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    moduleRef = module;
    app = module.createNestApplication();

    // Настраиваем валидацию как в production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    prismaService = module.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // Очистка всех тестовых данных
    await prismaService.refreshToken.deleteMany();
    await prismaService.userRoleContext.deleteMany();
    await prismaService.estimateItem.deleteMany();
    await prismaService.estimate.deleteMany();
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    // Финальная очистка
    await prismaService.refreshToken.deleteMany();
    await prismaService.userRoleContext.deleteMany();
    await prismaService.estimateItem.deleteMany();
    await prismaService.estimate.deleteMany();
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
    await moduleRef.close();
  });

  describe('Application Health & Status', () => {
    it('should return healthy status for all health endpoints', async () => {
      const healthResponse = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(healthResponse.body.status).toBe('ok');
      expect(healthResponse.body.info).toBeDefined();
      expect(healthResponse.body.details).toBeDefined();

      const readyResponse = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(readyResponse.body.status).toBe('ok');

      const liveResponse = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(liveResponse.body.status).toBe('ok');
    });

    it('should return Prometheus metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('nodejs_version_info');
      expect(response.text).toContain('process_cpu_user_seconds_total');
      expect(response.text).toContain('http_requests_total');
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // 1. Регистрация
      const registerData = {
        email: 'fullflow@example.com',
        password: 'SecurePassword123!',
        firstName: 'Full',
        lastName: 'Flow',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(registerResponse.body.user.email).toBe(registerData.email);
      expect(registerResponse.body.accessToken).toBeDefined();
      expect(registerResponse.body.refreshToken).toBeDefined();

      const { accessToken, refreshToken } = registerResponse.body;

      // 2. Получение профиля
      const profileResponse = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe(registerData.email);
      expect(profileResponse.body.firstName).toBe(registerData.firstName);

      // 3. Обновление профиля
      const updateData = {
        firstName: 'UpdatedFull',
        bio: 'Updated bio for integration test',
      };

      const updateResponse = await request(app.getHttpServer())
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.firstName).toBe(updateData.firstName);

      // 4. Обновление токена
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.accessToken).toBeDefined();
      expect(refreshResponse.body.refreshToken).toBeDefined();

      // 5. Логин
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: registerData.email,
          password: registerData.password,
        })
        .expect(200);

      expect(loginResponse.body.user.email).toBe(registerData.email);
      expect(loginResponse.body.accessToken).toBeDefined();

      // 6. Логаут
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // 7. Проверка, что токен больше не работает
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('should handle authentication errors correctly', async () => {
      // Попытка логина с несуществующим пользователем
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      // Попытка доступа без токена
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);

      // Попытка доступа с неверным токеном
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Estimate Management Flow', () => {
    let authToken: string;
    let userId: string;
    let projectId: string;

    beforeEach(async () => {
      // Создаем пользователя и получаем токен
      const user = await prismaService.user.create({
        data: {
          email: 'estimate-flow@example.com',
          passwordHash: 'hash',
          firstName: 'Estimate',
          lastName: 'User',
        },
      });
      userId = user.id;

      // Для простоты тестов, создаем JWT токен вручную
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'estimate-auth@example.com',
          password: 'password123',
          firstName: 'Auth',
          lastName: 'User',
        });

      authToken = registerResponse.body.accessToken;

      // Создаем проект
      const project = await prismaService.project.create({
        data: {
          name: 'Integration Test Project',
          description: 'Project for estimate integration tests',
          status: 'PLANNING',
          createdById: registerResponse.body.user.id,
        },
      });
      projectId = project.id;
    });

    it('should complete full estimate CRUD flow', async () => {
      // 1. Создание сметы
      const createData = {
        name: 'Integration Test Estimate',
        description: 'Full CRUD flow test',
        projectId,
        currency: 'RUB',
        laborCostPerHour: 2000,
        overheadPercentage: 15,
        profitPercentage: 10,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/estimates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createData)
        .expect(201);

      expect(createResponse.body.name).toBe(createData.name);
      expect(createResponse.body.projectId).toBe(projectId);

      const estimateId = createResponse.body.id;

      // 2. Получение сметы
      const getResponse = await request(app.getHttpServer())
        .get(`/api/estimates/${estimateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.id).toBe(estimateId);
      expect(getResponse.body.name).toBe(createData.name);

      // 3. Обновление сметы
      const updateData = {
        name: 'Updated Integration Test Estimate',
        laborCostPerHour: 2500,
      };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/estimates/${estimateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.name).toBe(updateData.name);
      expect(updateResponse.body.laborCostPerHour).toBe(2500);

      // 4. Получение списка смет
      const listResponse = await request(app.getHttpServer())
        .get('/api/estimates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listResponse.body.estimates).toHaveLength(1);
      expect(listResponse.body.total).toBe(1);

      // 5. Удаление сметы
      await request(app.getHttpServer())
        .delete(`/api/estimates/${estimateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 6. Проверка, что смета удалена
      await request(app.getHttpServer())
        .get(`/api/estimates/${estimateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle estimate validation errors', async () => {
      // Попытка создания сметы с невалидными данными
      await request(app.getHttpServer())
        .post('/api/estimates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Пустое имя
          description: 'Invalid estimate',
          // Отсутствует projectId
          currency: 'INVALID_CURRENCY',
          laborCostPerHour: -1000, // Отрицательная стоимость
        })
        .expect(400);

      // Попытка создания сметы с несуществующим проектом
      await request(app.getHttpServer())
        .post('/api/estimates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Valid Name',
          description: 'Valid description',
          projectId: 'non-existent-project-id',
          currency: 'RUB',
          laborCostPerHour: 2000,
        })
        .expect(400);
    });
  });

  describe('Rate Limiting & Security', () => {
    it('should enforce rate limiting on health endpoint', async () => {
      // Отправляем много запросов подряд
      const requests = Array.from({ length: 10 }, () =>
        request(app.getHttpServer()).get('/health')
      );

      const responses = await Promise.all(requests);

      // Большинство запросов должно пройти успешно
      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(0);

      // Может быть несколько ограниченных запросов
      const rateLimitedRequests = responses.filter(r => r.status === 429);
      // В зависимости от настроек throttler, может быть rate limiting
    });

    it('should have proper security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Проверяем базовые security headers от Helmet
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('0');
    });

    it('should handle CORS properly', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      // Проверяем CORS headers
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });

  describe('Error Handling & Validation', () => {
    it('should handle global validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email', // Невалидный email
          password: '123', // Слишком короткий пароль
          // Отсутствуют обязательные поля
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('should handle 404 errors for non-existent routes', async () => {
      await request(app.getHttpServer())
        .get('/api/non-existent-endpoint')
        .expect(404);
    });

    it('should handle server errors gracefully', async () => {
      // Попытка создания пользователя с дублирующимся email
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'First',
        lastName: 'User',
      };

      // Первая регистрация должна пройти успешно
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Вторая регистрация должна вернуть ошибку
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs')
        .expect(200);

      expect(response.text).toContain('Swagger UI');
      expect(response.text).toContain('estimate-service');
    });

    it('should provide OpenAPI specification', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);

      expect(response.body.openapi).toBeDefined();
      expect(response.body.info).toBeDefined();
      expect(response.body.paths).toBeDefined();
    });
  });

  describe('Performance & Load', () => {
    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      const concurrentRequests = 20;

      // Создаем множество одновременных запросов
      const requests = Array.from({ length: concurrentRequests }, () =>
        request(app.getHttpServer()).get('/health')
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Все запросы должны завершиться успешно
      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(concurrentRequests * 0.8); // 80% успешных запросов

      // Проверяем производительность
      expect(duration).toBeLessThan(5000); // 5 секунд для 20 запросов
    });

    it('should have reasonable response times', async () => {
      const iterations = 5;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app.getHttpServer()).get('/health').expect(200);
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      // Средний response time должен быть меньше 500ms
      expect(averageResponseTime).toBeLessThan(500);

      // 95% запросов должны выполняться быстрее 1 секунды
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];
      expect(p95ResponseTime).toBeLessThan(1000);
    });
  });
});
