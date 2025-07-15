import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig, SecurityAdvancedConfig } from '@ez-eco/shared/config';

/**
 * Сервис для работы с конфигурацией безопасности
 * Предоставляет удобный доступ к настройкам безопасности
 */
@Injectable()
export class SecurityConfigService {
  private readonly security: SecurityConfig;
  private readonly securityAdvanced: SecurityAdvancedConfig;

  constructor(private configService: ConfigService) {
    this.security = this.configService.get<SecurityConfig>('security');
    this.securityAdvanced = this.configService.get<SecurityAdvancedConfig>('securityAdvanced');
  }

  /**
   * Получить базовую конфигурацию безопасности
   */
  getSecurityConfig(): SecurityConfig {
    return this.security;
  }

  /**
   * Получить расширенную конфигурацию безопасности
   */
  getAdvancedSecurityConfig(): SecurityAdvancedConfig {
    return this.securityAdvanced;
  }

  /**
   * Получить настройки JWT
   */
  getJwtConfig() {
    return this.security.jwt;
  }

  /**
   * Получить настройки CORS
   */
  getCorsConfig() {
    return this.security.cors;
  }

  /**
   * Получить настройки rate limiting для конкретного эндпоинта
   */
  getRateLimitConfig(endpoint: 'auth' | 'api' | 'upload' | 'export' = 'api') {
    return this.security.rateLimit.endpoints[endpoint] || this.security.rateLimit.global;
  }

  /**
   * Получить настройки CSP
   */
  getCspConfig() {
    if (!this.security.csp.enabled) {
      return null;
    }

    const directives = this.security.helmet.contentSecurityPolicy.directives;
    const reportOnly = this.security.csp.reportOnly;
    const reportUri = this.security.csp.reportUri;

    return {
      directives,
      reportOnly,
      reportUri,
    };
  }

  /**
   * Получить настройки сессий
   */
  getSessionConfig() {
    return this.security.session;
  }

  /**
   * Проверить, включена ли определенная функция безопасности
   */
  isSecurityFeatureEnabled(feature: string): boolean {
    switch (feature) {
      case 'helmet':
        return this.security.helmet.enabled;
      case 'csrf':
        return this.security.csrf.enabled;
      case 'csp':
        return this.security.csp.enabled;
      case 'bruteForce':
        return this.securityAdvanced.bruteForce.enabled;
      case 'twoFactor':
        return this.securityAdvanced.twoFactor.enabled;
      case 'ipRestrictions':
        return this.securityAdvanced.ipRestrictions.enabled;
      case 'anomalyDetection':
        return this.securityAdvanced.monitoring.anomalyDetection.enabled;
      default:
        return false;
    }
  }

  /**
   * Получить политику паролей
   */
  getPasswordPolicy() {
    return this.securityAdvanced.passwordPolicy;
  }

  /**
   * Валидировать пароль согласно политике
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const policy = this.securityAdvanced.passwordPolicy;
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Пароль должен содержать минимум ${policy.minLength} символов`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну заглавную букву');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну строчную букву');
    }

    if (policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну цифру');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы один специальный символ');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Получить настройки для загрузки файлов
   */
  getFileUploadConfig() {
    return this.securityAdvanced.fileUpload;
  }

  /**
   * Проверить, разрешен ли MIME тип файла
   */
  isAllowedMimeType(mimeType: string): boolean {
    const allowedTypes = this.securityAdvanced.fileUpload.allowedMimeTypes;
    return allowedTypes.includes(mimeType);
  }

  /**
   * Получить настройки для API защиты
   */
  getApiProtectionConfig() {
    return this.securityAdvanced.apiProtection;
  }

  /**
   * Получить настройки мониторинга безопасности
   */
  getSecurityMonitoringConfig() {
    return this.securityAdvanced.monitoring;
  }

  /**
   * Проверить, нужно ли отправить алерт для события
   */
  shouldAlertForEvent(event: string): boolean {
    const alertConfig = this.securityAdvanced.monitoring.alerts;
    return alertConfig.enabled && alertConfig.criticalEvents.includes(event);
  }

  /**
   * Получить настройки для защиты от SSRF
   */
  getSsrfProtectionConfig() {
    return this.securityAdvanced.ssrf;
  }

  /**
   * Проверить, разрешен ли хост для внешних запросов
   */
  isHostAllowed(host: string): boolean {
    const ssrfConfig = this.securityAdvanced.ssrf;
    
    if (!ssrfConfig.enabled) {
      return true;
    }

    // Проверяем, не в черном списке ли хост
    if (ssrfConfig.blockedHosts.some(blocked => host.includes(blocked))) {
      return false;
    }

    // Если есть белый список, проверяем его
    if (ssrfConfig.allowedHosts.length > 0) {
      return ssrfConfig.allowedHosts.some(allowed => host.includes(allowed));
    }

    return true;
  }

  /**
   * Получить настройки соответствия стандартам
   */
  getComplianceConfig() {
    return this.securityAdvanced.compliance;
  }

  /**
   * Проверить, включено ли соответствие определенному стандарту
   */
  isComplianceEnabled(standard: 'gdpr' | 'pci'): boolean {
    return this.securityAdvanced.compliance[standard].enabled;
  }
}
