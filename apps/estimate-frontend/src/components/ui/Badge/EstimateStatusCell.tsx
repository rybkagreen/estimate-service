import React from 'react';
import { StatusBadge } from './StatusBadge';

interface EstimateStatusCellProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export const EstimateStatusCell: React.FC<EstimateStatusCellProps> = ({ status }) => (
  <div className='flex items-center gap-2'>
    <StatusBadge status={status} />
  </div>
);
