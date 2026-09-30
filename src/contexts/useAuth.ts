import { createContext, useContext } from 'react';
import type { AuthContextType } from './AuthContext';
export type * from './AuthContext';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
