import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validates FSBTS-2022 code format
 */
@ValidatorConstraint({ async: false })
export class IsFSBTSCodeConstraint implements ValidatorConstraintInterface {
  validate(code: string, args: ValidationArguments) {
    if (!code) return false;
    // FSBTS-2022 format: XX.XX.XX-XXX.XXXX
    const fsbtsRegex = /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}-[0-9]{3}\.[0-9]{4}$/;
    return fsbtsRegex.test(code);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Код должен соответствовать формату ФСБЦ-2022: XX.XX.XX-XXX.XXXX';
  }
}

export function IsFSBTSCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFSBTSCodeConstraint,
    });
  };
}

/**
 * Validates that price is positive and within reasonable limits
 */
@ValidatorConstraint({ async: false })
export class IsValidPriceConstraint implements ValidatorConstraintInterface {
  validate(price: number, args: ValidationArguments) {
    if (typeof price !== 'number') return false;
    return price >= 0 && price <= 999999999.99;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Цена должна быть положительным числом не более 999999999.99';
  }
}

export function IsValidPrice(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPriceConstraint,
    });
  };
}

/**
 * Validates coefficient value (must be between 0.01 and 10)
 */
@ValidatorConstraint({ async: false })
export class IsValidCoefficientConstraint implements ValidatorConstraintInterface {
  validate(coefficient: number, args: ValidationArguments) {
    if (typeof coefficient !== 'number') return false;
    return coefficient >= 0.01 && coefficient <= 10;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Коэффициент должен быть в диапазоне от 0.01 до 10';
  }
}

export function IsValidCoefficient(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCoefficientConstraint,
    });
  };
}

/**
 * Validates estimate status transitions
 */
@ValidatorConstraint({ async: false })
export class IsValidStatusTransitionConstraint implements ValidatorConstraintInterface {
  private allowedTransitions = {
    DRAFT: ['IN_REVIEW', 'CANCELLED'],
    IN_REVIEW: ['APPROVED', 'DRAFT', 'CANCELLED'],
    APPROVED: ['ARCHIVED'],
    CANCELLED: ['DRAFT'],
    ARCHIVED: [],
  };

  validate(newStatus: string, args: ValidationArguments) {
    const object = args.object as any;
    const currentStatus = object.currentStatus;
    
    if (!currentStatus) return true; // Allow any status for new estimates
    
    const allowed = this.allowedTransitions[currentStatus] || [];
    return allowed.includes(newStatus);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;
    return `Недопустимый переход статуса из ${object.currentStatus} в ${args.value}`;
  }
}

export function IsValidStatusTransition(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidStatusTransitionConstraint,
    });
  };
}

/**
 * Validates estimate item quantity
 */
@ValidatorConstraint({ async: false })
export class IsValidQuantityConstraint implements ValidatorConstraintInterface {
  validate(quantity: number, args: ValidationArguments) {
    if (typeof quantity !== 'number') return false;
    return quantity > 0 && quantity <= 999999;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Количество должно быть положительным числом не более 999999';
  }
}

export function IsValidQuantity(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidQuantityConstraint,
    });
  };
}
