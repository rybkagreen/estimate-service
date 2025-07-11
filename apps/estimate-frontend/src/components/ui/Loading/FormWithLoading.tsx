import React from 'react';
import { Button } from '../Button/Button';
import { LoadingOverlay } from '../Loading/LoadingOverlay';

interface FormWithLoadingProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitText?: string;
  className?: string;
}

export const FormWithLoading: React.FC<FormWithLoadingProps> = ({
  loading,
  onSubmit,
  children,
  submitText = 'Сохранить',
  className = '',
}) => (
  <form className={`relative ${className}`} onSubmit={onSubmit}>
    {loading && <LoadingOverlay />}
    <div className={loading ? 'opacity-50 pointer-events-none' : ''}>{children}</div>
    <Button disabled={loading} className='mt-4'>
      {submitText}
    </Button>
  </form>
);
