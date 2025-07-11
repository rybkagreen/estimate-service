import React from 'react';

interface LoadingOverlayProps {
  text?: string;
  progress?: number;
  className?: string;
  fullscreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  text = 'Загрузка...',
  progress,
  className = '',
  fullscreen = false,
}) => (
  <div
    className={`absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50 ${
      fullscreen ? 'fixed' : ''
    } ${className}`}
  >
    <span className='mb-2'>
      <span className='inline-block animate-spin rounded-full border-4 border-t-transparent border-gray-400 w-8 h-8' />
    </span>
    <span className='text-base font-medium mb-2'>{text}</span>
    {typeof progress === 'number' && (
      <div className='w-40 h-2 bg-gray-200 rounded'>
        <div className='h-2 bg-blue-500 rounded' style={{ width: `${progress}%` }} />
      </div>
    )}
  </div>
);
