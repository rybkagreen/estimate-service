import React from 'react';
import { Size } from '../../../types/ui.types';

export interface SpinnerProps {
  size?: Size;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-t-transparent border-gray-400 ${sizeClasses[size]} ${className}`}
      role='status'
      aria-label='Загрузка...'
    />
  );
};
