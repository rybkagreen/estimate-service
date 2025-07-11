import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  className = '',
  style,
}) => (
  <div
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={{ width, height, ...style }}
    aria-busy='true'
    aria-label='Загрузка...'
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height={12} className='mb-2 last:mb-0' />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 rounded-lg bg-white shadow ${className}`}>
    <Skeleton height={24} className='mb-4' />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 3,
  cols = 4,
  className = '',
}) => (
  <div className={className}>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className='flex gap-2 mb-2 last:mb-0'>
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Skeleton key={colIdx} height={12} width={80} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => <Skeleton height={size} width={size} className={`rounded-full ${className}`} />;
