import React from 'react';
import { Badge } from './Badge';

interface RoleBadgeProps {
  role: string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  user: 'bg-green-100 text-green-800',
  guest: 'bg-gray-100 text-gray-800',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  icon,
  description,
  className = '',
}) => (
  <span className='group relative inline-block'>
    <Badge variant='secondary' className={`${roleColors[role] || ''} ${className}`} icon={icon}>
      {role}
    </Badge>
    {description && (
      <span className='absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-10'>
        {description}
      </span>
    )}
  </span>
);
