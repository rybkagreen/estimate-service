import { Logger } from '@nestjs/common';
import { RetryableError } from '../errors/retryable.error';

const logger = new Logger('RetryDecorator');

export function Retry(
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    retryableErrors?: (new (...args: any[]) => Error)[];
  } = {},
) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    retryableErrors = [RetryableError],
  } = options;

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let currentAttempt = 1;
      let currentDelay = delay;

      while (currentAttempt <= maxAttempts) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          const isRetryable = retryableErrors.some(ErrorType => error instanceof ErrorType);

          if (!isRetryable || currentAttempt === maxAttempts) {
            throw error;
          }

          logger.warn(
            `Attempt ${currentAttempt}/${maxAttempts} failed for ${target.constructor.name}.${propertyKey}. Retrying in ${currentDelay}ms`,
          );

          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= backoff;
          currentAttempt++;
        }
      }
    };

    return descriptor;
  };
}
