import React from 'react';
import { Card } from './Card';

interface StatusCardProps {
  status: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  title,
  description,
  className = '',
}) => (
  <Card className={`status-card ${statusColors[status]} ${className}`}>
    <div className='font-semibold mb-1'>{title}</div>
    {description && <div className='text-sm opacity-80'>{description}</div>}
  </Card>
);
