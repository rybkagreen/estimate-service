import React from 'react';

export interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`rounded-lg bg-white shadow p-4 ${className}`}>{children}</div>
);

export const CardHeader: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`font-bold text-lg mb-2 ${className}`}>{children}</div>
);

export const CardBody: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={className}>{children}</div>
);

export const CardFooter: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`mt-4 text-sm text-gray-500 ${className}`}>{children}</div>
);
