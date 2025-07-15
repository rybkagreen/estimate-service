import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from '../config/security.config';

/**
 * Утилита для шифрования и дешифрования чувствительных данных
 */
@Injectable()
export class EncryptionUtil {
  private readonly algorithm: string;
  private readonly key: Buffer;
  private readonly ivLength: number;
  private readonly tagLength: number;
  private readonly saltLength: number;
  private readonly pbkdf2Iterations: number;

  constructor(private configService: ConfigService) {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    
    if (!securityConfig?.encryption) {
      throw new Error('Encryption configuration is missing');
    }

    this.algorithm = securityConfig.encryption.algorithm;
    this.ivLength = securityConfig.encryption.ivLength;
    this.tagLength = securityConfig.encryption.tagLength;
    this.saltLength = securityConfig.encryption.saltLength;
    this.pbkdf2Iterations = securityConfig.encryption.pbkdf2Iterations;

    // Преобразуем base64 ключ в Buffer
    this.key = Buffer.from(securityConfig.encryption.key, 'base64');
  }

  /**
   * Шифрует строку
   * @param text - Текст для шифрования
   * @returns Зашифрованная строка в формате base64
   */
  encrypt(text: string): string {
    try {
      // Генерируем случайный IV
      const iv = crypto.randomBytes(this.ivLength);
      
      // Создаем шифр
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      // Шифруем данные
      let encrypted = cipher.update(text, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      // Получаем тег аутентификации (для GCM)
      const tag = (cipher as any).getAuthTag();
      
      // Объединяем IV, тег и зашифрованные данные
      const combined = Buffer.concat([iv, tag, encrypted]);
      
      // Возвращаем в base64
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Дешифрует строку
   * @param encryptedText - Зашифрованная строка в формате base64
   * @returns Расшифрованная строка
   */
  decrypt(encryptedText: string): string {
    try {
      // Декодируем из base64
      const combined = Buffer.from(encryptedText, 'base64');
      
      // Извлекаем компоненты
      const iv = combined.slice(0, this.ivLength);
      const tag = combined.slice(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = combined.slice(this.ivLength + this.tagLength);
      
      // Создаем дешифратор
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      (decipher as any).setAuthTag(tag);
      
      // Дешифруем данные
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Шифрует объект
   * @param obj - Объект для шифрования
   * @returns Зашифрованная строка в формате base64
   */
  encryptObject(obj: any): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Дешифрует объект
   * @param encryptedText - Зашифрованная строка в формате base64
   * @returns Расшифрованный объект
   */
  decryptObject<T = any>(encryptedText: string): T {
    const jsonString = this.decrypt(encryptedText);
    return JSON.parse(jsonString);
  }

  /**
   * Хеширует пароль с использованием PBKDF2
   * @param password - Пароль для хеширования
   * @param salt - Соль (опционально, будет сгенерирована если не указана)
   * @returns Объект с хешем и солью
   */
  async hashPassword(password: string, salt?: Buffer): Promise<{ hash: string; salt: string }> {
    const saltBuffer = salt || crypto.randomBytes(this.saltLength);
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, saltBuffer, this.pbkdf2Iterations, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          reject(new Error(`Password hashing failed: ${err.message}`));
        } else {
          resolve({
            hash: derivedKey.toString('hex'),
            salt: saltBuffer.toString('hex')
          });
        }
      });
    });
  }

  /**
   * Проверяет пароль против хеша
   * @param password - Пароль для проверки
   * @param hash - Хеш пароля
   * @param salt - Соль
   * @returns true если пароль совпадает
   */
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const saltBuffer = Buffer.from(salt, 'hex');
    const { hash: newHash } = await this.hashPassword(password, saltBuffer);
    return newHash === hash;
  }

  /**
   * Генерирует случайный токен
   * @param length - Длина токена в байтах (по умолчанию 32)
   * @returns Случайный токен в формате hex
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Генерирует случайный API ключ
   * @returns API ключ в формате hex
   */
  generateApiKey(): string {
    return this.generateToken(32);
  }

  /**
   * Создает HMAC подпись
   * @param data - Данные для подписи
   * @param secret - Секретный ключ (по умолчанию используется master key)
   * @returns HMAC подпись в формате hex
   */
  createHmac(data: string, secret?: string): string {
    const key = secret || this.configService.get('security.masterApiKey');
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Проверяет HMAC подпись
   * @param data - Данные для проверки
   * @param signature - Подпись для проверки
   * @param secret - Секретный ключ (по умолчанию используется master key)
   * @returns true если подпись валидна
   */
  verifyHmac(data: string, signature: string, secret?: string): boolean {
    const expectedSignature = this.createHmac(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

/**
 * Декоратор для автоматического шифрования/дешифрования полей
 */
export function Encrypted() {
  return function (target: any, propertyKey: string) {
    let value: any;

    const getter = function () {
      return value;
    };

    const setter = function (newVal: any) {
      // В реальном приложении здесь должна быть логика шифрования
      value = newVal;
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}
