import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convert Prisma Decimal to number
 */
export function decimalToNumber(decimal: Decimal | null | undefined): number {
  if (!decimal) return 0;
  return decimal.toNumber();
}

/**
 * Convert number to Prisma Decimal
 */
export function numberToDecimal(number: number): Decimal {
  return new Decimal(number);
}

/**
 * Safely convert any value to number
 */
export function toNumber(value: any): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return parseFloat(value) || 0;
  }
  return 0;
}

/**
 * Transform Decimal fields in an object to numbers
 */
export function transformDecimalFields<T extends Record<string, any>>(
  obj: T,
  decimalFields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of decimalFields) {
    const value = result[field];
    if (value && typeof value === 'object' && 'toNumber' in value) {
      (result as any)[field] = decimalToNumber(value as Decimal);
    }
  }
  
  return result;
}
