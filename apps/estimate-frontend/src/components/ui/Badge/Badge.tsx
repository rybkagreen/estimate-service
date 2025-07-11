import React from 'react';
import { Size, Variant } from '../../../types/ui.types';

interface BadgeProps {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-cyan-100 text-cyan-800',
};

const sizeClasses: Record<Size, string> = {
  xs: 'text-xs px-1.5 py-0.5',
  sm: 'text-sm px-2 py-0.5',
  md: 'text-base px-2.5 py-1',
  lg: 'text-lg px-3 py-1.5',
  xl: 'text-xl px-4 py-2',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
  >
    {icon && <span className='mr-1'>{icon}</span>}
    {children}
  </span>
);
