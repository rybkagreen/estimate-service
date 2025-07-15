import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionUtil } from './encryption.util';

describe('EncryptionUtil', () => {
  let encryptionUtil: EncryptionUtil;
  let configService: ConfigService;

  const mockSecurityConfig = {
    encryption: {
      key: 'KTXeCxSISudZ2/cIZHDWQssMSJ0ziYH/SBfNy9PkTOWZwzACsK7QWNhRc0mqW3zC',
      algorithm: 'aes-256-gcm',
      ivLength: 16,
      tagLength: 16,
      saltLength: 64,
      pbkdf2Iterations: 100000,
    },
    masterApiKey: '98590c8659bb80eb27067812b6028034ee188aef021f211a2ef99bfb6b3ecb58',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionUtil,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'security') {
                return mockSecurityConfig;
              }
              if (key === 'security.masterApiKey') {
                return mockSecurityConfig.masterApiKey;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    encryptionUtil = module.get<EncryptionUtil>(EncryptionUtil);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const originalText = 'This is a secret message';
      
      const encrypted = encryptionUtil.encrypt(originalText);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalText);
      
      const decrypted = encryptionUtil.decrypt(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it('should produce different encrypted values for the same input', () => {
      const originalText = 'Same message';
      
      const encrypted1 = encryptionUtil.encrypt(originalText);
      const encrypted2 = encryptionUtil.encrypt(originalText);
      
      expect(encrypted1).not.toBe(encrypted2); // Due to random IV
      
      expect(encryptionUtil.decrypt(encrypted1)).toBe(originalText);
      expect(encryptionUtil.decrypt(encrypted2)).toBe(originalText);
    });

    it('should handle special characters and unicode', () => {
      const originalText = 'Специальные символы: 🔐 €£¥ <>&"\'';
      
      const encrypted = encryptionUtil.encrypt(originalText);
      const decrypted = encryptionUtil.decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => {
        encryptionUtil.decrypt('invalid-base64-data');
      }).toThrow('Decryption failed');
    });
  });

  describe('encryptObject/decryptObject', () => {
    it('should encrypt and decrypt objects correctly', () => {
      const originalObject = {
        id: 123,
        name: 'Test User',
        email: 'test@example.com',
        data: {
          nested: true,
          array: [1, 2, 3],
        },
      };
      
      const encrypted = encryptionUtil.encryptObject(originalObject);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      
      const decrypted = encryptionUtil.decryptObject(encrypted);
      expect(decrypted).toEqual(originalObject);
    });

    it('should handle null and undefined values in objects', () => {
      const originalObject = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
        false: false,
      };
      
      const encrypted = encryptionUtil.encryptObject(originalObject);
      const decrypted = encryptionUtil.decryptObject(encrypted);
      
      expect(decrypted.nullValue).toBeNull();
      expect(decrypted.undefinedValue).toBeUndefined();
      expect(decrypted.emptyString).toBe('');
      expect(decrypted.zero).toBe(0);
      expect(decrypted.false).toBe(false);
    });
  });

  describe('password hashing', () => {
    it('should hash password and verify correctly', async () => {
      const password = 'SecurePassword123!';
      
      const { hash, salt } = await encryptionUtil.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(salt).toBeDefined();
      expect(hash.length).toBe(128); // 64 bytes in hex
      expect(salt.length).toBe(128); // 64 bytes in hex
      
      const isValid = await encryptionUtil.verifyPassword(password, hash, salt);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const password = 'SecurePassword123!';
      const wrongPassword = 'WrongPassword123!';
      
      const { hash, salt } = await encryptionUtil.hashPassword(password);
      
      const isValid = await encryptionUtil.verifyPassword(wrongPassword, hash, salt);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password with different salts', async () => {
      const password = 'SecurePassword123!';
      
      const result1 = await encryptionUtil.hashPassword(password);
      const result2 = await encryptionUtil.hashPassword(password);
      
      expect(result1.hash).not.toBe(result2.hash);
      expect(result1.salt).not.toBe(result2.salt);
    });
  });

  describe('token generation', () => {
    it('should generate random tokens', () => {
      const token1 = encryptionUtil.generateToken();
      const token2 = encryptionUtil.generateToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1.length).toBe(64); // 32 bytes in hex
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with custom length', () => {
      const token = encryptionUtil.generateToken(16);
      expect(token.length).toBe(32); // 16 bytes in hex
    });

    it('should generate API keys', () => {
      const apiKey = encryptionUtil.generateApiKey();
      expect(apiKey).toBeDefined();
      expect(apiKey.length).toBe(64); // 32 bytes in hex
    });
  });

  describe('HMAC operations', () => {
    it('should create and verify HMAC', () => {
      const data = 'Important data to sign';
      
      const signature = encryptionUtil.createHmac(data);
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // SHA256 in hex
      
      const isValid = encryptionUtil.verifyHmac(data, signature);
      expect(isValid).toBe(true);
    });

    it('should reject tampered data', () => {
      const data = 'Important data to sign';
      const tamperedData = 'Tampered data to sign';
      
      const signature = encryptionUtil.createHmac(data);
      
      const isValid = encryptionUtil.verifyHmac(tamperedData, signature);
      expect(isValid).toBe(false);
    });

    it('should reject invalid signature', () => {
      const data = 'Important data to sign';
      const invalidSignature = 'invalid'.repeat(10) + '1234'; // 64 chars but invalid
      
      const isValid = encryptionUtil.verifyHmac(data, invalidSignature);
      expect(isValid).toBe(false);
    });

    it('should use custom secret for HMAC', () => {
      const data = 'Important data to sign';
      const customSecret = 'custom-secret-key';
      
      const signature1 = encryptionUtil.createHmac(data);
      const signature2 = encryptionUtil.createHmac(data, customSecret);
      
      expect(signature1).not.toBe(signature2);
      
      const isValid1 = encryptionUtil.verifyHmac(data, signature1);
      const isValid2 = encryptionUtil.verifyHmac(data, signature2, customSecret);
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error when encryption config is missing', () => {
      const invalidConfigService = {
        get: jest.fn(() => null),
      };
      
      expect(() => {
        new EncryptionUtil(invalidConfigService as any);
      }).toThrow('Encryption configuration is missing');
    });
  });
});
