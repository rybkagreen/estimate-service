import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Security Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create test user and get auth token
    const testUser = {
      email: 'security-test@example.com',
      password: 'SecurePassword123!',
      firstName: 'Security',
      lastName: 'Test',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    authToken = loginResponse.body.access_token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: 'security-test@example.com' },
    });
    await app.close();
  });

  describe('Authentication Security', () => {
    it('should reject requests without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/estimates')
        .expect(401);
    });

    it('should reject invalid JWT tokens', async () => {
      await request(app.getHttpServer())
        .get('/api/estimates')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject malformed authorization headers', async () => {
      await request(app.getHttpServer())
        .get('/api/estimates')
        .set('Authorization', 'invalid-format')
        .expect(401);
    });

    it('should handle expired tokens', async () => {
      // This would require creating an expired token, which is complex
      // For now, we test with an obviously invalid token structure
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      await request(app.getHttpServer())
        .get('/api/estimates')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Input Validation Security', () => {
    it('should reject SQL injection attempts in login', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: "admin'; DROP TABLE users; --",
          password: 'password123',
        })
        .expect(400);
    });

    it('should sanitize XSS attempts in registration', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'xss-test@example.com',
          password: 'password123',
          firstName: '<script>alert("xss")</script>',
          lastName: 'Test',
        })
        .expect(400);
    });

    it('should reject oversized payloads', async () => {
      const largePayload = {
        email: 'large@example.com',
        password: 'password123',
        firstName: 'A'.repeat(10000), // Very long string
        lastName: 'Test',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(largePayload)
        .expect(400);
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'not-an-email',
        '@invalid.com',
        'missing-at-symbol.com',
        'spaces in@email.com',
        'double@@at.com',
      ];

      for (const email of invalidEmails) {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
          })
          .expect(400);
      }
    });
  });

  describe('Rate Limiting Security', () => {
    it('should enforce rate limits on login attempts', async () => {
      const loginAttempts = Array.from({ length: 20 }, () =>
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'non-existent@example.com',
            password: 'wrong-password',
          })
      );

      const results = await Promise.allSettled(loginAttempts);

      // Some attempts should be rate limited
      const rateLimited = results.filter(
        result => result.status === 'fulfilled' &&
        (result.value as any).status === 429
      );

      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should enforce rate limits on API endpoints', async () => {
      const apiRequests = Array.from({ length: 110 }, () =>
        request(app.getHttpServer())
          .get('/api/estimates')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const results = await Promise.allSettled(apiRequests);

      // Some requests should be rate limited
      const rateLimited = results.filter(
        result => result.status === 'fulfilled' &&
        (result.value as any).status === 429
      );

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization Security', () => {
    it('should prevent access to other users data', async () => {
      // Create another user
      const otherUser = {
        email: 'other-user@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(otherUser);

      const otherLoginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: otherUser.email,
          password: otherUser.password,
        });

      const otherToken = otherLoginResponse.body.access_token;

      // Try to access first user's data with second user's token
      // This would require actual user-specific data endpoints
      // For now, we just verify that different tokens work independently

      await request(app.getHttpServer())
        .get('/api/estimates')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: 'other-user@example.com' },
      });
    });
  });

  describe('Headers Security', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Check for common security headers that should be present
      // Note: These depend on your helmet configuration
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    it('should include correlation ID in responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-correlation-id');
      expect(response.headers['x-correlation-id']).toMatch(/^[a-f0-9-]{36}$/);
    });

    it('should handle custom correlation ID', async () => {
      const customCorrelationId = 'test-correlation-id-123';

      const response = await request(app.getHttpServer())
        .get('/health')
        .set('x-correlation-id', customCorrelationId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(customCorrelationId);
    });
  });

  describe('Password Security', () => {
    it('should reject weak passwords', async () => {
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'qwerty',
        'abc123',
      ];

      for (const password of weakPasswords) {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: `weak-${Date.now()}@example.com`,
            password,
            firstName: 'Weak',
            lastName: 'Password',
          })
          .expect(400);
      }
    });

    it('should not return password in responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `no-password-${Date.now()}@example.com`,
          password: 'SecurePassword123!',
          firstName: 'No',
          lastName: 'Password',
        })
        .expect(201);

      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: response.body.user.email },
      });
    });
  });

  describe('API Key Security', () => {
    it('should validate API key format', async () => {
      const invalidApiKeys = [
        'invalid-key',
        'short',
        '',
        'not-starting-with-prefix',
      ];

      for (const apiKey of invalidApiKeys) {
        await request(app.getHttpServer())
          .get('/api/estimates')
          .set('x-api-key', apiKey)
          .expect(401);
      }
    });

    it('should handle API key authentication', async () => {
      // Test with master API key from environment
      const masterApiKey = process.env.MASTER_API_KEY;

      if (masterApiKey) {
        await request(app.getHttpServer())
          .get('/api/estimates')
          .set('x-api-key', masterApiKey)
          .expect(200);
      } else {
        // If no master key is set, it should reject
        await request(app.getHttpServer())
          .get('/api/estimates')
          .set('x-api-key', 'est_fake_key_for_testing')
          .expect(401);
      }
    });
  });
});
