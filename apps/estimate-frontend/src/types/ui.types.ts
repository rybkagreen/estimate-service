import { ReactNode } from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
  id?: string;
  style?: React.CSSProperties;
}

export type Variant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Статусы для бейджей и карточек
export type Status = 'draft' | 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';

// Типы загрузки
export type LoadingType = 'spinner' | 'skeleton' | 'overlay';

// Позиции для тултипов и поповеров
export type Position = 'top' | 'right' | 'bottom' | 'left' | 'auto';

// Анимации
export type AnimationType = 'fade' | 'slide' | 'scale' | 'none';

// Тренд для метрик
export interface TrendData {
  value: number;
  isPositive: boolean;
  label?: string;
}

// Иконки
export interface IconProps {
  name: string;
  size?: Size;
  color?: string;
  className?: string;
}
