import React from 'react';
import { Size } from '../../../types/ui.types';

interface SpinnerProps {
  size?: Size;
  className?: string;
}

export const CountBadge: React.FC<{ count: number; max?: number; className?: string }> = ({
  count,
  max = 99,
  className = '',
}) => {
  const display = count > max ? `${max}+` : count;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs px-2 py-0.5 animate-bounce ${className}`}
    >
      {display}
    </span>
  );
};
