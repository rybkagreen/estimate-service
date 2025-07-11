import React, { ReactNode } from 'react';
import { Size, Variant } from '../../../types/ui.types';

export interface ButtonProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  onClick,
  testId,
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const stateClasses = loading ? 'btn-loading' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${stateClasses} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      data-testid={testId}
    >
      {loading && <span className='btn-loading-spinner' />}
      <span className={loading ? 'btn-loading-text' : ''}>{children}</span>
    </button>
  );
};
