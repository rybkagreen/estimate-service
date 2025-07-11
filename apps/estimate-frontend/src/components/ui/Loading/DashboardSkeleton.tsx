import React from 'react';
import { SkeletonCard } from '../Loading/Skeleton';

export const DashboardSkeleton: React.FC = () => (
  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
