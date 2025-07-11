import React from 'react';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  className?: string;
}

const statusMap = {
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
  pending: { label: 'На рассмотрении', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Одобрено', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-800' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { label, color } = statusMap[status];
  return <Badge className={`${color} ${className}`}>{label}</Badge>;
};
