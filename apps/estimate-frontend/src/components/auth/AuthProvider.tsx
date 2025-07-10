import React, { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { login, logout, updateRole } from '../../store/slices/authSlice';

interface AuthContextProps {
  user: any;
  role: string;
  login: (user: any) => void;
  logout: () => void;
  updateRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state: RootState) => state.auth);

  const handleLogin = (user: any) => dispatch(login(user));
  const handleLogout = () => dispatch(logout());
  const handleUpdateRole = (role: string) => dispatch(updateRole(role));

  return (
    <AuthContext.Provider value={{ user, role, login: handleLogin, logout: handleLogout, updateRole: handleUpdateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
