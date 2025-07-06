import { Injectable, Logger } from '@nestjs/common';
import { VALIDATION_CONFIG } from '../config/data-sources.config';
import { ValidationResult } from '../types/common.types';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  /**
   * Валидация общих полей для всех типов расценок
   */
  validateCommonFields(item: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверка обязательных полей
    for (const field of VALIDATION_CONFIG.requiredFields) {
      if (!item[field] || (typeof item[field] === 'string' && item[field].trim() === '')) {
        errors.push(`Отсутствует обязательное поле: ${field}`);
      }
    }

    // Проверка длины кода
    if (item.code && item.code.length > VALIDATION_CONFIG.maxCodeLength) {
      errors.push(`Код слишком длинный: ${item.code.length} символов (максимум ${VALIDATION_CONFIG.maxCodeLength})`);
    }

    // Проверка длины названия
    if (item.name && item.name.length > VALIDATION_CONFIG.maxNameLength) {
      warnings.push(`Название слишком длинное: ${item.name.length} символов (рекомендуется до ${VALIDATION_CONFIG.maxNameLength})`);
    }

    // Проверка единицы измерения
    if (item.unit && !VALIDATION_CONFIG.allowedUnits.includes(item.unit)) {
      warnings.push(`Неизвестная единица измерения: ${item.unit}`);
    }

    // Проверка числовых полей
    for (const field of VALIDATION_CONFIG.numericFields) {
      if (item[field] !== undefined) {
        if (typeof item[field] !== 'number' || isNaN(item[field])) {
          errors.push(`Поле ${field} должно быть числом`);
        } else if (item[field] < 0) {
          errors.push(`Поле ${field} не может быть отрицательным`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Специальная валидация для ФЕР
   */
  validateFerItem(item: any): ValidationResult {
    const baseValidation = this.validateCommonFields(item);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Проверка структуры кода ФЕР (обычно формат: XX-XX-XXX)
    if (item.code && !/^\d{1,2}-\d{1,2}-\d{1,3}(-\d+)?$/.test(item.code)) {
      warnings.push(`Код ФЕР не соответствует стандартному формату: ${item.code}`);
    }

    // Проверка консистентности стоимостей
    if (item.laborCost && item.materialCost && item.machineCost && item.totalCost) {
      const calculatedTotal = item.laborCost + item.materialCost + item.machineCost;
      const difference = Math.abs(calculatedTotal - item.totalCost);

      if (difference > 0.01) {
        warnings.push(`Несоответствие в расчете общей стоимости: ${calculatedTotal} ≠ ${item.totalCost}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Специальная валидация для ТЕР
   */
  validateTerItem(item: any): ValidationResult {
    const baseValidation = this.validateCommonFields(item);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Проверка региона
    if (!item.region) {
      errors.push('Для ТЕР обязательно указание региона');
    }

    // Проверка структуры кода ТЕР
    if (item.code && !/^\d{1,2}-\d{1,2}-\d{1,3}(-\d+)?$/.test(item.code)) {
      warnings.push(`Код ТЕР не соответствует стандартному формату: ${item.code}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Специальная валидация для ГЭСН
   */
  validateGesnItem(item: any): ValidationResult {
    const baseValidation = this.validateCommonFields(item);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Проверка структуры кода ГЭСН (обычно формат: ГЭСН XX-XX-XXX)
    if (item.code && !/^(ГЭСН[-\s]?)?\d{1,2}-\d{1,2}-\d{1,3}(-\d+)?$/i.test(item.code)) {
      warnings.push(`Код ГЭСН не соответствует стандартному формату: ${item.code}`);
    }

    // Проверка трудозатрат
    if (item.laborConsumption !== undefined) {
      if (typeof item.laborConsumption !== 'number' || item.laborConsumption < 0) {
        errors.push('Трудозатраты должны быть положительным числом');
      }
    }

    // Проверка машинного времени
    if (item.machineTime !== undefined) {
      if (typeof item.machineTime !== 'number' || item.machineTime < 0) {
        errors.push('Машинное время должно быть положительным числом');
      }
    }

    // Проверка материалов
    if (item.materials && Array.isArray(item.materials)) {
      for (let i = 0; i < item.materials.length; i++) {
        const material = item.materials[i];

        if (!material.code || !material.name || !material.unit) {
          warnings.push(`Материал ${i + 1} имеет неполную информацию`);
        }

        if (material.consumption !== undefined &&
            (typeof material.consumption !== 'number' || material.consumption < 0)) {
          warnings.push(`Материал ${i + 1} имеет некорректный расход`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Валидация массива элементов
   */
  validateBatch<T>(items: T[], validator: (item: T) => ValidationResult): {
    validItems: T[];
    invalidItems: Array<{ item: T; validation: ValidationResult }>;
    summary: {
      total: number;
      valid: number;
      invalid: number;
      withWarnings: number;
    };
  } {
    const validItems: T[] = [];
    const invalidItems: Array<{ item: T; validation: ValidationResult }> = [];
    let withWarnings = 0;

    for (const item of items) {
      const validation = validator(item);

      if (validation.isValid) {
        validItems.push(item);

        if (validation.warnings.length > 0) {
          withWarnings++;
        }
      } else {
        invalidItems.push({ item, validation });
      }
    }

    const summary = {
      total: items.length,
      valid: validItems.length,
      invalid: invalidItems.length,
      withWarnings
    };

    this.logger.log(`Валидация завершена: ${summary.valid}/${summary.total} валидных элементов, ${summary.withWarnings} с предупреждениями`);

    return {
      validItems,
      invalidItems,
      summary
    };
  }

  /**
   * Проверка дубликатов по коду
   */
  findDuplicates<T extends { code: string }>(items: T[]): Map<string, T[]> {
    const duplicates = new Map<string, T[]>();
    const codeGroups = new Map<string, T[]>();

    // Группируем по кодам
    for (const item of items) {
      if (!codeGroups.has(item.code)) {
        codeGroups.set(item.code, []);
      }
      codeGroups.get(item.code)!.push(item);
    }

    // Находим дубликаты
    for (const [code, group] of codeGroups) {
      if (group.length > 1) {
        duplicates.set(code, group);
      }
    }

    if (duplicates.size > 0) {
      this.logger.warn(`Найдено ${duplicates.size} групп дубликатов кодов`);
    }

    return duplicates;
  }
}
