import { SetMetadata } from '@nestjs/common';
import { RequestPriority } from '../types';

export const PRIORITY_KEY = 'request_priority';

/**
 * Decorator to set priority for a specific endpoint
 * @param priority - The priority level for the endpoint
 */
export const Priority = (priority: RequestPriority) => 
  SetMetadata(PRIORITY_KEY, priority);

/**
 * Decorator shortcuts for common priorities
 */
export const HighPriority = () => Priority(RequestPriority.HIGH);
export const MediumPriority = () => Priority(RequestPriority.MEDIUM);
export const LowPriority = () => Priority(RequestPriority.LOW);
