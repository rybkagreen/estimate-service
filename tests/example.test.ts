/**
 * Example test file demonstrating how to use the test environment
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import * as Minio from 'minio';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

describe('Test Environment Example', () => {
  let prisma: PrismaClient;
  let redisClient: ReturnType<typeof createClient>;
  let minioClient: Minio.Client;

  beforeAll(async () => {
    // Initialize Prisma client with test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Initialize Redis client
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    await redisClient.connect();

    // Initialize MinIO client
    minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: 9001,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    });
  });

  afterAll(async () => {
    // Clean up connections
    await prisma.$disconnect();
    await redisClient.quit();
  });

  describe('PostgreSQL Tests', () => {
    it('should connect to test database', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });

    it('should have test users seeded', async () => {
      const users = await prisma.user.findMany();
      expect(users.length).toBeGreaterThan(0);
      
      const testUser = users.find(u => u.email === 'user1@test.com');
      expect(testUser).toBeDefined();
      expect(testUser?.username).toBe('testuser1');
    });

    it('should create and retrieve data', async () => {
      const newProject = await prisma.project.create({
        data: {
          name: 'Test Project from Jest',
          description: 'Created during test run',
          userId: (await prisma.user.findFirst())!.id,
        },
      });

      expect(newProject.id).toBeDefined();
      expect(newProject.name).toBe('Test Project from Jest');

      // Clean up
      await prisma.project.delete({ where: { id: newProject.id } });
    });
  });

  describe('Redis Tests', () => {
    it('should set and get values', async () => {
      const key = 'test:jest:key';
      const value = 'test-value-123';

      await redisClient.set(key, value);
      const retrieved = await redisClient.get(key);

      expect(retrieved).toBe(value);

      // Clean up
      await redisClient.del(key);
    });

    it('should handle JSON data', async () => {
      const key = 'test:jest:json';
      const data = { id: 1, name: 'Test', timestamp: Date.now() };

      await redisClient.set(key, JSON.stringify(data));
      const retrieved = await redisClient.get(key);
      const parsed = JSON.parse(retrieved!);

      expect(parsed).toEqual(data);

      // Clean up
      await redisClient.del(key);
    });

    it('should expire keys', async () => {
      const key = 'test:jest:expire';
      await redisClient.setEx(key, 1, 'expires-soon');
      
      const immediate = await redisClient.get(key);
      expect(immediate).toBe('expires-soon');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const expired = await redisClient.get(key);
      expect(expired).toBeNull();
    });
  });

  describe('MinIO Tests', () => {
    const testBucket = 'test-files';
    const testObject = 'test/jest-test-file.txt';

    it('should check bucket exists', async () => {
      const exists = await minioClient.bucketExists(testBucket);
      expect(exists).toBe(true);
    });

    it('should upload and download objects', async () => {
      const content = 'This is a test file content';
      const buffer = Buffer.from(content);

      // Upload object
      await minioClient.putObject(testBucket, testObject, buffer);

      // Download object
      const stream = await minioClient.getObject(testBucket, testObject);
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const downloaded = Buffer.concat(chunks).toString();
      expect(downloaded).toBe(content);

      // Clean up
      await minioClient.removeObject(testBucket, testObject);
    });

    it('should list objects', async () => {
      // Upload a test object first
      await minioClient.putObject(testBucket, 'test/list-test.txt', 'content');

      const objects: Minio.BucketItem[] = [];
      const stream = minioClient.listObjects(testBucket, 'test/', true);

      for await (const obj of stream) {
        objects.push(obj);
      }

      expect(objects.length).toBeGreaterThan(0);
      expect(objects.some(o => o.name === 'test/list-test.txt')).toBe(true);

      // Clean up
      await minioClient.removeObject(testBucket, 'test/list-test.txt');
    });
  });

  describe('Integration Tests', () => {
    it('should handle file upload workflow', async () => {
      // 1. Create a project in database
      const project = await prisma.project.create({
        data: {
          name: 'Integration Test Project',
          userId: (await prisma.user.findFirst())!.id,
        },
      });

      // 2. Upload file to MinIO
      const fileName = `projects/${project.id}/document.pdf`;
      await minioClient.putObject(testBucket, fileName, 'PDF content here');

      // 3. Store file metadata in database
      const file = await prisma.file.create({
        data: {
          filename: fileName,
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
          size: 16,
          bucket: testBucket,
          key: fileName,
          projectId: project.id,
          userId: project.userId,
        },
      });

      // 4. Cache file URL in Redis
      const fileUrl = `http://localhost:9001/${testBucket}/${fileName}`;
      await redisClient.setEx(`file:${file.id}:url`, 3600, fileUrl);

      // Verify everything is connected
      const cachedUrl = await redisClient.get(`file:${file.id}:url`);
      expect(cachedUrl).toBe(fileUrl);

      const exists = await minioClient.statObject(testBucket, fileName);
      expect(exists).toBeDefined();

      // Clean up
      await redisClient.del(`file:${file.id}:url`);
      await minioClient.removeObject(testBucket, fileName);
      await prisma.file.delete({ where: { id: file.id } });
      await prisma.project.delete({ where: { id: project.id } });
    });
  });
});
