import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Performance Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create test user and get auth token
    const testUser = {
      email: 'perf-test@example.com',
      password: 'password123',
      firstName: 'Performance',
      lastName: 'Test',
    };

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: 'perf-test@example.com' },
    });
    await app.close();
  });

  describe('API Response Time Tests', () => {
    it('should respond to health check in under 100ms', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(100);
      expect(response.body.status).toBe('ok');
    });

    it('should handle authentication in under 500ms', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'perf-test@example.com',
          password: 'password123',
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);
    });

    it('should handle protected routes in under 200ms', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/estimates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });
  });

  describe('Concurrent Request Tests', () => {
    it('should handle 10 concurrent health checks', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .get('/health')
          .expect(200)
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(responses).toHaveLength(10);
      expect(totalTime).toBeLessThan(1000); // All 10 requests in under 1 second
      responses.forEach(response => {
        expect(response.body.status).toBe('ok');
      });
    });

    it('should handle 5 concurrent authenticated requests', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get('/api/estimates')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(responses).toHaveLength(5);
      expect(totalTime).toBeLessThan(2000); // All 5 requests in under 2 seconds
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should enforce rate limits', async () => {
      // Make many requests quickly
      const promises = Array.from({ length: 110 }, () =>
        request(app.getHttpServer())
          .get('/health')
      );

      const responses = await Promise.allSettled(promises);

      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(
        result => result.status === 'fulfilled' &&
        (result.value as any).status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory during repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app.getHttpServer())
          .get('/health')
          .expect(200);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Database Performance Tests', () => {
    it('should handle database queries efficiently', async () => {
      const startTime = Date.now();

      // Simulate database operations
      await prisma.user.findMany({
        take: 10,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      const queryTime = Date.now() - startTime;
      expect(queryTime).toBeLessThan(100); // Database query under 100ms
    });

    it('should handle concurrent database queries', async () => {
      const promises = Array.from({ length: 5 }, () =>
        prisma.user.findMany({
          take: 5,
          select: { id: true, email: true },
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(5);
      expect(totalTime).toBeLessThan(500); // All 5 queries in under 500ms
    });
  });

  describe('Cache Performance Tests', () => {
    it('should improve response time with caching', async () => {
      // First request (cache miss)
      const startTime1 = Date.now();
      await request(app.getHttpServer())
        .get('/api/estimates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const firstRequestTime = Date.now() - startTime1;

      // Second request (cache hit)
      const startTime2 = Date.now();
      await request(app.getHttpServer())
        .get('/api/estimates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const secondRequestTime = Date.now() - startTime2;

      // Second request should be faster or at least not significantly slower
      expect(secondRequestTime).toBeLessThanOrEqual(firstRequestTime * 1.5);
    });
  });
});
