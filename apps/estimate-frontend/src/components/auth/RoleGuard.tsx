import React from 'react';
import { useAuth } from './AuthProvider';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { role } = useAuth();
  if (!allowedRoles.includes(role)) return null;
  return <>{children}</>;
};
