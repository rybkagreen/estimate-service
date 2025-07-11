import React from 'react';
import { Card } from './Card';

interface MetricCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  trend,
  className = '',
}) => {
  return (
    <Card className={`metric-card ${className}`}>
      <div className='metric-card-icon'>{icon}</div>
      <div className='metric-card-value'>{value}</div>
      <div className='metric-card-label'>{label}</div>
      {trend && (
        <div
          className={`metric-card-change ${
            trend.isPositive ? 'metric-card-change-positive' : 'metric-card-change-negative'
          }`}
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            className='inline align-middle'
          >
            <path
              d='M8 12V4M8 4L4 8M8 4l4 4'
              stroke={trend.isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span>
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
        </div>
      )}
    </Card>
  );
};
